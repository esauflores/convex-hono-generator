import type { HonoWithConvex } from "convex-helpers/server/hono";
import { HttpRouterWithHono } from "convex-helpers/server/hono";
import { Hono } from "hono";

import type { ActionCtx } from "./_generated/server";
import commentsRoutes from "./admin/comments/http";
import adminRoutes from "./admin/http";
import projectsRoutes from "./admin/projects/http";
import tagsRoutes from "./admin/tags/http";
import tasksRoutes from "./admin/tasks/http";
import usersRoutes from "./admin/users/http";
import healthRoutes from "./health/http";

const app: HonoWithConvex<ActionCtx> = new Hono();

// admin routes
adminRoutes.route("/comments", commentsRoutes);
adminRoutes.route("/projects", projectsRoutes);
adminRoutes.route("/tags", tagsRoutes);
adminRoutes.route("/tasks", tasksRoutes);
adminRoutes.route("/users", usersRoutes);
app.route("/admin", adminRoutes);

// health routes
app.route("/health", healthRoutes);

export { app };
export default new HttpRouterWithHono(app);
