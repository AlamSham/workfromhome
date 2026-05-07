import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How to Get a Remote Job With No Experience — Complete Guide 2026",
  description:
    "Step-by-step guide to landing your first remote job with zero experience. Resume tips, best entry-level roles, interview strategies, and free resources to get started.",
  keywords: [
    "how to get remote job no experience", "remote job no experience",
    "work from home no experience", "entry level remote jobs",
    "first remote job", "remote job for beginners", "wfh no experience",
    "online jobs no experience", "remote job tips for beginners",
  ],
  alternates: { canonical: "/blog/how-to-get-remote-job-no-experience" },
};

const STEPS = [
  { step: 1, title: "Pick a Remote-Friendly Skill", body: "Not every skill translates to remote work. Focus on digital-first skills: customer support, data entry, social media management, content writing, basic coding, or virtual assistance. These require nothing more than a laptop and internet connection." },
  { step: 2, title: "Build a Portfolio (Even Without a Job)", body: "Create sample work to prove your abilities. Write blog posts, design social media templates, build a simple website, or complete online courses with certificates. Platforms like Coursera, Google Career Certificates, and freeCodeCamp offer free, credible credentials." },
  { step: 3, title: "Optimize Your Resume for Remote Work", body: "Highlight self-discipline, communication skills, and tech proficiency. Mention tools you know (Slack, Zoom, Trello, Google Workspace). Add a 'Remote Work Skills' section listing time management, async communication, and self-motivation." },
  { step: 4, title: "Apply on Remote-First Job Boards", body: "Skip generic job sites. Focus on remote-specific platforms like RemoteJobDesk, We Work Remotely, FlexJobs, and Remote.co. These filter out in-office roles so every listing is genuinely remote." },
  { step: 5, title: "Ace the Virtual Interview", body: "Test your camera, microphone, and internet before the call. Use a clean, well-lit background. Practice common questions aloud. Many remote companies also use async video interviews — record yourself practicing to improve confidence and delivery." },
  { step: 6, title: "Start With Freelance or Contract Work", body: "If full-time remote jobs seem competitive, start with freelancing on Upwork, Fiverr, or Toptal. Build a track record of remote work, then leverage those references for full-time positions." },
];

const ENTRY_ROLES = [
  { role: "Customer Support Agent", salary: "$30K – $50K", difficulty: "Easy" },
  { role: "Virtual Assistant", salary: "$25K – $45K", difficulty: "Easy" },
  { role: "Data Entry Specialist", salary: "$28K – $40K", difficulty: "Easy" },
  { role: "Social Media Manager", salary: "$35K – $55K", difficulty: "Medium" },
  { role: "Content Writer", salary: "$35K – $60K", difficulty: "Medium" },
  { role: "Junior QA Tester", salary: "$40K – $65K", difficulty: "Medium" },
  { role: "Sales Development Rep", salary: "$40K – $70K + commission", difficulty: "Medium" },
  { role: "Technical Support", salary: "$35K – $55K", difficulty: "Easy" },
];

