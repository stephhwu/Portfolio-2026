import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        play: resolve(__dirname, "play.html"),
        about: resolve(__dirname, "about.html"),
        sixthStreetRebrand: resolve(__dirname, "sixth-street-rebrand.html"),
        airwaves: resolve(__dirname, "airwaves.html"),
        adobeCis: resolve(__dirname, "adobe-cis.html"),
        adobeCos: resolve(__dirname, "adobe-cos.html"),
        dogsWithJobs: resolve(__dirname, "dogs-with-jobs.html"),
        coralBleaching: resolve(__dirname, "coral-bleaching.html"),
      },
    },
  },
});
