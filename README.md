# Convex Hono Router

Generate Hono route registration from `convex/**/http.ts`. Each folder becomes a URL segment, so `convex/admin/tasks/http.ts` serves `/admin/tasks`. The generated file is `convex/http-routes.gen.ts`.

## Use it in a Convex project

In your Convex project, install the router and its peer dependencies:

```sh
pnpm add hono convex-helpers
pnpm add -D @esauflores/convex-hono-router
```

The npm package is scoped, but its executable is `convex-hono-router`.

Keep `convex/http.ts` as the Convex entry point:

```ts
import { HttpRouterWithHono } from "convex-helpers/server/hono";
import app from "./http-routes.gen";

export default new HttpRouterWithHono(app);
```

Create a Hono app in a nested `http.ts` and export it as the default. For example, `convex/health/http.ts` can contain:

```ts
import { Hono } from "hono";

const routes = new Hono();
routes.get("/", (c) => c.json({ status: "ok" }));

export default routes;
```

Run the generator from your Convex project when you add, remove, or move a route file:

```sh
pnpm exec convex-hono-router generate
```

The command writes `convex/http-routes.gen.ts`. Run it again after changing the route folder structure, then run `convex dev` or `convex deploy` as usual. The CLI requires Node 20 or newer.

Routes mount relative to the nearest parent `http.ts`. For example, the generator attaches `convex/admin/comments/http.ts` to `convex/admin/http.ts` with `adminRoutes.route("/comments", commentsRoutes)`. It then mounts `adminRoutes` at `/admin`, so the child serves `/admin/comments` and shares the parent's middleware.

A folder named `[id]` mounts as `:id`. The generator ignores `convex/http.ts` and all `_generated` folders.

## Run the example

The included `convex/` project has CRUD routes for users, projects, tasks, comments, and tags. Each resource supports `GET`, `POST`, `PATCH`, and `DELETE`. List endpoints accept `?limit=20` and a returned `?cursor=...` for pagination. `GET /health` is public. Admin routes use `Bearer ok` as a demo credential; replace it before deploying the example.

In this repository, generate the example routes and start the local Convex backend in one terminal. Run the integration test in another:

```sh
pnpm convex:generate
pnpm convex:dev
```

```sh
pnpm test:local
```

`pnpm test` runs the generator and Hono tests without a backend. `pnpm test:local` checks CRUD through the local Convex HTTP endpoint in `.env.local`.
