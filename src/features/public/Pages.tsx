import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import {
  Bot,
  Code2,
  TrendingUp,
  PenTool,
  Database,
  ArrowDown,
  ArrowUpRight,
  Check,
  Plus,
  CalendarDays,
} from "lucide-react";
import { categories, demonstrations, faqs, type Category, type ContentRecord } from "./content";
import { api, contentItems, useContent } from "./api";
import { SiteLayout, Button, CTA, PageHeading } from "./Chrome";
const ClayScene = lazy(() => import("../scene/ClayScene"));
const icons = [Code2, Bot, TrendingUp, PenTool, Database];
function useCatalog() {
  const query = useContent();
  const records = contentItems(query.data).filter((i) => i.kind === "category");
  // Keep the public catalogue useful while the CMS has no published category rows.
  // Once editors publish categories, those records take precedence.
  return records.length
    ? (records.map((i) => ({ ...i.data, id: i.slug, title: i.title, slug: i.slug })) as Category[])
    : categories;
}
function IconTile({ index }: { index: number }) {
  const Icon = icons[index % icons.length]!;
  return (
    <div className="icon-tile">
      <Icon strokeWidth={1.45} />
    </div>
  );
}
export function ServiceCards() {
  const items = useCatalog();
  return (
    <div className="service-grid">
      {items.map((c, i) => (
        <a className="service-card" key={c.id} href={"/services/" + c.slug}>
          <div className="service-card-top">
            <span className="card-number">0{i + 1}</span>
            <IconTile index={i} />
            <ArrowUpRight className="card-arrow" size={19} />
          </div>
          <h3>{c.title}</h3>
          <p>{c.summary}</p>
          <span className="card-foot">
            Explore the possibilities <span>↗</span>
          </span>
        </a>
      ))}
    </div>
  );
}
function useProjects() {
  const { data } = useContent();
  const projects = contentItems(data).filter((i) => i.kind === "case-study");
  return Array.isArray(data?.items)
    ? projects.map((i) => ({
        id: i.slug,
        title: i.title,
        type: i.data["type"] || "Selected work",
        image: i.data["image"],
        description: i.data["description"] || "",
        category: i.data["category"] || "technology",
        demo: !!i.data["demo"],
        liveUrl: i.data["openLivePreview"] && typeof i.data["liveUrl"] === "string" && /^https:\/\//.test(i.data["liveUrl"]) ? i.data["liveUrl"] : "",
      }))
    : demonstrations.map((p) => ({ ...p, demo: true, liveUrl: "" }));
}
function ProjectGrid({ limit, filter = "all", carousel = false }: { limit?: number; filter?: string; carousel?: boolean }) {
  const track = useRef<HTMLDivElement>(null);
  const projects = useProjects()
    .filter((p) => filter === "all" || p.category === filter)
    .slice(0, limit);
  if (!projects.length) return <p className="empty-editorial">No published projects in this selection yet.</p>;
  return (
    <>
    {carousel && projects.length > 1 && <div className="work-controls" aria-label="Work carousel controls">
      <button type="button" className="text-link" onClick={() => track.current?.scrollBy({ left: -track.current.clientWidth, behavior: "smooth" })}>Previous projects ←</button>
      <button type="button" className="text-link" onClick={() => track.current?.scrollBy({ left: track.current.clientWidth, behavior: "smooth" })}>Next projects →</button>
    </div>}
    <div ref={track} className={carousel ? "project-grid work-carousel" : "project-grid"} aria-label={carousel ? "Selected work" : undefined}>
      {projects.map((p, i) => (
        <a className={"project-card project-" + i} href={p.liveUrl || "/work/" + p.id} target={p.liveUrl ? "_blank" : undefined} rel={p.liveUrl ? "noopener noreferrer" : undefined} key={p.id}>
          <div className="project-image">
            {p.image ? (
              <img src={p.image} alt={p.title} loading="lazy" width="900" height="640" />
            ) : (
              <div className="project-placeholder">
                <Code2 size={72} />
              </div>
            )}
            <span className="project-pill">{p.type}</span>
          </div>
          <div className="project-caption">
            <div>
              <span className="eyebrow">{p.demo ? "ILLUSTRATIVE CONCEPT" : "SELECTED WORK"}</span>
              <h3>{p.title}</h3>
            </div>
            <span className="circle-arrow">
              <ArrowUpRight size={21} />
            </span>
          </div>
        </a>
      ))}
    </div>
    </>
  );
}
export function HomePage() {
  const reduce = useReducedMotion();
  const hero = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [chapter, setChapter] = useState(0);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    if (reduce) return;
    let disposed = false;
    let cleanup: undefined | (() => void);
    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        if (disposed) return;
        gsap.registerPlugin(ScrollTrigger);
        const mm = gsap.matchMedia();
        mm.add("(min-width: 1000px)", () => {
          const trigger = ScrollTrigger.create({
            trigger: hero.current,
            start: "top top",
            end: "+=1150",
            pin: true,
            scrub: true,
            onUpdate: (self) => {
              progress.current = self.progress;
              const next = self.progress < 0.33 ? 0 : self.progress < 0.67 ? 1 : 2;
              setChapter((previous) => (previous === next ? previous : next));
            },
          });
          return () => trigger.kill();
        });
        const ctx = gsap.context(() => {
          gsap.utils
            .toArray<HTMLElement>(".service-card,.project-card,.process-item")
            .forEach((el) =>
              gsap.from(el, {
                y: 35,
                opacity: 0,
                duration: 0.75,
                ease: "power2.out",
                scrollTrigger: { trigger: el, start: "top 94%", once: true },
              }),
            );
        });
        cleanup = () => {
          mm.revert();
          ctx.revert();
        };
      },
    );
    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [reduce]);

  return (
    <SiteLayout>
      <section className="cinematic-hero" ref={hero}>
        <div className="container hero-layout">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="live-dot" /> YOUR PARTNER FROM IDEA TO IMPACT
            </span>
            <h1>
              <span className={chapter === 0 ? "lit" : ""}>Build.</span>
              <span className={chapter === 1 ? "lit" : ""}>Automate.</span>
              <em className={chapter === 2 ? "lit" : ""}>Grow.</em>
            </h1>
            <p>
              Technology, AI and growth.
              <br />
              Thoughtfully connected.
              <br className="mobile-break" /> Built around you.
            </p>
            <div className="hero-actions">
              <Button href="/book">Book a discovery call</Button>
              <a className="text-link" href="/work">
                Explore our work <ArrowUpRight size={17} />
              </a>
            </div>
          </div>
          <div className="hero-art">
            <span className="art-index">F / LAB — {["BUILD", "AUTOMATE", "GROW"][chapter]}</span>
            {mounted && (
              <Suspense fallback={<div className="scene-loading">Build. Automate. Grow.</div>}>
                <ClayScene progress={progress} reduced={!!reduce} />
              </Suspense>
            )}
            <div className="scene-caption">
              <span className="live-dot" />
              {
                ["Ideas, made tangible.", "Make the connections.", "Ready for what’s next."][
                  chapter
                ]
              }
            </div>
          </div>
          <div className="hero-bottom">
            <a href="#capabilities" className="scroll-prompt">
              Scroll to explore <ArrowDown size={15} />
            </a>
            <div className="chapter-dots" aria-hidden="true">
              {["Build", "Automate", "Grow"].map((name, i) => (
                <span key={name} className={chapter === i ? "active" : ""}>
                  0{i + 1} <b>{name}</b>
                </span>
              ))}
            </div>
            <a href="#capabilities" className="skip-animation">
              Skip animation ↗
            </a>
          </div>
        </div>
      </section>
      <section className="intro-strip container">
        <p>
          From the first spark
          <br />
          to your next big move.
        </p>
        <p>
          We bring technology, automation, marketing, and creative work together. One connected team
          to help you build what matters—and make it work harder.
        </p>
        <span className="intro-mark">↗</span>
      </section>
      <section className="section container" id="capabilities">
        <div className="section-heading">
          <div>
            <span className="eyebrow">OUR CAPABILITIES</span>
            <h2>
              Five disciplines.
              <br />
              <em>One clear direction.</em>
            </h2>
          </div>
          <p>
            Start with what you need.
            <br />
            Build on what’s possible.
          </p>
        </div>
        <ServiceCards />
      </section>
      <section className="section container">
        <div className="section-heading">
          <div>
            <span className="eyebrow">IDEAS IN ACTION</span>
            <h2>
              Built with purpose.
              <br />
              <em>Designed for people.</em>
            </h2>
          </div>
          <a className="text-link" href="/work">
            Explore our work <ArrowUpRight size={17} />
          </a>
        </div>
        <ProjectGrid carousel />
      </section>
      <Process />
      <section className="section container faq-split">
        <div>
          <span className="eyebrow">A LITTLE CLARITY</span>
          <h2>
            Good questions.
            <br />
            <em>Straight answers.</em>
          </h2>
          <a className="text-link" href="/faq">
            More answers <ArrowUpRight size={17} />
          </a>
        </div>
        <FAQList limit={3} />
      </section>
      <CTA />
    </SiteLayout>
  );
}
function Process() {
  return (
    <section className="process-section">
      <div className="container">
        <div className="section-heading">
          <div>
            <span className="eyebrow">HOW WE GET THERE</span>
            <h2>
              Good work starts
              <br />
              with <em>understanding.</em>
            </h2>
          </div>
          <p>
            A clear path from the first conversation
            <br />
            to something you can put to work.
          </p>
        </div>
        <div className="process-grid">
          {[
            ["Discover", "Your goals. Your people. Your challenges. We listen before we build."],
            ["Define", "A clear scope, a thoughtful direction, and a plan we agree on together."],
            ["Create", "Design, develop, and refine. You see progress and shape the outcome."],
            ["Evolve", "Launch with confidence. Learn, improve, and grow from there."],
          ].map(([title, copy], i) => (
            <div className="process-item" key={title}>
              <span className="process-number">0{i + 1}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
export function ServicesPage() {
  return (
    <SiteLayout>
      <PageHeading
        eyebrow="OUR CAPABILITIES"
        title="Everything you need. Working together."
        description="Five complementary disciplines. One team that sees the whole picture."
      />
      <section className="container section">
        <ServiceCards />
      </section>
      <Process />
      <CTA />
    </SiteLayout>
  );
}
export function ServicePage({ slug }: { slug: string }) {
  const category = useCatalog().find((c) => c.slug === slug);
  if (!category) return <Missing />;
  return (
    <SiteLayout>
      <PageHeading
        eyebrow={category.eyebrow}
        title={category.headline}
        description={category.summary}
      />
      <section className="container service-detail">
        <div className="service-description">
          <span className="eyebrow">{category.title}</span>
          <h2>
            Built around
            <br />
            <em>your business.</em>
          </h2>
          <p>
            Tell us where you are and where you want to go. We’ll shape a practical solution around
            your goals, team, and existing tools.
          </p>
          <Button href={"/contact?service=" + encodeURIComponent(category.title)}>
            Discuss your project
          </Button>
        </div>
        <div className="offering-grid">
          {category.services.map((name, i) => (
            <div className="offering" key={name}>
              <span>0{(i % 9) + 1}</span>
              <h3>{name}</h3>
              <Check size={17} />
            </div>
          ))}
        </div>
      </section>
      <Process />
      <section className="container section">
        <FAQList limit={3} />
      </section>
      <CTA />
    </SiteLayout>
  );
}
export function WorkPage() {
  const [filter, setFilter] = useState("all");
  return (
    <SiteLayout>
      <PageHeading
        eyebrow="THE WORK"
        title="Ideas, brought to life."
        description="Explore connected digital experiences. Concept projects are clearly identified; published client work appears here as it is added."
      />
      <section className="container section">
        <div className="filter-tabs" aria-label="Filter work">
          {[["all", "All work"], ...categories.map((c) => [c.id, c.shortTitle])].map(
            ([id, title]) => (
              <button
                key={id}
                className={filter === id ? "active" : ""}
                onClick={() => setFilter(id!)}
              >
                {title}
              </button>
            ),
          )}
        </div>
        <ProjectGrid filter={filter} />
      </section>
      <CTA />
    </SiteLayout>
  );
}
export function CaseStudyPage({ slug }: { slug: string }) {
  const p = useProjects().find((p) => p.id === slug);
  const { data } = useContent();
  const record = contentItems(data).find((i) => i.slug === slug && i.kind === "case-study");
  if (!p) return <Missing />;
  return (
    <SiteLayout>
      <PageHeading
        eyebrow={p.demo ? "ILLUSTRATIVE CONCEPT · " + p.type : p.type}
        title={p.title}
        description={p.description}
      />
      <section className="container case-content">
        {p.image && <img className="case-cover" src={p.image} alt={p.title} />}
        <div className="case-copy">
          <h2>The idea</h2>
          <p>{record?.data["challenge"] || p.description}</p>
          <h2>The approach</h2>
          <p>
            {record?.data["approach"] ||
              "A considered interface connects the core customer journey with the tools and information behind it. This concept demonstrates the kind of experience we can tailor to a real project."}
          </p>
          {record?.data["outcomes"] && (
            <>
              <h2>The outcome</h2>
              <p>{record.data["outcomes"]}</p>
            </>
          )}
          {record?.data["liveUrl"] && (
            <Button href={record.data["liveUrl"]}>Visit the project</Button>
          )}
        </div>
      </section>
      <CTA />
    </SiteLayout>
  );
}
export function AboutPage() {
  return (
    <SiteLayout>
      <PageHeading
        eyebrow="MEET FANGSCRIPT LAB"
        title="Curious minds. Connected thinking."
        description="We’re a multidisciplinary team helping startups and businesses turn ideas into practical digital experiences."
      />
      <section className="container about-grid section">
        <div className="about-manifesto">
          Build with purpose.
          <br />
          Automate with care.
          <br />
          <em>Grow with intention.</em>
        </div>
        <div>
          <h2>One team for the bigger picture.</h2>
          <p>
            Great websites need clear messaging. Powerful software needs connected data. Growth
            needs the right systems behind it. We bring these disciplines together so your business
            can move forward with one team.
          </p>
          <p>
            Our approach starts with your goals and ends with something useful: a website people
            understand, an application your team relies on, or a workflow that gives you time back.
          </p>
        </div>
      </section>
      <Process />
      <CTA />
    </SiteLayout>
  );
}
function FAQList({ limit }: { limit?: number }) {
  const { data } = useContent();
  const records = contentItems(data).filter((i) => i.kind === "faq");
  const items = Array.isArray(data?.items) ? records.map((i) => [i.title, String(i.data["answer"] || "")]) : faqs;
  return (
    <div className="faq-list">
      {items.slice(0, limit).map(([q, a]) => (
        <details key={q}>
          <summary>
            {q}
            <Plus size={18} />
          </summary>
          <p>{a}</p>
        </details>
      ))}
    </div>
  );
}
export function FAQPage() {
  return (
    <SiteLayout>
      <PageHeading eyebrow="GOOD TO KNOW" title="A little clarity goes a long way." />
      <section className="container section narrow">
        <FAQList />
      </section>
      <CTA />
    </SiteLayout>
  );
}
export function InsightsPage({ slug }: { slug?: string }) {
  const { data } = useContent();
  const posts = contentItems(data).filter((i) => i.kind === "post");
  const post = posts.find((p) => p.slug === slug);
  if (slug && !post) return <Missing />;
  return (
    <SiteLayout>
      <PageHeading
        eyebrow="FROM THE LAB"
        title={post ? post.title : "Thinking out loud."}
        description={
          post
            ? post.data["excerpt"]
            : "Ideas and practical notes on building, automating, and growing."
        }
      />
      <section className="container section">
        {post ? (
          <article className="article-body">
            {String(post.data["body"] || "")
              .split("\n")
              .map((p, i) => (
                <p key={i}>{p}</p>
              ))}
          </article>
        ) : posts.length ? (
          <div className="project-grid">
            {posts.map((p) => (
              <a className="insight-card" href={"/insights/" + p.slug} key={p.id}>
                <span className="eyebrow">{p.data["category"] || "INSIGHT"}</span>
                <h2>{p.title}</h2>
                <p>{p.data["excerpt"]}</p>
                <span>Read the story ↗</span>
              </a>
            ))}
          </div>
        ) : (
          <div className="empty-editorial">
            <PenTool size={35} />
            <h2>Something thoughtful is on the way.</h2>
            <p>Notes from the lab will appear here when published.</p>
            <a href="/services" className="text-link">
              Explore our capabilities ↗
            </a>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
export function ContactPage() {
  const [interactive, setInteractive] = useState(false);
  useEffect(() => setInteractive(true), []);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    const values = Object.fromEntries(new FormData(e.currentTarget));
    try {
      await api("/lead/leads", {
        method: "POST",
        body: JSON.stringify({
          ...values,
          consent: values["consent"] === "on",
          source: "website",
          utm: Object.fromEntries(new URLSearchParams(location.search)),
        }),
      });
      setDone(true);
      form.current?.reset();
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <SiteLayout>
      <PageHeading
        eyebrow="LET’S MAKE SOMETHING MATTER"
        title="Tell us what’s on your mind."
        description="A new idea, a challenge, or a better way of working. We’d love to hear it."
      />
      <section className="container contact-grid section">
        <div>
          <h2>
            Your next chapter
            <br />
            <em>starts here.</em>
          </h2>
          <p>
            Share a little about your project. We’ll review your brief and get back to you to
            discuss the next step.
          </p>
          <a className="text-link" href="/book">
            <CalendarDays size={18} /> Prefer a conversation? Book a call ↗
          </a>
        </div>
        <form className="clay-form" ref={form} onSubmit={submit}>
          <fieldset disabled={!interactive || busy} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
          {done ? (
            <div role="status" className="success-panel">
              <Check size={32} />
              <h2>Your brief is with us.</h2>
              <p>Thanks for reaching out. The team will review your enquiry.</p>
              <button
                type="button"
                className="clay-button secondary"
                onClick={() => setDone(false)}
              >
                Send another brief
              </button>
            </div>
          ) : (
            <>
              <div className="form-row">
                <label>
                  Your name
                  <input
                    name="name"
                    required
                    maxLength={150}
                    autoComplete="name"
                    placeholder="Alex Morgan"
                  />
                </label>
                <label>
                  Email address
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="alex@company.com"
                  />
                </label>
              </div>
              <label>
                Company <span>(optional)</span>
                <input
                  name="company"
                  maxLength={200}
                  autoComplete="organization"
                  placeholder="Your company"
                />
              </label>
              <div className="form-row">
                <label>
                  What can we help with?
                  <select name="serviceCategory">
                    <option value="">Let’s explore</option>
                    {categories.map((c) => (
                      <option key={c.id}>{c.title}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Budget <span>(optional)</span>
                  <input name="budget" placeholder="Your range and currency" maxLength={100} />
                </label>
              </div>
              <label>
                A little about your project
                <textarea
                  name="message"
                  required
                  minLength={10}
                  maxLength={6000}
                  rows={5}
                  placeholder="What are you hoping to build or improve?"
                />
              </label>
              <label className="honeypot" aria-hidden="true">
                Website
                <input name="honeypot" tabIndex={-1} autoComplete="off" />
              </label>
              <label className="checkbox-label">
                <input type="checkbox" name="consent" required />{" "}
                <span>
                  I agree to the <a href="/privacy">privacy notice</a> and being contacted about
                  this enquiry.
                </span>
              </label>
              {message && (
                <p role="alert" className="form-error">
                  {message}
                </p>
              )}
              <button className="clay-button" disabled={busy}>
                {busy ? "Sending your brief…" : "Send your project brief"}
                <ArrowUpRight size={18} />
              </button>
            </>
          )}
          </fieldset>
        </form>
      </section>
    </SiteLayout>
  );
}
export function BookingPage() {
  const [config, setConfig] = useState<{ url?: string; error?: string }>({});
  useEffect(() => {
    api("/lead/booking-config")
      .then(setConfig)
      .catch(() => setConfig({ error: "Online scheduling has not been connected yet." }));
  }, []);
  return (
    <SiteLayout>
      <PageHeading
        eyebrow="LET’S TALK"
        title="A conversation. A clear next step."
        description="Choose a time to talk about your goals. No need to have every detail figured out."
      />
      <section className="container section narrow">
        {config.url ? (
          <div className="booking-frame">
            <iframe title="Book a discovery call" src={config.url} allow="payment" />
            <a href={config.url} target="_blank" rel="noreferrer" className="text-link">
              Open the calendar in a new tab ↗
            </a>
          </div>
        ) : (
          <div className="empty-editorial">
            <CalendarDays size={40} />
            <h2>Let’s arrange a conversation.</h2>
            <p>{config.error || "Checking calendar availability…"}</p>
            <Button href="/contact">Send us your preferred time</Button>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
export function LegalPage({ type }: { type: "privacy" | "terms" }) {
  const { data } = useContent();
  const item = contentItems(data).find((i) => i.kind === "page" && i.slug === type);
  return (
    <SiteLayout>
      <PageHeading
        eyebrow="FANGSCRIPT LAB"
        title={type === "privacy" ? "Your privacy matters." : "Working together, clearly."}
      />
      <article className="container article-body section">
        {item ? (
          <p>{item.data["body"]}</p>
        ) : type === "privacy" ? (
          <>
            <h2>Information you share</h2>
            <p>
              Enquiries contain the contact and project details you choose to provide. We use these
              to respond, arrange consultations, and manage agreed work. Client accounts also hold
              the project, proposal, file, and billing information needed to deliver services.
            </p>
            <h2>Chat and connected services</h2>
            <p>
              Messages and attachments sent to the assistant may be processed by our AI service
              provider. Please avoid submitting passwords, payment card details, or information you
              do not want processed. Scheduling, email, payment, and file services process
              information needed for their respective functions.
            </p>
            <h2>Your choices</h2>
            <p>
              Use the contact form to request access, correction, or deletion of your information.
              Essential session cookies support sign-in. Optional advertising and analytics tracking
              is disabled unless separately configured with consent.
            </p>
            <a href="/contact" className="text-link">
              Contact the team ↗
            </a>
          </>
        ) : (
          <>
            <h2>Project agreements</h2>
            <p>
              Scope, deliverables, fees, schedules, ownership, and support are set out in your
              project proposal or agreement. Information on this website is an introduction to our
              services, not a fixed offer or performance guarantee.
            </p>
            <h2>Proposals and payments</h2>
            <p>
              Review the complete proposal before accepting it. Invoice currency, payment
              instructions, due dates, and applicable taxes are shown on each invoice. Contact the
              team about discrepancies before making payment.
            </p>
            <h2>Responsible use</h2>
            <p>
              Use the website and client portal only for authorized purposes. Keep your account
              secure and share only material you have permission to provide. AI responses are
              informational; project commitments require confirmation from the team.
            </p>
          </>
        )}
      </article>
    </SiteLayout>
  );
}
export function Missing() {
  return (
    <SiteLayout>
      <PageHeading
        eyebrow="404"
        title="This page took another path."
        description="The page may have moved or is not published yet."
      />
      <section className="container section">
        <Button href="/">Back to the lab</Button>
      </section>
    </SiteLayout>
  );
}

export function ContentPreviewPage({ id }: { id: string }) {
  const [item, setItem] = useState<ContentRecord | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    api<ContentRecord>("/cms/records/" + id)
      .then(setItem)
      .catch((e) => setError(e.message));
  }, [id]);
  return (
    <SiteLayout>
      <meta name="robots" content="noindex,nofollow" />
      <PageHeading
        eyebrow="PRIVATE CONTENT PREVIEW"
        title={item?.title || "Content preview"}
        description={
          item
            ? `Version ${item.version || 1} · ${item.status || "draft"}`
            : error || "Loading your content…"
        }
      />
      {item && (
        <article className="container article-body section">
          {Object.entries(item.data)
            .filter(
              ([key]) => !["order", "seoTitle", "seoDescription", "socialImage"].includes(key),
            )
            .map(([key, value]) => (
              <section key={key}>
                <h2>{key.replace(/([A-Z])/g, " $1")}</h2>
                {key === "image" && typeof value === "string" ? (
                  <img src={value} alt={item.title} style={{ maxWidth: "100%" }} />
                ) : (
                  <p style={{ whiteSpace: "pre-wrap" }}>
                    {Array.isArray(value) ? value.join("\n") : String(value)}
                  </p>
                )}
              </section>
            ))}
        </article>
      )}
    </SiteLayout>
  );
}
