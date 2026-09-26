# Convex Hono Generator

Generate Hono route registration from `convex/**/http.ts`. Each folder becomes a URL segment, so `convex/admin/tasks/http.ts` serves `/admin/tasks`. The generator writes the root Convex entrypoint to `convex/http.ts`.

## Use it in a Convex project

In your Convex project, install the generator and its peer dependencies:

```sh
pnpm add convex hono convex-helpers
pnpm add -D @esauflores/convex-hono-generator
```

The npm package is scoped, but its executable is `convex-hono-generator`.

Create a Hono app in a nested `http.ts` and export it as the default. For example, `convex/health/http.ts` can contain:

```ts
import { Hono } from "hono";

const routes = new Hono();
routes.get("/", (c) => c.json({ status: "ok" }));

export default routes;
```

Run the generator from your Convex project when you add, remove, or move a route file:

```sh
pnpm exec convex-hono-generator generate
```

The command writes `convex/http.ts`. Run it again after changing the route folder structure, then run `convex dev` or `convex deploy` as usual. The CLI requires Node 20 or newer.

Routes mount relative to the nearest parent `http.ts`. For example, the generator attaches `convex/admin/comments/http.ts` to `convex/admin/http.ts` with `adminRoutes.route("/comments", commentsRoutes)`. It then mounts `adminRoutes` at `/admin`, so the child serves `/admin/comments` and shares the parent's middleware.

A folder named `[id]` mounts as `:id`. The generator ignores `convex/http.ts` and all `_generated` folders.

## Run the example

The included `convex/` project provides:

- CRUD routes for users, projects, tasks, comments, and tags.
- `GET`, `POST`, `PATCH`, and `DELETE` operations for each resource.
- Paginated list endpoints with `?limit=1` through `?limit=100` (default `100`). Responses return a `continueCursor`; pass that value as `?cursor=...` to fetch the next page.
- A public `GET /health` endpoint.
- Admin routes protected by the demo credential `Bearer ok`.

For this repository, generate the example routes and start the local Convex backend in one terminal:

```sh
pnpm convex:generate
pnpm convex:dev
```

In a second terminal, run the integration test:

```sh
pnpm test:local
```

`pnpm test` runs the generator and Hono tests without a backend. `pnpm test:local` checks CRUD through the local Convex HTTP endpoint in `.env.local`.
