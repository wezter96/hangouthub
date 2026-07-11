import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "node",
		include: ["packages/**/*.test.ts"],
		setupFiles: ["./vitest.setup.ts"],
		// Integration tests share one database, so run files serially.
		fileParallelism: false,
	},
});
