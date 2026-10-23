import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowUpRight,
  LayoutDashboard,
  Layers,
  Users,
  Briefcase,
  FileText,
  Wallet,
  FolderOpen,
  CalendarDays,
  Zap,
  Bot,
  BookOpen,
  BarChart3,
  ShieldCheck,
  Settings,
  RefreshCw,
} from "lucide-react";
export const portal = false;
export type RecordItem = {
  id: string;
  kind: string;
  title: string;
  slug: string | null;
  status: string;
  data: Record<string, any>;
  tenant_id?: string;
  version: number;
  created_at: string;
};
export type User = {
  id?: string;
  sub?: string;
  name: string;
  email: string;
  role: string;
  tenantId?: string;
};
export type Section = {
  id: string;
  label: string;
  module: string;
  kinds: string[];
  icon: typeof Layers;
};
const common: Section[] = [
  {
    id: "projects",
    label: "Projects",
    module: "project",
    kinds: ["projects", "milestones", "tasks", "updates"],
    icon: Briefcase,
  },
  {
    id: "proposals",
    label: "Proposals",
    module: "proposal",
    kinds: ["proposals", ...(portal ? [] : ["templates"])],
    icon: FileText,
  },
  {
    id: "invoices",
    label: "Invoices",
    module: "billing",
    kinds: ["invoices", ...(portal ? [] : ["receipts"])],
    icon: Wallet,
  },
  {
    id: "files",
    label: portal ? "Shared files" : "Files & media",
    module: "file",
    kinds: ["files"],
    icon: FolderOpen,
  },
];
export const sections: Section[] = [
  {
    id: "overview",
    label: "Overview",
    module: portal ? "project" : "lead",
    kinds: [portal ? "projects" : "leads"],
    icon: LayoutDashboard,
  },
  ...(!portal
    ? [
        {
          id: "content",
          label: "Content studio",
          module: "cms",
          kinds: [
            "category",
            "page",
            "case-study",
            "post",
            "faq",
            "testimonial",
            "settings",
            "media",
          ],
          icon: Layers,
        },
        {
          id: "leads",
          label: "Enquiries",
          module: "lead",
          kinds: ["leads", "bookings", "touchpoints"],
          icon: Users,
        },
        {
          id: "crm",
          label: "CRM & pipeline",
          module: "crm",
          kinds: ["deals", "contacts", "companies", "activities"],
          icon: Briefcase,
        },
      ]
    : []),
  ...common,
  ...(!portal
    ? [
        {
          id: "marketing",
          label: "Marketing",
          module: "marketing",
          kinds: ["drafts", "campaigns"],
          icon: CalendarDays,
        },
        {
          id: "automation",
          label: "Automations",
          module: "automation",
          kinds: ["workflows", "runs"],
          icon: Zap,
        },
        { id: "agents", label: "AI workspace", module: "agent", kinds: [], icon: Bot },
        { id: "knowledge", label: "Knowledge base", module: "rag", kinds: [], icon: BookOpen },
        {
          id: "analytics",
          label: "Analytics",
          module: "analytics",
          kinds: ["metrics"],
          icon: BarChart3,
        },
        {
          id: "notifications",
          label: "Notifications",
          module: "notification",
          kinds: ["notifications", "deliveries"],
          icon: CalendarDays,
        },
        {
          id: "audit",
          label: "Audit history",
          module: "audit",
          kinds: ["events"],
          icon: ShieldCheck,
        },
        { id: "users", label: "People & access", module: "auth", kinds: ["users"], icon: Users },
        { id: "settings", label: "Connections", module: "gateway", kinds: [], icon: Settings },
      ]
    : []),
];
export async function api(path: string, options: RequestInit = {}, retry = true): Promise<any> {
  const r = await fetch("/api/v1" + path, {
    credentials: "include",
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  if (r.status === 401 && retry && !path.startsWith("/auth/")) {
    const refresh = await fetch("/api/v1/auth/refresh", { method: "POST", credentials: "include" });
    if (refresh.ok) return api(path, options, false);
  }
  let data: any;
  try {
    data = await r.json();
  } catch {
    throw new Error(`The API service returned HTTP ${r.status} (${r.statusText || "unreachable"}). Check that backend containers are running.`);
  }
  if (!r.ok) throw new Error(data.error || data.detail || "Unable to complete this request");
  return data;
}

export const titleCase = (s: string) =>
  s.replaceAll("-", " ").replace(/\b\w/g, (c) => c.toUpperCase());
export function Brand() {
  return (
    <a className="brand" href="/">
      <span className="mark">F</span>FangScript <b>Lab</b>
    </a>
  );
}
export function Login({ onLogin }: { onLogin: (u: User) => void }) {
  const params = new URLSearchParams(location.search);
  const [mode, setMode] = useState(params.get("token") ? "password" : "login");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const values = Object.fromEntries(new FormData(e.currentTarget));
      if (mode === "login")
        onLogin(await api("/auth/login", { method: "POST", body: JSON.stringify(values) }));
      else if (mode === "reset") {
        const r = await api("/auth/reset-request", {
          method: "POST",
          body: JSON.stringify({ email: values.email }),
        });
        setMessage(r.message);
      } else {
        await api("/auth/set-password", {
          method: "POST",
          body: JSON.stringify({ password: values.password, token: params.get("token") }),
        });
        setMode("login");
        setMessage("Password set. You can now sign in.");
        history.replaceState(null, "", location.pathname);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="login-page">
      <Brand />
      <div className="login-card">
        <span className="eyebrow">{portal ? "YOUR CLIENT WORKSPACE" : "THE AGENCY WORKSPACE"}</span>
        <h1>
          {mode === "login"
            ? "Good to see you."
            : mode === "reset"
              ? "Let’s get you back in."
              : "Make yourself at home."}
        </h1>
        <p>
          {portal
            ? "Your projects, progress, and next steps. All in one place."
            : "A little clarity. A lot of possibility."}
        </p>
        <form onSubmit={submit}>
          {mode !== "password" && (
            <label>
              {mode === "login" ? "Username or email" : "Email address"}
              <input
                name="email"
                type={mode === "login" ? "text" : "email"}
                autoComplete={mode === "login" ? "username" : "email"}
                required
                placeholder={mode === "login" ? "fangscript" : "you@company.com"}
              />
            </label>
          )}
          {mode !== "reset" && (
            <label>
              Password
              <input
                name="password"
                type="password"
                minLength={mode === "password" ? 12 : 1}
                maxLength={200}
                required
                autoComplete={mode === "password" ? "new-password" : "current-password"}
              />
            </label>
          )}
          {error && (
            <div className="notice error" role="alert">
              {error}
            </div>
          )}
          {message && (
            <div className="notice" role="status">
              {message}
            </div>
          )}
          <button className="button gold" disabled={busy}>
            {busy
              ? "One moment…"
              : mode === "login"
                ? "Sign in"
                : mode === "reset"
                  ? "Send reset link"
                  : "Set your password"}
            <ArrowUpRight size={16} />
          </button>
        </form>
        <button
          className="link-button"
          onClick={() => {
            setMode(mode === "login" ? "reset" : "login");
            setError("");
            setMessage("");
          }}
        >
          {mode === "login" ? "Forgot your password?" : "Back to sign in"}
        </button>
        <div className="login-foot">
          Invitation-only access · <a href="/contact">Contact the team</a>
        </div>
      </div>
      <p className="login-tagline">Build. Automate. Grow.</p>
    </div>
  );
}
export function Overview({ onNavigate }: { onNavigate: (id: string) => void }) {
  const [cards, setCards] = useState<any[]>([]);
  useEffect(() => {
    const sources = portal
      ? [
          ["projects", "Active projects", "project", "projects"],
          ["proposals", "Your proposals", "proposal", "proposals"],
          ["invoices", "Invoices", "billing", "invoices"],
        ]
      : [
          ["leads", "Recent enquiries", "lead", "leads"],
          ["crm", "Open opportunities", "crm", "deals"],
          ["projects", "Projects in motion", "project", "projects"],
          ["invoices", "Invoices", "billing", "invoices"],
        ];
    void Promise.all(
      sources.map(async ([id, label, module, kind]) => {
        try {
          const r = await api(`/${module}/records?kind=${kind}&limit=100`);
          return { id, label, count: r.items.length, items: r.items };
        } catch {
          return { id, label, count: null, items: [] };
        }
      }),
    ).then(setCards);
  }, []);
  return (
    <>
      <div className="overview-banner">
        <div>
          <span className="eyebrow">ONE CONNECTED WORKSPACE</span>
          <h2>
            {portal
              ? "Good work, moving forward."
              : "A little less busywork.\nA lot more possibility."}
          </h2>
          <p>
            {portal
              ? "Stay connected to your projects and the team behind them."
              : "Your people, projects, and next opportunities. Together."}
          </p>
          <button className="button gold" onClick={() => onNavigate(portal ? "projects" : "crm")}>
            {portal ? "View your projects" : "Open your pipeline"}
            <ArrowUpRight size={16} />
          </button>
        </div>
        <div className="banner-sculpture">
          <span />
          <i />
          <b />
        </div>
      </div>
      <div className="metric-grid">
        {cards.map((c) => (
          <button key={c.id} className="metric-card" onClick={() => onNavigate(c.id)}>
            <span>
              {c.label}
              <ArrowUpRight size={15} />
            </span>
            <strong>{c.count === null ? "—" : c.count}</strong>
            <small>
              {c.count === null ? "Module is unavailable" : "In the latest 100 records"}
            </small>
          </button>
        ))}
      </div>
      <div className="overview-bottom">
        <section className="overview-list">
          <div className="panel-heading">
            <h2>{portal ? "Your projects" : "Recent enquiries"}</h2>
            <button onClick={() => onNavigate(portal ? "projects" : "leads")}>View all ↗</button>
          </div>
          {cards[0]?.items.slice(0, 5).map((r: RecordItem) => (
            <div className="activity-row" key={r.id}>
              <span className="avatar">{r.title[0]}</span>
              <div>
                <strong>{r.title}</strong>
                <small>{r.data.email || r.data.description || "Your next step starts here."}</small>
              </div>
              <span className={"status " + r.status}>{r.status}</span>
            </div>
          ))}
          {!cards[0]?.items.length && (
            <p className="quiet-empty">
              {cards[0]?.count === null
                ? "This module is unavailable."
                : "New activity will appear here."}
            </p>
          )}
        </section>
        <section className="quick-links">
          <span className="eyebrow">GOOD NEXT STEPS</span>
          <h2>Keep things moving.</h2>
          {(portal
            ? [
                ["proposals", "Review a proposal"],
                ["files", "Find a shared file"],
                ["invoices", "View invoices"],
              ]
            : [
                ["content", "Publish something useful"],
                ["agents", "Draft with your assistant"],
                ["projects", "Update a project"],
              ]
          ).map(([id, label]) => (
            <button key={id} onClick={() => onNavigate(id!)}>
              {label}
              <ArrowUpRight size={17} />
            </button>
          ))}
        </section>
      </div>
    </>
  );
}
export function Agents() {
  const [prompt, setPrompt] = useState("");
  const [kind, setKind] = useState("proposal");
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const load = () =>
    api("/agent/approvals")
      .then((d) => setItems(d.items))
      .catch((e) => setError(e.message));
  useEffect(() => {
    void load();
  }, []);
  return (
    <div className="agents-grid">
      <form
        className="assistant-compose"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          try {
            await api("/agent/draft", { method: "POST", body: JSON.stringify({ kind, prompt }) });
            await load();
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <Bot size={30} />
        <h2>A thoughtful starting point.</h2>
        <p>Give your assistant the context. Review every draft before using it.</p>
        <label>
          Draft a
          <select value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="proposal">Project proposal</option>
            <option value="follow-up">Client follow-up</option>
            <option value="marketing">Marketing content</option>
          </select>
        </label>
        <label>
          What should it know?
          <textarea
            rows={7}
            minLength={10}
            maxLength={8000}
            required
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Goals, audience, scope, and facts it should use…"
          />
        </label>
        <button className="button gold" disabled={busy}>
          {busy ? "Drafting…" : "Create a draft"}
          <ArrowUpRight size={16} />
        </button>
        {error && <p className="notice error">{error}</p>}
      </form>
      <section className="approval-list">
        <div className="panel-heading">
          <h2>Review inbox</h2>
          <button onClick={() => void load()}>
            <RefreshCw size={15} />
          </button>
        </div>
        {items.map((i) => (
          <article key={i.id}>
            <span className={"status " + i.status}>{i.status}</span>
            <h3>{titleCase(i.payload.kind || i.action)}</h3>
            <p>{i.payload.text}</p>
            {i.status === "pending" && (
              <button
                className="button"
                onClick={() =>
                  void api(`/agent/approvals/${i.id}/approve`, { method: "POST" })
                    .then(load)
                    .catch((e) => setError(e.message))
                }
              >
                Approve draft
              </button>
            )}
            {i.status === "approved" && i.action === "send-email" && (
              <button
                className="button gold"
                onClick={() =>
                  void api(`/agent/approvals/${i.id}/execute`, { method: "POST" })
                    .then(load)
                    .catch((e) => setError(e.message))
                }
              >
                Send approved email
              </button>
            )}
          </article>
        ))}
        {!items.length && <p className="quiet-empty">Drafts awaiting review will appear here.</p>}
      </section>
    </div>
  );
}
export function Knowledge() {
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState("");
  const load = () =>
    api("/rag/sources")
      .then((d) => setItems(d.items))
      .catch((e) => setError(e.message));
  useEffect(() => {
    void load();
  }, []);
  return (
    <>
      <div className="notice">
        Published website content is synchronized automatically. Internal notes remain private and
        are excluded from the public assistant.
      </div>
      {error && <div className="notice error">{error}</div>}
      <form
        className="inline-form"
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          try {
            await api("/rag/sources", {
              method: "POST",
              body: JSON.stringify(Object.fromEntries(new FormData(form))),
            });
            form.reset();
            await load();
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      >
        <label>
          Internal note title
          <input name="title" required />
        </label>
        <label>
          Content
          <textarea name="text" rows={5} required />
        </label>
        <button className="button gold">Add private knowledge</button>
      </form>
      <div className="records-panel">
        <table>
          <thead>
            <tr>
              <th>Source</th>
              <th>Visibility</th>
              <th>Version</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id}>
                <td>
                  {i.title}
                  <small>{i.url}</small>
                </td>
                <td>
                  <span className="status">{i.public ? "Public" : "Private"}</span>
                </td>
                <td>{i.version}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
export function Connections({ user }: { user: User }) {
  const [failures, setFailures] = useState<{module: string; id: string; title: string; error: string}[]>([]);
  const [busy, setBusy] = useState(false);
  async function inspect(module: string) {
    setBusy(true); setError("");
    try { const result = await api(`/${module}/operations/failures`); setFailures(result.items.map((item: any) => ({...item, module}))); }
    catch(e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  async function retry(module: string, id: string) {
    setBusy(true); setError("");
    try { await api(`/${module}/operations/failures/${id}/retry`, {method: "POST"}); await inspect(module); await load(); }
    catch(e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  const [status, setStatus] = useState<any[]>([]);
  const [error, setError] = useState("");
  const load = () => api("/gateway/status")
      .then((d) => setStatus(d.modules))
      .catch((e) => setError(e.message));
  useEffect(() => { void load(); }, []);
  return (
    <>
      <div className="notice">
        Provider credentials are configured on the server. Unconnected integrations remain
        unavailable.
      </div>
      <button className="button" onClick={() => void load()} disabled={busy}>Refresh status</button>
      {failures.map(f => <article className="notice" key={f.id}><strong>{f.module}: {f.title}</strong><p>{f.error}</p><button className="button" disabled={busy} onClick={() => void retry(f.module, f.id)}>Retry event</button></article>)}
      {error && <p role="alert" className="notice error">{error}</p>}
      <div className="connections-grid">
        {status.map((s) => (
          <article key={s.id}>
            <span className={"connection-dot " + (s.ready ? "ready" : "")} />
            <h3>{titleCase(s.id)}</h3>
            <span className={"status " + (s.ready ? "active" : "pending")}>
              {s.ready ? "Connected" : "Unavailable"}
            </span>
            {s.eventBus !== undefined && <p>Event connection: {s.eventBus ? "Connected" : "Unavailable"} · Queued: {s.queuedEvents ?? "—"} · Failed: {s.failedEvents ?? "—"}</p>}
            {user.role === "admin" && s.failedEvents > 0 && <button className="button" disabled={busy} onClick={() => void inspect(s.id)}>Review failed events</button>}
            {Object.entries(s.integrations || {}).map(([name, connected]) => (
              <p key={name}>
                {name}: {connected ? "Configured" : "Not connected"}
              </p>
            ))}
          </article>
        ))}
      </div>
    </>
  );
}
