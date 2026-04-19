import { Manrope, Playfair_Display } from "next/font/google";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/react";
import { JOB_CATEGORIES, getJobCategoryPath } from "./lib/jobCategories";
import { getCompanyPath } from "./lib/companies";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  preload: false,
});

export const metadata: Metadata = {
  title: {
    default: "RemoteJobDesk — Work From Home Jobs in US & Europe",
    template: "%s | RemoteJobDesk",
  },
  description:
    "Browse thousands of fresh remote and work-from-home jobs across the US, UK, and Europe. Updated daily with AI-enhanced listings.",
  keywords: ["remote jobs", "work from home", "wfh jobs", "remote work US", "online jobs"],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "RemoteJobDesk",
    title: "RemoteJobDesk — Work From Home Jobs in US & Europe",
    description:
      "Browse thousands of fresh remote and work-from-home jobs. Updated daily.",
  },
  twitter: {
    card: "summary_large_image",
    title: "RemoteJobDesk — Work From Home Jobs",
    description: "Fresh remote jobs updated daily for US & Europe.",
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://remotejobdesk.com"
  ),
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const featuredCategories = JOB_CATEGORIES.slice(0, 6);
  const featuredCompanies = [
    "Amazon",
    "NVIDIA",
    "Cloudera",
    "Honeycomb.io",
  ];
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/* ── Navbar ── */}
        <nav className="sticky top-0 z-50 border-b border-white/60 bg-white/80 backdrop-blur-md shadow-sm">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
            <Link
              href="/"
              className="flex min-w-0 items-center gap-2 font-serif text-lg font-bold text-brand-ink sm:text-xl"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white text-sm font-black">R</span>
              <span className="truncate">RemoteJobDesk</span>
            </Link>
            <div className="flex items-center justify-between gap-3 sm:hidden">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Browse
              </div>
              <Link
                href="/?country=US"
                className="inline-flex rounded-xl bg-brand px-3 py-1.5 text-sm font-semibold whitespace-nowrap text-white transition hover:bg-brand-ink"
              >
                🇺🇸 US Jobs
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-3">
              <Link
                href="/"
                className="rounded-xl px-3 py-1.5 text-sm font-semibold whitespace-nowrap text-slate-600 transition hover:bg-brand/10 hover:text-brand-ink"
              >
                Jobs
              </Link>
              <Link
                href="/about"
                className="rounded-xl px-3 py-1.5 text-sm font-semibold whitespace-nowrap text-slate-600 transition hover:bg-brand/10 hover:text-brand-ink"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="rounded-xl px-3 py-1.5 text-sm font-semibold whitespace-nowrap text-slate-600 transition hover:bg-brand/10 hover:text-brand-ink"
              >
                Contact
              </Link>
              <Link
                href="/?country=US"
                className="hidden sm:inline-flex rounded-xl bg-brand px-4 py-1.5 text-sm font-semibold whitespace-nowrap text-white transition hover:bg-brand-ink"
              >
                🇺🇸 US Jobs
              </Link>
            </div>
          </div>
        </nav>

        {/* ── Main Content ── */}
        <main className="flex flex-1 flex-col">{children}</main>

        {/* ── Footer ── */}
        <footer className="mt-auto border-t border-white/60 bg-white/70 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
              <div>
                <p className="font-serif text-lg font-bold text-brand-ink">RemoteJobDesk</p>
                <p className="mt-1 text-xs text-slate-500">
                  Fresh remote jobs updated daily for US & Europe.
                </p>
              </div>
              <nav className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                <Link href="/" className="hover:text-brand-ink transition">Home</Link>
                <Link href="/about" className="hover:text-brand-ink transition">About</Link>
                <Link href="/contact" className="hover:text-brand-ink transition">Contact</Link>
                <Link href="/editorial-policy" className="hover:text-brand-ink transition">Editorial Policy</Link>
                <Link href="/how-we-source-jobs" className="hover:text-brand-ink transition">How We Source Jobs</Link>
                <Link href="/privacy" className="hover:text-brand-ink transition">Privacy Policy</Link>
              </nav>
            </div>
            <div className="mt-6 border-t border-white/60 pt-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                Popular Categories
              </p>
              <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
                {featuredCategories.map((category) => (
                  <Link
                    key={category.slug}
                    href={getJobCategoryPath(category.slug)}
                    className="hover:text-brand-ink transition"
                  >
                    {category.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                Company Pages
              </p>
              <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
                {featuredCompanies.map((company) => (
                  <Link
                    key={company}
                    href={getCompanyPath(company)}
                    className="hover:text-brand-ink transition"
                  >
                    {company}
                  </Link>
                ))}
              </div>
            </div>
            <p className="mt-6 text-center text-xs text-slate-400">
              © {new Date().getFullYear()} RemoteJobDesk. All rights reserved. Job listings are aggregated from public sources.
            </p>
          </div>
        </footer>

        {/* ── JSON-LD Schema ── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "RemoteJobDesk",
              url: process.env.NEXT_PUBLIC_SITE_URL || "https://remotejobdesk.com",
              description:
                "Browse fresh remote and work-from-home jobs across the US, UK, and Europe.",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL || "https://remotejobdesk.com"}/?search={search_term_string}`,
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <Analytics />
      </body>
    </html>

  );
}
