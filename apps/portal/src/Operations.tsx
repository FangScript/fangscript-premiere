import { useEffect, useState } from "react";
import { api, type RecordItem } from "./Workspace";
export function MarketingCalendar({ onSelect }: { onSelect: (r: RecordItem) => void }) {
  const [month, setMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [items, setItems] = useState<RecordItem[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    const from = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-01`;
    const until = `${month.getMonth() === 11 ? month.getFullYear() + 1 : month.getFullYear()}-${String(((month.getMonth() + 1) % 12) + 1).padStart(2, "0")}-01`;
    api(`/marketing/calendar?from=${from}&until=${until}`)
      .then((r) => {
        if (active) setItems(r.items);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [month]);
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  return (
    <section className="operations-panel">
      <div className="panel-heading">
        <h2>{month.toLocaleDateString("en", { month: "long", year: "numeric" })}</h2>
        <div>
          <button
            className="button"
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
          >
            Previous month
          </button>
          <button
            className="button"
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
          >
            Next month
          </button>
        </div>
      </div>
      {error && (
        <p role="alert" className="notice error">
          {error}
        </p>
      )}
      <div className="marketing-calendar">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <strong key={d}>{d}</strong>
        ))}
        {Array.from({ length: month.getDay() }, (_, i) => (
          <div key={"blank" + i} />
        ))}
        {Array.from({ length: days }, (_, i) => {
          const day = i + 1;
          return (
            <div className="calendar-day" key={day}>
              <span>{day}</span>
              {items
                .filter((r) => new Date(r.data.scheduledFor).getDate() === day)
                .map((r) => (
                  <button key={r.id} onClick={() => onSelect(r)}>
                    <span className={"status " + r.status}>{r.status}</span>
                    {r.title}
                  </button>
                ))}
            </div>
          );
        })}
      </div>
      <p>
        Scheduling records your plan. Publishing to external channels requires a connected, approved
        workflow.
      </p>
    </section>
  );
}
export function FunnelReport() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    api("/analytics/funnel")
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);
  const stages = [
    ["lead.leads.created.v1", "Enquiries"],
    ["proposal.sent.v1", "Proposals sent"],
    ["proposal.accepted.v1", "Proposals accepted"],
    ["billing.invoice.paid.v1", "Invoices paid"],
  ];
  return (
    <section className="operations-panel">
      <h2>From first conversation to delivery.</h2>
      <p>
        All-time recorded activity. Stage counts represent events, not a matched customer cohort.
      </p>
      {error && (
        <p role="alert" className="notice error">
          {error}
        </p>
      )}
      <div className="metric-grid">
        {stages.map(([event, label]) => (
          <div className="metric-card" key={event}>
            <span>{label}</span>
            <strong>{data?.counts?.[event] ?? "—"}</strong>
          </div>
        ))}
      </div>
      <h3>Verified revenue</h3>
      <div className="metric-grid">
        {data?.revenue.map((r: any) => (
          <div className="metric-card" key={r.currency}>
            <span>{r.currency}</span>
            <strong>
              {new Intl.NumberFormat("en", { style: "currency", currency: r.currency }).format(
                Number(r.amountMinor) / 100,
              )}
            </strong>
          </div>
        ))}
      </div>
      {data && !data.revenue.length && <p>Revenue appears after a verified invoice payment.</p>}
    </section>
  );
}
