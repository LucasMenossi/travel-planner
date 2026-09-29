import { redirect } from "next/navigation";

import { AuthenticatedHeader } from "@/components/layout/AuthenticatedHeader";
import { getSession } from "@/lib/auth-session";

export default async function TripsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <>
      <AuthenticatedHeader
        userName={session.user.name ?? null}
        userEmail={session.user.email}
      />
      {children}
    </>
  );
}
