import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useLocation } from "@tanstack/react-router";

// Original monoline lettering: crisp at any size, with no font download.
const letters = [
  [0, "M25 63 C42 38 87 36 110 43 M80 44 C64 77 62 120 43 151 M56 98 C72 87 92 84 109 88"],
  [
    92,
    "M54 100 C34 79 9 102 10 128 C11 151 35 149 49 119 L57 94 C49 112 43 144 54 145 C62 146 69 137 77 128",
  ],
  [154, "M9 142 L26 94 C21 112 20 121 20 126 C40 89 66 85 57 114 L49 135 C43 157 67 142 79 129"],
  [
    222,
    "M53 100 C32 79 7 107 12 132 C17 151 36 145 49 121 L57 94 C44 136 34 176 16 184 C-5 194 -4 167 24 156 L77 130",
  ],
  [307, "M88 57 C67 32 32 47 27 68 C19 91 79 93 73 118 C68 146 19 161 8 137 C3 126 14 118 23 121"],
  [392, "M56 98 C39 82 13 103 12 126 C11 155 40 149 68 128"],
  [447, "M6 142 L25 95 C22 110 23 115 31 111 C48 89 59 87 55 100 C53 111 42 119 65 128"],
  [503, "M22 96 L9 132 C2 153 22 146 39 128 M29 73 L30 71"],
  [536, "M7 178 L33 96 M23 126 C51 75 73 94 60 126 C51 151 27 154 25 136 C35 146 55 144 78 128"],
  [600, "M46 61 L17 129 C5 156 32 148 58 128 M9 98 C29 94 51 91 65 94"],
  [
    707,
    "M20 132 C56 98 82 48 63 43 C45 39 40 74 33 102 C25 135 13 147 8 143 C37 132 57 161 83 140",
  ],
  [
    786,
    "M54 100 C34 79 9 102 10 128 C11 151 35 149 49 119 L57 94 C49 112 43 144 54 145 C62 146 69 137 77 128",
  ],
  [
    849,
    "M8 134 C20 109 55 53 42 47 C25 40 14 99 9 130 C4 157 39 152 52 124 C67 91 38 90 19 126 C36 137 59 138 78 122",
  ],
] as const;

export function WelcomeIntro({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(pathname === "/");
  const [ready, setReady] = useState(false);
  const skip = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (pathname !== "/") { setVisible(false); return; }
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (preference.matches) {
      setVisible(false);
      return;
    }
    setReady(true);
    skip.current?.focus({ preventScroll: true });
    const timer = window.setTimeout(() => setVisible(false), 3600);
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape") setVisible(false);
    };
    const reduce = () => {
      if (preference.matches) setVisible(false);
    };
    window.addEventListener("keydown", dismiss);
    preference.addEventListener("change", reduce);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", dismiss);
      preference.removeEventListener("change", reduce);
    };
  }, [pathname]);
  useEffect(() => {
    if (!visible || !ready) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [visible, ready]);
  return (
    <>
      {visible && (
        <div
          className="welcome-intro"
          role="dialog"
          aria-modal={ready || undefined}
          aria-label="Welcome to FangScript Lab"
        >
          <div className="welcome-signature">
            <svg viewBox="0 0 960 230" role="img" aria-label="FangScript Lab" fill="none">
              <defs>
                <linearGradient
                  id="welcome-ink"
                  x1="0"
                  y1="0"
                  x2="960"
                  y2="230"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#f6e8c9" />
                  <stop offset=".5" stopColor="#dec18b" />
                  <stop offset="1" stopColor="#f7eee0" />
                </linearGradient>
              </defs>
              {letters.map(([x, d], index) => (
                <path
                  key={index}
                  d={d}
                  transform={`translate(${x} 0)`}
                  pathLength="1"
                  stroke="url(#welcome-ink)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="welcome-letter"
                  style={{ "--ink-delay": `${160 + index * 135}ms` } as CSSProperties}
                />
              ))}
            </svg>
            <p>Build. Automate. Grow.</p>
          </div>
          <button ref={skip} className="welcome-skip" onClick={() => setVisible(false)}>
            Enter the lab <span aria-hidden="true">↗</span>
          </button>
        </div>
      )}
      <noscript>
        <style>{".welcome-intro{display:none!important}"}</style>
      </noscript>
      <div inert={visible}>{children}</div>
    </>
  );
}
