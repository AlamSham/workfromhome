import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import { JOB_CATEGORIES, getJobCategoryPath, getJobCategoryCountryPath } from "./lib/jobCategories";
import { SEO_COUNTRIES } from "./lib/seoCountries";
import { getCompanyPath } from "./lib/companies";
import BrandLogo from "./components/BrandLogo";
import Navbar from "./components/Navbar";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: "RemoteJobDesk — 1,000+ Verified Remote Jobs in US & Europe (2026)",
    template: "%s",
  },
  description:
    "Find 1000+ fresh remote and work-from-home jobs across the US, UK, Germany, and 20+ countries. AI-enhanced listings updated daily. Software, marketing, design, customer support & more.",
  keywords: [
    // Primary
    "remote jobs", "work from home jobs", "wfh jobs", "remote work",
    "online jobs", "telecommute jobs", "work remotely",
    // By country
    "remote jobs USA", "remote jobs UK", "remote jobs Europe",
    "work from home US", "remote jobs Germany", "remote jobs France",
    // By role
    "remote software engineer jobs", "remote marketing jobs",
    "remote customer support jobs", "remote design jobs",
    "remote data analyst jobs", "remote product manager jobs",
    // By level
    "entry level remote jobs", "senior remote jobs", "remote internships",
    // Long-tail
    "best remote jobs 2026", "legitimate work from home jobs",
    "high paying remote jobs", "remote jobs no experience",
    "part time remote jobs", "full time remote work",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large" as const,
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || "",
  },
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": "/rss.xml",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "RemoteJobDesk",
    title: "RemoteJobDesk — Work From Home Jobs in US & Europe",
    description:
      "Find fresh remote jobs across 20+ countries. Software, marketing, design & more. Updated daily with AI-enhanced listings.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "RemoteJobDesk — Fresh Remote Jobs Updated Daily",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RemoteJobDesk — Work From Home Jobs",
    description: "Fresh remote jobs updated daily for US, UK & Europe. 20+ countries covered.",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-icon.svg", type: "image/svg+xml" },
    ],
    shortcut: ["/favicon.svg"],
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://remotejobdesk.com"
  ),
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const featuredCategories = JOB_CATEGORIES;
  const featuredCompanies = [
    "Amazon",
    "NVIDIA",
    "Cloudera",
    "Honeycomb.io",
  ];

  const trendingSearches = [
    { label: "Software Jobs in US", path: getJobCategoryCountryPath("software-engineer", "us") },
    { label: "Customer Support in US", path: getJobCategoryCountryPath("customer-support", "us") },
    { label: "React Jobs in US", path: getJobCategoryCountryPath("react-developer", "us") },
    { label: "Software Jobs in UK", path: getJobCategoryCountryPath("software-engineer", "uk") },
    { label: "Customer Support in UK", path: getJobCategoryCountryPath("customer-support", "uk") },
    { label: "Marketing Jobs in Germany", path: getJobCategoryCountryPath("marketing", "germany") },
    { label: "Sales Jobs in France", path: getJobCategoryCountryPath("sales", "france") },
  ];

  const navLinks = [
    { href: "/", label: "Jobs" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/blog", label: "Blog" },
  ];

  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex min-h-full flex-col w-full max-w-full overflow-x-hidden">
        {/* ── Navbar ── */}
        <Navbar />

        {/* ── Main Content ── */}
        <main className="flex flex-1 flex-col w-full max-w-full min-w-0 overflow-x-hidden">{children}</main>

        {/* ── Footer ── */}
        <footer
          style={{
            marginTop: "auto",
            borderTop: "1px solid #e2e8f0",
            background: "#ffffff",
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              padding: "3rem 1.25rem 2rem",
            }}
          >
            {/* Top row: 4 columns */}
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {/* Brand */}
              <div>
                <div style={{ marginBottom: "0.75rem" }}>
                  <BrandLogo size="sm" showTagline={true} />
                </div>
                <p style={{ fontSize: "0.78rem", color: "#64748b", lineHeight: 1.7 }}>
                  AI-powered remote job discovery across 22+ countries. Updated daily.
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <p style={{ fontSize: "0.7rem", fontWeight: 800, color: "#0f172a", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                  Quick Links
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <Link href="/" style={{ fontSize: "0.82rem", color: "#475569", textDecoration: "none", transition: "color 0.2s" }}>Home</Link>
                  <Link href="/about" style={{ fontSize: "0.82rem", color: "#475569", textDecoration: "none", transition: "color 0.2s" }}>About</Link>
                  <Link href="/contact" style={{ fontSize: "0.82rem", color: "#475569", textDecoration: "none", transition: "color 0.2s" }}>Contact</Link>
                  <Link href="/blog" style={{ fontSize: "0.82rem", color: "#475569", textDecoration: "none", transition: "color 0.2s" }}>Blog</Link>
                  <Link href="/editorial-policy" style={{ fontSize: "0.82rem", color: "#475569", textDecoration: "none", transition: "color 0.2s" }}>Editorial Policy</Link>
                  <Link href="/how-we-source-jobs" style={{ fontSize: "0.82rem", color: "#475569", textDecoration: "none", transition: "color 0.2s" }}>How We Source Jobs</Link>
                  <Link href="/privacy" style={{ fontSize: "0.82rem", color: "#475569", textDecoration: "none", transition: "color 0.2s" }}>Privacy Policy</Link>
                </div>
              </div>

              {/* Categories */}
              <div>
                <p style={{ fontSize: "0.7rem", fontWeight: 800, color: "#0f172a", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                  Popular Categories
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {featuredCategories.map((category) => (
                    <Link
                      key={category.slug}
                      href={getJobCategoryPath(category.slug)}
                      style={{ fontSize: "0.82rem", color: "#475569", textDecoration: "none", transition: "color 0.2s" }}
                    >
                      {category.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Companies */}
              <div>
                <p style={{ fontSize: "0.7rem", fontWeight: 800, color: "#0f172a", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                  Top Companies
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {featuredCompanies.map((company) => (
                    <Link
                      key={company}
                      href={getCompanyPath(company)}
                      style={{ fontSize: "0.82rem", color: "#475569", textDecoration: "none", transition: "color 0.2s" }}
                    >
                      {company}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Countries */}
              <div>
                <p style={{ fontSize: "0.7rem", fontWeight: 800, color: "#0f172a", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                  Jobs by Country
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.5rem 0.75rem" }}>
                  {SEO_COUNTRIES.map((country) => (
                    <Link
                      key={country.slug}
                      href={`/remote-jobs-in-${country.slug}`}
                      style={{ fontSize: "0.82rem", color: "#475569", textDecoration: "none", transition: "color 0.2s" }}
                    >
                      {country.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Trending Searches */}
              <div>
                <p style={{ fontSize: "0.7rem", fontWeight: 800, color: "#0f172a", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                  Trending Searches
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {trendingSearches.map((search) => (
                    <Link
                      key={search.label}
                      href={search.path}
                      style={{ fontSize: "0.82rem", color: "#475569", textDecoration: "none", transition: "color 0.2s" }}
                    >
                      {search.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom bar */}
            <div
              style={{
                marginTop: "2.5rem",
                paddingTop: "1.5rem",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "0.75rem",
              }}
            >
              <p style={{ fontSize: "0.75rem", color: "#64748b" }}>
                © {new Date().getFullYear()} RemoteJobDesk. All rights reserved. Job listings are aggregated from public sources.
              </p>
              <div style={{ display: "flex", gap: "1rem" }}>
                <Link href="/rss.xml" style={{ fontSize: "0.75rem", color: "#64748b", textDecoration: "none" }}>RSS Feed</Link>
                <Link href="/sitemap.xml" style={{ fontSize: "0.75rem", color: "#64748b", textDecoration: "none" }}>Sitemap</Link>
              </div>
            </div>
          </div>
        </footer>

        {/* ── JSON-LD: WebSite + SearchAction ── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "RemoteJobDesk",
              url: process.env.NEXT_PUBLIC_SITE_URL || "https://remotejobdesk.com",
              description:
                "Find fresh remote and work-from-home jobs across the US, UK, and 20+ European countries. Updated daily.",
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
        {/* ── JSON-LD: Organization ── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "RemoteJobDesk",
              url: process.env.NEXT_PUBLIC_SITE_URL || "https://remotejobdesk.com",
              logo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://remotejobdesk.com"}/favicon.ico`,
              sameAs: [],
              description: "AI-powered remote job discovery platform covering US, UK, and 20+ European countries.",
            }),
          }}
        />
        {/* ── Google Analytics ── */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `}
            </Script>
          </>
        )}
        {/* ── Push Notification / Monetization Service Worker ── */}
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').catch(function() {});
              });
            }
          `}
        </Script>
        {/* ── Monetag MultiTag All-in-One ── */}
        <Script
          src="https://quge5.com/88/tag.min.js"
          data-zone="278943"
          strategy="afterInteractive"
        />
        <Analytics />
      </body>
    </html>
  );
}
