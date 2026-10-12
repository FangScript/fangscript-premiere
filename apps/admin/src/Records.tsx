import { useEffect, useRef, useState, type ReactNode } from "react";
import { X, Plus, Upload, Printer } from "lucide-react";
import { api, portal, titleCase, type RecordItem, type User } from "./Workspace";

const fields: Record<string, string[]> = {
  category: ["shortTitle", "eyebrow", "headline", "summary", "services"],
  page: ["body", "seoTitle", "seoDescription", "socialImage"],
  post: ["excerpt", "body", "category", "image", "seoTitle", "seoDescription"],
  "case-study": [
    "description",
    "challenge",
    "approach",
    "outcomes",
    "type",
    "category",
    "image",
    "liveUrl",
    "demo",
  ],
  faq: ["answer"],
  testimonial: ["quote", "name", "company"],
  settings: ["email", "linkedin", "github"],
  media: ["image", "description"],
  leads: ["email", "company", "serviceCategory", "budget", "message"],
  bookings: ["email", "start", "end", "timezone"],
  touchpoints: ["leadId", "description"],
  contacts: ["email", "phone", "company"],
  companies: ["email", "website"],
  deals: ["stage", "description", "value", "currency", "contactId"],
  activities: ["description", "relatedId", "dueDate"],
  projects: ["description", "progress", "dueDate", "clientVisible"],
  milestones: ["description", "projectId", "dueDate", "clientVisible"],
  tasks: ["description", "projectId", "assignee", "priority", "dueDate", "clientVisible"],
  updates: ["description", "projectId", "clientVisible"],
  proposals: ["summary", "email", "currency", "taxPercent", "clientVisible"],
  templates: ["summary", "body"],
  invoices: ["email", "currency", "taxPercent", "dueDate", "clientVisible"],
  receipts: ["invoiceId", "reference", "description"],
  drafts: ["body", "channel", "scheduledFor"],
  campaigns: ["description", "spend", "clicks", "leads", "date"],
  workflows: ["event", "description"],
  notifications: ["description"],
};
const longFields = new Set([
  "body",
  "summary",
  "description",
  "answer",
  "quote",
  "message",
  "challenge",
  "approach",
  "outcomes",
  "services",
]);
const numberFields = new Set([
  "value",
  "progress",
  "taxPercent",
  "spend",
  "clicks",
  "leads",
  "order",
]);
function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const before = document.activeElement as HTMLElement;
    const el = ref.current!;
    el.querySelector<HTMLElement>("button,input")?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const nodes = Array.from(
          el.querySelectorAll<HTMLElement>("button:not(:disabled),a[href],input,textarea,select"),
        );
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("keydown", key);
      before?.focus();
    };
  }, [onClose]);
  return (
    <div className="modal-backdrop">
      <div ref={ref} className="detail-modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-heading">
          <h2>{title}</h2>
          <button className="icon-button" aria-label="Close" onClick={onClose}>
            <X />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
function CompanySelect({
  value,
  onChange,
  required = false,
}: {
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  const [companies, setCompanies] = useState<RecordItem[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    api("/crm/records?kind=companies&limit=100")
      .then((d) => setCompanies(d.items))
      .catch((e) => setError(e.message));
  }, []);
  return (
    <label>
      Client company
      <select value={value} required={required} onChange={(e) => onChange(e.target.value)}>
        <option value="">Choose a company</option>
        {companies.map((c) => (
          <option key={c.id} value={c.id}>
            {c.title}
          </option>
        ))}
      </select>
      {error && <span>{error}</span>}
      {!error && !companies.length && <span>Add a company in CRM first.</span>}
    </label>
  );
}
export function Editor({
  module,
  kind,
  item,
  onClose,
  onSaved,
}: {
  module: string;
  kind: string;
  item: RecordItem | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(item?.title || "");
  const [slug, setSlug] = useState(item?.slug || "");
  const [tenant, setTenant] = useState(item?.tenant_id || "");
  const [status, setStatus] = useState(item?.status || "draft");
  const [data, setData] = useState<Record<string, any>>({
    ...(["invoices", "proposals"].includes(kind)
      ? { currency: "PKR", taxPercent: 0, clientVisible: true }
      : {}),
    ...item?.data,
  });
  const [lines, setLines] = useState<
    { description: string; quantity: number; unitPrice: number }[]
  >(item?.data.lines || [{ description: "", quantity: 1, unitPrice: 0 }]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const update = (k: string, v: any) => setData((d) => ({ ...d, [k]: v }));
  const invoiced = ["invoices", "proposals"].includes(kind);
  return (
    <Modal title={(item ? "Edit " : "New ") + titleCase(kind)} onClose={onClose}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          try {
            await api(`/${module}/records${item ? "/" + item.id : ""}`, {
              method: item ? "PUT" : "POST",
              body: JSON.stringify({
                kind,
                title,
                slug:
                  module === "cms"
                    ? slug ||
                      title
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-|-$/g, "")
                    : null,
                tenantId: tenant || null,
                status,
                data: { ...data, ...(invoiced ? { lines } : {}) },
                ...(item ? { version: item.version } : {}),
              }),
            });
            onSaved();
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <label>
          Title
          <input
            required
            value={title}
            maxLength={300}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        {module === "cms" && (
          <>
            <label>
              URL slug
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="Generated from title"
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
              />
            </label>
            <label>
              Display order
              <input
                type="number"
                value={data.order || 0}
                onChange={(e) => update("order", Number(e.target.value))}
              />
            </label>
          </>
        )}
        {["project", "proposal", "billing", "file"].includes(module) && (
          <CompanySelect value={tenant} onChange={setTenant} required={invoiced} />
        )}
        {!["cms", "proposal", "billing"].includes(module) && (
          <label>
            Status
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {Array.from(
                new Set([
                  status,
                  "draft",
                  "new",
                  "open",
                  "active",
                  "qualified",
                  "won",
                  "lost",
                  "complete",
                  "disabled",
                ]),
              ).map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
        )}
        {(fields[kind] || ["description"]).map((k) =>
          ["clientVisible", "demo"].includes(k) ? (
            <label className="check-field" key={k}>
              <input
                type="checkbox"
                checked={!!data[k]}
                onChange={(e) => update(k, e.target.checked)}
              />
              {titleCase(k.replace(/([A-Z])/g, " $1"))}
            </label>
          ) : (
            <label key={k}>
              {titleCase(k.replace(/([A-Z])/g, " $1"))}
              {longFields.has(k) ? (
                <textarea
                  rows={k === "body" ? 8 : 4}
                  value={Array.isArray(data[k]) ? data[k].join("\n") : data[k] || ""}
                  onChange={(e) =>
                    update(k, k === "services" ? e.target.value.split("\n") : e.target.value)
                  }
                />
              ) : (
                <input
                  type={
                    numberFields.has(k)
                      ? "number"
                      : k === "email"
                        ? "email"
                        : k === "scheduledFor"
                          ? "datetime-local"
                          : k === "dueDate" || k === "date"
                            ? "date"
                            : "text"
                  }
                  min={numberFields.has(k) ? 0 : undefined}
                  step={numberFields.has(k) ? "any" : undefined}
                  value={data[k] ?? ""}
                  onChange={(e) =>
                    update(k, numberFields.has(k) ? Number(e.target.value) : e.target.value)
                  }
                />
              )}
            </label>
          ),
        )}
        {kind === "page" && (
          <PageSections value={data.sections || []} onChange={(v) => update("sections", v)} />
        )}{" "}
        {invoiced && (
          <fieldset>
            <legend>Line items</legend>
            {lines.map((l, i) => (
              <div className="invoice-line" key={i}>
                <input
                  aria-label={`Item ${i + 1}`}
                  required
                  placeholder="Description"
                  value={l.description}
                  onChange={(e) =>
                    setLines((a) =>
                      a.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)),
                    )
                  }
                />
                <input
                  aria-label={`Quantity ${i + 1}`}
                  type="number"
                  required
                  min={1}
                  step={1}
                  value={l.quantity}
                  onChange={(e) =>
                    setLines((a) =>
                      a.map((x, j) => (j === i ? { ...x, quantity: Number(e.target.value) } : x)),
                    )
                  }
                />
                <input
                  aria-label={`Unit price ${i + 1}`}
                  type="number"
                  required
                  min={0}
                  step=".01"
                  value={l.unitPrice}
                  onChange={(e) =>
                    setLines((a) =>
                      a.map((x, j) => (j === i ? { ...x, unitPrice: Number(e.target.value) } : x)),
                    )
                  }
                />
                <button
                  type="button"
                  aria-label="Remove line"
                  disabled={lines.length === 1}
                  onClick={() => setLines((a) => a.filter((_, j) => i !== j))}
                >
                  <X size={15} />
                </button>
              </div>
            ))}
            <button
              type="button"
              className="button"
              onClick={() =>
                setLines((a) => [...a, { description: "", quantity: 1, unitPrice: 0 }])
              }
            >
              <Plus size={15} />
              Add item
            </button>
          </fieldset>
        )}
        {error && (
          <p role="alert" className="notice error">
            {error}
          </p>
        )}
        <div className="modal-actions">
          <button type="button" className="button" onClick={onClose}>
            Cancel
          </button>
          <button className="button gold" disabled={busy}>
            {busy ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
export function Detail({
  item,
  module,
  user,
  onClose,
  onEdit,
  onAction,
  onReload,
}: {
  item: RecordItem;
  module: string;
  user: User;
  onClose: () => void;
  onEdit: () => void;
  onAction: (a: string) => void;
  onReload: () => void;
}) {
  const [error, setError] = useState("");
  const [revisions, setRevisions] = useState<any[]>([]);
  const [bank, setBank] = useState("");
  useEffect(() => {
    if (module === "billing")
      api("/billing/payment-instructions")
        .then((r) => setBank(r.bankTransfer))
        .catch((e) => setError(e.message));
  }, [module]);
  const act = (label: string, action: string) => (
    <button className="button" onClick={() => onAction(action)}>
      {label}
    </button>
  );
  const money = (n: number) =>
    new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: item.data.currency || "PKR",
    }).format(n);
  return (
    <Modal title={item.title} onClose={onClose}>
      <div className="detail-meta">
        <span className={"status " + item.status}>{item.status}</span>
        <span>Version {item.version}</span>
      </div>
      {Object.entries(item.data)
        .filter(([k]) => !["passwordHash", "key", "lines", "total", "subtotal", "tax"].includes(k))
        .map(([k, v]) => (
          <div className="detail-field" key={k}>
            <span>{titleCase(k.replace(/([A-Z])/g, " $1"))}</span>
            <p>
              {Array.isArray(v)
                ? v.join("\n")
                : typeof v === "object"
                  ? JSON.stringify(v)
                  : String(v)}
            </p>
          </div>
        ))}
      {item.data.lines && (
        <table className="invoice-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Unit price</th>
            </tr>
          </thead>
          <tbody>
            {item.data.lines.map((l: any, i: number) => (
              <tr key={i}>
                <td>{l.description}</td>
                <td>{l.quantity}</td>
                <td>{money(l.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {item.data.total !== undefined && (
        <h3 className="invoice-total">Total {money(item.data.total / 100)}</h3>
      )}
      {bank && <div className="notice">{bank}</div>}
      {error && (
        <p className="notice error" role="alert">
          {error}
        </p>
      )}
      <div className="modal-actions wrap">
        {!portal &&
          !["auth", "audit", "analytics", "file"].includes(module) &&
          !["accepted", "paid", "sent", "approved", "posted"].includes(item.status) && (
            <button className="button" onClick={onEdit}>
              Edit
            </button>
          )}
        {module === "cms" && (
          <>
            {user.role === "admin" &&
              act(
                item.status === "published" ? "Unpublish" : "Publish",
                item.status === "published" ? "unpublish" : "publish",
              )}
            <a className="button" target="_blank" rel="noreferrer" href={"/preview/" + item.id}>
              Preview
            </a>
            <button
              className="button"
              onClick={() =>
                void api(`/cms/records/${item.id}/revisions`)
                  .then((d) => setRevisions(d.items))
                  .catch((e) => setError(e.message))
              }
            >
              Revisions
            </button>
          </>
        )}
        {module === "proposal" && item.kind === "proposals" && (
          <>
            {!portal && item.status === "draft" && act("Send proposal", "send")}
            {["client", "admin"].includes(user.role) && item.status === "sent" && (
              <>
                {act("Accept proposal", "accept")}
                {act("Decline", "reject")}
              </>
            )}
          </>
        )}
        {module === "billing" && item.kind === "invoices" && (
          <>
            {!portal && item.status === "draft" && act("Send invoice", "send")}
            {["sent", "overdue"].includes(item.status) && (
              <>
                <button
                  className="button gold"
                  onClick={() =>
                    void api(`/billing/invoices/${item.id}/checkout`, { method: "POST" })
                      .then((r) => {
                        if (r.url) location.assign(r.url);
                      })
                      .catch((e) => setError(e.message))
                  }
                >
                  Pay online
                </button>
                {user.role === "admin" && act("Verify bank payment", "mark-paid")}
              </>
            )}
          </>
        )}
        {module === "notification" && item.kind === "deliveries" && item.status === "pending" && (
          <button
            className="button"
            onClick={() =>
              void api(`/notification/deliveries/${item.id}/retry`, { method: "POST" })
                .then(onReload)
                .catch((e) => setError(e.message))
            }
          >
            Retry delivery
          </button>
        )}
        {module === "file" && (
          <button
            className="button"
            onClick={() =>
              void api(`/file/files/${item.id}/download`)
                .then((r) => location.assign(r.url))
                .catch((e) => setError(e.message))
            }
          >
            Download file
          </button>
        )}
        {module === "project" &&
          item.kind === "milestones" &&
          ["client", "admin"].includes(user.role) &&
          item.status !== "approved" &&
          act("Approve milestone", "approve")}
        {module === "marketing" &&
          item.status === "draft" &&
          user.role === "admin" &&
          act("Approve content", "approve")}
        {module === "marketing" &&
          item.status === "approved" &&
          act("Mark as posted", "mark-posted")}
        {["billing", "proposal"].includes(module) && (
          <button className="button" onClick={() => window.print()}>
            <Printer size={15} />
            Print / save PDF
          </button>
        )}
      </div>
      {revisions.length > 0 && (
        <div className="revision-list">
          <h3>Previous versions</h3>
          {revisions.map((r) => (
            <div key={r.id}>
              Version {r.version} · {new Date(r.created_at).toLocaleString()}
              {user.role === "admin" && (
                <button
                  onClick={() =>
                    void api(`/cms/records/${item.id}/restore`, {
                      method: "POST",
                      body: JSON.stringify({ revision: r.version, version: item.version }),
                    })
                      .then(onReload)
                      .catch((e) => setError(e.message))
                  }
                >
                  Restore as draft
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
export function Invite({ onDone }: { onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState("client");
  const [tenant, setTenant] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div className="invite-area">
      <button className="button" onClick={() => setOpen(!open)}>
        <Plus size={15} />
        Invite someone
      </button>
      {open && (
        <form
          className="inline-form"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            try {
              await api("/auth/invite", {
                method: "POST",
                body: JSON.stringify({
                  ...Object.fromEntries(new FormData(e.currentTarget)),
                  role,
                  ...(tenant ? { tenantId: tenant } : {}),
                }),
              });
              setOpen(false);
              onDone();
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <label>
            Name
            <input name="name" required />
          </label>
          <label>
            Email
            <input name="email" type="email" required />
          </label>
          <label>
            Role
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="client">Client</option>
              <option value="team">Team</option>
              <option value="admin">Administrator</option>
            </select>
          </label>
          {role === "client" && <CompanySelect value={tenant} onChange={setTenant} required />}
          {error && <p className="notice error">{error}</p>}
          <button className="button gold" disabled={busy}>
            Send invitation
          </button>
        </form>
      )}
    </div>
  );
}
export function FileUpload({ user, onDone }: { user: User; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [tenant, setTenant] = useState(user.tenantId || "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <>
      <button className="button gold" onClick={() => setOpen(true)}>
        <Upload size={15} />
        Upload file
      </button>
      {open && (
        <Modal title="Share a file" onClose={() => setOpen(false)}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError("");
              try {
                const form = new FormData(e.currentTarget);
                const file = form.get("file") as File;
                if (file.size > 20 * 1024 * 1024)
                  throw new Error("Choose a file smaller than 20 MB.");
                const r = await api("/file/upload-url", {
                  method: "POST",
                  body: JSON.stringify({
                    name: file.name,
                    contentType: file.type || "application/zip",
                    size: file.size,
                    tenantId: tenant || undefined,
                    clientVisible: true,
                  }),
                });
                const uploaded = await fetch(r.url, {
                  method: "PUT",
                  headers: { "Content-Type": file.type || "application/zip" },
                  body: file,
                });
                if (!uploaded.ok) throw new Error("Upload failed. Please try again.");
                await api(`/file/files/${r.id}/confirm`, { method: "POST" });
                setOpen(false);
                onDone();
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            {user.role !== "client" && (
              <CompanySelect value={tenant} onChange={setTenant} required />
            )}
            <label>
              File (up to 20 MB)
              <input
                name="file"
                type="file"
                required
                accept=".pdf,.txt,.jpg,.jpeg,.png,.webp,.zip"
              />
            </label>
            {error && <p className="notice error">{error}</p>}
            <button className="button gold" disabled={busy}>
              {busy ? "Uploading…" : "Upload and share"}
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}

function PageSections({
  value,
  onChange,
}: {
  value: { title: string; body: string }[];
  onChange: (v: { title: string; body: string }[]) => void;
}) {
  return (
    <fieldset>
      <legend>Page sections</legend>
      <p>Sections appear in this order beneath the page’s main content.</p>
      {value.map((s, i) => (
        <div className="inline-form" key={i}>
          <label>
            Section heading
            <input
              value={s.title}
              onChange={(e) =>
                onChange(value.map((v, j) => (i === j ? { ...v, title: e.target.value } : v)))
              }
            />
          </label>
          <label>
            Section content
            <textarea
              rows={4}
              value={s.body}
              onChange={(e) =>
                onChange(value.map((v, j) => (i === j ? { ...v, body: e.target.value } : v)))
              }
            />
          </label>
          <button
            type="button"
            className="button"
            disabled={i === 0}
            onClick={() => {
              const next = [...value];
              [next[i - 1], next[i]] = [next[i]!, next[i - 1]!];
              onChange(next);
            }}
          >
            Move up
          </button>
          <button
            type="button"
            className="button"
            onClick={() => onChange(value.filter((_, j) => i !== j))}
          >
            Remove section
          </button>
        </div>
      ))}
      <button
        type="button"
        className="button"
        onClick={() => onChange([...value, { title: "", body: "" }])}
      >
        Add section
      </button>
    </fieldset>
  );
}
