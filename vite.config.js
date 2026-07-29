import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        play: resolve(__dirname, "play.html"),
        about: resolve(__dirname, "about.html"),
        humanFormStudy: resolve(__dirname, "human-form-study.html"),
        interiorLight: resolve(__dirname, "interior-light.html"),
        project21: resolve(__dirname, "project-21.html"),
        dogsWithJobs: resolve(__dirname, "dogs-with-jobs.html"),
        everydayObjects: resolve(__dirname, "everyday-objects.html"),
        unit07Care: resolve(__dirname, "unit-07-care.html"),
        motionPractice: resolve(__dirname, "motion-practice.html"),
        noonlightSeries: resolve(__dirname, "noonlight-series.html"),
        materialStillness: resolve(__dirname, "material-stillness.html"),
        quietWalk: resolve(__dirname, "quiet-walk.html"),
      },
    },
  },
});
