import Link from "next/link";
import LandingShell from "../components/LandingShell";

export default function HomePage() {
  return (
    <LandingShell>
      <section className="hero">
        <p className="eyebrow">Project starter</p>
        <h1>Ship the boring parts once.</h1>
        <p className="lede">
          A Next.js shell with a landing page and a dashboard. Auth and users are optional overlays.
        </p>
        <div className="actions">
          <Link className="btn" href="/dashboard">Open dashboard</Link>
        </div>
      </section>
      <section className="features">
        <article>
          <h3>App Router</h3>
          <p>Plain Next.js. No extra UI kit to fight with.</p>
        </article>
        <article>
          <h3>Tokens</h3>
          <p>Light, dark, or brand. One CSS file.</p>
        </article>
        <article>
          <h3>Overlays</h3>
          <p>Turn on auth or users when you generate.</p>
        </article>
      </section>
    </LandingShell>
  );
}
