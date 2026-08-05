// Generates one static project page per portfolio piece from a single
// template + data array. Re-run with `node generate-projects.mjs` after
// editing the data below or the markup in renderProject().
//
// Layout (applies to every project): hero (video or image) -> type-stack
// meta block (title, then Industry/Year/Tagline and Services/Brief/Finding
// rows) -> image gallery -> a second editorial text block -> a 3-column
// captioned feature grid -> credits -> next-project link. Projects that
// don't specify a field yet fall back to generic placeholder copy/slots
// (see withDefaults) so every page stays structurally complete while real
// content gets filled in project by project.
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const YEAR = 2026;

const projects = [
  {
    slug: "sixth-street-rebrand",
    name: "Sixth Street Rebrand",
    image: "/previews/sixth-street.jpg",
    tags: ["Branding", "Visual Identity"],
    galleryVideos: [
      {
        src: "/previews/sixth-street-gallery.mp4",
        poster: "/previews/sixth-street-gallery-poster.jpg",
      },
      {
        src: "/previews/sixth-street-quick-links.mp4",
        poster: "/previews/sixth-street-quick-links-poster.jpg",
      },
    ],
  },
  {
    slug: "airwaves",
    name: "ai.rwaves Cannes Radio",
    image: "/previews/airwaves.jpg",
    heroVideo: "/videos/airwaves-hero.mp4",
    heroPoster: "/videos/airwaves-hero-poster.jpg",
    heroAudio: true,
    galleryVideo: {
      src: "/videos/airwaves-audio.mp4",
      poster: "/videos/airwaves-audio-poster.jpg",
    },
    tags: ["Motion Design", "Web Design"],
  },
  {
    slug: "adobe-cis",
    name: "Adobe Creative Intelligence System",
    image: "/videos/adobe-cis-hero-poster.jpg",
    heroVideo: "/videos/adobe-cis-hero.mp4",
    heroPoster: "/videos/adobe-cis-hero-poster.jpg",
    tags: ["Product Design", "AI/ML"],
  },
  {
    slug: "adobe-cos",
    name: "Adobe Content Operating System",
    image: "/videos/adobe-cos-hero-poster.jpg",
    heroVideo: "/videos/adobe-cos-hero.mp4",
    heroPoster: "/videos/adobe-cos-hero-poster.jpg",
    tags: ["Product Design", "AI/ML"],
  },
  {
    slug: "dogs-with-jobs",
    name: "Dogs with Jobs",
    image: "/previews/dogs-with-jobs.jpg",
    heroVideo: "/videos/dogs-with-jobs.mp4",
    heroPoster: "/videos/dogs-with-jobs-poster.jpg",
    tags: ["Web Design", "Motion Design", "Illustration"],
    intro: {
      heading: "A playful case for taking creators seriously.",
      // TODO: replace with the real thesis narrative — process, goals,
      // and outcome.
      paragraphs: [
        "Dogs with Jobs is an interactive brand and web experience built around a simple premise: every dog has a job. Illustration, motion, and a bit of humor make the case for playful, creator-first design.",
        "Built with Vue, GSAP, and Locomotive Scroll, the site leans on scroll-driven storytelling and a hand-illustrated collage style — playful in tone, but a fully considered interaction design case study underneath.",
      ],
    },
    gallery: [],
    bento: [
      { src: "/dogs-with-jobs/shorter-intro", alt: "Dogs with Jobs site intro animation" },
      { src: "/dogs-with-jobs/government", alt: "Working dog policy compliance matrix" },
      { src: "/dogs-with-jobs/fame", alt: "Sniffer dog profile scroll section" },
      { src: "/dogs-with-jobs/sniffers", alt: "Why so many sniffers, olfactory receptor chart" },
      { src: "/dogs-with-jobs/matrices", alt: "Some Cool Dog Jobs intro and job-category matrix" },
      { src: "/dogs-with-jobs/breeds", alt: "Popular dog breed role explorer, Police/Military" },
      { src: "/dogs-with-jobs/wildlife", alt: "Wildlife detection effectiveness chart" },
      { src: "/dogs-with-jobs/guide", alt: "Fetching some guidance interaction prompt" },
    ],
  },
  {
    slug: "coral-bleaching",
    name: "Coral Bleaching Map",
    image: "/coral-bleaching/coral-title-poster.jpg",
    heroVideo: "/coral-bleaching/coral-title.mp4",
    heroPoster: "/coral-bleaching/coral-title-poster.jpg",
    industry: ["Data Visualization"],
    tags: ["D3.js", "HTML", "CSS", "Photoshop"],
    intro: {
      heading:
        "An interactive look at the vulnerability — and resilience — of Pacific coral reefs.",
      paragraphs: [
        "The National Coral Reef Monitoring Program tracks key indicators of U.S. coral reef health, including bleaching prevalence. We used a black-and-white aesthetic to highlight coral reefs' fragile beauty and the risk of losing them if we don't reduce our carbon footprint.",
        "As more reefs become bleached, their natural ability to buffer storm energy weakens, increasing flood risk for nearby communities — in Florida alone, projected reef loss could put over 7,300 people at greater risk and cost an estimated $823.6 million annually in flood damage.",
      ],
    },
    gallery: [],
    bento: [
      { src: "/coral-bleaching/coral-intro", alt: "Pacific Ocean Bleaching Map intro" },
      { src: "/coral-bleaching/temp-animation", alt: "Daily sea surface temperature chart" },
      { src: "/coral-bleaching/slider", alt: "Coral bleaching color-to-monochrome slider" },
      { src: "/coral-bleaching/hover", alt: "Additional bleached corals hover grid" },
      { src: "/coral-bleaching/image-click", alt: "Coral genus detail cards" },
    ],
    section2: {
      eyebrow: "Full Project Walkthrough",
      heading: "Why corals bleach — and why it matters.",
      paragraphs: [
        "Corals become bleached when environmental stressors like changes in temperature, light, or nutrient levels cause them to expel the algae that live within their tissues. This loss of algae, which help provide color and energy, leaves the corals white. Elevated water temperatures are a common trigger for this process.",
      ],
    },
    walkthroughVideo: "/coral-bleaching/bleach-increase.mp4",
    walkthroughPoster: "/coral-bleaching/bleach-increase-poster.jpg",
    featureColumns: 2,
    featureGrid: [
      {
        heading: "What is Coral Bleaching?",
        body: "If users are unfamiliar with coral bleaching, we have a page that introduces the topic. The leading cause is climate change — a warming ocean, and a change in water temperature of as little as 2°F, can cause coral to drive out algae.",
        video: "/coral-bleaching/coral-graph.mp4",
        poster: "/coral-bleaching/coral-graph-poster.jpg",
      },
      {
        heading: "The Map",
        body: "The map artistically clusters images of the most bleached corals, positioned to represent their respective Pacific Ocean jurisdictions. Hovering over an image reveals the year of peak bleaching and the genus of the affected coral.",
        video: "/coral-bleaching/coral-hover.mp4",
        poster: "/coral-bleaching/coral-hover-poster.jpg",
      },
      {
        heading: "Coral Modal Functionality",
        body: "Clicking an image allows for deeper exploration of that coral genus. An interactive slider lets users transition between colored and monochrome images, creating a dramatic visual impact intended to inspire environmental action.",
        video: "/coral-bleaching/color-clickhover.mp4",
        poster: "/coral-bleaching/color-clickhover-poster.jpg",
      },
      {
        heading: "There is hope for corals!",
        body: "American Samoa, part of NOAA's National Marine Sanctuary system, is seeing coral bleaching decline — a promising sign of resilience being studied by the Smithsonian Tropical Research Institute.",
        video: "/coral-bleaching/blue-slide.mp4",
        poster: "/coral-bleaching/blue-slide-poster.jpg",
      },
    ],
    credits: [
      { role: "Design, Dev & Research", name: "Steph Wu" },
      { role: "Team", name: "Ian Yu" },
    ],
  },
];

