import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Braces,
  Code2,
  Github,
  Globe2,
  Layers3,
  Linkedin,
  Menu,
  MessageSquare,
  MonitorSmartphone,
  Play,
  Quote,
  Sparkles,
  Workflow,
  X,
  Youtube,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import heroImage from "@/assets/fangscript-hero.jpg";
import ctaImage from "@/assets/fangscript-cta.jpg";
import mountainImage from "@/assets/fangscript-mountains.jpg";

type Category = "All" | "Websites" | "Web Apps" | "AI" | "Automation";
type Project = {
  name: string;
  category: Exclude<Category, "All">;
  tags: string[];
  description: string;
  visual: "beauty" | "dashboard" | "assistant" | "jewellery" | "support" | "workflow";
};

const projects: Project[] = [
  { name: "Beauty & Beyond", category: "Websites", tags: ["Branding", "Business Automation"], description: "A premium beauty brand experience with modern e-commerce and automation.", visual: "beauty" },
  { name: "Business Automation Dashboard", category: "Web Apps", tags: ["Analytics", "Workflow Automation"], description: "A centralized dashboard for managing business workflows and analytics.", visual: "dashboard" },
  { name: "FangScript AI Assistant", category: "AI", tags: ["AI Agent", "Chat", "Booking"], description: "An intelligent AI assistant designed for customer conversations and bookings.", visual: "assistant" },
  { name: "Al Noor Jewellers", category: "Websites", tags: ["Luxury", "E-commerce", "Brand Experience"], description: "A premium jewellery website designed around craftsmanship and luxury.", visual: "jewellery" },
  { name: "AI Customer Support Agent", category: "AI", tags: ["AI Agent", "Customer Support", "Automation"], description: "Always-on support that resolves questions and routes complex requests intelligently.", visual: "support" },
  { name: "Business Workflow Automation", category: "Automation", tags: ["n8n", "APIs", "Workflow Automation"], description: "Connected systems that remove repetitive work and keep teams moving.", visual: "workflow" },
];

const services = [
  { icon: MonitorSmartphone, title: "Websites", text: "Modern, fast and responsive business websites." },
  { icon: Layers3, title: "Web Apps", text: "Custom web applications for your unique needs." },
  { icon: Bot, title: "AI Agents", text: "Intelligent agents that work for you." },
  { icon: MessageSquare, title: "Chatbots", text: "Smart chat experiences for better customer support." },
  { icon: Workflow, title: "Automation", text: "Eliminate repetitive work and boost productivity." },
  { icon: Braces, title: "APIs & AI Systems", text: "Connect, extend and power your products." },
];

const processSteps = [
  ["01", "Discover", "Understand your goals, needs and challenges."],
  ["02", "Plan", "Design the right solution with a clear roadmap."],
  ["03", "Build", "Develop, test and iterate with you."],
  ["04", "Launch", "Deliver and support for long-term growth."],
];

const testimonials = [
  { quote: "FangScript transformed our idea into a powerful web application. The team is professional, responsive and genuinely cares about the results.", name: "Sarah Khan", company: "Beauty & Beyond", initials: "SK" },
  { quote: "The automation has changed how our team works. What used to take hours now happens reliably in the background.", name: "Omar Rahman", company: "Northline Operations", initials: "OR" },
  { quote: "They understood the business problem before proposing technology. That clarity made all the difference.", name: "Maya Ansari", company: "Atelier MA", initials: "MA" },
];

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <a href="#home" className="group inline-flex items-center gap-3" aria-label="FangScript home">
      <span className="brand-mark" aria-hidden="true"><i /><i /></span>
      {!compact && <span className="font-display text-lg font-bold text-foreground sm:text-xl">FangScript</span>}
    </a>
  );
}

function SectionIntro({ number, eyebrow, title, accent, copy }: { number: string; eyebrow: string; title: string; accent?: string; copy?: string }) {
  return (
    <div className="section-intro">
      <div className="section-kicker"><span>{number}</span>{eyebrow}</div>
      <h2>{title}{accent && <><br /><em>{accent}</em></>}</h2>
      {copy && <p>{copy}</p>}
    </div>
  );
}

