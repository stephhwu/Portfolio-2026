import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

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

  // --- Landing hero: portfolio highlight reel --------------------------
  // Seven scenes cross-dissolve in a loop, each with its own entrance
  // move (pan, staggered grid, fast pop, directional slide) so the reel
  // reads like an edited sizzle cut. Videos only play while their scene
  // is the active one — otherwise six clips would be decoding in the
  // background simultaneously for no visible benefit.
  const reel = document.querySelector(".landing-reel");
  if (reel) {
    const scenes = gsap.utils.toArray(".landing-reel-scene", reel);
    const HOLD = {
      "sixth-street": 2.6,
      airwaves: 2.1,
      synth: 2.3,
      "dog-data": 1.8,
      "jersey-triptych": 1.5,
      "jersey-bento": 2.1,
      coral: 2,
    };
    const XFADE = 0.4;

    const playSceneVideos = (scene) => {
      scene.querySelectorAll("video").forEach((v) => {
        v.currentTime = 0;
        v.play().catch(() => {});
      });
    };
    const stopSceneVideos = (scene) => {
      scene.querySelectorAll("video").forEach((v) => v.pause());
    };

    if (prefersReducedMotion) {
      gsap.set(scenes, { opacity: 0 });
      gsap.set(scenes[0], { opacity: 1 });
      playSceneVideos(scenes[0]);
    } else {
      gsap.set(scenes.slice(1), { opacity: 0 });

      const master = gsap.timeline({ repeat: -1 });

      scenes.forEach((scene, i) => {
        const name = scene.dataset.scene;
        const hold = HOLD[name] ?? 2;
        const isFirst = i === 0;
        const sceneTl = gsap.timeline();

        sceneTl.call(() => playSceneVideos(scene));

        if (!isFirst) {
          sceneTl.to(scene, { opacity: 1, duration: XFADE, ease: "power1.out" }, 0);
        }

        // Per-scene entrance choreography, layered on top of the crossfade.
        if (name === "sixth-street") {
          const img = scene.querySelector(".landing-reel-pan img");
          gsap.set(img, { scale: 1.22, xPercent: -6 });
          sceneTl.to(
            img,
            { xPercent: 6, duration: hold + XFADE, ease: "none" },
            0,
          );
        } else if (name === "airwaves") {
          const items = scene.querySelectorAll(".landing-reel-airwaves-item");
          gsap.set(items, { opacity: 0, scale: 0.92 });
          sceneTl.to(
            items,
            { opacity: 1, scale: 1, duration: 0.5, ease: "power3.out", stagger: 0.08 },
            0.1,
          );
        } else if (name === "synth") {
          const items = scene.querySelectorAll(".landing-reel-synth-item");
          gsap.set(items, { opacity: 0, scale: 0.7 });
          sceneTl.to(
            items,
            {
              opacity: 1,
              scale: 1,
              duration: 0.45,
              ease: "back.out(1.7)",
              stagger: 0.045,
            },
            0.1,
          );
        } else if (name === "jersey-triptych") {
          const items = scene.querySelectorAll(".landing-reel-triptych-item");
          gsap.set(items, { opacity: 0, scale: 0.85 });
          sceneTl.to(
            items,
            { opacity: 1, scale: 1, duration: 0.18, ease: "power2.out", stagger: 0.07 },
            0.05,
          );
        } else if (name === "jersey-bento") {
          const bridge = scene.querySelector(".landing-reel-jersey-item--bridge");
          const box = scene.querySelector(".landing-reel-jersey-item--box");
          const portrait = scene.querySelector(".landing-reel-jersey-item--portrait");
          gsap.set(bridge, { opacity: 0, x: -24 });
          gsap.set(box, { opacity: 0, y: 24 });
          gsap.set(portrait, { opacity: 0, x: 24 });
          sceneTl
            .to(bridge, { opacity: 1, x: 0, duration: 0.5, ease: "power3.out" }, 0.1)
            .to(box, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, 0.22)
            .to(portrait, { opacity: 1, x: 0, duration: 0.5, ease: "power3.out" }, 0.16);
        }

        sceneTl.to({}, { duration: hold });
        sceneTl.to(scene, { opacity: 0, duration: XFADE, ease: "power1.in" });
        sceneTl.call(() => stopSceneVideos(scene));

        master.add(sceneTl);
      });
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

  // --- Page-load entrance: nav, hero media, and headline type-in ------
  // Runs on every page (index, about, play, and every project detail
  // page) since each is a full page load, not a client-side route.
  if (!prefersReducedMotion) {
    const siteNav = document.querySelector(".site-nav");
    const heroMedia = document.querySelector(".landing-video-placeholder");
    const landingName = document.querySelector(".landing-name");
    const placeholderCopy = document.querySelector(".placeholder-page p");

    const intro = gsap.timeline({ defaults: { ease: "power3.out" } });

    if (siteNav) {
      gsap.set(siteNav, { y: -16, opacity: 0 });
      intro.to(siteNav, { y: 0, opacity: 1, duration: 0.5 }, 0);
    }

    if (heroMedia) {
      gsap.set(heroMedia, { opacity: 0, scale: 0.97 });
      intro.to(heroMedia, { opacity: 1, scale: 1, duration: 0.8 }, 0.1);
    }

    if (landingName) {
      const words = splitWords(landingName);
      gsap.set(words, { yPercent: 110, opacity: 0 });
      intro.to(
        words,
        { yPercent: 0, opacity: 1, duration: 0.9, stagger: 0.08 },
        0.25,
      );
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
      ".footer-heading",
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
