import { useEffect, useState } from "react";
import { api, type User } from "./Workspace";
import "./hosting.css";

type Input = {
  title: string;
  repository: string;
  branch: string;
  slug: string;
  mode: string;
  privateRepo: boolean;
  baseDirectory: string;
  publishDirectory: string;
  installCommand: string;
  buildCommand: string;
  startCommand: string;
  port: number;
  dockerfile: string;
  description: string;
  image: string;
};
type Project = {
  id: string;
  input: Input;
  url: string;
  status: string;
  error?: string;
  logs?: string;
  case_study_id?: string;
  application_uuid?: string;
};
type Overview = {
  configured: boolean;
  missing: string[];
  domain: string;
  privateRepositories: boolean;
  items: Project[];
};
const initial: Input = {
  title: "",
  repository: "",
  branch: "main",
  slug: "",
  mode: "static",
  privateRepo: false,
  baseDirectory: "/",
  publishDirectory: "/dist",
  installCommand: "npm ci",
  buildCommand: "npm run build",
  startCommand: "npm start",
  port: 3000,
  dockerfile: "/Dockerfile",
  description: "",
  image: "",
};
const pending = (status: string) =>
  ["provisioning", "submitting", "building", "starting"].includes(status);
const labels: Record<string, string> = {
  draft: "Ready to deploy",
  provisioning: "Creating application",
  submitting: "Submitting build",
  building: "Building",
  starting: "Starting application",
  ready: "Live",
  failed: "Needs attention",
};

function EnvironmentForm({
  project,
  busy,
  run,
}: {
  project: Project;
  busy: boolean;
  run: (fn: () => Promise<void>) => Promise<void>;
}) {
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [build, setBuild] = useState(false);
  const [saved, setSaved] = useState(false);
  return (
    <details>
      <summary>Environment variables</summary>
      <form
        className="hosting-form"
        onSubmit={(e) => {
          e.preventDefault();
          void run(async () => {
            await api(`/cms/hosting/${project.id}/environment`, {
              method: "PATCH",
              body: JSON.stringify([{ key, value, is_buildtime: build, is_runtime: true }]),
            });
            setKey("");
            setValue("");
            setSaved(true);
          });
        }}
      >
        <fieldset disabled={busy || pending(project.status)}>
          <label>
            Variable name
            <input
              value={key}
              required
              pattern="[A-Za-z_][A-Za-z0-9_]*"
              onChange={(e) => {
                setKey(e.target.value);
                setSaved(false);
              }}
              placeholder="DATABASE_URL"
            />
          </label>
          <label>
            Variable value
            <input
              type="password"
              autoComplete="new-password"
              required
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </label>
          <label>
            Available during build
            <select
              value={build ? "yes" : "no"}
              onChange={(e) => setBuild(e.target.value === "yes")}
            >
              <option value="no">Runtime only</option>
              <option value="yes">Build and runtime</option>
            </select>
          </label>
          <p>
            Frontend variables such as VITE_* become public in the built website. Add only public
            API URLs or public keys there.
          </p>
          <button className="button" type="submit">
            Save variable
          </button>
          {saved && <p role="status">Variable saved. Redeploy to apply it.</p>}
        </fieldset>
      </form>
    </details>
  );
}

