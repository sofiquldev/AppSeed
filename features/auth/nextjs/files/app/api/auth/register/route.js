import { NextResponse } from "next/server";
import { setSession } from "../../../../lib/auth";
import { createUser } from "../../../../lib/users-store";

export async function POST(request) {
  const body = await request.json();
  try {
    const user = createUser({
      name: body.name,
      email: body.email,
      password: body.password,
    });
    await setSession(user.email);
    const { password, ...safe } = user;
    return NextResponse.json({ user: safe });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
