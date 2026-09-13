import { NextResponse } from "next/server";
import { updateUser } from "../../../../lib/users-store";

export async function PUT(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const user = updateUser(id, {
    name: body.name,
    email: body.email,
    role: body.role,
  });
  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const { password, ...safe } = user;
  return NextResponse.json({ user: safe });
}
