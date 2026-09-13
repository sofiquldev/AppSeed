import Link from "next/link";
import LandingShell from "../components/LandingShell";

export default function HomePage() {
  return (
    <LandingShell>
      <section className="hero">
        <p className="eyebrow">Landing 01</p>
        <h1>A starter you can actually give a client.</h1>
        <p className="lede">
          Next.js landing and dashboard. Add auth or users when you generate. Change tokens, not twenty files.
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
