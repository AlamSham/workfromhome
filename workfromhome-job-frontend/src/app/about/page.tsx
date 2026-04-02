import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — RemoteJobDesk",
  description:
    "Learn about RemoteJobDesk — your daily source for fresh remote and work-from-home jobs across the US, UK, and Europe.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6 lg:px-10">
      <header className="fade-up glass-card p-6 sm:p-10">
        <span className="inline-flex rounded-full bg-brand/10 px-3 py-1 text-xs font-bold tracking-widest text-brand-ink uppercase">
          About Us
        </span>
        <h1 className="mt-3 font-serif text-3xl font-bold text-slate-900 sm:text-4xl">
          Your Daily Remote Job Feed
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          RemoteJobDesk is a free job discovery platform aggregating the best
          work-from-home opportunities across the United States, United Kingdom,
          and Europe — updated every day.
        </p>
      </header>

      <section className="fade-up glass-card p-6 sm:p-10 space-y-5">
        <h2 className="section-title">What We Do</h2>
        <p className="text-sm leading-7 text-slate-600">
          We automatically collect remote job listings from dozens of trusted
          sources — job boards, company career pages, and RSS feeds. Each
          listing is enhanced with AI-generated metadata to help you quickly
          determine if a role is a good fit.
        </p>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-slate-600">
          <li>✅ 100% remote / work-from-home positions only</li>
          <li>✅ Listings from US, UK, EU and global companies</li>
          <li>✅ AI-enhanced titles and descriptions for clarity</li>
          <li>✅ Updated daily with fresh listings</li>
          <li>✅ Free to use — no sign-up required</li>
        </ul>
      </section>

      <section className="fade-up glass-card p-6 sm:p-10 space-y-4">
        <h2 className="section-title">Our Mission</h2>
        <p className="text-sm leading-7 text-slate-600">
          We believe the future of work is remote. Our mission is to make it
          easier for professionals everywhere to discover legitimate
          work-from-home opportunities without having to search dozens of
          different websites every day.
        </p>
      </section>

      <section className="fade-up glass-card p-6 sm:p-10 space-y-4">
        <h2 className="section-title">Disclaimer</h2>
        <p className="text-sm leading-7 text-slate-600">
          RemoteJobDesk aggregates publicly available job listings. We do not
          post jobs ourselves and are not responsible for the accuracy of
          individual listings. Always verify job details directly on the
          employer&apos;s website before applying.
        </p>
      </section>
    </div>
  );
}
