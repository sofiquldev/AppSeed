import Link from "next/link";

export default function AppShell({ title = "Dashboard", children }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" href="/dashboard">AppSeed</Link>
        <nav>
          <Link href="/dashboard">Dashboard</Link>
          {/* <appseed:nav> */}
          {/* </appseed:nav> */}
        </nav>
      </aside>
      <main className="main">
        <header className="topbar">
          <h1>{title}</h1>
        </header>
        {children}
      </main>
    </div>
  );
}
