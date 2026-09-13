"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function onSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Could not register");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="guest-wrap">
      <Link className="brand" href="/">AppSeed</Link>
      <div className="card">
        <h1>Create an account</h1>
        <form className="form" onSubmit={onSubmit}>
          <label>
            Name
            <input name="name" required />
          </label>
          <label>
            Email
            <input name="email" type="email" required />
          </label>
          <label>
            Password
            <input name="password" type="password" minLength={8} required />
          </label>
          {error ? <p className="error">{error}</p> : null}
          <button className="btn" type="submit">Register</button>
          <p className="muted">Already have an account? <Link href="/login">Log in</Link></p>
        </form>
      </div>
    </div>
  );
}
