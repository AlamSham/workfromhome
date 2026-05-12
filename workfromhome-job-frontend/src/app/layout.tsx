import { Manrope, Playfair_Display } from "next/font/google";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import { JOB_CATEGORIES, getJobCategoryPath } from "./lib/jobCategories";
import { SEO_COUNTRIES } from "./lib/seoCountries";
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
    default: "RemoteJobDesk — Work From Home Jobs in US & Europe | Updated Daily",
    template: "%s | RemoteJobDesk",
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
  const featuredCountries = SEO_COUNTRIES.slice(0, 6);

  const navLinks = [
    { href: "/", label: "Jobs" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/blog", label: "Blog" },
  ];

  return (
    <html
      lang="en"
      className={`${manrope.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/* ── Navbar ── */}
        <nav
          style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            borderBottom: "1px solid rgba(148,163,184,0.06)",
            background: "rgba(6,10,20,0.85)",
            backdropFilter: "blur(20px) saturate(1.5)",
            WebkitBackdropFilter: "blur(20px) saturate(1.5)",
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.75rem 1.25rem",
              gap: "1rem",
            }}
          >
            {/* Logo */}
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                textDecoration: "none",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  display: "flex",
                  width: "34px",
                  height: "34px",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
                  color: "#fff",
                  fontSize: "0.8rem",
                  fontWeight: 900,
                  boxShadow: "0 2px 12px rgba(6,182,212,0.3)",
                }}
              >
                R
              </span>
              <span
                style={{
                  fontFamily: "var(--font-playfair), Georgia, serif",
                  fontSize: "1.15rem",
                  fontWeight: 700,
                  color: "#f1f5f9",
                  letterSpacing: "-0.01em",
                }}
              >
                Remote<span style={{ color: "#06b6d4" }}>Job</span>Desk
              </span>
            </Link>

            {/* Nav Links */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    padding: "0.4rem 0.85rem",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: "#94a3b8",
                    textDecoration: "none",
                    borderRadius: "0.5rem",
                    transition: "color 0.2s, background 0.2s",
                    whiteSpace: "nowrap",
                  }}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/remote-jobs-in-us"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  marginLeft: "0.5rem",
                  padding: "0.45rem 1rem",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: "#fff",
                  background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
                  borderRadius: "0.6rem",
                  textDecoration: "none",
                  boxShadow: "0 2px 12px rgba(6,182,212,0.25)",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}
              >
                🇺🇸 US Jobs
              </Link>
            </div>
          </div>
        </nav>

        {/* ── Main Content ── */}
        <main className="flex flex-1 flex-col">{children}</main>

        {/* ── Footer ── */}
        <footer
          style={{
            marginTop: "auto",
            borderTop: "1px solid rgba(148,163,184,0.06)",
            background: "rgba(6,10,20,0.9)",
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
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "2rem",
              }}
            >
              {/* Brand */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.75rem" }}>
                  <span
                    style={{
                      display: "flex",
                      width: "28px",
                      height: "28px",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "8px",
                      background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
                      color: "#fff",
                      fontSize: "0.65rem",
                      fontWeight: 900,
                    }}
                  >
                    R
                  </span>
                  <span style={{ fontFamily: "var(--font-playfair), Georgia, serif", fontWeight: 700, color: "#f1f5f9" }}>
                    Remote<span style={{ color: "#06b6d4" }}>Job</span>Desk
                  </span>
                </div>
                <p style={{ fontSize: "0.78rem", color: "#64748b", lineHeight: 1.7 }}>
                  AI-powered remote job discovery across 22+ countries. Updated daily.
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <p style={{ fontSize: "0.7rem", fontWeight: 800, color: "#64748b", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                  Quick Links
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <Link href="/" style={{ fontSize: "0.82rem", color: "#94a3b8", textDecoration: "none", transition: "color 0.2s" }}>Home</Link>
                  <Link href="/about" style={{ fontSize: "0.82rem", color: "#94a3b8", textDecoration: "none", transition: "color 0.2s" }}>About</Link>
                  <Link href="/contact" style={{ fontSize: "0.82rem", color: "#94a3b8", textDecoration: "none", transition: "color 0.2s" }}>Contact</Link>
                  <Link href="/blog" style={{ fontSize: "0.82rem", color: "#94a3b8", textDecoration: "none", transition: "color 0.2s" }}>Blog</Link>
                  <Link href="/editorial-policy" style={{ fontSize: "0.82rem", color: "#94a3b8", textDecoration: "none", transition: "color 0.2s" }}>Editorial Policy</Link>
                  <Link href="/how-we-source-jobs" style={{ fontSize: "0.82rem", color: "#94a3b8", textDecoration: "none", transition: "color 0.2s" }}>How We Source Jobs</Link>
                  <Link href="/privacy" style={{ fontSize: "0.82rem", color: "#94a3b8", textDecoration: "none", transition: "color 0.2s" }}>Privacy Policy</Link>
                </div>
              </div>

              {/* Categories */}
              <div>
                <p style={{ fontSize: "0.7rem", fontWeight: 800, color: "#64748b", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                  Popular Categories
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {featuredCategories.map((category) => (
                    <Link
                      key={category.slug}
                      href={getJobCategoryPath(category.slug)}
                      style={{ fontSize: "0.82rem", color: "#94a3b8", textDecoration: "none", transition: "color 0.2s" }}
                    >
                      {category.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Companies */}
              <div>
                <p style={{ fontSize: "0.7rem", fontWeight: 800, color: "#64748b", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                  Top Companies
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {featuredCompanies.map((company) => (
                    <Link
                      key={company}
                      href={getCompanyPath(company)}
                      style={{ fontSize: "0.82rem", color: "#94a3b8", textDecoration: "none", transition: "color 0.2s" }}
                    >
                      {company}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Countries */}
              <div>
                <p style={{ fontSize: "0.7rem", fontWeight: 800, color: "#64748b", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                  Top Countries
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {featuredCountries.map((country) => (
                    <Link
                      key={country.slug}
                      href={`/remote-jobs-in-${country.slug}`}
                      style={{ fontSize: "0.82rem", color: "#94a3b8", textDecoration: "none", transition: "color 0.2s" }}
                    >
                      {country.name}
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
                borderTop: "1px solid rgba(148,163,184,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "0.75rem",
              }}
            >
              <p style={{ fontSize: "0.72rem", color: "#475569" }}>
                © {new Date().getFullYear()} RemoteJobDesk. All rights reserved. Job listings are aggregated from public sources.
              </p>
              <div style={{ display: "flex", gap: "1rem" }}>
                <Link href="/rss.xml" style={{ fontSize: "0.72rem", color: "#475569", textDecoration: "none" }}>RSS Feed</Link>
                <Link href="/sitemap.xml" style={{ fontSize: "0.72rem", color: "#475569", textDecoration: "none" }}>Sitemap</Link>
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
        <Analytics />
      </body>
    </html>
  );
}
