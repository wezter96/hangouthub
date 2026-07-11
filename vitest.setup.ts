import { fileURLToPath } from "node:url";

import dotenv from "dotenv";

// Load the server env (DATABASE_URL, auth secrets) before any package that
// validates it is imported by a test file.
dotenv.config({
	path: fileURLToPath(new URL("./apps/server/.env", import.meta.url)),
});