export function Hosting({ user }: { user: User }) {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [selected, setSelected] = useState<Project | null>(null);
  const [form, setForm] = useState<Input>(initial);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const load = () => api("/cms/hosting").then(setOverview);
  useEffect(() => {
    if (user.role !== "admin") return;
    let active = true;
    api("/cms/hosting")
      .then((data) => {
        if (active) setOverview(data);
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user.role]);
  useEffect(() => {
    if (!selected || !pending(selected.status) || busy) return;
    let active = true;
    const id = selected.id;
    const timer = setTimeout(() => {
      api("/cms/hosting/" + id)
        .then((data) => {
          if (active) setSelected(data);
        })
        .catch((e) => {
          if (active) setError(e.message);
        });
    }, 6000);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [selected, busy]);
  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to complete this action.");
    } finally {
      setBusy(false);
    }
  }
  function change<K extends keyof Input>(key: K, value: Input[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }
  function newProject() {
    setSelected(null);
    setForm(initial);
    setEditing(true);
    setError("");
    setNotice("");
  }
  async function choose(project: Project) {
    setSelected(project);
    setEditing(false);
    await run(async () => {
      setSelected(await api("/cms/hosting/" + project.id));
    });
  }
  if (user.role !== "admin")
    return <p className="notice">Project hosting is available to administrators.</p>;
  return (
    <section className="hosting-panel" aria-label="Project hosting">
      <div className="hosting-heading">
        <div>
          <h2>Your projects, live on your domain.</h2>
          <p>Import a GitHub repository, deploy it, then add its live preview to your portfolio.</p>
        </div>
        <button
          className="button gold"
          disabled={!overview?.configured || busy}
          onClick={newProject}
        >
          Import from GitHub
        </button>
      </div>
      {loading && <p role="status">Loading hosted projects…</p>}
      {error && (
        <div role="alert" className="notice error">
          {error}
          <button className="button" disabled={busy} onClick={() => void run(load)}>
            Retry connection
          </button>
        </div>
      )}
      {notice && (
        <p role="status" className="notice">
          {notice}
        </p>
      )}
      {overview && !overview.configured && (
        <div className="notice">
          <strong>Connect your hosting server first.</strong>
          <p>Set these runtime settings on the CMS service, then redeploy it:</p>
          <p>{overview.missing.join(", ")}</p>
          <p>
            Point your wildcard project domain to the hosting server. Your API token stays on the
            server.
          </p>
        </div>
      )}
      <div className="hosting-layout">
        <aside className="hosting-projects" aria-label="Hosted projects">
          {overview?.items.length === 0 && (
            <p>No projects yet. Import your first repository to get started.</p>
          )}
          {overview?.items.map((project) => (
            <button
              key={project.id}
              className={selected?.id === project.id ? "selected" : ""}
              disabled={busy}
              onClick={() => void choose(project)}
            >
              <strong>{project.input.title}</strong>
              <small>{project.url.replace("https://", "")}</small>
              <span>{labels[project.status] || project.status}</span>
            </button>
          ))}
        </aside>
        <div>
          {editing ? (
            <form
              className="hosting-form"
              onSubmit={(event) => {
                event.preventDefault();
                void run(async () => {
                  const result = await api("/cms/hosting" + (selected ? "/" + selected.id : ""), {
                    method: selected ? "PUT" : "POST",
                    body: JSON.stringify(form),
                  });
                  setSelected(result);
                  setEditing(false);
                  await load();
                  setNotice("Project saved. Select Deploy project to start its build.");
                });
              }}
            >
              <h3>{selected ? "Build settings" : "Import a project"}</h3>
              <fieldset disabled={busy}>
                <label>
                  Project name
                  <input
                    required
                    value={form.title}
                    onChange={(e) => change("title", e.target.value)}
                    placeholder="Novexa Retail"
                  />
                </label>
                <label>
                  GitHub repository
                  <input
                    required
                    type="url"
                    value={form.repository}
                    onChange={(e) => change("repository", e.target.value)}
                    placeholder="https://github.com/FangScript/novexa-retail"
                  />
                </label>
                <div className="hosting-pair">
                  <label>
                    Branch
                    <input
                      required
                      value={form.branch}
                      onChange={(e) => change("branch", e.target.value)}
                    />
                  </label>
                  <label>
                    Project address
                    <input
                      required
                      pattern="[a-z0-9]+(-[a-z0-9]+)*"
                      minLength={3}
                      maxLength={40}
                      disabled={!!selected}
                      value={form.slug}
                      onChange={(e) => change("slug", e.target.value.toLowerCase())}
                      placeholder="novexa"
                    />
                  </label>
                </div>
                <p className="hosting-address">
                  https://{form.slug || "your-project"}.{overview?.domain || "your-domain.com"}
                </p>
                <label>
                  Repository access
                  <select
                    disabled={!overview?.privateRepositories}
                    value={form.privateRepo ? "private" : "public"}
                    onChange={(e) => change("privateRepo", e.target.value === "private")}
                  >
                    <option value="public">Public repository</option>
                    <option value="private" disabled={!overview?.privateRepositories}>
                      Private — connected GitHub App
                    </option>
                  </select>
                  {selected && overview?.privateRepositories && (
                    <small>Switch to the connected GitHub App if GitHub blocks public cloning.</small>
                  )}
                </label>
                <label>
                  Application type
                  <select value={form.mode} onChange={(e) => change("mode", e.target.value)}>
                    <option value="static">Frontend / landing page</option>
                    <option value="node">Node application / server-rendered website</option>
                    <option value="dockerfile">Full application with Dockerfile</option>
                  </select>
                </label>
                <label>
                  Repository folder
                  <input
                    value={form.baseDirectory}
                    onChange={(e) => change("baseDirectory", e.target.value)}
                    required
                  />
                </label>
                {form.mode !== "dockerfile" ? (
                  <>
                    <label>
                      Install command
                      <input
                        value={form.installCommand}
                        onChange={(e) => change("installCommand", e.target.value)}
                      />
                    </label>
                    <label>
                      Build command
                      <input
                        value={form.buildCommand}
                        onChange={(e) => change("buildCommand", e.target.value)}
                      />
                    </label>
                    {form.mode === "static" ? (
                      <label>
                        Build output folder
                        <input
                          value={form.publishDirectory}
                          onChange={(e) => change("publishDirectory", e.target.value)}
                          required
                        />
                      </label>
                    ) : (
                      <label>
                        Start command
                        <input
                          value={form.startCommand}
                          onChange={(e) => change("startCommand", e.target.value)}
                        />
                      </label>
                    )}
                  </>
                ) : (
                  <label>
                    Dockerfile path
                    <input
                      value={form.dockerfile}
                      onChange={(e) => change("dockerfile", e.target.value)}
                      required
                    />
                  </label>
                )}
                {form.mode !== "static" && (
                  <label>
                    Application port
                    <input
                      type="number"
                      min={1}
                      max={65535}
                      value={form.port}
                      onChange={(e) => change("port", Number(e.target.value))}
                      required
                    />
                  </label>
                )}
                <p>
                  For backend applications, prepare the hosting application, add its environment
                  variables, then deploy. Databases must already exist. Each project runs separately
                  from this website.
                </p>
                <label>
                  Portfolio description
                  <textarea
                    value={form.description}
                    onChange={(e) => change("description", e.target.value)}
                  />
                </label>
                <label>
                  Cover image URL (optional)
                  <input
                    type="url"
                    value={form.image}
                    onChange={(e) => change("image", e.target.value)}
                    placeholder="https://…"
                  />
                </label>
                <div className="hosting-actions">
                  <button className="button gold" type="submit">
                    {busy ? "Saving…" : "Save project"}
                  </button>
                  <button className="button" type="button" onClick={() => setEditing(false)}>
                    Cancel
                  </button>
                </div>
              </fieldset>
            </form>
          ) : selected ? (
            <article className="hosting-detail">
              <p className="workspace-label">{labels[selected.status] || selected.status}</p>
              <h3>{selected.input.title}</h3>
              <p className="hosting-address">{selected.url}</p>
              <p>
                {selected.input.repository} · {selected.input.branch}
              </p>
              {selected.error && (
                <p role="alert" className="notice error">
                  {selected.error}
                </p>
              )}
              {pending(selected.status) && (
                <p role="status">
                  Checking build progress every few seconds. You can leave this page; the build
                  continues on your server.
                </p>
              )}
              <div className="hosting-actions">
                {!selected.application_uuid && (
                  <button
                    className="button"
                    disabled={busy || pending(selected.status)}
                    onClick={() =>
                      void run(async () => {
                        setSelected(
                          await api(`/cms/hosting/${selected.id}/prepare`, { method: "POST" }),
                        );
                        await load();
                        setNotice(
                          "Application prepared. Add any environment variables before deploying.",
                        );
                      })
                    }
                  >
                    Prepare environment
                  </button>
                )}
                <button
                  className="button gold"
                  disabled={busy || pending(selected.status) || !overview?.configured}
                  onClick={() =>
                    void run(async () => {
                      setSelected(
                        await api(`/cms/hosting/${selected.id}/deploy`, { method: "POST" }),
                      );
                      await load();
                    })
                  }
                >
                  {selected.application_uuid ? "Redeploy project" : "Deploy project"}
                </button>
                <button className="button" disabled={busy} onClick={() => void choose(selected)}>
                  Refresh status & logs
                </button>
                <button
                  className="button"
                  disabled={busy || pending(selected.status)}
                  onClick={() => {
                    setForm(selected.input);
                    setEditing(true);
                  }}
                >
                  Edit settings
                </button>
                {selected.status === "ready" && (
                  <>
                    <a
                      className="button"
                      href={selected.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open live preview ↗
                    </a>
                    <button
                      className="button"
                      disabled={busy}
                      onClick={() =>
                        void run(async () => {
                          const published = await api(`/cms/hosting/${selected.id}/publish`, { method: "POST" });
                          setSelected({ ...selected, case_study_id: published.caseStudyId });
                          await load();
                          setNotice(
                            "Published to Work. Its project card now opens the live preview.",
                          );
                        })
                      }
                    >
                      {selected.case_study_id ? "Update Work link" : "Publish to Work"}
                    </button>
                  </>
                )}
              </div>
              {selected.application_uuid && (
                <p>
                  Hosting application ID: <code>{selected.application_uuid}</code>
                </p>
              )}
              {selected.application_uuid && (
                <EnvironmentForm key={selected.id} project={selected} busy={busy} run={run} />
              )}
              {selected.case_study_id && (
                <p>Listed in your portfolio. Edit the case study or unpublish it from Content.</p>
              )}
              <details open={!!selected.logs}>
                <summary>Build logs</summary>
                <pre className="hosting-logs">
                  {selected.logs ||
                    (selected.status === "failed"
                      ? "Coolify reported a failed build but returned no deployment logs. The Coolify API token may need read:sensitive permission. Update HOSTING_COOLIFY_TOKEN on the CMS service, redeploy CMS, then refresh status & logs here."
                      : "No deployment logs have been returned yet. Start or refresh a deployment to load its logs.")}
                </pre>
              </details>
            </article>
          ) : (
            <div className="empty-state">
              <h3>From repository to live preview.</h3>
              <p>
                Choose a project or import one from GitHub. Visitors stay under your own domain when
                they open its preview.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
