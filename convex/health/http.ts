import { Hono } from "hono";

const routes = new Hono();
routes.get("/", (c) => c.json({ status: "ok" }));

export default routes;
