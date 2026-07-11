import { fileURLToPath } from "node:url";

import dotenv from "dotenv";

// Standalone scripts (seed) run with the db package as cwd, so the server env
// file has to be loaded explicitly before anything touches `env/server`.
dotenv.config({
	path: fileURLToPath(new URL("../../../apps/server/.env", import.meta.url)),
});
