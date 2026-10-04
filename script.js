document.addEventListener("DOMContentLoaded", () => {
  // --- Mobile menu ---------------------------------------------------
  // On narrow screens the left sidebar collapses to a top bar; the
  // toggle reveals the full nav list beneath it.
  const sideNav = document.querySelector(".side-nav");
  const navToggle = document.querySelector(".nav-toggle");

  if (sideNav && navToggle) {
    const setOpen = (open) => {
      sideNav.classList.toggle("is-open", open);
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };

    navToggle.addEventListener("click", () => {
      setOpen(navToggle.getAttribute("aria-expanded") !== "true");
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && sideNav.classList.contains("is-open")) {
        setOpen(false);
        navToggle.focus();
      }
    });
  }

  // --- Dogs with Jobs: brand bento type marquee ------------------------
  // The marquee is paused and hidden by default in CSS; start it right
  // away rather than gating it behind a scroll-triggered intro.
  const dwjTypeFrame = document.querySelector(".dwj-type-frame");
  if (dwjTypeFrame) {
    const intro = dwjTypeFrame.querySelector(".dwj-type-intro");
    const track = dwjTypeFrame.querySelector(".dwj-type-track");
    if (intro) intro.style.display = "none";
    if (track) {
      track.style.opacity = "1";
      track.style.animationPlayState = "running";
    }
  }

  // --- Video mute toggles ----------------------------------------------
  // Applies to any .video-mute-toggle button on the page (hero and/or
  // gallery videos that carry real audio). Autoplay still requires the
  // video to start muted, so this only flips `muted` after a user
  // gesture rather than controlling playback itself.
  document.querySelectorAll(".video-mute-toggle").forEach((button) => {
    const video = button.parentElement.querySelector("video");
    if (!video) return;
    button.addEventListener("click", () => {
      video.muted = !video.muted;
      button.setAttribute("aria-pressed", String(!video.muted));
      button.setAttribute(
        "aria-label",
        video.muted ? "Unmute video" : "Mute video",
      );
    });
  });

  // --- Project carousels ------------------------------------------------
  // Loops infinitely in both directions: the real items are flanked by a
  // cloned copy on each side, so there's always another slide to scroll
  // to no matter which arrow gets clicked. Once a smooth scroll settles
  // on a clone, it's silently swapped (no animation) for the matching
  // real slide, so the loop point is invisible. Navigating by exact
  // element position (scrollTo an item's offsetLeft) rather than a
  // guessed distance is also what fixed an earlier bug where scrollBy's
  // computed distance didn't quite match the CSS scroll-snap point,
  // causing a visible snap-back "bounce" after every click.
  document.querySelectorAll("[data-carousel]").forEach((carousel) => {
    const track = carousel.querySelector("[data-carousel-track]");
    const prevButton = carousel.querySelector("[data-carousel-prev]");
    const nextButton = carousel.querySelector("[data-carousel-next]");
    const realItems = track ? Array.from(track.children) : [];
    if (!track || !prevButton || !nextButton || realItems.length === 0) return;

    const count = realItems.length;
    const makeClone = (original) => {
      const clone = original.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      clone.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"));
      return clone;
    };
    // Built as one fragment and inserted in a single call — inserting
    // each clone individually via insertBefore(clone, track.firstChild)
    // would reverse their order, since every new clone bumps the
    // previous one further right instead of taking its place in line.
    const prependFrag = document.createDocumentFragment();
    realItems.forEach((original) => prependFrag.appendChild(makeClone(original)));
    track.insertBefore(prependFrag, track.firstChild);
    realItems.forEach((original) => track.appendChild(makeClone(original)));

    const allItems = Array.from(track.children);
    let index = count; // first real item, past the prepended clones
    const goTo = (i, smooth) => {
      track.scrollTo({ left: allItems[i].offsetLeft, behavior: smooth ? "smooth" : "auto" });
    };
    goTo(index, false);

    // Recomputed from actual scroll position rather than trusting the
    // tracked `index` — a finger swipe moves the scroll position without
    // going through goTo, so `index` alone would go stale the moment
    // someone drags the carousel instead of using the arrows, and the
    // next arrow click would jump from the wrong slide.
    const nearestIndex = () => {
      let closest = 0;
      let minDist = Infinity;
      allItems.forEach((item, i) => {
        const dist = Math.abs(item.offsetLeft - track.scrollLeft);
        if (dist < minDist) {
          minDist = dist;
          closest = i;
        }
      });
      return closest;
    };

    let settleTimer;
    track.addEventListener("scroll", () => {
      clearTimeout(settleTimer);
      settleTimer = setTimeout(() => {
        index = nearestIndex();
        if (index < count) {
          index += count;
          goTo(index, false);
        } else if (index >= count * 2) {
          index -= count;
          goTo(index, false);
        }
      }, 120);
    });

    prevButton.addEventListener("click", () => goTo(--index, true));
    nextButton.addEventListener("click", () => goTo(++index, true));
  });

  // --- Airwaves: shader prototype demo ----------------------------------
  // The actual proof-of-concept shader from the project, running live —
  // same WebGL warp code as the standalone tool, wired up to the
  // approved sizzle-video stills instead of a file upload. Only runs on
  // the airwaves page, where the [data-shader-demo] markup exists.
  const shaderDemo = document.querySelector("[data-shader-demo]");
  if (shaderDemo) {
    const canvas = shaderDemo.querySelector("[data-shader-canvas]");
    const thumbs = Array.from(shaderDemo.querySelectorAll("[data-shader-thumb]"));
    const modeButtons = Array.from(shaderDemo.querySelectorAll("[data-shader-mode]"));
    const sliders = {
      amp: shaderDemo.querySelector('[data-shader-input="amp"]'),
      freq: shaderDemo.querySelector('[data-shader-input="freq"]'),
      speed: shaderDemo.querySelector('[data-shader-input="speed"]'),
    };
    const sliderLabels = {
      amp: shaderDemo.querySelector('[data-shader-val="amp"]'),
      freq: shaderDemo.querySelector('[data-shader-val="freq"]'),
      speed: shaderDemo.querySelector('[data-shader-val="speed"]'),
    };

    const VS = `
      attribute vec2 a_pos;
      varying vec2 v_uv;
      void main() {
        v_uv = a_pos * 0.5 + 0.5;
        gl_Position = vec4(a_pos, 0.0, 1.0);
      }`;

    // Same four warp modes as the standalone prototype, plus a
    // u_coverRatio uniform (computed in JS below) so any source image,
    // regardless of its own aspect ratio, fills the fixed-ratio stage
    // like CSS object-fit: cover instead of stretching.
    const FS = `
      precision highp float;
      uniform sampler2D u_tex;
      uniform float u_time;
      uniform float u_amp;
      uniform float u_freq;
      uniform int   u_mode;
      uniform vec2  u_coverRatio;
      varying vec2  v_uv;

      vec2 hash2(vec2 p) {
        p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
        return fract(sin(p) * 43758.5453);
      }

      float vnoise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        float a = fract(sin(dot(i + vec2(0,0), vec2(127.1,311.7))) * 43758.5453);
        float b = fract(sin(dot(i + vec2(1,0), vec2(127.1,311.7))) * 43758.5453);
        float c = fract(sin(dot(i + vec2(0,1), vec2(127.1,311.7))) * 43758.5453);
        float d = fract(sin(dot(i + vec2(1,1), vec2(127.1,311.7))) * 43758.5453);
        return mix(mix(a,b,u.x), mix(c,d,u.x), u.y) * 2.0 - 1.0;
      }

      float fbm(vec2 p) {
        return vnoise(p) + 0.5*vnoise(p*2.1+vec2(1.7,9.2)) + 0.25*vnoise(p*4.3+vec2(8.3,2.8));
      }

      void main() {
        vec2 uv = v_uv * u_coverRatio + (1.0 - u_coverRatio) * 0.5;
        float pad = 0.06;
        vec2 suv = uv * (1.0 - 2.0*pad) + pad;

        float amp  = u_amp  * 0.001;
        float freq = u_freq;
        float t    = u_time;
        vec2 warp  = vec2(0.0);

        if (u_mode == 0) {
          vec2 d = uv - 0.5;
          float r = length(d);
          float angle = atan(d.y, d.x);
          float wave = amp * sin(freq * r * 6.2832 - t);
          float nr = r + wave;
          warp = vec2(cos(angle), sin(angle)) * (nr - r);

        } else if (u_mode == 1) {
          float scale = freq * 0.8;
          float nx = vnoise(suv * scale + vec2(0.0, t * 0.25));
          float ny = vnoise(suv * scale + vec2(31.7, t * 0.25));
          warp = vec2(nx, ny) * amp * 2.5;

        } else if (u_mode == 2) {
          float wave  = amp * sin(uv.y * freq * 6.2832 + t);
          float wave2 = amp * 0.4 * sin(uv.y * freq * 3.7 * 6.2832 + t * 1.3);
          warp = vec2(wave + wave2, 0.0);

        } else {
          float scale = freq * 0.5;
          float nx = fbm(suv * scale + vec2(t * 0.12, 0.0));
          float ny = fbm(suv * scale + vec2(0.0, t * 0.12 + 5.2));
          warp = vec2(nx, ny) * amp * 3.0;
        }

        vec2 finalUV = clamp(suv + warp, 0.0, 1.0);
        gl_FragColor = texture2D(u_tex, finalUV);
      }`;

    let gl, program, texture, uniforms, animId, startTime;
    let currentMode = 0;
    let coverRatio = [1, 1];

    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    };

    const initGL = () => {
      gl = canvas.getContext("webgl", { antialias: true });
      if (!gl) return false;

      program = gl.createProgram();
      gl.attachShader(program, compile(gl.VERTEX_SHADER, VS));
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FS));
      gl.linkProgram(program);
      gl.useProgram(program);

      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(program, "a_pos");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

      texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      uniforms = {
        time: gl.getUniformLocation(program, "u_time"),
        amp: gl.getUniformLocation(program, "u_amp"),
        freq: gl.getUniformLocation(program, "u_freq"),
        mode: gl.getUniformLocation(program, "u_mode"),
        coverRatio: gl.getUniformLocation(program, "u_coverRatio"),
      };

      return true;
    };

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      if (gl) gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const loadTexture = (src) => {
      const img = new Image();
      img.onload = () => {
        const canvasAspect = canvas.clientWidth / canvas.clientHeight;
        const imageAspect = img.naturalWidth / img.naturalHeight;
        coverRatio = [
          Math.min(canvasAspect / imageAspect, 1),
          Math.min(imageAspect / canvasAspect, 1),
        ];
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      };
      // data-src attributes are plain strings Vite never rewrites (unlike
      // real src/href attributes), so they stay root-relative even when
      // the site is deployed under a subpath — resolve against the
      // actual configured base here instead of using src as-is.
      img.src = import.meta.env.BASE_URL + src.replace(/^\//, "");
    };

    const render = (timestamp) => {
      if (!gl) return;
      if (!startTime) startTime = timestamp;
      const speed = parseFloat(sliders.speed.value);
      const t = ((timestamp - startTime) / 1000) * (speed * 0.4);
      gl.uniform1f(uniforms.time, t);
      gl.uniform1f(uniforms.amp, parseFloat(sliders.amp.value));
      gl.uniform1f(uniforms.freq, parseFloat(sliders.freq.value));
      gl.uniform1i(uniforms.mode, currentMode);
      gl.uniform2f(uniforms.coverRatio, coverRatio[0], coverRatio[1]);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animId = requestAnimationFrame(render);
    };

    if (initGL()) {
      resizeCanvas();
      window.addEventListener("resize", resizeCanvas);

      const defaultThumb = thumbs.find((t) => t.classList.contains("is-active")) || thumbs[0];
      if (defaultThumb) loadTexture(defaultThumb.dataset.src);

      animId = requestAnimationFrame(render);

      thumbs.forEach((thumb) => {
        thumb.addEventListener("click", () => {
          if (thumb.classList.contains("is-active")) return;
          thumbs.forEach((t) => {
            t.classList.remove("is-active");
            t.setAttribute("aria-checked", "false");
          });
          thumb.classList.add("is-active");
          thumb.setAttribute("aria-checked", "true");
          loadTexture(thumb.dataset.src);
        });
      });

      modeButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
          modeButtons.forEach((b) => {
            b.classList.remove("is-active");
            b.setAttribute("aria-checked", "false");
          });
          btn.classList.add("is-active");
          btn.setAttribute("aria-checked", "true");
          currentMode = parseInt(btn.dataset.shaderMode, 10);
        });
      });

      Object.entries(sliders).forEach(([key, input]) => {
        input.addEventListener("input", () => {
          sliderLabels[key].textContent = input.value;
        });
      });
    }
  }

});
