import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { HttpRouterWithHono } from "convex-helpers/server/hono";
import { expect, test } from "vitest";

import { generate } from "../src/generate.js";

test("folder routes mount inside parent middleware and update when regenerated", () => {
  const project = mkdtempSync(join(tmpdir(), "convex-hono-generator-"));
  const routes = join(project, "convex");
  try {
    for (const dir of ["admin", "admin/posts", "public", "public/inbox", "public/posts", "public/users/[id]"]) {
      mkdirSync(join(routes, dir), { recursive: true });
      writeFileSync(join(routes, dir, "http.ts"), "export default {};\n");
    }

    const output = readFileSync(generate(project), "utf8");
    expect(generate(project)).toBe(join(routes, "http.ts"));
    expect(output).toContain('import adminRoutes from "./admin/http";');
    expect(output).toContain('import postsRoutes from "./admin/posts/http";');
    expect(output).toContain('import postsRoutes2 from "./public/posts/http";');
    expect(output).toContain('adminRoutes.route("/posts", postsRoutes);');
    expect(output).toContain('publicRoutes.route("/inbox", inboxRoutes);');
    expect(output).toContain('publicRoutes.route("/posts", postsRoutes2);');
    expect(output).toContain('app.route("/public", publicRoutes);');
    expect(output).toContain('publicRoutes.route("/users/:id", idRoutes);');
    expect(output.indexOf('adminRoutes.route("/posts"')).toBeLessThan(output.indexOf('app.route("/admin"'));
    expect(output.match(/\/\/ admin routes/g)).toHaveLength(1);
    expect(output.match(/\/\/ public routes/g)).toHaveLength(1);
    expect(output).not.toContain("// app routes");

    rmSync(join(routes, "admin/posts/http.ts"));
    expect(readFileSync(generate(project), "utf8")).not.toContain('from "./admin/posts/http"');

    writeFileSync(join(routes, "http.ts"), "export default {};\n");
    mkdirSync(join(routes, "_generated"));
    writeFileSync(join(routes, "_generated/http.ts"), "export default {};\n");
    const withRoot = readFileSync(generate(project), "utf8");
    expect(withRoot).not.toContain('from "./http"');
    expect(withRoot).not.toContain("_generated/http");
  } finally {
    rmSync(project, { recursive: true, force: true });
  }
});

test("generated Hono app applies parent middleware to child routes", async () => {
  const project = fileURLToPath(new URL("../", import.meta.url));
  generate(project);
  const { app } = await import("../convex/http.ts");
  const output = readFileSync(new URL("../convex/http.ts", import.meta.url), "utf8");
  expect(output).toContain('// health routes\napp.route("/health", healthRoutes);');
  expect(output).not.toContain('healthRoutes.route("/", healthRoutes)');
  expect((await app.request("/admin/users")).status).toBe(401);
  expect((await app.request("/admin/comments")).status).toBe(401);
  expect((await app.request("/admin/admin/comments", { headers: { Authorization: "Bearer ok" } })).status).toBe(404);
  const health = await app.request("/health");
  expect(health.status).toBe(200);
  expect(await health.json()).toEqual({ status: "ok" });
  const http = new HttpRouterWithHono(app);
  expect(http.getRoutes().some(([path, method]) => path === "/health" && method === "GET")).toBe(true);
  expect(http.getRoutes().some(([path, method]) => path === "/admin/users" && method === "GET")).toBe(true);
  expect(http.getRoutes().some(([path, method]) => path === "/admin/comments" && method === "GET")).toBe(true);
  expect(http.getRoutes().some(([path, method]) => path === "/admin/tasks" && method === "POST")).toBe(true);
});
