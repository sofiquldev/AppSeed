import { NextResponse } from "next/server";
import { setSession, verifyUser } from "../../../../lib/auth";

export async function POST(request) {
  const body = await request.json();
  const user = verifyUser(body.email, body.password);
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  await setSession(user.email);
  return NextResponse.json({ user });
}
