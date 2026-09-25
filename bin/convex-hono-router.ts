#!/usr/bin/env node
import { generate, watchRoutes } from "../src/generate.js";

const command = process.argv[2];
if ((command !== "generate" && command !== "watch") || process.argv.length !== 3) {
  console.error("Usage: convex-hono-router <generate|watch>");
  process.exitCode = 1;
} else {
  try {
    if (command === "generate") console.log(generate());
    else {
      const watcher = watchRoutes();
      watcher.on("error", (error) => {
        console.error(error);
        process.exitCode = 1;
        watcher.close();
      });
      console.log("Watching convex/**/http.ts for route changes");
    }
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
