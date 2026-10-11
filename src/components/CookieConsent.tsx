import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Cookie, Shield, Check, X, Settings2 } from "lucide-react";

interface CookiePreferences {
  essential: boolean; // Always true
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const saved = localStorage.getItem("fangscript_cookie_consent");
      if (!saved) {
        // Slight delay so it doesn't jarringly block the initial render
        timer = setTimeout(() => setShowBanner(true), 1200);
      }
    } catch {
      // ignore
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    try {
      localStorage.setItem("fangscript_cookie_consent", JSON.stringify(prefs));
    } catch {
      // ignore
    }
    setShowBanner(false);
    setShowSettings(false);
  };

  const handleAcceptAll = () => {
    savePreferences({
      essential: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    });
  };

  const handleEssentialOnly = () => {
    savePreferences({
      essential: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    });
  };

  const handleSaveCustom = () => {
    savePreferences({
      essential: true,
      analytics,
      marketing,
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 z-40 max-w-lg rounded-2xl border border-amber-500/20 bg-[#0A0D18]/95 p-5 shadow-2xl backdrop-blur-xl text-slate-200"
          role="dialog"
          aria-labelledby="cookie-heading"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
              <Cookie size={20} />
            </div>
            <div className="flex-1">
              <h4 id="cookie-heading" className="text-sm font-semibold text-white">
                Privacy & Cookie Consent
              </h4>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                We use essential cookies to keep our platform secure and operational. With your permission, we also use privacy-first analytics to measure site performance.
              </p>

              {showSettings && (
                <div className="mt-3 space-y-2 rounded-xl bg-black/40 p-3 border border-white/5 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-white">Strictly Necessary</span>
                      <p className="text-[11px] text-slate-500">Security, session auth, and routing</p>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Always active</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <div>
                      <span className="font-medium text-white">Telemetry & Analytics</span>
                      <p className="text-[11px] text-slate-500">Anonymous performance metrics & error logs</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={analytics}
                      onChange={(e) => setAnalytics(e.target.checked)}
                      className="rounded border-white/20 bg-white/5 text-amber-400 focus:ring-0"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <div>
                      <span className="font-medium text-white">Marketing & Attribution</span>
                      <p className="text-[11px] text-slate-500">Campaign source and UTM tracking</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={marketing}
                      onChange={(e) => setMarketing(e.target.checked)}
                      className="rounded border-white/20 bg-white/5 text-amber-400 focus:ring-0"
                    />
                  </div>
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {showSettings ? (
                  <button
                    onClick={handleSaveCustom}
                    className="rounded-lg bg-amber-400 px-3.5 py-1.5 text-xs font-semibold text-slate-950 hover:bg-amber-300 transition-colors"
                  >
                    Save Preferences
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleAcceptAll}
                      className="rounded-lg bg-amber-400 px-3.5 py-1.5 text-xs font-semibold text-slate-950 hover:bg-amber-300 transition-colors"
                    >
                      Accept All
                    </button>
                    <button
                      onClick={handleEssentialOnly}
                      className="rounded-lg bg-white/10 px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/15 hover:text-white transition-colors"
                    >
                      Essential Only
                    </button>
                    <button
                      onClick={() => setShowSettings(!showSettings)}
                      className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                    >
                      <Settings2 size={13} />
                      Customize
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
