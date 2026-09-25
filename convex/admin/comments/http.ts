import type { HonoWithConvex } from "convex-helpers/server/hono";

import { internal } from "../../_generated/api";
import type { ActionCtx } from "../../_generated/server";
import schema from "../../schema";
import { crudRoutes } from "../crudRoutes";

const routes: HonoWithConvex<ActionCtx> = crudRoutes(
  "comments",
  schema.tables.comments.validator,
  schema.tables.comments.validator.partial(),
  {
    list: (ctx, paginationOpts) => ctx.runQuery(internal.admin.comments.data.paginate, { paginationOpts }),
    read: (ctx, id) => ctx.runQuery(internal.admin.comments.data.read, { id }),
    create: (ctx, input) => ctx.runMutation(internal.admin.comments.data.create, input),
    update: (ctx, id, patch) => ctx.runMutation(internal.admin.comments.data.update, { id, patch }),
    destroy: (ctx, id) => ctx.runMutation(internal.admin.comments.data.destroy, { id }),
  },
);

export default routes;
