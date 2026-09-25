import { crud } from "convex-helpers/server/crud";

import schema from "../../schema";

export const { create, read, paginate, update, destroy } = crud(schema, "projects");
