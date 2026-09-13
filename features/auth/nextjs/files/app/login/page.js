"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function onSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Could not log in");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="guest-wrap">
      <Link className="brand" href="/">AppSeed</Link>
      <div className="card">
        <h1>Log in</h1>
        <form className="form" onSubmit={onSubmit}>
          <label>
            Email
            <input name="email" type="email" defaultValue="admin@example.com" required />
          </label>
          <label>
            Password
            <input name="password" type="password" defaultValue="password" required />
          </label>
          {error ? <p className="error">{error}</p> : null}
          <button className="btn" type="submit">Log in</button>
          <p className="muted">No account? <Link href="/register">Register</Link></p>
        </form>
      </div>
    </div>
  );
}
