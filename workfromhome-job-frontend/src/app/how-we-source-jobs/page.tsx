import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How We Source Jobs — RemoteJobDesk",
  description:
    "See how RemoteJobDesk collects, filters, categorizes, and refreshes remote job listings across the US, UK, and Europe.",
};

const STEPS = [
  {
    title: "1. Source Collection",
    body:
      "We collect listings from public job feeds, employer pages, APIs, and other trusted remote-job sources. We focus on listings that appear accessible, current, and relevant to remote work seekers.",
  },
  {
    title: "2. Relevance Filtering",
    body:
      "Incoming listings are filtered to reduce irrelevant news stories, duplicate entries, and pages that do not clearly represent an actual job opening.",
  },
  {
    title: "3. Country and Category Mapping",
    body:
      "We map listings into supported countries and categories when the source text provides enough evidence. If a listing is too vague, we avoid over-claiming precision.",
  },
  {
    title: "4. SEO and Display Enrichment",
    body:
      "We generate concise SEO fields and UI summaries to help job seekers scan listings faster, while preserving a direct link back to the original source page.",
  },
  {
    title: "5. Expiry and Cleanup",
    body:
      "Listings are automatically re-evaluated over time. Old, expired, or inaccessible jobs are removed so that search engines and users are less likely to encounter stale openings.",
  },
];

export default function HowWeSourceJobsPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6 lg:px-10">
      <header className="fade-up glass-card p-6 sm:p-10">
        <span className="inline-flex rounded-full bg-brand/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-brand-ink">
          Source Policy
        </span>
        <h1 className="mt-3 font-serif text-3xl font-bold text-slate-900 sm:text-4xl">
          How RemoteJobDesk Sources Jobs
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          We aggregate remote job opportunities from multiple public sources and
          use filtering, deduplication, and metadata enrichment to present them
          in a cleaner format for job seekers.
        </p>
      </header>

      <section className="fade-up glass-card p-6 sm:p-10">
        <h2 className="section-title">Our Workflow</h2>
        <div className="mt-5 grid gap-4">
          {STEPS.map(({ title, body }) => (
            <article key={title} className="rounded-2xl bg-slate-50 p-5">
              <h3 className="text-base font-bold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="fade-up glass-card p-6 sm:p-10 space-y-4">
        <h2 className="section-title">What We Do Not Promise</h2>
        <p className="text-sm leading-7 text-slate-600">
          We do not guarantee that every role remains open after publication, and
          we are not the employer for the jobs listed on this site. Final
          application details, compensation, hiring timelines, and eligibility
          rules should always be confirmed on the employer&apos;s own site.
        </p>
      </section>

      <section className="fade-up glass-card p-6 sm:p-10 space-y-4">
        <h2 className="section-title">Why This Matters</h2>
        <p className="text-sm leading-7 text-slate-600">
          Search engines and users both prefer transparent job sites. Clear
          sourcing, accurate freshness signals, and honest summaries help build
          trust and improve the long-term quality of the site.
        </p>
      </section>
    </div>
  );
}
