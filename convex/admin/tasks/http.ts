import type { HonoWithConvex } from "convex-helpers/server/hono";

import { internal } from "../../_generated/api";
import type { ActionCtx } from "../../_generated/server";
import schema from "../../schema";
import { crudRoutes } from "../crudRoutes";

const routes: HonoWithConvex<ActionCtx> = crudRoutes(
  "tasks",
  schema.tables.tasks.validator,
  schema.tables.tasks.validator.partial(),
  {
    list: (ctx, paginationOpts) => ctx.runQuery(internal.admin.tasks.data.paginate, { paginationOpts }),
    read: (ctx, id) => ctx.runQuery(internal.admin.tasks.data.read, { id }),
    create: (ctx, input) => ctx.runMutation(internal.admin.tasks.data.create, input),
    update: (ctx, id, patch) => ctx.runMutation(internal.admin.tasks.data.update, { id, patch }),
    destroy: (ctx, id) => ctx.runMutation(internal.admin.tasks.data.destroy, { id }),
  },
);

export default routes;
