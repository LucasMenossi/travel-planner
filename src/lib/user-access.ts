import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { user } from "@/lib/auth-schema";

export async function getUserAccess(userId: string) {
  const [currentUser] = await db
    .select({ isDemo: user.isDemo })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  return currentUser ?? null;
}

export async function assertCanMutate(userId: string) {
  const access = await getUserAccess(userId);

  if (!access) {
    throw new Error("USER_NOT_FOUND");
  }

  if (access.isDemo) {
    throw new Error("READ_ONLY_DEMO");
  }
}
