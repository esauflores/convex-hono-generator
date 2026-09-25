import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

export function generate(projectDir: string = process.cwd()): string {
  const convexDir = join(projectDir, "convex");
  if (!existsSync(convexDir)) throw new Error(`Convex directory not found: ${convexDir}`);

  const routes: { segments: string[]; path: string }[] = [];
  function scan(dir: string): void {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== "_generated") scan(path);
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

  const imports = namedRoutes.map(
    (route) =>
      `import ${route.name} from ${JSON.stringify(`./${relative(convexDir, route.path).split(sep).join("/").replace(/\.ts$/, "")}`)};`,
  );
  imports.unshift('import { Hono } from "hono";');
  imports.unshift('import type { HonoWithConvex } from "convex-helpers/server/hono";');
  imports.unshift('import type { ActionCtx } from "./_generated/server";');

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
  const target = join(convexDir, "http-routes.gen.ts");
  if (!existsSync(target) || readFileSync(target, "utf8") !== output) writeFileSync(target, output);
  return target;
}
