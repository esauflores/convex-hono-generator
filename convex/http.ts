import { HttpRouterWithHono } from "convex-helpers/server/hono";

import app from "./http.gen";

export default new HttpRouterWithHono(app);
