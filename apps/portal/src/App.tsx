import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Menu, ChevronRight, ArrowUpRight, Plus, Search, RefreshCw, LogOut } from "lucide-react";
import {
  api,
  Brand,
  sections,
  portal,
  type User,
  type RecordItem,
  type Section,
  titleCase,
  Overview,
  Login,
  Connections,
  Agents,
  Knowledge,
} from "./Workspace";
import { Editor, Detail, Invite, FileUpload } from "./Records";
import "./workspace.css";
import { MarketingCalendar, FunnelReport } from "./Operations";
function App() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [section, setSection] = useState<Section>(sections[0]!);
  const [kind, setKind] = useState(section.kinds[0] || "");
  const [items, setItems] = useState<RecordItem[]>([]);
  const [selected, setSelected] = useState<RecordItem | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const [revision, setRevision] = useState(0);
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    api("/auth/me", {}, false)
      .then(setUser)
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);
  useEffect(() => {
    if (!user || !kind) return;
    let current = true;
    setLoading(true);
    setError("");
    const timer = setTimeout(
      () =>
        api(
          `/${section.module}/records?kind=${kind}&limit=30&offset=${offset}&search=${encodeURIComponent(search)}`,
        )
          .then((r) => {
            if (current) setItems(r.items);
          })
          .catch((e) => {
            if (current) {
              setError(e.message);
              setItems([]);
            }
          })
          .finally(() => {
            if (current) setLoading(false);
          }),
      search ? 300 : 0,
    );
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [user, section, kind, search, offset, revision]);
  function change(s: Section) {
    setSection(s);
    setKind(s.kinds[0] || "");
    setSearch("");
    setOffset(0);
    setSelected(null);
    setEditing(false);
    setMenu(false);
    setError("");
  }
  const reload = () => {
    setSelected(null);
    setEditing(false);
    setRevision((x) => x + 1);
  };
  async function action(item: RecordItem, name: string) {
    try {
      await api(`/${section.module}/records/${item.id}/action`, {
        method: "POST",
        body: JSON.stringify({ action: name, version: item.version }),
      });
      reload();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  if (checking)
    return (
      <div className="loading-page">
        <Brand />
        <p>Opening your workspace…</p>
      </div>
    );
  if (!user) return <Login onLogin={setUser} />;
  if (!portal && user.role === "client")
    return (
      <div className="login-page">
        <Brand />
        <div className="login-card">
          <h1>Your client workspace is ready.</h1>
          <a className="button gold" href="/portal/">
            Open client portal
          </a>
        </div>
      </div>
    );
  const special = ["overview", "agents", "knowledge", "settings", "analytics"].includes(section.id);
  const Icon = section.icon;
  return (
    <div className="workspace">
      <aside className={"sidebar " + (menu ? "open" : "")}>
        <Brand />
        <span className="workspace-label">{portal ? "CLIENT WORKSPACE" : "AGENCY WORKSPACE"}</span>
        <nav>
          {sections.map((s, i) => (
            <button
              key={s.id}
              className={(s.id === section.id ? "active " : "") + (i === 8 ? "nav-divider" : "")}
              onClick={() => change(s)}
            >
              <s.icon size={17} />
              {s.label}
              {s.id === section.id && <ChevronRight size={14} />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <a href="/" target="_blank" rel="noreferrer">
            View website <ArrowUpRight size={15} />
          </a>
          <div className="user-info">
            <span>{user.name?.[0] || "F"}</span>
            <div>
              <strong>{user.name}</strong>
              <small>{user.role}</small>
            </div>
            <button
              aria-label="Sign out"
              onClick={() =>
                void api("/auth/logout", { method: "POST" }).finally(() => setUser(null))
              }
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
      <div className="workspace-main">
        <header className="workspace-header">
          <button
            className="mobile-menu-button"
            aria-label="Toggle menu"
            onClick={() => setMenu(!menu)}
          >
            <Menu size={20} />
          </button>
          <span>
            FangScript Lab <ChevronRight size={13} />
            {section.label}
          </span>
          <a className="header-link" href="/book">
            {portal ? "Book a conversation" : "View calendar"}
            <ArrowUpRight size={14} />
          </a>
        </header>
        <main className="workspace-content">
          <div className="workspace-title">
            <div>
              <span className="eyebrow">
                {portal ? "YOUR NEXT CHAPTER" : "MAKE ROOM FOR GOOD WORK"}
              </span>
              <h1>
                {section.id === "overview" ? `Hello, ${user.name.split(" ")[0]}.` : section.label}
              </h1>
              <p>
                {section.id === "overview"
                  ? "Here’s where things stand. Let’s move them forward."
                  : portal
                    ? "Everything you need to stay in the loop."
                    : "Thoughtfully organized. Ready for your next move."}
              </p>
            </div>
            {!portal &&
              !special &&
              !["audit", "analytics", "users", "files"].includes(section.id) && (
                <button
                  className="button gold"
                  onClick={() => {
                    setSelected(null);
                    setEditing(true);
                  }}
                >
                  <Plus size={16} />
                  New {kind.replace(/s$/, "")}
                </button>
              )}
            {section.id === "files" && <FileUpload user={user} onDone={reload} />}
          </div>
          {error && (
            <div className="notice error" role="alert">
              {error}
              <button onClick={reload}>
                <RefreshCw size={15} />
                Retry
              </button>
            </div>
          )}
          {section.id === "overview" ? (
            <Overview
              onNavigate={(id) => {
                const target = sections.find((s) => s.id === id);
                if (target) change(target);
              }}
            />
          ) : section.id === "agents" ? (
            <Agents />
          ) : section.id === "knowledge" ? (
            <Knowledge />
          ) : section.id === "analytics" ? (
            <FunnelReport />
          ) : section.id === "settings" ? (
            <Connections user={user} />
          ) : (
            <>
              {section.id === "marketing" && kind === "drafts" && (
                <MarketingCalendar onSelect={setSelected} />
              )}
              <div className="table-toolbar">
                <div className="resource-tabs">
                  {section.kinds.map((k) => (
                    <button
                      key={k}
                      className={kind === k ? "active" : ""}
                      onClick={() => {
                        setKind(k);
                        setOffset(0);
                        setSelected(null);
                      }}
                    >
                      {titleCase(k)}
                    </button>
                  ))}
                </div>
                <label className="search-box">
                  <Search size={16} />
                  <input
                    placeholder="Search…"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setOffset(0);
                    }}
                  />
                </label>
                <button className="icon-button" aria-label="Refresh" onClick={reload}>
                  <RefreshCw size={16} />
                </button>
              </div>
              {section.id === "users" && <Invite onDone={reload} />}
              <div className="records-panel">
                {loading ? (
                  <div className="empty-state">
                    <RefreshCw className="spin" />
                    <p>Loading records…</p>
                  </div>
                ) : items.length ? (
                  <>
                    <div className="table-scroll">
                      <table>
                        <thead>
                          <tr>
                            <th>{titleCase(kind)}</th>
                            <th>Status</th>
                            <th>{kind === "invoices" ? "Amount" : "Details"}</th>
                            <th>Created</th>
                            <th />
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((r) => (
                            <tr
                              key={r.id}
                              tabIndex={0}
                              onClick={() => setSelected(r)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") setSelected(r);
                              }}
                            >
                              <td>
                                <strong>{r.title}</strong>
                                <small>{r.data.email || r.slug || ""}</small>
                              </td>
                              <td>
                                <span className={"status " + r.status}>{r.status}</span>
                              </td>
                              <td>
                                {kind === "invoices"
                                  ? new Intl.NumberFormat("en-PK", {
                                      style: "currency",
                                      currency: r.data.currency || "PKR",
                                    }).format((r.data.total || 0) / 100)
                                  : r.data.stage ||
                                    r.data.serviceCategory ||
                                    r.data.role ||
                                    r.data.description?.slice(0, 50) ||
                                    "—"}
                              </td>
                              <td>
                                {new Date(r.created_at).toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "short",
                                })}
                              </td>
                              <td>
                                <ArrowUpRight size={15} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="pagination">
                      <span>
                        Showing {offset + 1}–{offset + items.length}
                      </span>
                      <div>
                        <button
                          disabled={!offset}
                          onClick={() => setOffset(Math.max(0, offset - 30))}
                        >
                          Previous
                        </button>
                        <button disabled={items.length < 30} onClick={() => setOffset(offset + 30)}>
                          Next
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="empty-state">
                    <Icon size={33} />
                    <h2>{portal ? "You’re all caught up." : "A clear space for what’s next."}</h2>
                    <p>
                      {portal
                        ? `Your shared ${kind} will appear here.`
                        : `Add your first ${kind.replace(/s$/, "")} to get started.`}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
          {selected && !editing && (
            <Detail
              item={selected}
              module={section.module}
              user={user}
              onClose={() => setSelected(null)}
              onEdit={() => setEditing(true)}
              onAction={(a) => void action(selected, a)}
              onReload={reload}
            />
          )}
          {editing && (
            <Editor
              module={section.module}
              kind={kind}
              item={selected}
              onClose={() => setEditing(false)}
              onSaved={reload}
            />
          )}
        </main>
        <footer className="workspace-footer">
          Build. Automate. Grow.
          <span>FangScript Lab · {portal ? "Client portal" : "Agency workspace"}</span>
        </footer>
      </div>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
