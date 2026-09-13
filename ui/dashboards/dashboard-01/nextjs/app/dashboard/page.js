import AppShell from "../../components/AppShell";

export default function DashboardPage() {
  return (
    <AppShell title="Overview">
      <section className="stats">
        <article>
          <span className="muted">Stack</span>
          <strong>Next.js</strong>
        </article>
        <article>
          <span className="muted">Layout</span>
          <strong>Dashboard 01</strong>
        </article>
        <article>
          <span className="muted">Status</span>
          <strong>Ready</strong>
        </article>
      </section>
      <section className="card">
        <h2>Recent activity</h2>
        <p className="muted">Dashboard 01. Generate with users if you want a list here.</p>
      </section>
    </AppShell>
  );
}
