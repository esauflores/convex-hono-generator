import type { HonoWithConvex } from "convex-helpers/server/hono";
import { validate } from "convex-helpers/validators";
import { ConvexError } from "convex/values";
import type { Validator } from "convex/values";
import { v } from "convex/values";
import { Hono } from "hono";

import type { Id, TableNames } from "../_generated/dataModel";
import type { ActionCtx } from "../_generated/server";

export function crudRoutes<
  Table extends TableNames,
  Create extends Validator<unknown, "required", string>,
  Patch extends Validator<unknown, "required", string>,
>(
  table: Table,
  createValidator: Create,
  patchValidator: Patch,
  operations: {
    list: (ctx: ActionCtx, paginationOpts: { numItems: number; cursor: string | null }) => Promise<unknown>;
    read: (ctx: ActionCtx, id: Id<Table>) => Promise<unknown>;
    create: (ctx: ActionCtx, input: Create["type"]) => Promise<unknown>;
    update: (ctx: ActionCtx, id: Id<Table>, patch: Patch["type"]) => Promise<unknown>;
    destroy: (ctx: ActionCtx, id: Id<Table>) => Promise<unknown>;
  },
): HonoWithConvex<ActionCtx> {
  const routes: HonoWithConvex<ActionCtx> = new Hono();

  routes.onError((error, c) => {
    if (error.message.startsWith("ArgumentValidationError:")) return c.json({ error: "Invalid input" }, 400);
    if (error.message.includes("Failed to parse cursor")) return c.json({ error: "Invalid cursor" }, 400);
    if (
      error instanceof ConvexError &&
      typeof error.data === "object" &&
      error.data !== null &&
      "paginationError" in error.data &&
      error.data.paginationError === "InvalidCursor"
    ) {
      return c.json({ error: "Invalid cursor" }, 400);
    }
    console.error(error);
    return c.json({ error: "Internal server error" }, 500);
  });

  routes.get("/", async (c) => {
    const numItems = Number(c.req.query("limit") ?? 100);
    if (!Number.isInteger(numItems) || numItems < 1 || numItems > 100) {
      return c.json({ error: "Limit must be between 1 and 100" }, 400);
    }
    return Response.json(await operations.list(c.env, { numItems, cursor: c.req.query("cursor") ?? null }));
  });

  routes.get("/:id", async (c) => {
    const id: unknown = c.req.param("id");
    if (!validate(v.id(table), id)) return c.json({ error: "Invalid ID" }, 400);
    const result = await operations.read(c.env, id);
    return result === null ? c.json({ error: "Not found" }, 404) : Response.json(result);
  });

  routes.post("/", async (c) => {
    const body: unknown = await c.req.json().catch(() => undefined);
    if (!validate(createValidator, body)) return c.json({ error: "Invalid body" }, 400);
    return Response.json(await operations.create(c.env, body), { status: 201 });
  });

  routes.patch("/:id", async (c) => {
    const id: unknown = c.req.param("id");
    const body: unknown = await c.req.json().catch(() => undefined);
    if (!validate(v.id(table), id) || !validate(patchValidator, body)) {
      return c.json({ error: "Invalid ID or body" }, 400);
    }
    if ((await operations.read(c.env, id)) === null) return c.json({ error: "Not found" }, 404);
    await operations.update(c.env, id, body);
    return c.body(null, 204);
  });

  routes.delete("/:id", async (c) => {
    const id: unknown = c.req.param("id");
    if (!validate(v.id(table), id)) return c.json({ error: "Invalid ID" }, 400);
    const result = await operations.destroy(c.env, id);
    return result === null ? c.json({ error: "Not found" }, 404) : Response.json(result);
  });

  return routes;
}
