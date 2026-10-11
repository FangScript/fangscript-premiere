import { motion } from "motion/react";
import {
  ArrowRight,
  Bot,
  Braces,
  Check,
  Code2,
  Compass,
  Gauge,
  Globe2,
  Layers3,
  Mail,
  MessageSquare,
  Rocket,
  ShieldCheck,
  Sparkles,
  Workflow,
  Zap,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Cpu,
  TrendingUp,
  Palette,
  Network,
  Shield,
  Layers,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PageCta, PageHero, SiteFrame } from "@/components/SiteChrome";
import { SERVICE_CATEGORIES, type ServiceCategory, type ServiceAvailability } from "@/data/servicesData";
import { submitLead, type StoredLead } from "@/lib/leadCapture";
import { BookingModal } from "@/components/BookingModal";

const portfolio = [
  { category: "Website", title: "Beauty & Beyond", copy: "A considered e-commerce experience that brought brand, product discovery, and operations into one elegant system.", result: "Stronger discovery", visual: "case-beauty" },
  { category: "Web App", title: "Operations Control Room", copy: "One source of truth for workflows, performance signals, and daily team decisions.", result: "Hours saved weekly", visual: "case-dashboard" },
  { category: "AI", title: "FangScript Assistant", copy: "A conversational assistant that answers, qualifies, and turns intent into booked conversations.", result: "Always-on response", visual: "case-ai" },
  { category: "Website", title: "Al Noor Jewellers", copy: "A luxury digital storefront designed to make craftsmanship feel tangible on every screen.", result: "Premium brand presence", visual: "case-jewellery" },
  { category: "AI", title: "Support Intelligence", copy: "Customer context, knowledge retrieval, and smart escalation in a single service workflow.", result: "Faster resolutions", visual: "case-support" },
  { category: "Automation", title: "Connected Operations", copy: "A dependable automation layer joining enquiries, delivery, reporting, and follow-up.", result: "Less manual work", visual: "case-flow" },
];

const faqs = [
  ["What does FangScript build?", "We design and develop premium websites, custom web applications, AI agents, conversational experiences, workflow automation, and the APIs that connect them."],
  ["What does a typical project cost?", "Scope determines investment. After a short discovery conversation, we provide a clear proposal with deliverables, timing, and a fixed project range before work begins."],
  ["How long does a project take?", "Focused websites often take four to eight weeks. Larger applications, AI systems, and automation programs are planned in phases and may run for eight to sixteen weeks or longer."],
  ["Can you improve an existing product?", "Yes. We can audit, redesign, rebuild, or extend an existing website or application without forcing a complete restart when the foundation is sound."],
  ["Will we own the finished work?", "Yes. Once the agreed project is complete and paid for, your business owns the custom designs and code created for it, excluding standard third-party tools and licenses."],
  ["Do you provide ongoing support?", "Yes. We offer practical post-launch support, monitoring, improvements, and ongoing product partnerships depending on what your team needs."],
  ["How do you keep AI systems accurate?", "We constrain systems to approved knowledge, add clear fallbacks and human handoff, test real scenarios, and monitor quality rather than treating AI as a magic black box."],
  ["Can you connect the tools we already use?", "Usually. We work with modern APIs, webhooks, databases, CRMs, scheduling tools, and automation platforms to create a connected workflow."],
];

function AvailabilityBadge({ status }: { status: ServiceAvailability }) {
  if (status === "available") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        Available
      </span>
    );
  }
  if (status === "custom") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
        Custom Scope
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-slate-500/10 text-slate-400 border border-slate-500/20">
      Coming Soon
    </span>
  );
}