function ProjectVisual({ type }: { type: Project["visual"] }) {
  if (type === "beauty" || type === "jewellery") {
    return (
      <div className={`project-screen ${type}`}>
        <div className="screen-nav"><span>FANG</span><i /><i /><b>SHOP</b></div>
        <div className="luxury-copy"><small>{type === "beauty" ? "TIMELESS BEAUTY" : "AL NOOR"}</small><strong>{type === "beauty" ? "Beauty, beyond convention." : "A point of view."}</strong><span>Discover the collection</span></div>
        <div className="product-orbit"><i /><i /><i /></div>
      </div>
    );
  }
  if (type === "dashboard" || type === "workflow") {
    return (
      <div className={`project-screen ${type}`}>
        <aside><i /><i /><i /><i /><i /></aside>
        <div className="dash-main"><div className="screen-nav"><span>OVERVIEW</span><b>LIVE</b></div><div className="metrics"><i /><i /><i /></div><div className="chart"><svg viewBox="0 0 500 120" preserveAspectRatio="none"><path d="M0 96 C55 80 74 102 126 64 S210 78 254 40 S345 69 390 33 S446 52 500 12" /></svg></div><div className="bars"><i /><i /><i /><i /><i /><i /><i /><i /></div></div>
      </div>
    );
  }
  return (
    <div className={`project-screen ${type}`}>
      <div className="ai-aura"><Bot size={32} /></div>
      <strong>{type === "support" ? "How can we help today?" : "Hi! I'm your FangScript assistant."}</strong>
      <p>{type === "support" ? "Search customer history and resolve requests." : "How can I help you today?"}</p>
      <div className="chat-input"><span>Type your message…</span><ArrowRight size={16} /></div>
      <div className="chat-lines"><i /><i /><i /></div>
    </div>
  );
}

function ProjectCard({ project, active, onDragEnd }: { project: Project; active: boolean; onDragEnd?: (offset: number) => void }) {
  return (
    <motion.article
      className={`project-card ${active ? "is-active" : ""}`}
      drag={active ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.12}
      onDragEnd={(_, info) => onDragEnd?.(info.offset.x)}
      whileHover={active ? { y: -6 } : undefined}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="project-media"><ProjectVisual type={project.visual} /><div className="media-shade" /></div>
      <div className="project-copy">
        <div><span className="project-category">{project.category}</span><h3>{project.name}</h3></div>
        <p>{project.description}</p>
        <div className="project-bottom"><div className="tags">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><span className="round-arrow"><ArrowRight size={18} /></span></div>
      </div>
    </motion.article>
  );
}

