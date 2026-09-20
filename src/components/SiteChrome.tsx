import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Github, Linkedin, Menu, X, Youtube } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

const links = [
  ["Home", "/"],
  ["Services", "/services"],
  ["Work", "/work"],
  ["About", "/about"],
  ["FAQ", "/faq"],
] as const;

export function Brand({ compact = false }: { compact?: boolean }) {
  return <Link to="/" className="brand-link" aria-label="FangScript home"><span className="brand-mark" aria-hidden="true"><i /><i /></span>{!compact && <span>FangScript</span>}</Link>;
}

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return <>
    <header className={`site-nav ${scrolled || pathname !== "/" ? "scrolled" : ""}`}>
      <div className="nav-inner"><Brand /><nav className="desktop-nav" aria-label="Primary navigation">{links.map(([label, to]) => <Link key={to} to={to} activeOptions={{ exact: to === "/" }} activeProps={{ className: "active" }}>{label}</Link>)}</nav><Link className="nav-cta" to="/contact">Let's Build Together <ArrowRight size={15} /></Link><button className="menu-button" aria-label="Open navigation" onClick={() => setMenuOpen(true)}><Menu /></button></div>
    </header>
    <AnimatePresence>{menuOpen && <motion.div className="mobile-menu" initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }}><div className="mobile-menu-head"><Brand /><button aria-label="Close navigation" onClick={() => setMenuOpen(false)}><X /></button></div><nav>{[...links, ["Start a project", "/contact"] as const].map(([label, to], i) => <motion.div key={to} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * .06 }}><Link to={to}>{label}<ArrowRight /></Link></motion.div>)}</nav></motion.div>}</AnimatePresence>
  </>;
}

export function SiteFooter() {
  return <footer className="site-footer"><div className="section-boundary footer-top"><div><Brand /><p>Crafted with passion <span>•</span> Built for your brand.</p></div><div className="footer-columns"><nav aria-label="Footer navigation">{links.map(([label, to]) => <Link key={to} to={to}>{label}</Link>)}</nav><div className="socials"><a href="https://github.com" aria-label="GitHub"><Github /></a><a href="https://linkedin.com" aria-label="LinkedIn"><Linkedin /></a><a href="https://x.com" aria-label="X"><X /></a><a href="https://youtube.com" aria-label="YouTube"><Youtube /></a></div></div></div><div className="section-boundary footer-bottom"><small>© 2026 FangScript. All rights reserved.</small><span>AI • WEBSITES • AUTOMATION</span></div></footer>;
}

export function SiteFrame({ children }: { children: ReactNode }) { return <div className="site-shell"><SiteHeader />{children}<SiteFooter /></div>; }

export function PageHero({ eyebrow, title, accent, copy }: { eyebrow: string; title: string; accent?: string; copy: string }) {
  return <section className="page-hero"><div className="page-hero-glow" /><div className="grain" /><motion.div className="section-boundary page-hero-inner" initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .75, ease: [0.16, 1, .3, 1] }}><div className="eyebrow"><i />{eyebrow}</div><h1>{title}{accent && <em>{accent}</em>}</h1><p>{copy}</p></motion.div></section>;
}

export function PageCta({ title = "Ready to build something useful?", copy = "Tell us where you want to go. We'll help shape the clearest path from idea to launch." }: { title?: string; copy?: string }) {
  return <section className="page-cta"><div className="section-boundary"><div><span>Start a conversation</span><h2>{title}</h2><p>{copy}</p></div><Link to="/contact" className="gold-button">Start a Project <ArrowRight /></Link></div></section>;
}