function withDefaults(p) {
  return {
    ...p,
    // TODO: replace with the real industry categories for this project.
    industry: p.industry || ["Design"],
    intro: p.intro || {
      heading: "About this project.",
      // TODO: replace with the real story behind this project — process,
      // goals, and outcome.
      paragraphs: [
        `A closer look at ${p.name.toLowerCase()}, part of an ongoing body of work exploring form, light, and quiet detail.`,
        "Every frame is considered on its own, then edited together to build a single, cohesive mood across the set.",
      ],
    },
    gallery: p.gallery || [null, null, null],
    bento: p.bento || [],
    section2: p.section2 || {
      eyebrow: "Process",
      heading: "Built frame by frame.",
      paragraphs: [
        "The set was developed over several passes, refining framing, light, and composition each time.",
      ],
    },
    featureGrid: p.featureGrid || [
      {
        heading: "Process",
        body: "How the work came together, from first pass to final edit.",
        image: null,
      },
      {
        heading: "Detail",
        body: "A closer look at the texture and material of the piece.",
        image: null,
      },
      {
        heading: "Outcome",
        body: "The finished set, sequenced as a single body of work.",
        image: null,
      },
    ],
    credits: p.credits || [
      { role: "Photography", name: "Steph Wu" },
      { role: "Creative Direction", name: "Steph Wu" },
    ],
    featureColumns: p.featureColumns || 3,
  };
}

