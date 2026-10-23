import { useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import { ArrowUpRight, ArrowRight, Menu, X, Github, Linkedin } from "lucide-react";
import { contentItems, useContent } from "./api";
import { ChatWidget } from "../chat/ChatWidget";
export function Brand() {
  return (
    <a href="/" className="brand" aria-label="FangScript Lab home">
      <span className="brand-symbol">
        <i />
        <i />
        <i />
      </span>
      <span>
        FangScript<span className="brand-lab"> Lab</span>
      </span>
    </a>
  );
}
export function Button({
  href,
  children,
  secondary = false,
}: {
  href: string;
  children: ReactNode;
  secondary?: boolean;
}) {
  return (
    <a className={secondary ? "clay-button secondary" : "clay-button"} href={href}>
      {children}
      <ArrowUpRight size={17} />
    </a>
  );
}
export function SiteLayout({ children }: { children: ReactNode }) {
  const [menu, setMenu] = useState(false);
  const { data } = useContent();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const items = contentItems(data);
  const page = items.find(
    (i) =>
      i.kind === "page" &&
      i.slug === (pathname === "/" ? "home" : pathname.split("/").filter(Boolean).at(-1)),
  );
  const sections = Array.isArray(page?.data["sections"]) ? page.data["sections"] : [];
  const settings = items.find((i) => i.kind === "settings")?.data;
  const handleInternalNavigation = (event: MouseEvent<HTMLDivElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = (event.target as HTMLElement).closest<HTMLAnchorElement>("a[href]");
    if (!target || target.target === "_blank" || target.hasAttribute("download")) return;
    const href = target.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
    const url = new URL(href, window.location.origin);
    if (url.origin !== window.location.origin) return;
    // These are independently mounted applications, outside the public router.
    if (/^\/(admin|portal)(\/|$)/.test(url.pathname)) return;
    event.preventDefault();
    setMenu(false);
    void navigate({ to: url.pathname + url.search + url.hash });
  };
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  return (
    <div className="lab-site" onClick={handleInternalNavigation}>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="lab-header">
        <div className="container header-inner">
          <Brand />
          <nav aria-label="Main navigation" className={menu ? "main-nav is-open" : "main-nav"}>
            {[
              ["Services", "/services"],
              ["Work", "/work"],
              ["About", "/about"],
              ["Insights", "/insights"],
            ].map(([label, url]) => (
              <a href={url} key={url} onClick={() => setMenu(false)}>
                {label}
              </a>
            ))}
          </nav>
          <a className="header-cta" href="/book">
            Book a discovery call <ArrowUpRight size={15} />
          </a>
          <button
            className="mobile-toggle"
            aria-label={menu ? "Close navigation" : "Open navigation"}
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <main id="main">
        {children}
        {sections.map((section: any, index: number) => (
          <section key={index} className="container section article-body">
            <h2>{section.title}</h2>
            <p style={{ whiteSpace: "pre-wrap" }}>{section.body}</p>
          </section>
        ))}
      </main>
      <footer className="lab-footer container">
        <div className="footer-top">
          <div>
            <Brand />
            <p>One team. A world of possibilities.</p>
          </div>
          <div className="footer-links">
            <a href="/services">Services</a>
            <a href="/work">Our work</a>
            <a href="/contact">Start a project</a>
            <a href="/portal">Client portal</a>
            <a href="/faq">FAQs</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} FangScript Lab</span>
          <span className="footer-tagline">Build. Automate. Grow.</span>
          <div>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
            {settings?.["linkedin"] && (
              <a href={settings["linkedin"]} rel="noopener noreferrer" aria-label="LinkedIn">
                <Linkedin size={16} />
              </a>
            )}
            {settings?.["github"] && (
              <a href={settings["github"]} rel="noopener noreferrer" aria-label="GitHub">
                <Github size={16} />
              </a>
            )}
          </div>
        </div>
      </footer>
      <ChatWidget />
    </div>
  );
}
export function CTA() {
  return (
    <section className="container cta-section">
      <div className="cta-clay">
        <div>
          <span className="eyebrow">THE NEXT CHAPTER STARTS HERE</span>
          <h2>
            What will we
            <br />
            <em>build together?</em>
          </h2>
          <p>A new idea. A better workflow. Your next stage of growth.</p>
          <Button href="/book">Book a discovery call</Button>
        </div>
        <div className="cta-orb" aria-hidden="true">
          <span />
          <i />
          <b />
        </div>
      </div>
    </section>
  );
}
export function PageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="page-heading container">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
  );
}
export { ArrowRight, ArrowUpRight };
