"use client";

import { useEffect, useMemo, useState } from "react";

const empty = {
  stacks: [],
  features: [],
  dashboards: [],
  landings: [],
  themes: [],
  addons: [],
};

const ENGINE = {
  laravel: {
    title: "Laravel",
    blurb: "PHP. Pages, login, and a dashboard. Usual pick for client work.",
  },
  nextjs: {
    title: "Next.js",
    blurb: "JavaScript. Quick to run locally. Usual pick for a modern site.",
  },
  html: {
    title: "HTML",
    blurb: "Plain files. No build. Fine when you just need a landing page.",
  },
  "wp-theme": {
    title: "WordPress theme",
    blurb: "A theme you drop into wp-content/themes.",
  },
  "wp-plugin": {
    title: "WordPress plugin",
    blurb: "A plugin you drop into wp-content/plugins.",
  },
};

export default function Page() {
  const [catalog, setCatalog] = useState(empty);
  const [step, setStep] = useState(0);
  const [kind, setKind] = useState("");
  const [name, setName] = useState("");
  const [stack, setStack] = useState("");
  const [wantAuth, setWantAuth] = useState(null);
  const [wantUsers, setWantUsers] = useState(null);
  const [database, setDatabase] = useState("sqlite");
  const [storage, setStorage] = useState("local");
  const [dashboard, setDashboard] = useState("");
  const [landing, setLanding] = useState("");
  const [theme, setTheme] = useState("");
  const [customColors, setCustomColors] = useState({
    bg: "#f8fafc",
    surface: "#ffffff",
    text: "#0f172a",
    accent: "#1570ef",
  });
  const [github, setGithub] = useState(false);
  const [token, setToken] = useState("");
  const [tokenHelp, setTokenHelp] = useState(false);
  const [githubAuth, setGithubAuth] = useState({ oauth: false, login: null });
  const [jumpTo, setJumpTo] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    fetch("/api/catalog")
      .then((res) => res.json())
      .then(setCatalog)
      .catch((err) => setError(err.message));
    refreshGithubAuth().then(setGithubAuth).catch(() => {});

    const params = new URLSearchParams(window.location.search);
    const draft = readDraft();
    if (draft) applyDraft(draft, {
      setKind,
      setName,
      setStack,
      setWantAuth,
      setWantUsers,
      setDatabase,
      setStorage,
      setDashboard,
      setLanding,
      setTheme,
      setCustomColors,
      setGithub,
    });
    if (params.get("github") === "1") {
      setGithub(true);
      setJumpTo("deliver");
    }
    if (params.get("github") === "error") {
      setGithub(true);
      setJumpTo("deliver");
      setError("GitHub login did not finish. Try again, or paste a token.");
    }
    if (params.get("github") === "setup") {
      setGithub(true);
      setJumpTo("deliver");
      setTokenHelp(true);
      setError("Log in with GitHub needs GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in .env. Restart the web app after you add them, or paste a token.");
    }
    if (params.has("github")) {
      window.history.replaceState({}, "", "/");
    }
  }, []);

  useEffect(() => {
    function onKey(event) {
      if (event.key === "Escape") setLightbox(null);
    }
    if (!lightbox) return undefined;
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  const selectedEngine = catalog.stacks.find((item) => item.id === stack);
  const engines = catalog.stacks.filter((item) => (item.fits || []).includes(kind));
  const stackDashboards = catalog.dashboards.filter((item) => !stack || item.stacks.includes(stack));
  const stackLandings = catalog.landings.filter((item) => !stack || item.stacks.includes(stack));
  const canAuth = selectedEngine?.hasAuth !== false && Boolean(stack);
  const canAddons = selectedEngine?.showAddons !== false && Boolean(stack);

  useEffect(() => {
    if (stackDashboards.length && !stackDashboards.some((item) => item.id === dashboard)) {
      setDashboard(stackDashboards[0].id);
    }
    if (stackLandings.length && !stackLandings.some((item) => item.id === landing)) {
      setLanding(stackLandings[0].id);
    }
    if (
      catalog.themes.length &&
      theme !== "custom" &&
      !catalog.themes.some((item) => item.id === theme)
    ) {
      setTheme(catalog.themes[0].id);
    }
  }, [stack, dashboard, landing, theme, stackDashboards, stackLandings, catalog.themes]);

  const questions = useMemo(() => {
    const list = [
      {
        id: "kind",
        label: "Type",
        title: "What are you making?",
        ready: Boolean(kind),
      },
    ];

    if (kind !== "plugin" && kind !== "theme") {
      list.push({
        id: "engine",
        label: "Built with",
        title: "What should it be built with?",
        ready: Boolean(stack),
      });
    }

    list.push({
      id: "name",
      label: "Name",
      title: "What should we call it?",
      ready: Boolean(name.trim()),
    });

    if (canAuth) {
      list.push({
        id: "auth",
        label: "Login",
        title: "Do people need to log in?",
        ready: wantAuth !== null,
      });
      if (wantAuth) {
        list.push({
          id: "users",
          label: "Users",
          title: "Do you need a user list to manage?",
          ready: wantUsers !== null,
        });
      }
    }

    list.push({
      id: "look",
      label: "Look",
      title: "How should it look?",
      ready: theme === "custom" ? isCustomReady(customColors) : Boolean(theme),
    });

    if (canAddons) {
      list.push({
        id: "extras",
        label: "Extras",
        title: "Database and files?",
        lede: "SQLite and local files if you are not sure.",
        ready: Boolean(database && storage),
      });
    }

    list.push({
      id: "deliver",
      label: "Files",
      title: "How do you want the files?",
      ready: !github || Boolean(token.trim()) || Boolean(githubAuth.login),
    });

    list.push({
      id: "result",
      label: "Done",
      title: result ? `${result.name} is ready.` : "Building the project…",
      ready: true,
    });

    return list;
  }, [kind, stack, name, wantAuth, wantUsers, theme, customColors, github, token, githubAuth.login, result, canAuth, canAddons, database, storage]);

  useEffect(() => {
    if (!jumpTo) return;
    const index = questions.findIndex((item) => item.id === jumpTo);
    if (index >= 0) {
      setStep(index);
      setJumpTo("");
    }
  }, [jumpTo, questions]);

  const current = questions[Math.min(step, questions.length - 1)];
  const isLastQuestion = current.id === "deliver";
  const isResult = current.id === "result";
  const nextQuestion = questions[step + 1];
  const answers = {
    kind: { landing: "Landing page", dashboard: "Dashboard", both: "Landing + dashboard", theme: "WordPress theme", plugin: "WordPress plugin" }[kind] || "",
    engine: ENGINE[stack]?.title || selectedEngine?.name || "",
    name: name.trim(),
    auth: wantAuth === null ? "" : wantAuth ? "Login on" : "No login",
    users: wantUsers === null ? "" : wantUsers ? "User list" : "No user list",
    look: [
      theme === "custom" ? `Custom ${customColors.accent}` : theme,
      kind === "dashboard" ? "" : landing,
      kind === "landing" || kind === "plugin" || kind === "theme" ? "" : dashboard,
    ].filter(Boolean).join(" · "),
    extras: [databaseLabel(database, catalog), storageLabel(storage, catalog)].filter(Boolean).join(" · "),
    deliver: github ? "GitHub" : "Zip",
    result: result ? "Ready" : "",
  };

  function chooseKind(next) {
    setKind(next);
    if (next === "plugin") {
      setStack("wp-plugin");
      setWantAuth(false);
      setWantUsers(false);
      return;
    }
    if (next === "theme") {
      setStack("wp-theme");
      setWantAuth(false);
      setWantUsers(false);
      return;
    }
    const allowed = catalog.stacks.filter((item) => (item.fits || []).includes(next)).map((item) => item.id);
    if (stack && !allowed.includes(stack)) setStack("");
  }

  const addons = extrasToAddons(database, storage);

  async function build() {
    setBusy(true);
    setError("");
    setResult(null);
    setStep(questions.length - 1);
    const features = [];
    if (wantAuth) features.push("auth");
    if (wantAuth && wantUsers) features.push("users");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          stack,
          features,
          addons,
          dashboard: dashboard || "dashboard-01",
          landing: landing || "landing-01",
          theme,
          tokens: theme === "custom" ? tokensFromCustom(customColors) : undefined,
          github,
          token: token || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generate failed");
      setResult(data);
    } catch (err) {
      setError(err.message);
      setStep(questions.length - 2);
    } finally {
      setBusy(false);
    }
  }

  function next() {
    if (isLastQuestion) return build();
    setStep((value) => Math.min(value + 1, questions.length - 1));
  }

  function back() {
    setError("");
    setStep((value) => Math.max(value - 1, 0));
  }

  function restart() {
    setResult(null);
    setError("");
    setKind("");
    setStack("");
    setWantAuth(null);
    setWantUsers(null);
    setDatabase("sqlite");
    setStorage("local");
    setGithub(false);
    setToken("");
    setTokenHelp(false);
    setStep(0);
  }

  function saveGithubDraft() {
    writeDraft({
      kind,
      name,
      stack,
      wantAuth,
      wantUsers,
      database,
      storage,
      dashboard,
      landing,
      theme,
      customColors,
      github: true,
    });
  }

  async function signOutGithub() {
    await fetch("/api/github/logout", { method: "POST" });
    setGithubAuth({ oauth: githubAuth.oauth, login: null });
  }

  const commands = useMemo(() => {
    if (!result) return "";
    return [`cd ${result.dest}`, ...(result.run.install || []), result.run.dev]
      .filter(Boolean)
      .join("\n");
  }, [result]);

  return (
    <main className="page">
      <div className="frame">
        <header className="brand">
          <span className="brand-left">
            <Mark />
            AppSeed
          </span>
          <button type="button" className="icon-btn" aria-label="Menu">
            <MenuIcon />
          </button>
        </header>

        <div className="status">
          <p className="status-now">
            Step {Math.min(step + 1, questions.length)} of {questions.length}
            {current.label ? ` · ${current.label}` : ""}
          </p>
          {step > 0 && (
            <div className="trail">
              {questions.slice(0, step).map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className="chip-link"
                  onClick={() => {
                    setError("");
                    setStep(index);
                  }}
                >
                  <span>{item.label}</span>
                  {answers[item.id] ? <strong>{answers[item.id]}</strong> : null}
                </button>
              ))}
            </div>
          )}
          {nextQuestion && !isResult && (
            <p className="status-next">Next: {nextQuestion.title}</p>
          )}
        </div>

        <h1>{current.title}</h1>
        {current.lede ? <p className="lede">{current.lede}</p> : null}

        {current.id === "kind" && (
          <div className="choices">
            <Pick
              selected={kind === "landing"}
              title="A landing page"
              blurb="A public site. Hero, a few sections, a button."
              onSelect={() => chooseKind("landing")}
            />
            <Pick
              selected={kind === "dashboard"}
              title="A dashboard"
              blurb="A signed-in app. Sidebar, pages, tables."
              onSelect={() => chooseKind("dashboard")}
            />
            <Pick
              selected={kind === "both"}
              title="Both"
              blurb="A public page and a dashboard behind it."
              onSelect={() => chooseKind("both")}
            />
            <Pick
              selected={kind === "theme"}
              title="A WordPress theme"
              blurb="Something you activate under Appearance → Themes."
              onSelect={() => chooseKind("theme")}
            />
            <Pick
              selected={kind === "plugin"}
              title="A WordPress plugin"
              blurb="Something you activate under Plugins."
              onSelect={() => chooseKind("plugin")}
            />
          </div>
        )}

        {current.id === "engine" && (
          <div className="choices">
            {engines.map((item) => {
              const copy = ENGINE[item.id] || { title: item.name, blurb: item.description };
              return (
                <Pick
                  key={item.id}
                  selected={stack === item.id}
                  title={copy.title}
                  blurb={copy.blurb}
                  onSelect={() => setStack(item.id)}
                />
              );
            })}
          </div>
        )}

        {current.id === "name" && (
          <label className="field">
            <span>A short name. Letters, numbers, dashes.</span>
            <input
              className="underline"
              value={name}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && current.ready && next()}
              placeholder="acme-dashboard"
              autoFocus
            />
          </label>
        )}

        {current.id === "auth" && (
          <div className="choices">
            <Pick
              selected={wantAuth === false}
              title="No"
              blurb="Just pages. No login screen."
              onSelect={() => {
                setWantAuth(false);
                setWantUsers(false);
              }}
            />
            <Pick
              selected={wantAuth === true}
              title="Yes"
              blurb="Login and registration."
              onSelect={() => setWantAuth(true)}
            />
          </div>
        )}

        {current.id === "users" && (
          <div className="choices">
            <Pick
              selected={wantUsers === false}
              title="No"
              blurb="People can sign in. No admin list."
              onSelect={() => setWantUsers(false)}
            />
            <Pick
              selected={wantUsers === true}
              title="Yes"
              blurb="A page to see and edit users."
              onSelect={() => setWantUsers(true)}
            />
          </div>
        )}

        {current.id === "look" && (
          <div className="kits">
            {kind !== "landing" && kind !== "plugin" && kind !== "theme" && stackDashboards.map((item) => (
              <KitCard
                key={`d-${item.id}`}
                item={item}
                selected={dashboard === item.id}
                onSelect={() => setDashboard(item.id)}
                onPreview={() => setLightbox(item)}
              />
            ))}
            {kind !== "dashboard" && kind !== "plugin" && stackLandings.map((item) => (
              <KitCard
                key={`l-${item.id}`}
                item={item}
                selected={landing === item.id}
                onSelect={() => setLanding(item.id)}
                onPreview={() => setLightbox(item)}
              />
            ))}
            <p className="lede" style={{ margin: "0.4rem 0 0" }}>Colors</p>
            <div className="swatches">
              {catalog.themes.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`swatch ${theme === item.id ? "selected" : ""}`}
                  onClick={() => setTheme(item.id)}
                >
                  {item.name}
                  <span className="chips">
                    <span className="chip" style={{ background: item.tokens?.["color-bg"] }} />
                    <span className="chip" style={{ background: item.tokens?.["color-surface"] }} />
                    <span className="chip" style={{ background: item.tokens?.["color-accent"] }} />
                  </span>
                </button>
              ))}
              <button
                type="button"
                className={`swatch ${theme === "custom" ? "selected" : ""}`}
                onClick={() => {
                  const preset = catalog.themes.find((item) => item.id === theme);
                  if (preset?.tokens) {
                    setCustomColors({
                      bg: preset.tokens["color-bg"] || customColors.bg,
                      surface: preset.tokens["color-surface"] || customColors.surface,
                      text: preset.tokens["color-text"] || customColors.text,
                      accent: preset.tokens["color-accent"] || customColors.accent,
                    });
                  }
                  setTheme("custom");
                }}
              >
                Custom
                <span className="chips">
                  <span className="chip" style={{ background: customColors.bg }} />
                  <span className="chip" style={{ background: customColors.surface }} />
                  <span className="chip" style={{ background: customColors.accent }} />
                </span>
              </button>
            </div>
            {theme === "custom" && (
              <div className="color-grid">
                <ColorField
                  label="Background"
                  value={customColors.bg}
                  onChange={(bg) => setCustomColors((current) => ({ ...current, bg }))}
                />
                <ColorField
                  label="Surface"
                  value={customColors.surface}
                  onChange={(surface) => setCustomColors((current) => ({ ...current, surface }))}
                />
                <ColorField
                  label="Text"
                  value={customColors.text}
                  onChange={(text) => setCustomColors((current) => ({ ...current, text }))}
                />
                <ColorField
                  label="Accent"
                  value={customColors.accent}
                  onChange={(accent) => setCustomColors((current) => ({ ...current, accent }))}
                />
              </div>
            )}
          </div>
        )}

        {current.id === "extras" && (
          <div className="choices">
            <p className="lede" style={{ margin: 0 }}>Database</p>
            <Pick
              selected={database === "sqlite"}
              title="SQLite"
              blurb="A file on disk. Fine until you need more."
              onSelect={() => setDatabase("sqlite")}
            />
            {catalog.addons.filter((item) => item.group === "database").map((item) => (
              <Pick
                key={item.id}
                selected={database === item.id}
                title={item.name}
                blurb={item.description}
                onSelect={() => setDatabase(item.id)}
              />
            ))}
            <p className="lede" style={{ margin: "0.6rem 0 0" }}>File storage</p>
            <Pick
              selected={storage === "local"}
              title="Local files"
              blurb="Saved on this machine. Fine to start."
              onSelect={() => setStorage("local")}
            />
            {catalog.addons.filter((item) => item.group === "storage").map((item) => (
              <Pick
                key={item.id}
                selected={storage === item.id}
                title={item.name}
                blurb={item.description}
                onSelect={() => setStorage(item.id)}
              />
            ))}
          </div>
        )}

        {current.id === "deliver" && (
          <div className="choices">
            <Pick
              selected={!github}
              title="Download a zip"
              blurb="No GitHub account needed."
              onSelect={() => setGithub(false)}
            />
            <Pick
              selected={github}
              title="Put it on GitHub"
              blurb="We create a repo and push the files."
              onSelect={() => setGithub(true)}
            />
            {github && (
              <div className="github-box">
                {githubAuth.oauth && githubAuth.login && (
                  <p className="github-session">
                    Signed in as <strong>{githubAuth.login}</strong>
                    {" "}
                    <button type="button" className="text-btn" onClick={signOutGithub}>Sign out</button>
                  </p>
                )}
                {!githubAuth.login && (
                  <a className="btn ghost" href="/api/github/login" onClick={saveGithubDraft}>
                    Log in with GitHub
                  </a>
                )}
                {(!githubAuth.oauth || !githubAuth.login) && (
                  <label className="field">
                    <span className="field-head">
                      GitHub token
                      <button type="button" className="text-btn" onClick={() => setTokenHelp((open) => !open)}>
                        {tokenHelp ? "Hide" : "How?"}
                      </button>
                    </span>
                    {tokenHelp && (
                      <div className="help-panel">
                        {!githubAuth.oauth && (
                          <p>
                            Login with GitHub needs a GitHub OAuth app on this server
                            (<code>GITHUB_CLIENT_ID</code> and <code>GITHUB_CLIENT_SECRET</code>).
                            Until then, paste a token.
                          </p>
                        )}
                        <ol>
                          <li>
                            Open{" "}
                            <a href="https://github.com/settings/tokens/new?scopes=repo&description=AppSeed" target="_blank" rel="noreferrer">
                              github.com/settings/tokens
                            </a>
                            .
                          </li>
                          <li>Generate a classic token and tick <strong>repo</strong>.</li>
                          <li>Paste it here. Do not commit it.</li>
                        </ol>
                      </div>
                    )}
                    <input
                      className="underline"
                      type="password"
                      value={token}
                      onChange={(event) => setToken(event.target.value)}
                      placeholder="ghp_..."
                    />
                  </label>
                )}
                <p className="notice">
                  We do not store your token or GitHub account. It is used once to create this repo, then forgotten. Nothing is saved in AppSeed or in the generated project.
                </p>
              </div>
            )}
          </div>
        )}

        {isResult && result && (
          <section className="result">
            <article>
              <strong>Folder</strong>
              <pre>{result.dest}</pre>
            </article>
            {result.docker && (
              <article>
                <strong>Docker</strong>
                <pre>{`Dockerfiles: ${result.docker.dockerfiles.join(", ") || "none"}\nImages: ${result.docker.images.join(", ") || "none"}`}</pre>
              </article>
            )}
            {result.github && (
              <article>
                <strong>Repo</strong>
                <pre>{`${result.github.url}\n${result.github.clone}`}</pre>
              </article>
            )}
            <article>
              <strong>Local run</strong>
              <pre>{commands}</pre>
            </article>
          </section>
        )}

        {error && <p className="error">{error}</p>}

        <div className="actions">
          {!isResult && (
            <button type="button" className="btn" onClick={next} disabled={!current.ready || busy}>
              {isLastQuestion ? (busy ? "Building…" : "Build project") : "Continue"}
            </button>
          )}
          {isResult && result?.downloadUrl && (
            <a className="btn" href={result.downloadUrl}>Download zip</a>
          )}
          {isResult && (
            <button type="button" className="btn ghost" onClick={restart}>Start over</button>
          )}
          {step > 0 && !isResult && (
            <button type="button" className="btn ghost" onClick={back}>Back</button>
          )}
        </div>

        {lightbox?.previewUrl && (
          <div className="lightbox" role="dialog" aria-modal="true" aria-label={lightbox.name} onClick={() => setLightbox(null)}>
            <button type="button" className="lightbox-close" aria-label="Close preview" onClick={() => setLightbox(null)}>
              ×
            </button>
            <img
              src={lightbox.previewUrl}
              alt={lightbox.name}
              onClick={(event) => event.stopPropagation()}
            />
          </div>
        )}

        <div className="dots" aria-hidden="true">
          {questions.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={index === step ? "on" : index < step ? "done" : ""}
              aria-label={`${item.label}${answers[item.id] ? `: ${answers[item.id]}` : ""}`}
              onClick={() => index <= step && setStep(index)}
            />
          ))}
        </div>
      </div>
      <div className="band" />
    </main>
  );
}

