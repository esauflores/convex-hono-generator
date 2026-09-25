import type { HonoWithConvex } from "convex-helpers/server/hono";

import { internal } from "../../_generated/api";
import type { ActionCtx } from "../../_generated/server";
import schema from "../../schema";
import { crudRoutes } from "../crudRoutes";

const routes: HonoWithConvex<ActionCtx> = crudRoutes(
  "users",
  schema.tables.users.validator,
  schema.tables.users.validator.partial(),
  {
    list: (ctx, paginationOpts) => ctx.runQuery(internal.admin.users.data.paginate, { paginationOpts }),
    read: (ctx, id) => ctx.runQuery(internal.admin.users.data.read, { id }),
    create: (ctx, input) => ctx.runMutation(internal.admin.users.data.create, input),
    update: (ctx, id, patch) => ctx.runMutation(internal.admin.users.data.update, { id, patch }),
    destroy: (ctx, id) => ctx.runMutation(internal.admin.users.data.destroy, { id }),
  },
);

export default routes;
