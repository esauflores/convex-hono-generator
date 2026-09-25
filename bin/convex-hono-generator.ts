#!/usr/bin/env node
import { generate } from "../src/generate.js";

if (process.argv[2] !== "generate" || process.argv.length !== 3) {
  console.error("Usage: convex-hono-generator generate");
  process.exitCode = 1;
} else {
  try {
    console.log(generate());
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
