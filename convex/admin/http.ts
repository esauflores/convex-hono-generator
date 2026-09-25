import { Hono } from "hono";

const routes = new Hono();
routes.use("*", async (c, next) => {
  if (c.req.header("Authorization") !== "Bearer ok") return c.text("Unauthorized", 401);
  await next();
});
export default routes;