const nav = `    <nav class="site-nav">
      <a href="/" class="nav-logo">stephanie wu</a>
      <div class="nav-links">
        <a href="/#work" class="nav-link work-link">Work</a>
        <a href="/play.html" class="nav-link">Play</a>
        <a href="/about.html" class="nav-link">About</a>
      </div>
      <button
        type="button"
        class="nav-toggle"
        aria-expanded="false"
        aria-controls="mobile-menu"
        aria-label="Open menu"
      >
        <span class="nav-toggle-bar"></span>
        <span class="nav-toggle-bar"></span>
        <span class="nav-toggle-bar"></span>
      </button>
    </nav>

    <div class="mobile-menu" id="mobile-menu" inert>
      <a href="/#work" class="mobile-menu-link work-link">Work</a>
      <a href="/play.html" class="mobile-menu-link">Play</a>
      <a href="/about.html" class="mobile-menu-link">About</a>
    </div>`;

const footer = `    <footer class="site-footer">
      <h2 class="footer-heading">Let's create<br />something great.</h2>

      <a href="mailto:wu.h.stephanie@gmail.com" class="footer-contact"
        >Contact Me</a
      >

      <div class="footer-bottom">
        <p class="footer-copy">© ${YEAR} stephanie wu</p>
        <!-- TODO: swap in your real LinkedIn profile URL -->
        <a
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          class="footer-link"
          >LinkedIn</a
        >
      </div>
    </footer>`;

// Videos that carry meaningful audio still autoplay muted (required for
// autoplay to work at all), but get this toggle so the audio isn't just
// silently unreachable. Shared by the hero and the gallery video below.
function renderMuteToggle() {
  return `        <button
          type="button"
          class="video-mute-toggle"
          aria-pressed="false"
          aria-label="Unmute video"
        >
          <svg class="icon-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5Z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
          <svg class="icon-unmuted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
        </button>`;
}

function renderHero(p) {
  if (p.heroVideo) {
    return `      <div class="project-hero">
        <video autoplay muted loop playsinline poster="${p.heroPoster || ""}">
          <source src="${p.heroVideo}" type="video/mp4" />
        </video>
${p.heroAudio ? renderMuteToggle() : ""}
      </div>`;
  }
  return `      <div class="project-hero">
        <img src="${p.image}" alt="${p.name}" />
      </div>`;
}

function renderMeta(p) {
  const list = (items) =>
    items.map((item) => `<li>${item}</li>`).join("\n            ");

  return `      <section class="project-meta">
        <h1 class="project-title">${p.name}</h1>

        <div class="project-meta-row project-meta-row--top">
          <div class="project-meta-col">
            <p class="eyebrow">Industry</p>
            <ul class="project-meta-list">
            ${list(p.industry)}
            </ul>
          </div>
          <div class="project-meta-col">
            <p class="eyebrow">Year</p>
            <p class="project-meta-value">${YEAR}</p>
          </div>
          <p class="project-tagline">${p.intro.heading}</p>
        </div>

        <div class="project-meta-row project-meta-row--bottom">
          <div class="project-meta-col">
            <p class="eyebrow">Services</p>
            <ul class="project-meta-list">
            ${list(p.tags)}
            </ul>
          </div>
          <div class="project-meta-col project-meta-col--wide">
            <p class="eyebrow">Brief</p>
            <p>${p.intro.paragraphs[0]}</p>
          </div>
          <div class="project-meta-col project-meta-col--wide">
            <p class="eyebrow">Finding</p>
            <p>${p.intro.paragraphs[1] || ""}</p>
          </div>
        </div>
      </section>`;
}

