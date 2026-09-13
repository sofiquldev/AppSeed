import Link from "next/link";
import AppShell from "../../components/AppShell";
import { listUsers } from "../../lib/users-store";

export default function UsersPage() {
  const users = listUsers();

  return (
    <AppShell title="Users">
      <section className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td><Link href={`/users/${user.id}`}>Edit</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </AppShell>
  );
}
