import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	clientPrefix: "EXPO_PUBLIC_",
	client: {
		EXPO_PUBLIC_SERVER_URL: z.url(),
		// Set to "true" once OAuth providers are configured on the server.
		EXPO_PUBLIC_ENABLE_SOCIAL: z.string().optional(),
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
});
