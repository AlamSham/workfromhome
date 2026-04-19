import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Editorial Policy — RemoteJobDesk",
  description:
    "Learn how RemoteJobDesk reviews, updates, and maintains remote job listings, SEO metadata, and site quality standards.",
};

const PRINCIPLES = [
  {
    title: "Freshness First",
    body:
      "We prioritize recently published remote roles and remove expired listings as quickly as possible. Job availability can change at the source, so we encourage applicants to verify the employer page before applying.",
  },
  {
    title: "Single Job, Clear Intent",
    body:
      "We only aim to publish pages dedicated to a single job posting, with a clear title, description, location eligibility, and source link. We avoid list-page markup for individual job structured data.",
  },
  {
    title: "People-First Presentation",
    body:
      "We rewrite and organize metadata to make listings easier to understand, but we do not invent salary, benefits, requirements, or employer facts that are not available from the source material.",
  },
  {
    title: "Source Transparency",
    body:
      "Every listing links back to its original publisher or employer source. If a source appears broken, misleading, or expired, we may remove the listing from our site.",
  },
  {
    title: "Ongoing Corrections",
    body:
      "We improve titles, snippets, categorization, and country targeting over time. When we discover inaccurate categorization or low-quality source content, we update or remove the page.",
  },
];

export default function EditorialPolicyPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6 lg:px-10">
      <header className="fade-up glass-card p-6 sm:p-10">
        <span className="inline-flex rounded-full bg-brand/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-brand-ink">
          Editorial Policy
        </span>
        <h1 className="mt-3 font-serif text-3xl font-bold text-slate-900 sm:text-4xl">
          How We Review and Maintain Job Listings
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          RemoteJobDesk is designed to help job seekers discover fresh remote
          opportunities quickly. This page explains how we source listings,
          enrich metadata, and decide when a job page should be updated or
          removed.
        </p>
      </header>

      <section className="fade-up glass-card p-6 sm:p-10">
        <h2 className="section-title">Our Standards</h2>
        <div className="mt-5 grid gap-4">
          {PRINCIPLES.map(({ title, body }) => (
            <article key={title} className="rounded-2xl bg-slate-50 p-5">
              <h3 className="text-base font-bold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="fade-up glass-card p-6 sm:p-10 space-y-4">
        <h2 className="section-title">Metadata and AI Assistance</h2>
        <p className="text-sm leading-7 text-slate-600">
          We may use automation and AI assistance to improve job titles, write
          concise meta descriptions, and group roles into useful categories.
          These enhancements are intended to make listings easier to browse, not
          to change the meaning of the job itself.
        </p>
        <p className="text-sm leading-7 text-slate-600">
          If source material is thin or unclear, we prefer shorter, more honest
          summaries over exaggerated claims. We do not intentionally publish
          misleading salary claims, fake urgency, or invented employer details.
        </p>
      </section>

      <section className="fade-up glass-card p-6 sm:p-10 space-y-4">
        <h2 className="section-title">Removal and Correction Policy</h2>
        <p className="text-sm leading-7 text-slate-600">
          Listings may be removed when they are expired, no longer accessible,
          duplicated, incorrectly categorized, or appear inconsistent with their
          source. We also review user-reported issues and may make corrections
          when a listing no longer meets our quality standards.
        </p>
        <p className="text-sm leading-7 text-slate-600">
          To report a problem with a listing, contact us through the{" "}
          <a href="/contact" className="font-semibold text-brand-ink hover:underline">
            contact page
          </a>
          .
        </p>
      </section>
    </div>
  );
}
