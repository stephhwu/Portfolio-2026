import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/",
  build: {
    rollupOptions: {
      input: {
  main: resolve(__dirname, "index.html"),
  play: resolve(__dirname, "play/index.html"),
  about: resolve(__dirname, "about/index.html"),
  sixthStreetRebrand: resolve(__dirname, "sixth-street-rebrand/index.html"),
  sixthStreetLogo: resolve(__dirname, "sixth-street-logo/index.html"),
  airwaves: resolve(__dirname, "airwaves/index.html"),
  adobeCis: resolve(__dirname, "adobe-cis/index.html"),
  adobeCos: resolve(__dirname, "adobe-cos/index.html"),
  dogsWithJobs: resolve(__dirname, "dogs-with-jobs/index.html"),
  coralBleaching: resolve(__dirname, "coral-bleaching/index.html"),
  beneathTheSurface: resolve(__dirname, "beneath-the-surface/index.html"),
  posterIndex: resolve(__dirname, "poster-index/index.html"),
  breathscape: resolve(__dirname, "breathscape/index.html"),
  coralChronicles: resolve(__dirname, "coral-chronicles/index.html"),
},
    },
  },
});