function Pick({ selected, title, blurb, onSelect, check = false }) {
  return (
    <button type="button" className={`choice ${selected ? "selected" : ""}`} onClick={onSelect}>
      <input type={check ? "checkbox" : "radio"} readOnly checked={selected} />
      <span>
        <strong>{title}</strong>
        <small>{blurb}</small>
      </span>
    </button>
  );
}

function KitCard({ item, selected, onSelect, onPreview }) {
  return (
    <div className={`kit ${selected ? "selected" : ""}`}>
      {item.previewUrl ? (
        <button type="button" className="kit-shot" onClick={onPreview} aria-label={`Open ${item.name} preview`}>
          <img src={item.previewUrl} alt="" />
        </button>
      ) : null}
      <button type="button" className="kit-select" onClick={onSelect}>
        <h3>{item.name}</h3>
        <p>{item.description}</p>
      </button>
    </div>
  );
}

function Mark() {
  return (
    <svg className="mark" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 2 3 7v10l9 5 9-5V7l-9-5zm0 2.2 6.5 3.6v8.4L12 19.8 5.5 16.2V7.8L12 4.2z" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

const DRAFT_KEY = "appseed-draft";

function refreshGithubAuth() {
  return fetch("/api/github/status").then((res) => res.json());
}

function writeDraft(draft) {
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

function readDraft() {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    sessionStorage.removeItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function applyDraft(draft, setters) {
  if (draft.kind) setters.setKind(draft.kind);
  if (draft.name) setters.setName(draft.name);
  if (draft.stack) setters.setStack(draft.stack);
  if (draft.wantAuth !== undefined) setters.setWantAuth(draft.wantAuth);
  if (draft.wantUsers !== undefined) setters.setWantUsers(draft.wantUsers);
  if (draft.database) setters.setDatabase(draft.database);
  if (draft.storage) setters.setStorage(draft.storage);
  if (draft.dashboard) setters.setDashboard(draft.dashboard);
  if (draft.landing) setters.setLanding(draft.landing);
  if (draft.theme) setters.setTheme(draft.theme);
  if (draft.customColors) setters.setCustomColors(draft.customColors);
  if (draft.github) setters.setGithub(true);
}

function extrasToAddons(database, storage) {
  return [database, storage].filter((id) => id && id !== "sqlite" && id !== "local");
}

function databaseLabel(database, catalog) {
  if (database === "sqlite") return "SQLite";
  return catalog.addons.find((item) => item.id === database)?.name || database;
}

function storageLabel(storage, catalog) {
  if (storage === "local") return "Local files";
  return catalog.addons.find((item) => item.id === storage)?.name || storage;
}

const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function isCustomReady(colors) {
  return ["bg", "surface", "text", "accent"].every((key) => HEX.test(colors[key] || ""));
}

function expandHex(hex) {
  const h = hex.replace("#", "");
  if (h.length === 3) return `#${h.split("").map((c) => c + c).join("")}`;
  return `#${h}`;
}

function hexToRgb(hex) {
  const h = expandHex(hex).slice(1);
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function rgbToHex({ r, g, b }) {
  return `#${[r, g, b]
    .map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, "0"))
    .join("")}`;
}

function mix(a, b, t) {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return rgbToHex({
    r: A.r + (B.r - A.r) * t,
    g: A.g + (B.g - A.g) * t,
    b: A.b + (B.b - A.b) * t,
  });
}

function readableOn(bg) {
  const { r, g, b } = hexToRgb(bg);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? "#0f172a" : "#f8fafc";
}

function tokensFromCustom(colors) {
  const bg = expandHex(colors.bg);
  const surface = expandHex(colors.surface);
  const text = expandHex(colors.text);
  const accent = expandHex(colors.accent);
  return {
    "color-bg": bg,
    "color-surface": surface,
    "color-surface-2": mix(surface, text, 0.06),
    "color-border": mix(text, bg, 0.18),
    "color-text": text,
    "color-muted": mix(text, bg, 0.42),
    "color-accent": accent,
    "color-accent-hover": mix(accent, "#000000", 0.15),
    "color-accent-text": readableOn(accent),
  };
}

function ColorField({ label, value, onChange }) {
  const picker = HEX.test(value) ? expandHex(value) : "#000000";
  return (
    <label className="color-field">
      <span>{label}</span>
      <span className="color-inputs">
        <input type="color" value={picker} aria-label={label} onChange={(event) => onChange(event.target.value)} />
        <input type="text" value={value} spellCheck={false} onChange={(event) => onChange(event.target.value)} />
      </span>
    </label>
  );
}