function FeaturedWork() {
  const reduceMotion = useReducedMotion();
  const [filter, setFilter] = useState<Category>("All");
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const filtered = useMemo(() => projects.filter((p) => filter === "All" || p.category === filter), [filter]);
  const go = useCallback((direction: number) => setIndex((current) => (current + direction + filtered.length) % filtered.length), [filtered.length]);
  const interact = useCallback(() => {
    setPaused(true);
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => setPaused(false), 4000);
  }, []);

  useEffect(() => {
    if (paused || reduceMotion || filtered.length < 2) return;
    const timer = setInterval(() => go(1), 5600);
    return () => clearInterval(timer);
  }, [paused, reduceMotion, filtered.length, go]);

  useEffect(() => () => { if (resumeTimer.current) clearTimeout(resumeTimer.current); }, []);

  const previous = filtered[(index - 1 + filtered.length) % filtered.length];
  const active = filtered[index];
  const next = filtered[(index + 1) % filtered.length];
  if (!active || !previous || !next) return null;

  return (
    <section id="work" className="section-shell featured-section" aria-labelledby="work-title">
      <div className="section-boundary">
        <div className="featured-head">
          <div id="work-title"><SectionIntro number="02" eyebrow="Featured work" title="Selected" accent="Projects" copy="A few examples of what we've built so far. Each project solves a real business need with modern technology." /></div>
          <div className="filters" aria-label="Filter projects">{(["All", "Websites", "Web Apps", "AI", "Automation"] as Category[]).map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => { setFilter(item); setIndex(0); interact(); }}>{item}</button>)}</div>
        </div>
        <div className="carousel-wrap" tabIndex={0} role="region" aria-roledescription="carousel" aria-label="Featured projects" onMouseEnter={() => setPaused(true)} onMouseLeave={interact} onFocus={() => setPaused(true)} onBlur={interact} onKeyDown={(e) => { if (e.key === "ArrowLeft") { go(-1); interact(); } if (e.key === "ArrowRight") { go(1); interact(); } }}>
          <button className="carousel-arrow left" aria-label="Previous project" onClick={() => { go(-1); interact(); }}><ArrowLeft /></button>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div key={filter} className="carousel-stage" initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} transition={{ duration: reduceMotion ? 0.15 : 0.55 }}>
              {filtered.length > 1 && <motion.div key={`prev-${previous.name}-${index}`} className="carousel-side prev" initial={{ opacity: 0, x: -60 }} animate={{ opacity: 0.43, x: 0, scale: 0.9 }}><ProjectCard project={previous} active={false} /></motion.div>}
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={`${active.name}-${index}`} className="carousel-active" initial={{ opacity: 0, x: 70, scale: 0.94 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: -70, scale: 0.94 }} transition={{ duration: reduceMotion ? 0.16 : 0.7, ease: [0.16, 1, 0.3, 1] }}>
                  <ProjectCard project={active} active onDragEnd={(offset) => { if (Math.abs(offset) > 70) go(offset < 0 ? 1 : -1); interact(); }} />
                </motion.div>
              </AnimatePresence>
              {filtered.length > 1 && <motion.div key={`next-${next.name}-${index}`} className="carousel-side next" initial={{ opacity: 0, x: 60 }} animate={{ opacity: 0.43, x: 0, scale: 0.9 }}><ProjectCard project={next} active={false} /></motion.div>}
            </motion.div>
          </AnimatePresence>
          <button className="carousel-arrow right" aria-label="Next project" onClick={() => { go(1); interact(); }}><ArrowRight /></button>
        </div>
        <div className="carousel-meta"><span>{String(index + 1).padStart(2, "0")} <i /> {String(filtered.length).padStart(2, "0")}</span><div className="dots">{filtered.map((project, dot) => <button key={project.name} aria-label={`Go to ${project.name}`} className={dot === index ? "active" : ""} onClick={() => { setIndex(dot); interact(); }} />)}</div></div>
      </div>
    </section>
  );
}

