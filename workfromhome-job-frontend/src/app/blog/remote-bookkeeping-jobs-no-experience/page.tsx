import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Remote Bookkeeping Jobs with No Experience — 2026 Career Guide",
  description:
    "Learn how to land entry-level remote bookkeeping jobs with no prior experience. Covers top hiring companies, essential software skills (QuickBooks, Xero), salary ranges ($35K–$65K), and application strategies.",
  keywords: [
    "remote bookkeeping jobs no experience",
    "entry level remote bookkeeping jobs",
    "work from home bookkeeping",
    "online bookkeeping jobs for beginners",
    "virtual bookkeeper no degree",
    "remote accounting jobs entry level",
  ],
  alternates: { canonical: "/blog/remote-bookkeeping-jobs-no-experience" },
};

const TOP_COMPANIES = [
  { name: "AccountingDepartment.com", role: "Full-Charge Virtual Bookkeeper", pay: "$40,000 – $60,000 / yr", notes: "Provides comprehensive training on QuickBooks and virtual client management. 100% remote for US candidates." },
  { name: "Belay Solutions", role: "Virtual Bookkeeper (Contract)", pay: "$20 – $28 / hr", notes: "Hires entry-level and mid-level virtual bookkeepers to assist small business clients. Flexible part-time hours." },
  { name: "Intuit (QuickBooks Live)", role: "Associate Bookkeeper", pay: "$22 – $32 / hr + bonus", notes: "Offers remote onboarding and training programs for individuals with basic math and organization skills." },
  { name: "Upwork & Fiverr Pro", role: "Freelance Virtual Bookkeeper", pay: "$25 – $50 / hr", notes: "Ideal for beginners looking to build a portfolio by offering basic bookkeeping, invoicing, and expense tracking." },
];

