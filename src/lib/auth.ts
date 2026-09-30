import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";

import * as authSchema from "@/lib/auth-schema";
import { db } from "@/lib/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
  }),

  emailAndPassword: {
    enabled: true,
  },

  user: {
    additionalFields: {
      isDemo: {
        type: "boolean",
        defaultValue: false,
        input: false,
      },
    },
  },
});
