import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
  }).index("by_email", ["email"]),

  projects: defineTable({
    ownerId: v.id("users"),
    name: v.string(),
    description: v.string(),
  }).index("by_owner", ["ownerId"]),

  tasks: defineTable({
    projectId: v.id("projects"),
    title: v.string(),
    status: v.union(v.literal("todo"), v.literal("doing"), v.literal("done")),
    assigneeId: v.optional(v.id("users")),
  }).index("by_project", ["projectId"]),

  comments: defineTable({
    taskId: v.id("tasks"),
    authorId: v.id("users"),
    body: v.string(),
  }).index("by_task", ["taskId"]),

  tags: defineTable({
    taskId: v.id("tasks"),
    name: v.string(),
    color: v.string(),
  }).index("by_task", ["taskId"]),
});
