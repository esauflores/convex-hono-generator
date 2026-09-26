import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

export function generate(projectDir: string = process.cwd()): string {
  const convexDir = join(projectDir, "convex");
  if (!existsSync(convexDir)) throw new Error(`Convex directory not found: ${convexDir}`);

  const routes: { segments: string[]; path: string }[] = [];
  function scan(dir: string): void {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith("_")) scan(path);
      else if (dir !== convexDir && entry.isFile() && entry.name === "http.ts") {
        const segments = relative(convexDir, dir).split(sep);
        routes.push({ segments, path });
      }
    }
  }
  scan(convexDir);
  routes.sort((a, b) => a.path.localeCompare(b.path));

  const usedNames = new Set<string>();
  const namedRoutes = routes.map((route) => {
    const identifier = (route.segments.at(-1) ?? "root").replace(/^\[|\]$/g, "").replace(/[^A-Za-z0-9_$]/g, "_");
    const base = `${/^\d/.test(identifier) ? "_" : ""}${identifier}Routes`;
    let name = base;
    for (let suffix = 2; usedNames.has(name); suffix++) name = `${base}${suffix}`;
    usedNames.add(name);
    return { ...route, name };
  });

  const modulePath = (path: string) => `./${relative(convexDir, path).split(sep).join("/").replace(/\.ts$/, "")}`;
  const imports = [
    'import type { HonoWithConvex } from "convex-helpers/server/hono";',
    'import { Hono } from "hono";',
    "",
    'import type { ActionCtx } from "./_generated/server";',
    ...namedRoutes.map(({ name, path }) => `import ${name} from ${JSON.stringify(modulePath(path))};`),
  ];

  const lines = ["const app: HonoWithConvex<ActionCtx> = new Hono();"];
  namedRoutes.sort(
    (a, b) =>
      a.segments[0].localeCompare(b.segments[0]) ||
      b.segments.length - a.segments.length ||
      a.path.localeCompare(b.path),
  );

  let group = "";
  for (const route of namedRoutes) {
    if (route.segments[0] !== group) {
      group = route.segments[0];
      lines.push("", `// ${group.replace(/[^A-Za-z0-9_-]/g, "_")} routes`);
    }
    const parent = namedRoutes.find(
      (candidate) =>
        candidate.segments.length < route.segments.length &&
        candidate.segments.every((segment, index) => segment === route.segments[index]),
    );
    const relativeSegments = route.segments.slice(parent?.segments.length ?? 0);
    const mount = `/${relativeSegments.map((segment) => segment.replace(/^\[([A-Za-z_$][\w$]*)\]$/, ":$1")).join("/")}`;
    lines.push(`${parent?.name ?? "app"}.route(${JSON.stringify(mount)}, ${route.name});`);
  }
  lines.push("", "export default app;");

  const output = `${imports.join("\n")}\n\n${lines.join("\n")}\n`;
  const target = join(convexDir, "http.gen.ts");
  if (!existsSync(target) || readFileSync(target, "utf8") !== output) writeFileSync(target, output);
  const entrypoint = join(convexDir, "http.ts");
  const entrypointOutput =
    'import { HttpRouterWithHono } from "convex-helpers/server/hono";\n\nimport app from "./http.gen";\n\nexport default new HttpRouterWithHono(app);\n';
  if (!existsSync(entrypoint)) writeFileSync(entrypoint, entrypointOutput);
  return target;
}