export function FangScriptHome() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [testimonial, setTestimonial] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!rootRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let ctx: { revert: () => void } | undefined;
    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([gsapModule, triggerModule]) => {
      const gsap = gsapModule.default;
      const ScrollTrigger = triggerModule.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        gsap.to(".hero-bg", { scale: 1.08, yPercent: 8, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 } });
        gsap.utils.toArray<HTMLElement>(".reveal-section").forEach((section) => gsap.from(section.children, { y: 36, opacity: 0, duration: 0.8, stagger: 0.1, ease: "power3.out", scrollTrigger: { trigger: section, start: "top 82%" } }));
        gsap.fromTo(".process-progress", { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { trigger: ".process-grid", start: "top 75%", end: "bottom 55%", scrub: 0.8 } });
        gsap.to(".parallax-bg", { yPercent: 12, ease: "none", scrollTrigger: { trigger: ".why-section", start: "top bottom", end: "bottom top", scrub: 1 } });
        gsap.utils.toArray<HTMLElement>("[data-stat]").forEach((el) => {
          const end = Number(el.dataset.stat ?? 0);
          const value = { n: 0 };
          gsap.to(value, { n: end, duration: 1.7, ease: "power2.out", onUpdate: () => { el.textContent = `${Math.round(value.n)}${end === 100 ? "%" : "+"}`; }, scrollTrigger: { trigger: el, start: "top 88%", once: true } });
        });
      }, rootRef);
    });
    return () => ctx?.revert();
  }, []);

  const scrollTo = (id: string) => { setMenuOpen(false); document.querySelector(id)?.scrollIntoView({ behavior: "smooth" }); };

  return (
    <div ref={rootRef} className="site-shell">
      <header className={`site-nav ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-inner"><Logo /><nav className="desktop-nav" aria-label="Primary navigation">{[["Home", "#home"], ["Services", "#services"], ["Work", "#work"], ["FAQ", "#faq"]].map(([label, href], i) => <a key={href} className={i === 0 ? "active" : ""} href={href}>{label}</a>)}</nav><a className="nav-cta" href="#contact">Let's Build Together <ArrowRight size={15} /></a><button className="menu-button" aria-label="Open navigation" onClick={() => setMenuOpen(true)}><Menu /></button></div>
      </header>
      <AnimatePresence>{menuOpen && <motion.div className="mobile-menu" initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }}><div className="mobile-menu-head"><Logo /><button aria-label="Close navigation" onClick={() => setMenuOpen(false)}><X /></button></div><nav>{[["Home", "#home"], ["Services", "#services"], ["Work", "#work"], ["FAQ", "#faq"], ["Let's build together", "#contact"]].map(([label, href], i) => <motion.button key={href} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} onClick={() => scrollTo(href)}>{label}<ArrowRight /></motion.button>)}</nav></motion.div>}</AnimatePresence>

      <main>
        <section id="home" className="hero">
          <img className="hero-bg" src={heroImage} width={1920} height={1080} alt="Mountain peaks illuminated by a warm horizon at night" />
          <div className="hero-veil" /><div className="grain" />
          <div className="hero-inner">
            <motion.div className="hero-copy" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.25 } } }}>
              <motion.div className="eyebrow" variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}><i /> Our work</motion.div>
              <h1><motion.span variants={{ hidden: { opacity: 0, y: 35 }, show: { opacity: 1, y: 0 } }}>Ideas into</motion.span><motion.em variants={{ hidden: { opacity: 0, y: 35 }, show: { opacity: 1, y: 0 } }}>Intelligent Products.</motion.em></h1>
              <motion.p variants={{ hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0 } }}>We build websites, web apps, AI agents and automation that solve real business problems. Here are some of our recent projects and case studies.</motion.p>
              <motion.div className="hero-actions" variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } }}><a className="primary-link" href="#work">Explore Our Work <ArrowRight /></a><a className="text-link" href="#work">View Projects <span>↗</span></a></motion.div>
            </motion.div>
            <motion.div className="device-scene" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 1.15, ease: [0.16, 1, 0.3, 1] }} aria-label="FangScript projects shown on laptop, tablet and phone">
              <div className="laptop"><div className="device-top"><ProjectVisual type="jewellery" /></div><div className="device-base" /></div>
              <div className="tablet"><ProjectVisual type="beauty" /></div>
              <div className="phone"><ProjectVisual type="assistant" /></div>
              <div className="scene-note">A premium web experience<br />for a timeless brand.</div>
            </motion.div>
          </div>
          <a href="#services" className="scroll-cue" aria-label="Scroll to services"><span>Scroll to explore</span><i /></a>
        </section>

        <section id="services" className="section-shell services-section reveal-section"><div className="section-boundary services-layout"><div><SectionIntro number="01" eyebrow="Services" title="What We Build" copy="From sleek websites to powerful AI systems, we create digital solutions that help businesses grow and operate smarter." /><a className="primary-link compact" href="#work">View All Services <ArrowRight /></a></div><div className="services-grid">{services.map(({ icon: Icon, title, text }) => <motion.article className="service-card" key={title} whileHover={{ y: -7 }}><div><Icon /><ArrowRight className="service-arrow" /></div><h3>{title}</h3><p>{text}</p></motion.article>)}</div></div></section>

        <FeaturedWork />

        <section className="section-shell why-section"><img className="parallax-bg" src={mountainImage} alt="Dark mountain wall illuminated by amber light" loading="lazy" width={1920} height={1024} /><div className="why-veil" /><div className="section-boundary why-layout reveal-section"><div><SectionIntro number="03" eyebrow="Why FangScript" title="We're not just developers." accent="We're problem solvers." copy="FangScript helps businesses turn real workflows into software, AI systems and automation. No fluff. Just practical solutions that work." /><a className="primary-link compact" href="#contact">Learn More About Us <ArrowRight /></a></div><div className="stats"><div><strong data-stat="6">0+</strong><span>Successful Projects</span></div><div><strong data-stat="100">0%</strong><span>Client Focused</span></div><div><strong>∞</strong><span>Possibilities</span></div></div><div className="floating-code"><div className="code-window back"><i /><i /><i /><span>const future = build(idea)</span><b>automation.connect()</b><em>launch → scale</em></div><div className="code-window front"><i /><i /><i /><span>export function intelligence() {'{'}</span><b>&nbsp;&nbsp;return solve(problem)</b><em>{'}'}</em><Zap /></div></div></div></section>

        <section className="section-shell tech-section"><div className="section-boundary tech-layout reveal-section"><SectionIntro number="04" eyebrow="Technology" title="Modern Stack." accent="Real Results." copy="We use the latest and most reliable technologies to build scalable, secure and high-performing solutions." /><div className="tech-grid">{["React", "Next.js", "Node.js", "Python", "MongoDB", "Supabase", "Firebase", "AWS", "Vercel"].map((name, i) => <motion.div className="tech-card" key={name} whileHover={{ y: -5, scale: 1.04 }}><span>{i % 3 === 0 ? <Code2 /> : i % 3 === 1 ? <Globe2 /> : <Zap />}</span><b>{name}</b></motion.div>)}</div></div></section>

        <section className="section-shell process-section"><div className="section-boundary process-layout reveal-section"><SectionIntro number="05" eyebrow="Our process" title="From Idea to Impact" copy="We keep things simple, transparent, and focused on what matters — your success." /><div className="process-grid"><div className="process-line"><i className="process-progress" /></div>{processSteps.map(([number, title, text]) => <div className="process-step" key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></div>)}</div></div></section>

        <section id="faq" className="section-shell testimonial-section"><div className="section-boundary testimonial-layout reveal-section"><SectionIntro number="06" eyebrow="Clients" title="What Our Clients Say" copy="Don't just take our word for it. Here's what businesses have to say about working with us." /><div className="testimonial-area"><AnimatePresence mode="wait"><motion.blockquote key={testimonial} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.42 }}><Quote /><p>“{testimonials[testimonial].quote}”</p><footer><span>{testimonials[testimonial].initials}</span><div><strong>{testimonials[testimonial].name}</strong><small>{testimonials[testimonial].company}</small></div></footer></motion.blockquote></AnimatePresence><div className="testimonial-controls"><button aria-label="Previous testimonial" onClick={() => setTestimonial((testimonial - 1 + testimonials.length) % testimonials.length)}><ArrowLeft /></button><span>{testimonial + 1} / {testimonials.length}</span><button aria-label="Next testimonial" onClick={() => setTestimonial((testimonial + 1) % testimonials.length)}><ArrowRight /></button></div></div></div></section>

        <section id="contact" className="final-cta"><img src={ctaImage} alt="Mountain valley at an orange sunset" loading="lazy" width={1920} height={768} /><div className="cta-veil" /><div className="grain" /><div className="section-boundary cta-layout reveal-section"><div><div className="section-kicker">Let's talk</div><h2>Have a Project in Mind?</h2><p>Tell us what you're trying to build. We'll help you turn your idea into a powerful digital solution — with the right technology.</p></div><a className="gold-button" href="mailto:hello@fangscript.com">Get in Touch <ArrowRight /></a><div className="cta-brand"><Logo /><p>Crafted with passion <span>•</span> Built for your brand.</p></div></div></section>
      </main>

      <footer className="site-footer"><div className="section-boundary footer-inner"><small>© 2025 FangScript. All rights reserved.</small><nav><a href="#home">Home</a><a href="#services">Services</a><a href="#work">Work</a><a href="#faq">FAQ</a></nav><div className="socials"><a href="https://github.com" aria-label="GitHub"><Github /></a><a href="https://linkedin.com" aria-label="LinkedIn"><Linkedin /></a><a href="https://x.com" aria-label="X"><X /></a><a href="https://youtube.com" aria-label="YouTube"><Youtube /></a></div></div></footer>
    </div>
  );
}