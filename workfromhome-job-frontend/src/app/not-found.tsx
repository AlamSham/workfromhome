import Link from "next/link";
import { JOB_CATEGORIES, getJobCategoryPath } from "./lib/jobCategories";
import { SEO_COUNTRIES } from "./lib/seoCountries";

export default function NotFound() {
  const topCategories = JOB_CATEGORIES.slice(0, 8);
  const topCountries = SEO_COUNTRIES.slice(0, 6);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-4 py-16 sm:px-6 sm:py-24">
      <div className="w-full rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-xl shadow-slate-100/50 backdrop-blur-sm sm:p-12 text-center">
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3.5 py-1.5 text-xs font-bold text-amber-700 ring-1 ring-amber-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
          404 • Position Filled or Expired
        </div>

        {/* Heading */}
        <h1 className="mt-4 font-serif text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          This Remote Job Is No Longer Available
        </h1>

        {/* Description */}
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
          The listing you were looking for has either been filled by the employer or reached its closing date.
          Don&apos;t worry — hundreds of fresh, verified work-from-home jobs are hiring right now!
        </p>

        {/* Search Bar */}
        <div className="mx-auto mt-8 max-w-xl">
          <form action="/" method="GET" className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-white p-1.5 shadow-sm focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition">
            <svg
              className="ml-3 h-5 w-5 text-slate-400 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              name="search"
              placeholder="Search remote jobs (e.g. Customer Support, React, Data Entry)..."
              className="w-full bg-transparent px-2 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
            >
              Search
            </button>
          </form>
        </div>

        {/* Primary CTA */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-600 transition"
          >
            <span>⚡ Browse 1,000+ Active Remote Jobs</span>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
          <Link
            href="/blog"
            className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Read Career Guides
          </Link>
        </div>

        {/* Divider */}
        <div className="my-10 h-px w-full bg-slate-100" />

        {/* Category Pills */}
        <div className="text-left sm:text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Popular Job Categories
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {topCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={getJobCategoryPath(cat.slug)}
                className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-blue-300 hover:bg-blue-50/60 hover:text-blue-700 transition"
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Country Quick Links */}
        <div className="mt-6 text-left sm:text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Jobs by Location
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {topCountries.map((country) => (
              <Link
                key={country.slug}
                href={`/remote-jobs-in-${country.slug}`}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-slate-400 hover:text-slate-900 transition"
              >
                {country.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
