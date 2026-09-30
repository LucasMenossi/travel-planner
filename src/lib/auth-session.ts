import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { getUserAccess } from "@/lib/user-access";

export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  const access = await getUserAccess(session.user.id);

  return {
    ...session,
    user: {
      ...session.user,
      isDemo: access?.isDemo ?? false,
    },
  };
}
