import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth-session";

export default async function TripsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <main className="min-h-svh p-8">
      <h1 className="text-2xl font-semibold">Welcome, {session.user.name}</h1>
    </main>
  );
}
