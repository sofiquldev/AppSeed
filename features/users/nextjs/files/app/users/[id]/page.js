import { notFound } from "next/navigation";
import AppShell from "../../../components/AppShell";
import { findUserById } from "../../../lib/users-store";
import UserForm from "./user-form";

export default async function EditUserPage({ params }) {
  const { id } = await params;
  const user = findUserById(id);
  if (!user) notFound();

  return (
    <AppShell title="Edit user">
      <section className="card" style={{ maxWidth: 480 }}>
        <UserForm user={user} />
      </section>
    </AppShell>
  );
}
