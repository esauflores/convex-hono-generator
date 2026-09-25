import { HttpRouterWithHono } from "convex-helpers/server/hono";

import app from "./http-routes.gen";

export default new HttpRouterWithHono(app);
