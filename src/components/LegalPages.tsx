import { motion } from "motion/react";
import { Shield, Lock, FileText, CheckCircle, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { PageHero, SiteFrame } from "@/components/SiteChrome";

export function PrivacyPage() {
  return (
    <SiteFrame>
      <main>
        <PageHero
          eyebrow="Privacy & Compliance"
          title="Data Protection"
          accent="& Transparency."
          copy="How FangScript collects, protects, and handles your project data, consent timestamps, and communication privacy."
        />

        <section className="inner-section py-16">
          <div className="section-boundary max-w-4xl mx-auto space-y-12 text-slate-300 text-sm leading-relaxed">
            <div className="p-6 rounded-2xl bg-amber-400/5 border border-amber-400/20 flex items-start gap-4">
              <Shield className="text-amber-400 shrink-0 mt-1" size={24} />
              <div>
                <h2 className="text-white text-base font-semibold mb-1">Our Core Privacy Commitment</h2>
                <p className="text-slate-400 text-xs">
                  We believe in minimal data footprint. We do not sell personal data, we enforce explicit consent logging, and your proprietary business data is never used to train public LLM foundation models.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <span className="text-amber-400">01.</span> Information We Collect
              </h2>
              <p className="mb-3">
                When you interact with the FangScript Platform (through inquiry forms, discovery scheduling, or the public AI assistant), we record:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
                <li><strong>Contact details:</strong> Name, professional email address, company name, and project requirements.</li>
                <li><strong>Consent records:</strong> Explicit timestamp (`consent_timestamp`) and IP-derived location confirming when consent was granted.</li>
                <li><strong>Attribution telemetry:</strong> Referral source, landing page, and UTM campaign parameters (stored without invasive cross-site tracking).</li>
                <li><strong>AI interaction metrics:</strong> Anonymized query logs, latency metrics, and token consumption to verify grounding and safety.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <span className="text-amber-400">02.</span> Enterprise AI Safety & Data Governance
              </h2>
              <p className="mb-3">
                In accordance with our architecture guidelines:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
                <li><strong>Zero Model Training:</strong> All interactions with OpenAI, Anthropic, or local model APIs execute under strict enterprise terms where zero user data is retained for foundation model training.</li>
                <li><strong>Retrieval Guardrails:</strong> The public chatbot has read-only access strictly to public service documentation. It cannot access client tenant databases or internal repositories.</li>
                <li><strong>Human-in-the-Loop:</strong> Internal AI agents (Hermes) only draft proposals or workflows; execution requires human authorization.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <span className="text-amber-400">03.</span> Data Retention & Your Rights (GDPR / CCPA)
              </h2>
              <p className="mb-3">
                You retain complete control over your personal information:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h3 className="font-semibold text-white text-xs mb-1">Right to Access & Export</h3>
                  <p className="text-xs text-slate-400">Request a full machine-readable JSON export of all inquiry history and project records associated with your email.</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h3 className="font-semibold text-white text-xs mb-1">Right to Complete Deletion</h3>
                  <p className="text-xs text-slate-400">Request immediate permanent erasure of your contact information and lead history from our active databases.</p>
                </div>
              </div>
              <p>
                To exercise any privacy rights, email our team directly at{" "}
                <a href="mailto:privacy@fangscript.com" className="text-amber-400 underline">
                  privacy@fangscript.com
                </a>.
              </p>
            </div>

            <div className="pt-6 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-slate-500">Last updated: October 11, 2026 • FangScript Legal</span>
              <Link to="/contact" className="text-xs font-semibold text-amber-400 hover:underline flex items-center gap-1">
                Have questions? Contact us <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </SiteFrame>
  );
}

export function TermsPage() {
  return (
    <SiteFrame>
      <main>
        <PageHero
          eyebrow="Legal & Commercial"
          title="Terms of Service"
          accent="& Engagement."
          copy="The commercial agreements, intellectual property ownership, and operating standards that govern client partnerships with FangScript."
        />

        <section className="inner-section py-16">
          <div className="section-boundary max-w-4xl mx-auto space-y-12 text-slate-300 text-sm leading-relaxed">
            <div className="p-6 rounded-2xl bg-amber-400/5 border border-amber-400/20 flex items-start gap-4">
              <FileText className="text-amber-400 shrink-0 mt-1" size={24} />
              <div>
                <h2 className="text-white text-base font-semibold mb-1">Client-First Code & IP Ownership</h2>
                <p className="text-slate-400 text-xs">
                  We engineer enduring assets for your business. Upon project completion and milestone payment, your company owns 100% of all bespoke code, schemas, and design systems.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <span className="text-amber-400">01.</span> Scope of Services & Milestones
              </h2>
              <p className="mb-3">
                All client engagements operate under defined milestone agreements. FangScript provides a detailed scope of deliverables, engineering specifications, and fixed or phased investment schedule prior to commencing work.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
                <li>Changes to project specifications are reviewed and approved in writing as formal change requests.</li>
                <li>Milestones include structured demo walk-throughs and an acceptance review period.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <span className="text-amber-400">02.</span> Intellectual Property & Licensing
              </h2>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
                <li><strong>Custom Deliverables:</strong> All custom code, database designs, branding assets, and documentation created specifically for the client become the exclusive property of the client upon final payment.</li>
                <li><strong>Third-Party Components:</strong> Open-source libraries and frameworks (React, PostgreSQL, etc.) remain subject to their respective open-source licenses (MIT, Apache, etc.).</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <span className="text-amber-400">03.</span> Warranty, Maintenance & SLAs
              </h2>
              <p className="mb-3">
                We stand behind our engineering. FangScript provides a standard 30-day post-launch warranty on all custom software to remediate any bugs or functional deviations from agreed technical specifications without additional charge. Ongoing SLA and uptime maintenance agreements are available under separate service schedules.
              </p>
            </div>

            <div className="pt-6 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-slate-500">Effective: October 2026 • FangScript Legal</span>
              <Link to="/contact" className="text-xs font-semibold text-amber-400 hover:underline flex items-center gap-1">
                Start a conversation <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </SiteFrame>
  );
}
