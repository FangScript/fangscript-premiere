/**
 * Lead Capture and Event Envelope utilities
 * Conforming to FangScript Architecture Section 4.2 & SRS FR-LEAD-01, FR-LEAD-02, FR-LEAD-03
 */

export interface LeadSubmission {
  name: string;
  email: string;
  company?: string;
  serviceCategory?: string;
  budget?: string;
  message: string;
  consentGiven: boolean;
  honeypot?: string;
}

export interface StoredLead {
  id: string;
  name: string;
  email: string;
  company: string;
  serviceCategory: string;
  budget: string;
  message: string;
  consent: {
    given: boolean;
    timestamp: string;
  };
  utm: {
    source: string;
    medium: string;
    campaign: string;
    term: string;
    content: string;
    referrer: string;
    pagePath: string;
  };
  score: "new" | "qualified" | "disqualified" | "converted";
  createdAt: string;
}

export interface EventEnvelope<T = unknown> {
  id: string;
  type: string;
  occurred_at: string;
  source: string;
  correlation_id: string;
  actor: {
    kind: "user" | "agent" | "system" | "api_key";
    id: string;
  };
  tenant_id: string | null;
  data: T;
}

export interface BookingSubmission {
  name: string;
  email: string;
  company?: string;
  serviceCategory: string;
  date: string;
  timeSlot: string;
  timezone: string;
  notes?: string;
  consentGiven: boolean;
}

function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function extractUtmParameters(): StoredLead["utm"] {
  if (typeof window === "undefined") {
    return {
      source: "direct",
      medium: "none",
      campaign: "none",
      term: "",
      content: "",
      referrer: "",
      pagePath: "/",
    };
  }

  const params = new URLSearchParams(window.location.search);
  return {
    source: params.get("utm_source") || (document.referrer ? new URL(document.referrer, window.location.origin).hostname : "direct"),
    medium: params.get("utm_medium") || (params.get("utm_source") ? "cpc" : "organic"),
    campaign: params.get("utm_campaign") || "direct_brand",
    term: params.get("utm_term") || "",
    content: params.get("utm_content") || "",
    referrer: document.referrer || "",
    pagePath: window.location.pathname,
  };
}

export function calculateInitialLeadScore(lead: Partial<LeadSubmission>): "new" | "qualified" {
  if (lead.budget && (lead.budget.includes("15,000") || lead.budget.includes("30,000+"))) {
    return "qualified";
  }
  if (lead.company && lead.email && !lead.email.endsWith("@gmail.com") && !lead.email.endsWith("@yahoo.com")) {
    return "qualified";
  }
  return "new";
}

export async function submitLead(submission: LeadSubmission): Promise<{ success: boolean; leadId?: string; error?: string }> {
  // Honeypot spam protection (FR-LEAD-02)
  if (submission.honeypot && submission.honeypot.trim().length > 0) {
    console.warn("[Anti-Spam] Bot submission detected via honeypot field. Suppressing lead intake.");
    return { success: true, leadId: generateUUID() }; // Silently reject
  }

  if (!submission.consentGiven) {
    return { success: false, error: "Explicit consent is required to process your inquiry." };
  }

  if (!submission.email || !submission.name) {
    return { success: false, error: "Name and email are required." };
  }

  const leadId = generateUUID();
  const consentTimestamp = new Date().toISOString();
  const utm = extractUtmParameters();
  const score = calculateInitialLeadScore(submission);

  const storedLead: StoredLead = {
    id: leadId,
    name: submission.name.trim(),
    email: submission.email.trim(),
    company: submission.company?.trim() || "Unspecified",
    serviceCategory: submission.serviceCategory || "General Inquiry",
    budget: submission.budget || "Not Specified",
    message: submission.message.trim(),
    consent: {
      given: true,
      timestamp: consentTimestamp,
    },
    utm,
    score,
    createdAt: consentTimestamp,
  };

  // Construct standard Event Envelope (Architecture Section 4.2)
  const eventPayload: EventEnvelope<StoredLead> = {
    id: generateUUID(),
    type: "lead.created.v1",
    occurred_at: consentTimestamp,
    source: "web-public",
    correlation_id: generateUUID(),
    actor: {
      kind: "user",
      id: leadId,
    },
    tenant_id: null,
    data: storedLead,
  };

  try {
    if (typeof window !== "undefined") {
      const existingLeads: StoredLead[] = JSON.parse(localStorage.getItem("fangscript_leads") || "[]");
      existingLeads.unshift(storedLead);
      localStorage.setItem("fangscript_leads", JSON.stringify(existingLeads.slice(0, 50)));

      const existingEvents: EventEnvelope[] = JSON.parse(localStorage.getItem("fangscript_events") || "[]");
      existingEvents.unshift(eventPayload);
      localStorage.setItem("fangscript_events", JSON.stringify(existingEvents.slice(0, 100)));
    }
  } catch (e) {
    console.error("Local storage sync error:", e);
  }

  // Attempt async post to backend gateway if available
  try {
    fetch("/api/v1/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventPayload),
    }).catch(() => {
      // In local frontend dev without backend running, silently handled
    });
  } catch {
    // ignore
  }

  return { success: true, leadId };
}

export async function submitBooking(booking: BookingSubmission): Promise<{ success: boolean; bookingId?: string; error?: string }> {
  if (!booking.consentGiven) {
    return { success: false, error: "Please agree to our privacy policy to confirm your discovery call." };
  }

  const bookingId = generateUUID();
  const occurredAt = new Date().toISOString();
  const utm = extractUtmParameters();

  const eventPayload: EventEnvelope<{
    bookingId: string;
    booking: BookingSubmission;
    utm: StoredLead["utm"];
  }> = {
    id: generateUUID(),
    type: "booking.scheduled.v1",
    occurred_at: occurredAt,
    source: "web-public",
    correlation_id: generateUUID(),
    actor: {
      kind: "user",
      id: bookingId,
    },
    tenant_id: null,
    data: {
      bookingId,
      booking,
      utm,
    },
  };

  try {
    if (typeof window !== "undefined") {
      const existingBookings = JSON.parse(localStorage.getItem("fangscript_bookings") || "[]");
      existingBookings.unshift({ bookingId, ...booking, utm, createdAt: occurredAt });
      localStorage.setItem("fangscript_bookings", JSON.stringify(existingBookings.slice(0, 50)));

      const existingEvents: EventEnvelope[] = JSON.parse(localStorage.getItem("fangscript_events") || "[]");
      existingEvents.unshift(eventPayload);
      localStorage.setItem("fangscript_events", JSON.stringify(existingEvents.slice(0, 100)));
    }
  } catch (e) {
    console.error("Local storage sync error:", e);
  }

  return { success: true, bookingId };
}