export default function RemoteBookkeepingJobsNoExperience() {
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Remote Bookkeeping Jobs with No Experience — 2026 Career Guide",
    description: "Learn how to land entry-level remote bookkeeping jobs with no prior experience. Covers hiring companies, software skills, and salaries.",
    datePublished: "2026-08-15",
    dateModified: "2026-08-15",
    author: { "@type": "Organization", name: "RemoteJobDesk" },
    publisher: { "@type": "Organization", name: "RemoteJobDesk" },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Can I get a remote bookkeeping job with no experience?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! Many virtual assistant agencies and accounting firms hire entry-level remote bookkeepers. You do not need a CPA or accounting degree — basic math skills, attention to detail, and familiarity with QuickBooks or Excel are sufficient to get started."
        }
      },
      {
        "@type": "Question",
        name: "How much do entry-level remote bookkeepers make?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Entry-level remote bookkeepers typically earn between $18 and $28 per hour ($35,000 to $55,000 annually). Experienced virtual bookkeepers or specialized freelancers can make $65,000+ per year."
        }
      },
      {
        "@type": "Question",
        name: "What software should I learn for remote bookkeeping?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "QuickBooks Online and Xero are the industry standards. Free online courses and certifications offered directly by QuickBooks (QuickBooks ProAdvisor certification) can significantly boost your resume."
        }
      }
    ]
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6 lg:px-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* Breadcrumb */}
      <nav className="fade-up flex items-center gap-2 text-sm text-slate-500">
        <Link href="/" className="hover:text-brand-ink transition">Home</Link>
        <span>/</span>
        <Link href="/blog" className="hover:text-brand-ink transition">Blog</Link>
        <span>/</span>
        <span className="text-slate-200 font-semibold line-clamp-1">Remote Bookkeeping Jobs No Experience</span>
      </nav>

      <article className="fade-up glass-card rounded-3xl p-6 sm:p-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="badge bg-cyan-500/10 text-cyan-400">Career Guide</span>
          <span className="text-xs text-slate-400 font-semibold">6 min read</span>
          <span className="ml-auto text-xs text-slate-500">Aug 15, 2026</span>
        </div>

        <h1 className="font-serif text-2xl font-bold text-slate-100 sm:text-3xl leading-tight">
          Remote Bookkeeping Jobs with No Experience — 2026 Career Guide
        </h1>

        <p className="mt-4 text-sm leading-7 text-slate-300">
          Bookkeeping is one of the fastest-growing remote careers that does not require a college degree or CPA certification. 
          Small businesses, e-commerce stores, and digital agencies across the US and Europe are constantly seeking reliable 
          virtual bookkeepers to record transactions, manage invoices, and balance financial accounts.
        </p>

        <div className="mt-6 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-2">Key Highlights</p>
          <ul className="text-sm text-slate-300 space-y-2">
            <li>✅ <strong>Average Starting Pay:</strong> $20 – $28 per hour ($40K+ annual)</li>
            <li>✅ <strong>Degree Requirement:</strong> None required (High School Diploma / GED is sufficient)</li>
            <li>✅ <strong>Top Tools to Master:</strong> QuickBooks Online, Xero, Microsoft Excel / Google Sheets</li>
            <li>✅ <strong>Work Hours:</strong> High flexibility — full-time, part-time, or freelance hours</li>
          </ul>
        </div>

        <h2 className="mt-8 text-xl font-bold text-slate-100">Why Remote Bookkeeping is Ideal for Beginners</h2>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          Unlike financial auditing or CPA accounting, bookkeeping focuses on basic financial recordkeeping: categorizing expenses, 
          reconciling bank statements, and sending client invoices. Because these tasks rely heavily on cloud software, 
          100% of the work can be done from home on a laptop.
        </p>

        <h2 className="mt-8 text-xl font-bold text-slate-100">Top 4 Companies Hiring Entry-Level Remote Bookkeepers</h2>
        <div className="mt-4 space-y-4">
          {TOP_COMPANIES.map((company) => (
            <div key={company.name} className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-bold text-cyan-400">{company.name}</h3>
                <span className="badge bg-emerald-500/10 text-emerald-400 text-xs">{company.pay}</span>
              </div>
              <p className="mt-1 text-xs font-semibold text-slate-300">Role: {company.role}</p>
              <p className="mt-2 text-xs leading-6 text-slate-400">{company.notes}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-8 text-xl font-bold text-slate-100">3 Steps to Get Hired with Zero Experience</h2>
        <ol className="mt-4 space-y-3 text-sm leading-7 text-slate-300 list-decimal pl-5">
          <li><strong>Get Certified for Free:</strong> Take the free QuickBooks ProAdvisor certification course on Intuit. It takes 10-15 hours and immediately adds legitimacy to your resume.</li>
          <li><strong>Master Basic Excel Functions:</strong> Practice SUM, VLOOKUP, and Pivot Tables. Small businesses love virtual bookkeepers who can organize data cleanly.</li>
          <li><strong>Target Virtual Staffing Agencies:</strong> Apply to virtual assistant firms like Belay, Time etc, and Boldly, which place entry-level bookkeepers with business clients.</li>
        </ol>
      </article>

      {/* FAQ */}
      <section className="glass-card fade-up rounded-3xl p-6 sm:p-8">
        <h2 className="section-title">Frequently Asked Questions</h2>
        <div className="mt-4 space-y-4">
          {faqJsonLd.mainEntity.map((item, index) => (
            <details key={index} className="group rounded-2xl bg-slate-900/60 border border-slate-800 p-4" open={index === 0}>
              <summary className="cursor-pointer text-sm font-bold text-slate-200 leading-6 group-open:mb-2 group-open:text-cyan-400 transition-colors">
                {item.name}
              </summary>
              <p className="text-sm leading-7 text-slate-400">{item.acceptedAnswer.text}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="glass-card fade-up rounded-3xl p-6 sm:p-8 text-center">
        <h2 className="section-title">Start Searching Remote Opportunities</h2>
        <p className="mt-2 text-sm text-slate-400">Explore active work-from-home positions updated hourly.</p>
        <div className="mt-4 flex flex-wrap gap-3 justify-center">
          <Link href="/" className="btn-primary">Browse All Remote Jobs →</Link>
          <Link href="/remote-jobs-in-us" className="btn-outline">🇺🇸 Remote US Jobs</Link>
        </div>
      </section>
    </div>
  );
}