function renderGalleryVideo(galleryVideo) {
  return `      <div class="project-hero project-gallery-video">
        <video autoplay muted loop playsinline poster="${galleryVideo.poster || ""}">
          <source src="${galleryVideo.src}" type="video/mp4" />
        </video>
${renderMuteToggle()}
      </div>`;
}

function renderGalleryVideos(videos) {
  const items = videos
    .map(
      (v) => `        <div class="project-gallery-video-item">
          <video autoplay muted loop playsinline poster="${v.poster || ""}">
            <source src="${v.src}" type="video/mp4" />
          </video>
        </div>`,
    )
    .join("\n");
  return `      <div class="project-gallery project-gallery--videos">\n${items}\n      </div>`;
}

function renderGallery(images) {
  if (!images.length) return "";
  const items = images
    .map((src) =>
      src
        ? `        <div class="project-gallery-item"><img src="${src}" alt="" /></div>`
        : `        <!-- TODO: drop a real photo into this gallery slot -->\n        <div class="project-gallery-item"></div>`
    )
    .join("\n");
  return `      <div class="project-gallery">\n${items}\n      </div>`;
}

function renderBento(items) {
  if (!items.length) return "";
  const tiles = items
    .map(
      ({ src, alt }) =>
        `        <div class="bento-item"><video autoplay muted loop playsinline poster="${src}-poster.jpg" aria-label="${alt}"><source src="${src}.mp4" type="video/mp4" /></video></div>`
    )
    .join("\n");
  return `      <div class="bento-gallery">\n${tiles}\n      </div>`;
}

function renderFeatureGrid(features, columns) {
  const items = features
    .map((f) => {
      const media = f.video
        ? `<div class="project-feature-image"><video autoplay muted loop playsinline poster="${f.poster || ""}"><source src="${f.video}" type="video/mp4" /></video></div>`
        : f.image
        ? `<div class="project-feature-image"><img src="${f.image}" alt="" /></div>`
        : `<!-- TODO: drop a real photo in here -->\n          <div class="project-feature-image"></div>`;
      return `        <article class="project-feature">
          ${media}
          <h3>${f.heading}</h3>
          <p>${f.body}</p>
        </article>`;
    })
    .join("\n");
  return `      <div class="project-feature-grid" style="--feature-cols: ${columns};">\n${items}\n      </div>`;
}

function renderWalkthroughVideo(p) {
  if (!p.walkthroughVideo) return "";
  return `      <div class="project-walkthrough">
        <video controls poster="${p.walkthroughPoster || ""}">
          <source src="${p.walkthroughVideo}" type="video/mp4" />
        </video>
      </div>`;
}

function renderProject(rawProject, index, all) {
  const project = withDefaults(rawProject);
  const next = withDefaults(all[(index + 1) % all.length]);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${project.name} | stephanie wu</title>
    <link rel="stylesheet" href="https://use.typekit.net/rjn0cck.css" />
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body>
${nav}

    <main class="project">
${renderHero(project)}

${renderMeta(project)}

${renderBento(project.bento)}

${
  project.galleryVideo
    ? renderGalleryVideo(project.galleryVideo)
    : project.galleryVideos
      ? renderGalleryVideos(project.galleryVideos)
      : renderGallery(project.gallery)
}

      <section class="project-section">
        <div class="project-section-head">
          <p class="eyebrow">${project.section2.eyebrow}</p>
          <h2 class="project-section-title">${project.section2.heading}</h2>
        </div>
        <div class="project-section-body">
          ${project.section2.paragraphs
            .map((p) => `<p>${p}</p>`)
            .join("\n          ")}
        </div>
      </section>

${renderWalkthroughVideo(project)}

${renderFeatureGrid(project.featureGrid, project.featureColumns)}

      <dl class="project-credits">
        ${project.credits
          .map(
            (c) => `<div class="project-credit">
          <dt class="mono">${c.role}</dt>
          <dd>${c.name}</dd>
        </div>`
          )
          .join("\n        ")}
      </dl>

      <a class="project-next" href="/${next.slug}.html">
        <span class="eyebrow">Next Project</span>
        <span class="project-next-title">${next.name}</span>
      </a>
    </main>

${footer}
    <script type="module" src="/script.js"></script>
  </body>
</html>
`;
}

for (const [index, project] of projects.entries()) {
  const html = renderProject(project, index, projects);
  writeFileSync(join(__dirname, `${project.slug}.html`), html, "utf8");
}

console.log(`Generated ${projects.length} project pages.`);
