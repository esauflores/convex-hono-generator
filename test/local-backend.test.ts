import { readFileSync } from "node:fs";

import { expect, test } from "vitest";

test.skipIf(process.env.RUN_CONVEX_LOCAL !== "1")("five CRUD resources work through local Convex", async () => {
  const env = readFileSync(".env.local", "utf8");
  const site = process.env.CONVEX_SITE_URL ?? env.match(/^CONVEX_SITE_URL=(.*)$/m)?.[1]?.replace(/^['"]|['"]$/g, "");
  if (!site) throw new Error("CONVEX_SITE_URL is missing. Start pnpm convex:dev first.");

  const request = (table: string, method: string, id?: string, body?: object) =>
    fetch(new URL(`/admin/${table}${id ? `/${id}` : ""}`, site), {
      method,
      headers: { Authorization: "Bearer ok", ...(body ? { "Content-Type": "application/json" } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });

  const health = await fetch(new URL("/health", site));
  expect(health.status).toBe(200);
  expect(await health.json()).toEqual({ status: "ok" });
  expect((await fetch(new URL("/admin/users", site))).status).toBe(401);
  expect((await request("users", "POST", undefined, { name: 7 })).status).toBe(400);
  expect((await request("users", "GET", "not-an-id")).status).toBe(400);
  expect((await request("users?limit=0", "GET")).status).toBe(400);

  const created: { table: string; id: string; patch: object }[] = [];
  async function create(table: string, body: object, patch: object): Promise<string> {
    const response = await request(table, "POST", undefined, body);
    expect(response.status).toBe(201);
    const doc: unknown = await response.json();
    if (typeof doc !== "object" || doc === null || !("_id" in doc) || typeof doc._id !== "string") {
      throw new Error(`Invalid ${table} create response`);
    }
    created.push({ table, id: doc._id, patch });
    return doc._id;
  }

  try {
    const userId = await create("users", { name: "Ada", email: "ada@example.test" }, { name: "Ada Lovelace" });
    await create("users", { name: "Grace", email: "grace@example.test" }, { name: "Grace Hopper" });
    const firstPage = await request("users?limit=1", "GET");
    expect(firstPage.status).toBe(200);
    const page: unknown = await firstPage.json();
    if (
      typeof page !== "object" ||
      page === null ||
      !("continueCursor" in page) ||
      typeof page.continueCursor !== "string"
    ) {
      throw new Error("Missing pagination cursor");
    }
    expect((await request(`users?limit=1&cursor=${encodeURIComponent(page.continueCursor)}`, "GET")).status).toBe(200);
    expect((await request("users?cursor=invalid", "GET")).status).toBe(400);
    const projectId = await create(
      "projects",
      { ownerId: userId, name: "Website", description: "Launch" },
      { description: "Ready" },
    );
    expect((await request("users", "GET", projectId)).status).toBe(400);
    const taskId = await create("tasks", { projectId, title: "Publish", status: "todo" }, { status: "doing" });
    await create("comments", { taskId, authorId: userId, body: "Started" }, { body: "In progress" });
    await create("tags", { taskId, name: "urgent", color: "red" }, { color: "orange" });

    for (const { table, id, patch } of created) {
      const read = await request(table, "GET", id);
      expect(read.status).toBe(200);
      expect(await read.json()).toMatchObject({ _id: id });

      const listed = await request(table, "GET");
      expect(listed.status).toBe(200);
      expect(await listed.json()).toMatchObject({
        page: expect.arrayContaining([expect.objectContaining({ _id: id })]),
      });

      expect((await request(table, "PATCH", id, patch)).status).toBe(204);
      const updated = await request(table, "GET", id);
      expect(await updated.json()).toMatchObject(patch);
    }

    for (const { table, id } of [...created].reverse()) {
      expect((await request(table, "DELETE", id)).status).toBe(200);
      expect((await request(table, "GET", id)).status).toBe(404);
      created.pop();
    }
  } finally {
    for (const { table, id } of [...created].reverse()) await request(table, "DELETE", id);
  }
});