export default function HowToGetRemoteJob() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Get a Remote Job With No Experience",
    description: "Step-by-step guide to landing your first work-from-home job.",
    step: STEPS.map((s) => ({
      "@type": "HowToStep",
      position: s.step,
      name: s.title,
      text: s.body,
    })),
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: "Can you get a remote job with no experience?", acceptedAnswer: { "@type": "Answer", text: "Absolutely. Roles like customer support, virtual assistant, data entry, and content writing are entry-level friendly and don't require prior remote work experience. Focus on transferable skills and build a small portfolio to stand out." } },
      { "@type": "Question", name: "What is the easiest remote job to get?", acceptedAnswer: { "@type": "Answer", text: "Customer support and virtual assistant roles are the easiest remote jobs to land. They require strong communication skills and basic computer proficiency, but typically no specialized training or degree." } },
      { "@type": "Question", name: "How long does it take to find a remote job?", acceptedAnswer: { "@type": "Answer", text: "On average, it takes 2-8 weeks to land a remote job when actively applying. The timeline depends on your skills, the number of applications, and how well your resume is optimized for remote positions." } },
    ],
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6 lg:px-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <nav className="fade-up flex items-center gap-2 text-sm text-slate-500">
        <Link href="/" className="hover:text-brand-ink transition">Home</Link>
        <span>/</span>
        <Link href="/blog" className="hover:text-brand-ink transition">Blog</Link>
        <span>/</span>
        <span className="text-slate-800 font-semibold">Get Remote Job — No Experience</span>
      </nav>

      <article className="fade-up glass-card rounded-3xl p-6 sm:p-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="badge bg-brand/10 text-brand-ink">Getting Started</span>
          <span className="text-xs text-slate-400 font-semibold">10 min read</span>
        </div>
        <h1 className="font-serif text-2xl font-bold text-slate-900 sm:text-3xl leading-tight">
          How to Get a Remote Job With No Experience — Complete Guide
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          Think you need years of experience to work from home? Think again. Thousands of companies hire 
          remote workers with zero prior experience every month. This guide walks you through exactly how to 
          land your first remote job — from picking the right skill to acing the virtual interview.
        </p>
      </article>

      {/* Steps */}
      {STEPS.map((s) => (
        <section key={s.step} className="fade-up glass-card rounded-2xl p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white text-sm font-black shrink-0">
              {s.step}
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{s.title}</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">{s.body}</p>
            </div>
          </div>
        </section>
      ))}

      {/* Entry Level Roles Table */}
      <section className="glass-card fade-up rounded-3xl p-6 sm:p-8">
        <h2 className="section-title">Best Entry-Level Remote Jobs (No Experience Needed)</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-bold uppercase tracking-widest text-slate-400 border-b">
                <th className="pb-3 pr-4">Role</th>
                <th className="pb-3 pr-4">Salary Range</th>
                <th className="pb-3">Difficulty</th>
              </tr>
            </thead>
            <tbody>
              {ENTRY_ROLES.map((r) => (
                <tr key={r.role} className="border-b border-slate-100">
                  <td className="py-3 pr-4 font-semibold text-slate-800">{r.role}</td>
                  <td className="py-3 pr-4 text-slate-600">{r.salary}</td>
                  <td className="py-3">
                    <span className={`badge ${r.difficulty === "Easy" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                      {r.difficulty}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="glass-card fade-up rounded-3xl p-6 sm:p-8">
        <h2 className="section-title">Frequently Asked Questions</h2>
        <div className="mt-4 space-y-4">
          <details className="group rounded-2xl bg-slate-50 p-4" open>
            <summary className="cursor-pointer text-sm font-bold text-slate-800 leading-6 group-open:mb-2">Can you get a remote job with no experience?</summary>
            <p className="text-sm leading-7 text-slate-600">Absolutely. Roles like customer support, virtual assistant, data entry, and content writing are entry-level friendly and don&apos;t require prior remote work experience.</p>
          </details>
          <details className="group rounded-2xl bg-slate-50 p-4">
            <summary className="cursor-pointer text-sm font-bold text-slate-800 leading-6 group-open:mb-2">What is the easiest remote job to get?</summary>
            <p className="text-sm leading-7 text-slate-600">Customer support and virtual assistant roles are the easiest remote jobs to land. They require strong communication skills and basic computer proficiency.</p>
          </details>
          <details className="group rounded-2xl bg-slate-50 p-4">
            <summary className="cursor-pointer text-sm font-bold text-slate-800 leading-6 group-open:mb-2">How long does it take to find a remote job?</summary>
            <p className="text-sm leading-7 text-slate-600">On average, it takes 2-8 weeks to land a remote job when actively applying. Optimize your resume and apply to 5-10 positions daily for best results.</p>
          </details>
        </div>
      </section>

      {/* CTA */}
      <section className="glass-card fade-up rounded-3xl p-6 sm:p-8 text-center">
        <h2 className="section-title">Start Your Remote Job Search Today</h2>
        <p className="mt-2 text-sm text-slate-600">Browse entry-level remote jobs across 22 countries.</p>
        <div className="mt-4 flex flex-wrap gap-3 justify-center">
          <Link href="/" className="btn-primary">Browse Remote Jobs →</Link>
          <Link href="/remote-customer-support-jobs" className="btn-outline">Support Jobs</Link>
          <Link href="/remote-sales-jobs" className="btn-outline">Sales Jobs</Link>
        </div>
      </section>
    </div>
  );
}
