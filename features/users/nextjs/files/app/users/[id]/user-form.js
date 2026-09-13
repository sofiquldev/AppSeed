"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function UserForm({ user }) {
  const router = useRouter();
  const [error, setError] = useState("");

  async function onSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const res = await fetch(`/api/users/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        role: form.get("role"),
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Could not save");
      return;
    }
    router.push("/users");
    router.refresh();
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <label>
        Name
        <input name="name" defaultValue={user.name} required />
      </label>
      <label>
        Email
        <input name="email" type="email" defaultValue={user.email} required />
      </label>
      <label>
        Role
        <input name="role" defaultValue={user.role} required />
      </label>
      {error ? <p className="error">{error}</p> : null}
      <button className="btn" type="submit">Save</button>
    </form>
  );
}
