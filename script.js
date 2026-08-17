import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
CustomEase.create("hop", "0.8, 0, 0.2, 1");
CustomEase.create("hop2", "0.9, 0, 0.1, 1");

// Splits an element into chars/words via GSAP SplitText, optionally
// wrapping each unit in its own overflow-hidden mask (SplitText's
// `mask` option) so it can slide up from nothing without ever
// revealing past its own baseline. Used by the preloader/hero reveal.
function splitText(selector, type, className, mask = true) {
  return SplitText.create(selector, {
    type,
    [`${type}Class`]: className,
    ...(mask && { mask: type }),
  });
}

// Splits an element's text into word spans wrapped in an overflow-hidden
// mask, so each word can slide/fade in independently without ever
// revealing from nothing (see splitWords usage below).
function splitWords(el) {
  const words = el.textContent.trim().split(/\s+/);
  el.textContent = "";
  const inners = [];
  words.forEach((word, i) => {
    const wrap = document.createElement("span");
    wrap.className = "split-word";
    const inner = document.createElement("span");
    inner.className = "split-word-inner";
    inner.textContent = word;
    wrap.appendChild(inner);
    el.appendChild(wrap);
    inners.push(inner);
    if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
  });
  return inners;
}

document.addEventListener("DOMContentLoaded", () => {
  const lenis = new Lenis();
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

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

  // --- Landing entrance: preloader + hero reveal ------------------------
  // A fixed full-screen preloader (fanned project thumbnails, wordmark,
  // and a counter) plays once on the homepage, then wipes away via
  // clip-path to reveal the hero beneath. Scroll is locked for the
  // duration so the page can't be scrolled out from under the still-
  // animating overlay; the nav stays hidden until the wipe reaches it
  // and reveals in the same beat as the hero bio, so the whole thing
  // reads as one choreographed cut rather than the preloader just
  // disappearing.
  const preloader = document.querySelector(".preloader");
  // Set by the "Work" nav link (see below) right before it navigates here
  // from another page, so landing on #work reads as a jump-to-section
  // rather than replaying the full preloader. A genuine reload/refresh
  // never sets this, so the intro still plays then.
  const skipIntro = sessionStorage.getItem("skipIntro") === "1";
  if (skipIntro) sessionStorage.removeItem("skipIntro");
  if (preloader) {
    if (prefersReducedMotion || skipIntro) {
      preloader.style.display = "none";
    } else {
      document.body.style.overflow = "hidden";
      lenis.stop();

      splitText(".preloader-header h1", "chars", "char");
      splitText(".site-nav a", "words", "word");

      const preloaderImgInitRotations = [7.5, -2.5, -10, 12.5, -5, 5];
      gsap.set(".preloader-img", {
        rotate: (i) => preloaderImgInitRotations[i],
      });

      const heroBio = document.querySelector(".hero-bio");
      const heroBioWords = heroBio ? splitWords(heroBio) : [];
      gsap.set(heroBioWords, { yPercent: 110, opacity: 0 });

      const tl = gsap.timeline({
        delay: 0.5,
        onComplete: () => {
          document.body.style.overflow = "";
          lenis.start();
        },
      });

      tl.to(".preloader-img", {
        scale: 1,
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        duration: 1,
        ease: "hop",
        stagger: 0.2,
      });

      // Each char slides up out of its own overflow-clip mask, so a
      // letter with a detached top stroke (the tittle on "i", the
      // upper curve of "e") visibly separates from the rest of the
      // glyph while its tween is still in flight — the top crosses
      // into view before the bottom does. A full 1s tween made that
      // window long enough to read as a clipped/broken letter instead
      // of a quick reveal, so this is kept short.
      tl.to(
        ".preloader-header h1 .char",
        {
          y: "0%",
          duration: 0.5,
          ease: "hop2",
          stagger: { each: 0.05, from: "random" },
        },
        "0.35",
      );

      tl.to(
        ".preloader-counter p",
        {
          y: "0%",
          duration: 1,
          ease: "hop2",
          onStart: () => {
            const counterEl = document.querySelector(".preloader-counter p");
            const counter = { value: 0 };
            gsap.to(counter, {
              value: 100,
              duration: 2,
              delay: 0.5,
              ease: "power2.inOut",
              onUpdate: () => {
                counterEl.textContent = String(
                  Math.round(counter.value),
                ).padStart(3, "0");
              },
            });
          },
        },
        "<",
      );

      tl.to(
        ".preloader-counter p",
        { y: "-100%", duration: 0.75, ease: "hop2" },
        3.25,
      );

      tl.to(
        ".preloader-header h1 .char",
        {
          y: "-100%",
          duration: 0.75,
          ease: "hop2",
          stagger: { each: 0.125, from: "random" },
        },
        3.25,
      );

      tl.to(
        ".preloader-images .preloader-img",
        {
          scale: 0,
          clipPath: "polygon(20% 20%, 80% 20%, 80% 80%, 20% 80%)",
          duration: 1,
          ease: "hop2",
          stagger: -0.075,
        },
        3.5,
      );

      tl.to(
        preloader,
        { clipPath: "inset(0 0 100% 0)", duration: 1, ease: "hop2" },
        4.35,
      );

      tl.to(
        ".site-nav a .word",
        { y: "0%", duration: 1, ease: "hop", stagger: 0.075 },
        4.65,
      );

      // Held back until the nav/wordmark wipe has settled, so the bio
      // reads as its own follow-up beat instead of just more motion
      // happening in the same instant.
      tl.to(
        heroBioWords,
        { yPercent: 0, opacity: 1, duration: 0.8, ease: "power3.out", stagger: 0.06 },
        5.1,
      );
    }
  }

  // --- Mobile menu ---------------------------------------------------
  const navToggle = document.querySelector(".nav-toggle");
  const mobileMenu = document.getElementById("mobile-menu");

  const closeMobileMenu = () => {
    if (!navToggle || !mobileMenu) return;
    mobileMenu.classList.remove("is-open");
    mobileMenu.setAttribute("inert", "");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
    document.documentElement.style.overflow = "";
    lenis.start();
  };

  const openMobileMenu = () => {
    if (!navToggle || !mobileMenu) return;
    mobileMenu.classList.add("is-open");
    mobileMenu.removeAttribute("inert");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Close menu");
    document.documentElement.style.overflow = "hidden";
    lenis.stop();
    const firstLink = mobileMenu.querySelector(".mobile-menu-link");
    if (firstLink) firstLink.focus();
  };

  if (navToggle && mobileMenu) {
    navToggle.addEventListener("click", () => {
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    mobileMenu.querySelectorAll(".mobile-menu-link").forEach((link) => {
      link.addEventListener("click", closeMobileMenu);
    });

    document.addEventListener("keydown", (e) => {
      if (
        e.key === "Escape" &&
        navToggle.getAttribute("aria-expanded") === "true"
      ) {
        closeMobileMenu();
        navToggle.focus();
      }
    });
  }

  // --- "Work" nav links (desktop + mobile menu) -----------------------
  document.querySelectorAll(".work-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      const target = document.getElementById("work");
      if (target) {
        e.preventDefault();
        lenis.scrollTo(target);
      } else {
        // Navigating to the homepage's #work section from another page:
        // let the browser follow the link normally, but flag it so the
        // preloader intro is skipped on arrival (see above).
        sessionStorage.setItem("skipIntro", "1");
      }
    });
  });

  if (location.hash) {
    const hashTarget = document.querySelector(location.hash);
    if (hashTarget) {
      requestAnimationFrame(() =>
        lenis.scrollTo(hashTarget, { immediate: true }),
      );
    }
  }

  // --- Page-load entrance: nav and headline type-in ---------------------
  // Runs on every page (about, play, and every project detail page)
  // since each is a full page load, not a client-side route. Skipped
  // for .site-nav on the homepage, where the preloader/hero timeline
  // above owns the nav's reveal instead so it doesn't fade in twice.
  if (!prefersReducedMotion) {
    const siteNav = document.querySelector(".site-nav");
    const placeholderCopy = document.querySelector(".placeholder-page p");

    const intro = gsap.timeline({ defaults: { ease: "power3.out" } });

    if (siteNav && !preloader) {
      gsap.set(siteNav, { y: -16, opacity: 0 });
      intro.to(siteNav, { y: 0, opacity: 1, duration: 0.5 }, 0);
    }

    if (placeholderCopy) {
      gsap.set(placeholderCopy, { y: 16, opacity: 0 });
      intro.to(placeholderCopy, { y: 0, opacity: 1, duration: 0.6 }, 0.1);
    }
  }

  // --- Project title type-in on scroll ---------------------------------
  const projectTitle = document.querySelector(".project-title");
  if (projectTitle && !prefersReducedMotion) {
    const words = splitWords(projectTitle);
    gsap.set(words, { yPercent: 110, opacity: 0 });
    ScrollTrigger.create({
      trigger: projectTitle,
      start: "top 85%",
      once: true,
      onEnter: () =>
        gsap.to(words, {
          yPercent: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.06,
          ease: "power3.out",
        }),
    });
  }

  // --- Generic scroll-triggered content reveals ------------------------
  // Shared classes from the project template + footer, so this applies
  // across every page without needing per-page markup changes. The
  // desktop pinned "spotlight" section manages its own scrubbed motion
  // and is intentionally left out of this pass.
  if (!prefersReducedMotion) {
    const fadeUpSelectors = [
      ".project-tagline",
      ".eyebrow",
      ".project-meta-list",
      ".project-meta-value",
      ".project-section-title",
      ".project-section-body p",
      ".project-gallery-item",
      ".project-guideline-item",
      ".bento-item",
      ".project-feature",
      ".project-credit",
      ".about-hero-title",
      ".about-bio p",
      ".about-role",
      ".about-award",
      ".about-clients-item",
      ".footer-contact",
      ".spotlight-mobile .project-blurb",
    ];

    fadeUpSelectors.forEach((selector) => {
      const els = gsap.utils.toArray(selector);
      if (!els.length) return;
      gsap.set(els, { opacity: 0, y: 20 });
      ScrollTrigger.batch(els, {
        start: "top 85%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out",
            stagger: 0.06,
          }),
      });
    });
  }

  // --- Dogs with Jobs: brand bento type reveal -------------------------
  // Opens on the font name itself ("Ivypresto Headline") as a beat before
  // the marquee starts, rather than cutting straight to the looping text.
  // The marquee stays paused (and at opacity 0) via CSS until this timeline
  // hands off to it, so there's one continuous motion instead of two
  // independent animations racing each other.
  const dwjTypeFrame = document.querySelector(".dwj-type-frame");
  if (dwjTypeFrame) {
    const intro = dwjTypeFrame.querySelector(".dwj-type-intro");
    const track = dwjTypeFrame.querySelector(".dwj-type-track");

    if (prefersReducedMotion) {
      intro.style.display = "none";
      track.style.opacity = "1";
    } else {
      gsap.set(intro, { opacity: 0, y: 14, scale: 0.94 });

      ScrollTrigger.create({
        trigger: dwjTypeFrame,
        start: "top 85%",
        once: true,
        onEnter: () => {
          gsap
            .timeline()
            .to(intro, {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.7,
              ease: "power3.out",
            })
            .to(intro, {
              opacity: 0,
              filter: "blur(6px)",
              duration: 0.35,
              ease: "power2.in",
            }, "+=1.1")
            .to(track, { opacity: 1, duration: 0.4, ease: "power1.out" }, "-=0.15")
            .call(() => {
              track.style.animationPlayState = "running";
            });
        },
      });
    }
  }

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

  // --- Spotlight / work section ---------------------------------------
  const spotlightSection = document.querySelector(".spotlight");
  if (!spotlightSection) return;

  ScrollTrigger.matchMedia({
    // Desktop: pinned, scrubbed scroll-jacking sequence.
    "(min-width: 769px)": () => {
      const projectIndex = document.querySelector(".project-index h1");
      const projectIndexTotal = projectIndex.querySelector(
        ".project-index-total",
      );
      const digitReel = projectIndex.querySelector(".digit-reel");
      const digitReelWindow = projectIndex.querySelector(
        ".digit-reel-window",
      );
      const digitRowHeight = digitReelWindow.offsetHeight;

      const projectImgs = document.querySelectorAll(".project-img");
      const projectImagesContainer =
        document.querySelector(".project-images");
      // Constant pixel distance between consecutive thumbnails' tops
      // (image height + gap). Since the whole column translates as one
      // rigid block, this step never changes once measured — it's what
      // lets continuousIndex below track the *real* crossing geometry
      // instead of an assumed 1/totalProjectCount-per-project rate,
      // which drifted out of sync with when each thumbnail actually
      // reached center.
      const imageStep =
        projectImgs[1].getBoundingClientRect().top -
        projectImgs[0].getBoundingClientRect().top;
      // Height doesn't change once the layout settles, so this is safe
      // to measure once — unlike top, which shifts the moment GSAP's pin
      // engages (see the single getBoundingClientRect read in onUpdate
      // below, kept for exactly that reason).
      const imgHeight = projectImgs[0].getBoundingClientRect().height;
      const projectNamesContainer = document.querySelector(".project-names");
      const projectNamesReel = document.querySelector(".project-names-reel");
      const projectNames = document.querySelectorAll(".project-names-reel p");
      const totalProjectCount = projectNames.length;
      const namesWindowHeight = projectNamesContainer.offsetHeight;
      const namesRowHeight = projectNames[0].offsetHeight;

      projectIndexTotal.textContent = `/${String(totalProjectCount).padStart(
        2,
        "0",
      )}`;

      const imgActivationThreshold = window.innerHeight / 2;
      const imgActiveScale = 0.15;

      // How far the column needs to travel so the *last* thumbnail's
      // center lands exactly on the activation line by the end of the
      // scroll — not just "the container's bottom edge reaches the
      // viewport's bottom edge" (the previous formula), which left
      // slack that grew or shrank with .project-images' padding and
      // didn't actually guarantee the last project ever reached center.
      // paddingTop mirrors where the first thumbnail sits the instant
      // the pin engages (GSAP pins .spotlight's top to the viewport
      // top, and .project-images itself sits at top:0 within it).
      const paddingTop = parseFloat(
        getComputedStyle(projectImagesContainer).paddingTop,
      );
      const lastImgInitialCenter =
        paddingTop + (totalProjectCount - 1) * imageStep + imgHeight / 2;
      const moveDistanceImages = imgActivationThreshold - lastImgInitialCenter;

      // Covers with looping media only animate while active in the
      // spotlight: <video> covers (e.g. Adobe CIS) play/pause, and <img>
      // covers that opt in via data-loop-src (e.g. Coral Bleaching Map)
      // swap to their looping asset — both revert once scrolled past.
      const loopActiveStates = new WeakMap();

      const trigger = ScrollTrigger.create({
        trigger: ".spotlight",
        start: "top top",
        // How much real scroll input the whole sequence takes — this is
        // purely pacing (a bigger number = slower, more deliberate
        // scroll per project). It's independent of whether the images
        // actually finish moving by the end: progress always reaches 1,
        // and therefore imagesTranslateY always reaches exactly
        // moveDistanceImages, right as this distance runs out — that
        // correctness lives in the moveDistanceImages formula itself,
        // not here. (A previous version tied this directly to
        // moveDistanceImages' magnitude thinking that was required for
        // the last thumbnail to land correctly — it wasn't, and doing
        // that also deleted all the scroll-per-project pacing, making
        // the whole sequence blow past in a few hundred pixels.)
        end: `+=${window.innerHeight * 5}px`,
        pin: true,
        pinSpacing: true,
        scrub: 1,
        onUpdate: (self) => {
          // Skip all of this while the section isn't actually pinned in
          // view. GSAP can fire onUpdate before the trigger reaches its
          // start point (e.g. during initial setup/refresh, before the
          // user has scrolled anywhere near the spotlight); without this
          // guard, that fires the loop-media activation logic below on
          // page load — which is what was eagerly fetching the Coral
          // Bleaching gif and the Adobe CIS/COS cover videos before
          // anyone had scrolled a pixel.
          if (!self.isActive) return;

          const progress = self.progress;
          const imagesTranslateY = progress * moveDistanceImages;

          gsap.set(projectImagesContainer, {
            y: imagesTranslateY,
          });

          // One real read per frame — the only one left in this loop.
          // GSAP's pin engages by transforming .spotlight itself, which
          // shifts the coordinate space in a way a purely analytical
          // "initial position + offset" formula can't account for (there
          // was a version of this that tried exactly that and it drifted
          // once the pin kicked in). Every other image's position is
          // still derived by arithmetic from this one real measurement —
          // they move rigidly together, so that relationship holds
          // regardless of what the pin is doing underneath.
          const firstImgTop = projectImgs[0].getBoundingClientRect().top;

          // A continuous (unfloored) project position, derived from the
          // first thumbnail's actual position relative to the activation
          // line rather than an assumed even split of progress. Both the
          // digit reel and the name reel scrub off this single value, so
          // they land on the next number/name at the exact moment its
          // thumbnail reaches center — not before, not after.
          const firstImgCenter = firstImgTop + imgHeight / 2;
          const continuousIndex = Math.min(
            totalProjectCount,
            Math.max(
              1,
              1 + (imgActivationThreshold - firstImgCenter) / imageStep,
            ),
          );

          gsap.set(digitReel, {
            y: -continuousIndex * digitRowHeight,
          });

          projectImgs.forEach((img, index) => {
            const imgTop = firstImgTop + index * imageStep;
            const imgBottom = imgTop + imgHeight;
            const isActive =
              imgTop <= imgActivationThreshold &&
              imgBottom >= imgActivationThreshold;

            const media = img.querySelector("img, video");
            if (media && media.tagName === "VIDEO") {
              // Video covers (e.g. Adobe CIS) play only while active,
              // instead of running continuously off-screen.
              const wasActive = loopActiveStates.get(media);
              if (isActive !== wasActive) {
                if (isActive) {
                  media.currentTime = 0;
                  media.play().catch(() => {});
                } else {
                  media.pause();
                }
                loopActiveStates.set(media, isActive);
              }
            } else if (media && media.dataset.loopSrc) {
              const wasActive = loopActiveStates.get(media);
              if (isActive !== wasActive) {
                media.src = isActive
                  ? media.dataset.loopSrc
                  : media.dataset.stillSrc;
                loopActiveStates.set(media, isActive);
              }
            }

            // Scale grows the closer the image sits to the activation
            // line and eases back out as it drifts away, rather than
            // snapping between two states like opacity does. Falloff
            // range matches the image's own height so the peak lines up
            // with isActive and the effect fully resolves by the time
            // the neighboring image takes over.
            const imgCenter = imgTop + imgHeight / 2;
            const distance = Math.abs(imgCenter - imgActivationThreshold);
            const proximity = Math.max(0, 1 - distance / imgHeight);
            const eased = proximity * proximity * (3 - 2 * proximity);

            gsap.set(img, {
              opacity: isActive ? 1 : 0.5,
              scale: 1 + eased * imgActiveScale,
              // The scaled-up image overlaps its neighbors' boxes since
              // transform doesn't affect layout. Without this, whichever
              // image is later in the DOM paints on top regardless of
              // size, so a dim neighbor could sit over the grown, bright
              // one. Keying z-index to how grown each image currently is
              // keeps the biggest one on top.
              zIndex: Math.round(eased * 10),
            });
          });

          // Centers whichever name sits at continuousIndex in the
          // window, same idea as the digit reel above — the reel moves,
          // the highlighted slot doesn't. Neighbors dim and fade with
          // distance from center; the CSS mask on .project-names
          // handles the soft cutoff at the window's top/bottom edges.
          gsap.set(projectNamesReel, {
            y: namesWindowHeight / 2 - (continuousIndex - 0.5) * namesRowHeight,
          });

          projectNames.forEach((p, index) => {
            const distance = Math.abs(continuousIndex - (index + 1));
            gsap.set(p, {
              color: distance < 0.5 ? "#fff" : "#4a4a4a",
              opacity: Math.max(0.25, 1 - distance * 0.35),
            });
          });
        },
      });

      // Returning a cleanup function lets matchMedia revert this
      // trigger automatically if the viewport crosses the breakpoint.
      return () => trigger.kill();
    },

    // Mobile: no scroll-jacking. Cards sit in normal document flow and
    // simply fade/slide in as they're scrolled to, which is far less
    // disorienting on touch devices and doesn't force a long forced
    // scroll before the user can move past the section.
    "(max-width: 768px)": () => {
      const mobileProjects = document.querySelectorAll(".mobile-project");
      if (mobileProjects.length === 0 || prefersReducedMotion) return;

      const triggers = Array.from(mobileProjects).map((el) => {
        gsap.set(el, { opacity: 0, y: 32 });
        return ScrollTrigger.create({
          trigger: el,
          start: "top 88%",
          onEnter: () =>
            gsap.to(el, {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: "power2.out",
            }),
        });
      });

      return () => triggers.forEach((t) => t.kill());
    },
  });
});
