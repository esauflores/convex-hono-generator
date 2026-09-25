/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin_comments_data from "../admin/comments/data.js";
import type * as admin_comments_http from "../admin/comments/http.js";
import type * as admin_crudRoutes from "../admin/crudRoutes.js";
import type * as admin_http from "../admin/http.js";
import type * as admin_projects_data from "../admin/projects/data.js";
import type * as admin_projects_http from "../admin/projects/http.js";
import type * as admin_tags_data from "../admin/tags/data.js";
import type * as admin_tags_http from "../admin/tags/http.js";
import type * as admin_tasks_data from "../admin/tasks/data.js";
import type * as admin_tasks_http from "../admin/tasks/http.js";
import type * as admin_users_data from "../admin/users/data.js";
import type * as admin_users_http from "../admin/users/http.js";
import type * as health_http from "../health/http.js";
import type * as http from "../http.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "admin/comments/data": typeof admin_comments_data;
  "admin/comments/http": typeof admin_comments_http;
  "admin/crudRoutes": typeof admin_crudRoutes;
  "admin/http": typeof admin_http;
  "admin/projects/data": typeof admin_projects_data;
  "admin/projects/http": typeof admin_projects_http;
  "admin/tags/data": typeof admin_tags_data;
  "admin/tags/http": typeof admin_tags_http;
  "admin/tasks/data": typeof admin_tasks_data;
  "admin/tasks/http": typeof admin_tasks_http;
  "admin/users/data": typeof admin_users_data;
  "admin/users/http": typeof admin_users_http;
  "health/http": typeof health_http;
  http: typeof http;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
