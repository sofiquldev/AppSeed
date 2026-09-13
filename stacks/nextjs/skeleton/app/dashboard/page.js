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
          <span className="muted">Status</span>
          <strong>Ready</strong>
        </article>
        <article>
          <span className="muted">Auth</span>
          <strong>Optional overlay</strong>
        </article>
      </section>
      <section className="card">
        <h2>Recent activity</h2>
        <p className="muted">Nothing here yet. Generate with the users feature if you want a list.</p>
      </section>
    </AppShell>
  );
}
