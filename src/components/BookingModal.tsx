import { useState, useId } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Calendar as CalendarIcon,
  Clock,
  Globe,
  CheckCircle2,
  X,
  ArrowRight,
  Shield,
  Sparkles,
} from "lucide-react";
import { SERVICE_CATEGORIES } from "@/data/servicesData";
import { submitBooking } from "@/lib/leadCapture";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedCategory?: string;
}

const AVAILABLE_SLOTS = [
  "09:30 AM",
  "11:00 AM",
  "01:30 PM",
  "03:00 PM",
  "04:30 PM",
];

export function BookingModal({ isOpen, onClose, preselectedCategory }: BookingModalProps) {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2); // Default to 2 days ahead
    return d.toISOString().split("T")[0] ?? "";
  });
  const [selectedSlot, setSelectedSlot] = useState<string>(AVAILABLE_SLOTS[1] ?? "11:00 AM");
  const [category, setCategory] = useState<string>(
    preselectedCategory || (SERVICE_CATEGORIES[0]?.title ?? "Technology & Software Development")
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [consent, setConsent] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const timezone = typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC";

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      setErrorMsg("Please accept the privacy policy to proceed.");
      return;
    }
    setErrorMsg("");
    setIsSubmitting(true);

    const res = await submitBooking({
      name,
      email,
      serviceCategory: category,
      date: selectedDate,
      timeSlot: selectedSlot,
      timezone,
      notes,
      consentGiven: consent,
    });

    setIsSubmitting(false);
    if (res.success) {
      setConfirmed(true);
    } else {
      setErrorMsg(res.error || "Failed to schedule booking.");
    }
  };

  const resetAndClose = () => {
    setConfirmed(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-amber-500/20 bg-[#080B14] p-6 shadow-2xl text-slate-100"
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
                  <Sparkles size={14} />
                  <span>Discovery Consultation</span>
                </div>
                <h3 className="text-xl font-semibold text-white mt-1">Book a 30-min Strategy Call</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Direct conversation with a FangScript technical lead. Zero sales pressure.
                </p>
              </div>
              <button
                onClick={resetAndClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {confirmed ? (
              <div className="py-10 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-4">
                  <CheckCircle2 size={36} />
                </div>
                <h4 className="text-2xl font-bold text-white">Call Confirmed!</h4>
                <p className="text-sm text-slate-300 max-w-md mx-auto mt-2">
                  We've reserved <strong>{selectedSlot}</strong> on <strong>{selectedDate}</strong> ({timezone}).
                  A calendar invite and meeting link have been prepared for <strong>{email}</strong>.
                </p>
                <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10 max-w-sm mx-auto text-left text-xs text-slate-300">
                  <div className="flex items-center gap-2 text-amber-400 mb-1 font-medium">
                    <Shield size={14} /> What happens next:
                  </div>
                  <p>Our team will review your project requirements and prepare relevant architecture references before we talk.</p>
                </div>
                <button
                  onClick={resetAndClose}
                  className="mt-6 px-6 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-semibold text-sm hover:bg-amber-300 transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleBooking} className="mt-4 space-y-4">
                {/* Date & Slot Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <CalendarIcon size={14} className="text-amber-400" />
                      Select Date
                    </label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split("T")[0]}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Clock size={14} className="text-amber-400" />
                      Time Slot ({timezone.split("/")[1] || timezone})
                    </label>
                    <select
                      value={selectedSlot}
                      onChange={(e) => setSelectedSlot(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#0f1422] px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"
                    >
                      {AVAILABLE_SLOTS.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Capability Selection */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Primary Area of Interest
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0f1422] px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"
                  >
                    {SERVICE_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.title}>
                        {cat.title} ({cat.badge})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Name & Email Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Alex Morgan"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Work Email</label>
                    <input
                      type="email"
                      required
                      placeholder="alex@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Brief notes */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Project Context or Specific Questions (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Briefly describe what you're looking to build or solve..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none resize-none"
                  />
                </div>

                {/* Privacy & Consent */}
                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="booking-consent"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 rounded border-white/20 bg-white/5 text-amber-400 focus:ring-0"
                  />
                  <label htmlFor="booking-consent" className="text-xs text-slate-400 cursor-pointer">
                    I agree to FangScript processing my contact details to arrange this consultation in accordance with the{" "}
                    <a href="/privacy" className="text-amber-400 hover:underline" target="_blank" rel="noreferrer">
                      Privacy Policy
                    </a>.
                  </label>
                </div>

                {errorMsg && <p className="text-xs text-rose-400">{errorMsg}</p>}

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={resetAndClose}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-semibold hover:bg-amber-300 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? "Scheduling..." : "Confirm Discovery Call"}
                    <ArrowRight size={14} />
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
