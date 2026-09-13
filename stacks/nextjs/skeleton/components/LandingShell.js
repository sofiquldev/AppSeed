import Link from "next/link";

export default function LandingShell({ children, appName = "AppSeed" }) {
  return (
    <>
      <header className="landing-nav">
        <Link className="brand" href="/">{appName}</Link>
        <nav>
          <Link href="/dashboard">Dashboard</Link>
          {/* <appseed:landing-nav> */}
          {/* </appseed:landing-nav> */}
        </nav>
      </header>
      {children}
      <footer className="landing-foot">
        <a className="muted appseed-footprint" href="{{APPSEED_URL}}" rel="nofollow noopener">{{APPSEED_CREDIT}}</a>
      </footer>
    </>
  );
}