export function ServicesPage() {
  const defaultCategory = SERVICE_CATEGORIES[0]!;
  const [selectedId, setSelectedId] = useState<string>(defaultCategory.id);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingCategory, setBookingCategory] = useState<string>("");

  const activeCategory: ServiceCategory = SERVICE_CATEGORIES.find((c) => c.id === selectedId) ?? defaultCategory;

  const handleOpenBooking = (categoryTitle: string) => {
    setBookingCategory(categoryTitle);
    setBookingModalOpen(true);
  };

  return (
    <SiteFrame>
      <main>
        <PageHero
          eyebrow="Capabilities"
          title="Digital systems built for"
          accent="real momentum."
          copy="Five specialized capabilities covering engineering, intelligence, growth, design, and connected operations—engineered around the commercial results your business actually needs."
        />

        {/* Category Navigation Bar */}
        <section className="border-b border-white/10 bg-[#0A0D18] sticky top-[70px] z-20 backdrop-blur-md">
          <div className="section-boundary py-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none" role="tablist">
              {SERVICE_CATEGORIES.map((cat) => {
                const isSelected = cat.id === selectedId;
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setSelectedId(cat.id)}
                    className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-amber-400 text-slate-950 font-semibold shadow-lg shadow-amber-400/10"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon size={14} className={isSelected ? "text-slate-950" : "text-amber-400"} />
                    <span>{cat.shortTitle}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Detailed Active Category Showcase */}
        <section className="inner-section py-16 bg-[#070A14]">
          <div className="section-boundary">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              {/* Left Column: Category Narrative */}
              <div className="lg:col-span-5 space-y-6">
                <div className="flex items-center gap-3">
                  <span className="text-xs uppercase font-bold tracking-widest text-amber-400">
                    Category 0{SERVICE_CATEGORIES.findIndex((c) => c.id === activeCategory.id) + 1}
                  </span>
                  <AvailabilityBadge status={activeCategory.badge} />
                </div>

                <h2 className="text-3xl sm:text-4xl font-serif text-white leading-tight">
                  {activeCategory.title}
                </h2>

                <p className="text-amber-300 text-sm font-medium leading-relaxed">
                  {activeCategory.tagline}
                </p>

                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <div className="text-xs font-semibold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                    <Shield size={13} className="text-amber-400" />
                    Problem Solved
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeCategory.problemSolved}
                  </p>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  {activeCategory.metrics.map((m) => (
                    <div key={m.label} className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                      <strong className="block text-base sm:text-lg font-bold text-amber-400">{m.value}</strong>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">{m.label}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => handleOpenBooking(activeCategory.title)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-semibold hover:bg-amber-300 transition-colors"
                  >
                    <Calendar size={14} />
                    Schedule Discovery Call
                  </button>
                  <Link
                    to="/contact"
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/10 text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Request Project Quote
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>

              {/* Right Column: Sub-Services & Deliverables */}
              <div className="lg:col-span-7 space-y-8">
                <div>
                  <h3 className="text-xs uppercase font-bold tracking-widest text-slate-400 mb-4">
                    Sub-Services & Specialized Capabilities
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {activeCategory.subServices.map((sub) => (
                      <div
                        key={sub.id}
                        className="p-5 rounded-2xl bg-[#0B0F1E] border border-white/10 hover:border-amber-400/30 transition-all space-y-3 group"
                      >
                        <div className="flex items-start justify-between">
                          <h4 className="text-sm font-semibold text-white group-hover:text-amber-300 transition-colors">
                            {sub.name}
                          </h4>
                          <AvailabilityBadge status={sub.availability} />
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {sub.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {sub.features.map((feat) => (
                            <span
                              key={feat}
                              className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/5"
                            >
                              {feat}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Deliverables Checklist */}
                <div>
                  <h3 className="text-xs uppercase font-bold tracking-widest text-slate-400 mb-3">
                    Standard Scope Deliverables
                  </h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {activeCategory.deliverables.map((deliv) => (
                      <li
                        key={deliv}
                        className="flex items-start gap-2 text-xs text-slate-300 p-2.5 rounded-xl bg-white/5 border border-white/5"
                      >
                        <Check size={14} className="text-amber-400 shrink-0 mt-0.5" />
                        <span>{deliv}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Process Steps */}
                <div>
                  <h3 className="text-xs uppercase font-bold tracking-widest text-slate-400 mb-3">
                    Execution Methodology
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeCategory.processSteps.map((step) => (
                      <div key={step.step} className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-amber-400 font-bold text-xs">{step.step}</span>
                          <h5 className="text-xs font-semibold text-white">{step.title}</h5>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{step.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* All 5 Categories Grid Overview */}
        <section className="inner-section py-20">
          <div className="section-boundary">
            <div className="inner-intro">
              <span>Comprehensive Catalogue</span>
              <h2>All 5 Disciplines, One Unified Agency.</h2>
              <p>We choose the right level of technology for the problem, then make every detail feel considered.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SERVICE_CATEGORIES.map((cat, i) => {
                const Icon = cat.icon;
                return (
                  <article
                    key={cat.id}
                    onClick={() => {
                      setSelectedId(cat.id);
                      window.scrollTo({ top: 400, behavior: "smooth" });
                    }}
                    className={`p-6 rounded-2xl border transition-all cursor-pointer group ${
                      cat.id === selectedId
                        ? "border-amber-400/50 bg-[#0E1324] shadow-xl"
                        : "border-white/10 bg-[#090C18] hover:border-amber-400/30 hover:bg-[#0C1020]"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2.5 rounded-xl bg-amber-400/10 text-amber-400 group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors">
                        <Icon size={20} />
                      </div>
                      <AvailabilityBadge status={cat.badge} />
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">0{i + 1}</span>
                    <h3 className="text-lg font-serif text-white mt-1 mb-2 group-hover:text-amber-300 transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
                      {cat.problemSolved}
                    </p>
                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-amber-400 font-medium">
                      <span>View Specifications</span>
                      <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Core Principles Band */}
        <section className="outcomes-band">
          <div className="section-boundary outcomes-grid">
            <div>
              <Gauge />
              <strong>Fast by design</strong>
              <span>Sub-300ms gateway latency & Lighthouse 95+ performance.</span>
            </div>
            <div>
              <ShieldCheck />
              <strong>Built responsibly</strong>
              <span>Human-in-the-loop AI safety & zero foundation training.</span>
            </div>
            <div>
              <Rocket />
              <strong>Client IP Ownership</strong>
              <span>100% source code, schema, and design transfer.</span>
            </div>
          </div>
        </section>

        <PageCta title="Have an engineering or AI challenge worth solving?" />
      </main>

      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        preselectedCategory={bookingCategory}
      />
    </SiteFrame>
  );
}

export function WorkPage() {
  const [filter, setFilter] = useState("All");
  const filters = ["All", "Website", "Web App", "AI", "Automation"];
  const shown = portfolio.filter((item) => filter === "All" || item.category === filter);

  return (
    <SiteFrame>
      <main>
        <PageHero
          eyebrow="Selected work"
          title="Products with purpose."
          accent="Experiences with presence."
          copy="A selection of websites, applications, agents, and automated systems designed around measurable business needs."
        />
        <section className="inner-section work-page">
          <div className="section-boundary">
            <div className="work-toolbar">
              <p>{String(shown.length).padStart(2, "0")} selected projects</p>
              <div className="filters" aria-label="Filter projects">
                {filters.map((item) => (
                  <button
                    key={item}
                    className={filter === item ? "active" : ""}
                    onClick={() => setFilter(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <motion.div layout className="case-grid">
              {shown.map((item, i) => (
                <motion.article
                  layout
                  key={item.title}
                  className="case-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className={`case-visual ${item.visual}`}>
                    <div className="case-ui">
                      <i />
                      <i />
                      <i />
                      <span />
                    </div>
                  </div>
                  <div className="case-copy">
                    <span>{item.category}</span>
                    <h2>{item.title}</h2>
                    <p>{item.copy}</p>
                    <footer>
                      <strong>{item.result}</strong>
                      <ArrowRight />
                    </footer>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </section>
        <PageCta title="Your project could be next." />
      </main>
    </SiteFrame>
  );
}

export function AboutPage() {
  const principles = [
    { icon: Compass, title: "Clarity before complexity", copy: "We understand the commercial problem before choosing a tool or writing code." },
    { icon: Sparkles, title: "Craft with intent", copy: "Every interaction, visual decision, and workflow must earn its place." },
    { icon: Code2, title: "Built to endure", copy: "Strong foundations make products easier to operate, improve, and scale." },
  ];
  return (
    <SiteFrame>
      <main>
        <PageHero
          eyebrow="The studio"
          title="Small team."
          accent="Serious capability."
          copy="FangScript is a focused digital studio for ambitious businesses that value sharp thinking, excellent execution, and a direct working relationship."
        />
        <section className="inner-section about-story">
          <div className="section-boundary story-grid">
            <div className="story-number">
              F/S<span>EST. 2025</span>
            </div>
            <div>
              <span className="overline">Our point of view</span>
              <h2>Technology should make business feel simpler.</h2>
              <p>
                That idea guides every FangScript engagement. We bring product thinking, design, engineering, and automation into one room—so decisions stay connected and the finished system works as one.
              </p>
              <p>
                We stay close to the work, communicate plainly, and care about what happens after launch. The result is not just something polished. It is something useful.
              </p>
            </div>
          </div>
        </section>
        <section className="inner-section principles-section">
          <div className="section-boundary">
            <div className="inner-intro">
              <span>How we work</span>
              <h2>Principles that shape the outcome.</h2>
            </div>
            <div className="principle-grid">
              {principles.map(({ icon: Icon, title, copy }) => (
                <article key={title}>
                  <Icon />
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="numbers-band">
          <div className="section-boundary">
            <div>
              <strong>5</strong>
              <span>Core Disciplines</span>
            </div>
            <div>
              <strong>100%</strong>
              <span>IP Ownership Transfer</span>
            </div>
            <div>
              <strong>0</strong>
              <span>Data Retention on AI</span>
            </div>
            <div>
              <strong>∞</strong>
              <span>Room to evolve</span>
            </div>
          </div>
        </section>
        <PageCta title="Let's make the complex feel clear." />
      </main>
    </SiteFrame>
  );
}

export function FaqPage() {
  return (
    <SiteFrame>
      <main>
        <PageHero
          eyebrow="Questions, answered"
          title="Clear from the"
          accent="very beginning."
          copy="The practical details behind working with FangScript—from first conversation to launch and beyond."
        />
        <section className="inner-section faq-page">
          <div className="section-boundary faq-layout">
            <div>
              <span className="overline">Common questions</span>
              <h2>What you may want to know.</h2>
              <p>Still deciding what you need? Tell us the business challenge. We can help define the right project.</p>
              <Link to="/contact" className="primary-link compact">
                Ask us directly <ArrowRight />
              </Link>
            </div>
            <Accordion type="single" collapsible className="faq-list">
              {faqs.map(([question, answer], i) => (
                <AccordionItem key={question} value={`item-${i}`}>
                  <AccordionTrigger>
                    <span>
                      <i>{String(i + 1).padStart(2, "0")}</i>
                      {question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p>{answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
        <PageCta
          title="Still have a question?"
          copy="Send it our way. You'll get a clear answer from the people who would work on your project."
        />
      </main>
    </SiteFrame>
  );
}

export function ContactPage() {
  const [submitting, setSubmitting] = useState(false);
  const [submittedLeadId, setSubmittedLeadId] = useState<string | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    serviceCategory: SERVICE_CATEGORIES[0]?.title ?? "Technology & Software Development",
    budget: "$15,000–$30,000",
    message: "",
    consentGiven: true,
    website_hp: "", // Honeypot field (FR-LEAD-02)
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMsg("");

    if (!formData.consentGiven) {
      setErrorMsg("Please accept the privacy policy to submit your project brief.");
      return;
    }

    setSubmitting(true);
    const result = await submitLead({
      name: formData.name,
      email: formData.email,
      company: formData.company,
      serviceCategory: formData.serviceCategory,
      budget: formData.budget,
      message: formData.message,
      consentGiven: formData.consentGiven,
      honeypot: formData.website_hp,
    });

    setSubmitting(false);
    if (result.success && result.leadId) {
      setSubmittedLeadId(result.leadId);
    } else {
      setErrorMsg(result.error || "Submission error. Please try again.");
    }
  };

  return (
    <SiteFrame>
      <main>
        <PageHero
          eyebrow="Start a project"
          title="Let's build something"
          accent="that matters."
          copy="Share the challenge, the ambition, or even the rough idea. We'll reply with useful next steps and architecture guidance—not a generic sales pitch."
        />

        <section className="inner-section contact-page">
          <div className="section-boundary contact-layout">
            <aside>
              <span className="overline">Contact & Scheduling</span>
              <h2>Begin with a conversation.</h2>
              <p>Tell us enough to understand where you are and what a successful outcome would look like.</p>

              <div className="mt-6 space-y-3">
                <a href="mailto:hello@fangscript.com" className="inline-flex items-center gap-2 text-amber-400 font-semibold text-sm hover:underline">
                  <Mail size={16} />
                  hello@fangscript.com
                </a>

                {/* Direct Calendar Booking Trigger */}
                <div className="pt-4">
                  <button
                    onClick={() => setBookingModalOpen(true)}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-amber-400/10 border border-amber-400/20 text-white hover:bg-amber-400/15 transition-all text-left group"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                        <Calendar size={14} />
                        Live Calendar Booking
                      </div>
                      <div className="text-xs text-slate-300 font-medium mt-0.5">
                        Schedule a 30-min Strategy Call
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-amber-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              <div className="contact-note">
                <Zap />
                <p>
                  <strong>What happens next?</strong>
                  <br />
                  Our engineering lead reviews your submission, prepares initial technical references, and responds within 24 business hours.
                </p>
              </div>
            </aside>

            {submittedLeadId ? (
              <div className="p-8 rounded-2xl border border-emerald-500/30 bg-[#090D1A] text-slate-200 space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <CheckCircle2 size={28} />
                </div>
                <h3 className="text-2xl font-serif text-white">Project Inquiry Received</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Thank you, <strong>{formData.name}</strong>. Your inquiry has been registered in the FangScript intake pipeline.
                  <br />
                  <span className="text-[11px] text-slate-400 font-mono mt-1 block">
                    Reference ID: {submittedLeadId}
                  </span>
                </p>

                <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-amber-400 font-medium">
                    <ShieldCheck size={14} />
                    Verified Details & Consent
                  </div>
                  <p className="text-slate-400">
                    Category: <span className="text-white">{formData.serviceCategory}</span> • Budget Tier: <span className="text-white">{formData.budget}</span>
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Consent timestamped per GDPR Article 7 standards.
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap gap-3">
                  <button
                    onClick={() => setBookingModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-semibold hover:bg-amber-300 transition-colors"
                  >
                    <Calendar size={13} />
                    Book Instant Strategy Call
                  </button>
                  <button
                    onClick={() => {
                      setSubmittedLeadId(null);
                      setFormData({
                        name: "",
                        email: "",
                        company: "",
                        serviceCategory: SERVICE_CATEGORIES[0]?.title ?? "Technology & Software Development",
                        budget: "$15,000–$30,000",
                        message: "",
                        consentGiven: true,
                        website_hp: "",
                      });
                    }}
                    className="px-4 py-2 rounded-xl bg-white/5 text-xs text-slate-300 hover:text-white transition-colors"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Honeypot field (hidden from real users, catches bots per FR-LEAD-02) */}
                <div style={{ display: "none" }} aria-hidden="true">
                  <label htmlFor="website_hp">Leave this empty</label>
                  <input
                    id="website_hp"
                    name="website_hp"
                    tabIndex={-1}
                    autoComplete="off"
                    value={formData.website_hp}
                    onChange={(e) => setFormData({ ...formData, website_hp: e.target.value })}
                  />
                </div>

                <div className="field-row">
                  <label>
                    Your name *
                    <input
                      name="name"
                      required
                      autoComplete="name"
                      placeholder="Jane Smith"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </label>
                  <label>
                    Work email *
                    <input
                      name="email"
                      required
                      type="email"
                      autoComplete="email"
                      placeholder="jane@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </label>
                </div>

                <div className="field-row">
                  <label>
                    Company or Organization
                    <input
                      name="company"
                      autoComplete="organization"
                      placeholder="Acme Corp"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    />
                  </label>
                  <label>
                    Service Discipline *
                    <select
                      name="serviceCategory"
                      value={formData.serviceCategory}
                      onChange={(e) => setFormData({ ...formData, serviceCategory: e.target.value })}
                    >
                      {SERVICE_CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.title}>
                          {cat.title} ({cat.badge})
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label>
                  Indicative investment range
                  <select
                    name="budget"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  >
                    <option value="Under $5,000">Under $5,000 (Small sprint / advisory)</option>
                    <option value="$5,000–$15,000">$5,000–$15,000 (Focused website / MVP tool)</option>
                    <option value="$15,000–$30,000">$15,000–$30,000 (Full web application / AI RAG system)</option>
                    <option value="$30,000+">$30,000+ (Multi-service enterprise platform)</option>
                    <option value="Let's discuss">Let's discuss during discovery</option>
                  </select>
                </label>

                <label>
                  Tell us about the project *
                  <textarea
                    name="message"
                    required
                    rows={5}
                    placeholder="What commercial objective, product feature, or operational workflow are you aiming to solve or launch?"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </label>

                {/* Explicit GDPR Consent Checkbox (FR-LEAD-03, NFR-PRV-03) */}
                <div className="flex items-start gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="lead-consent"
                    required
                    checked={formData.consentGiven}
                    onChange={(e) => setFormData({ ...formData, consentGiven: e.target.checked })}
                    className="mt-0.5 rounded border-white/20 bg-white/5 text-amber-400 focus:ring-0"
                  />
                  <label htmlFor="lead-consent" className="text-xs text-slate-400 font-normal leading-relaxed cursor-pointer">
                    I consent to FangScript storing and processing my project information to provide architectural advice and proposal scopes per the{" "}
                    <Link to="/privacy" className="text-amber-400 hover:underline">
                      Privacy Policy
                    </Link>.
                  </label>
                </div>

                {errorMsg && (
                  <div className="flex items-center gap-2 text-rose-400 text-xs">
                    <AlertCircle size={14} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="form-submit">
                  <button className="gold-button" type="submit" disabled={submitting}>
                    {submitting ? "Transmitting Brief..." : "Submit Project Brief"} <ArrowRight />
                  </button>
                  <p>
                    Your brief triggers an automated lead evaluation event and is reviewed by our engineering leadership.
                  </p>
                </div>
              </form>
            )}
          </div>
        </section>
      </main>

      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        preselectedCategory={formData.serviceCategory}
      />
    </SiteFrame>
  );
}
