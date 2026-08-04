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
      ".bento-item",
      ".project-feature",
      ".project-credit",
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

  // --- Spotlight / work section ---------------------------------------
  const spotlightSection = document.querySelector(".spotlight");
  if (!spotlightSection) return;

  ScrollTrigger.matchMedia({
    // Desktop: pinned, scrubbed scroll-jacking sequence.
    "(min-width: 769px)": () => {
      const projectIndexContainer = document.querySelector(".project-index");
      const projectIndex = document.querySelector(".project-index h1");
      const projectImgs = document.querySelectorAll(".project-img");
      const projectImagesContainer =
        document.querySelector(".project-images");
      const projectNames = document.querySelectorAll(".project-names p");
      const projectNamesContainer = document.querySelector(".project-names");
      const totalProjectCount = projectNames.length;

      const spotlightSectionHeight = spotlightSection.offsetHeight;
      const spotlightSectionPadding = parseFloat(
        getComputedStyle(spotlightSection).padding,
      );
      const projectIndexMarginTop = parseFloat(
        getComputedStyle(projectIndexContainer).marginTop,
      );
      const projectIndexHeight =
        projectIndexContainer.offsetHeight + projectIndexMarginTop;
      const containerHeight = projectNamesContainer.offsetHeight;
      const imagesHeight = projectImagesContainer.offsetHeight;

      const moveDistanceIndex =
        spotlightSectionHeight -
        spotlightSectionPadding * 2 -
        projectIndexHeight;
      const moveDistanceNames =
        spotlightSectionHeight - spotlightSectionPadding * 2 - containerHeight;
      const moveDistanceImages = window.innerHeight - imagesHeight;

      const imgActivationThreshold = window.innerHeight / 2;

      const trigger = ScrollTrigger.create({
        trigger: ".spotlight",
        start: "top top",
        end: `+=${window.innerHeight * 5}px`,
        pin: true,
        pinSpacing: true,
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          const currentIndex = Math.min(
            Math.floor(progress * totalProjectCount) + 1,
            totalProjectCount,
          );

          projectIndex.textContent = `${String(currentIndex).padStart(
            2,
            "0",
          )}/${String(totalProjectCount).padStart(2, "0")}`;

          gsap.set(projectIndex, {
            y: progress * moveDistanceIndex,
          });

          gsap.set(projectImagesContainer, {
            y: progress * moveDistanceImages,
          });

          projectImgs.forEach((img) => {
            const imgRect = img.getBoundingClientRect();
            const imgTop = imgRect.top;
            const imgBottom = imgRect.bottom;

            if (
              imgTop <= imgActivationThreshold &&
              imgBottom >= imgActivationThreshold
            ) {
              gsap.set(img, {
                opacity: 1,
              });
            } else {
              gsap.set(img, {
                opacity: 0.5,
              });
            }
          });

          projectNames.forEach((p, index) => {
            const startProgress = index / totalProjectCount;
            const endProgress = (index + 1) / totalProjectCount;
            const projectProgress = Math.max(
              0,
              Math.min(
                1,
                (progress - startProgress) / (endProgress - startProgress),
              ),
            );

            gsap.set(p, {
              y: -projectProgress * moveDistanceNames,
            });

            if (projectProgress > 0 && projectProgress < 1) {
              gsap.set(p, {
                color: "#fff",
              });
            } else {
              gsap.set(p, {
                color: "#4a4a4a",
              });
            }
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
