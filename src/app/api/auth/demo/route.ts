import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  const email = process.env.DEMO_USER_EMAIL;
  const password = process.env.DEMO_USER_PASSWORD;

  if (!email || !password) {
    return NextResponse.json(
      { message: "Demo account is not configured." },
      { status: 503 },
    );
  }

  try {
    return await auth.api.signInEmail({
      body: { email, password },
      headers: request.headers,
      asResponse: true,
    });
  } catch {
    return NextResponse.json(
      { message: "Demo account is unavailable." },
      { status: 503 },
    );
  }
}
