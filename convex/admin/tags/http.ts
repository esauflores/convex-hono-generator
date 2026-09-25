import type { HonoWithConvex } from "convex-helpers/server/hono";

import { internal } from "../../_generated/api";
import type { ActionCtx } from "../../_generated/server";
import schema from "../../schema";
import { crudRoutes } from "../crudRoutes";

const routes: HonoWithConvex<ActionCtx> = crudRoutes(
  "tags",
  schema.tables.tags.validator,
  schema.tables.tags.validator.partial(),
  {
    list: (ctx, paginationOpts) => ctx.runQuery(internal.admin.tags.data.paginate, { paginationOpts }),
    read: (ctx, id) => ctx.runQuery(internal.admin.tags.data.read, { id }),
    create: (ctx, input) => ctx.runMutation(internal.admin.tags.data.create, input),
    update: (ctx, id, patch) => ctx.runMutation(internal.admin.tags.data.update, { id, patch }),
    destroy: (ctx, id) => ctx.runMutation(internal.admin.tags.data.destroy, { id }),
  },
);

export default routes;
