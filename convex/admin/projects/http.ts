import type { HonoWithConvex } from "convex-helpers/server/hono";

import { internal } from "../../_generated/api";
import type { ActionCtx } from "../../_generated/server";
import schema from "../../schema";
import { crudRoutes } from "../crudRoutes";

const routes: HonoWithConvex<ActionCtx> = crudRoutes(
  "projects",
  schema.tables.projects.validator,
  schema.tables.projects.validator.partial(),
  {
    list: (ctx, paginationOpts) => ctx.runQuery(internal.admin.projects.data.paginate, { paginationOpts }),
    read: (ctx, id) => ctx.runQuery(internal.admin.projects.data.read, { id }),
    create: (ctx, input) => ctx.runMutation(internal.admin.projects.data.create, input),
    update: (ctx, id, patch) => ctx.runMutation(internal.admin.projects.data.update, { id, patch }),
    destroy: (ctx, id) => ctx.runMutation(internal.admin.projects.data.destroy, { id }),
  },
);

export default routes;
