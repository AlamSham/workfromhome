import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Remote Work Blog — Guides, Tips & Career Advice | RemoteJobDesk",
  description:
    "Expert guides on finding remote jobs, work-from-home tips, salary insights, and career advice for remote professionals in 2026.",
  keywords: [
    "remote work blog",
    "work from home tips",
    "remote job advice",
    "remote career guide",
    "wfh tips",
    "remote work 2026",
  ],
  alternates: {
    canonical: "/blog",
  },
};

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
}

const BLOG_POSTS: BlogPost[] = [
  {
    slug: "remote-bookkeeping-jobs-no-experience",
    title: "Remote Bookkeeping Jobs with No Experience — Complete 2026 Career Guide",
    excerpt: "Discover entry-level remote bookkeeping opportunities hiring in 2026. Includes salary data ($35K–$65K), software requirements, and fast application steps.",
    date: "2026-08-15",
    readTime: "12 min",
    category: "Career Guide",
  },
  {
    slug: "remote-jobs-hiring-immediately",
    title: "20+ Remote Jobs Hiring Immediately (Fast Onboarding 2026)",
    excerpt: "Need a work-from-home job fast? Check out companies hiring immediately for customer support, transcription, data entry, and QA testing roles.",
    date: "2026-08-15",
    readTime: "11 min",
    category: "Fast Hiring",
  },
  {
    slug: "remote-customer-support-jobs-no-experience",
    title: "Remote Customer Support Jobs (No Experience Needed) — 2026",
    excerpt: "Looking to start working from home? Remote customer support is the perfect entry point. Discover how to land these roles with zero prior experience in 2026.",
    date: "2026-08-16",
    readTime: "12 min",
    category: "Getting Started",
  },
  {
    slug: "work-from-home-data-entry-jobs",
    title: "Work From Home Data Entry Jobs — Apply Now 2026",
    excerpt: "Find legitimate work-from-home data entry jobs in 2026. Learn how to spot scams, what skills you need, and where to apply today.",
    date: "2026-08-17",
    readTime: "11 min",
    category: "Data & Admin",
  },
  {
    slug: "remote-jobs-for-beginners",
    title: "Remote Jobs for Beginners — Complete 2026 Step-by-Step Guide",
    excerpt: "The ultimate guide to finding remote jobs for beginners. Discover the top roles you can land with no prior remote work experience, salary charts, and resume templates.",
    date: "2026-08-18",
    readTime: "13 min",
    category: "Getting Started",
  },
  {
    slug: "remote-jobs-that-pay-well",
    title: "Remote Jobs That Pay Well — Top Lucrative Work-From-Home Careers in 2026",
    excerpt: "You don't need a college degree to make six figures from home. Discover high-paying remote jobs paying $100K–$250K+ in tech, product, and sales.",
    date: "2026-08-19",
    readTime: "14 min",
    category: "Salary Guide",
  },
  {
    slug: "best-companies-hiring-remotely-2026",
    title: "Best Companies Hiring Remotely in 2026 — Verified Remote-First Employers",
    excerpt: "Looking for the best remote employers? We highlight the top remote-first companies offering great benefits, async work, home office stipends, and global hiring.",
    date: "2026-08-20",
    readTime: "15 min",
    category: "Company Spotlight",
  },
  {
    slug: "remote-jobs-in-europe-for-americans",
    title: "Remote Jobs in Europe for Americans — Legal Guide, Taxes & Top Hiring Roles",
    excerpt: "Want to work from Europe for a US company or land European remote roles? Learn about digital nomad visas, tax exemptions (FEIE), and time zone strategies.",
    date: "2026-08-21",
    readTime: "14 min",
    category: "Global Remote",
  },
  {
    slug: "best-remote-jobs-2026",
    title: "Best Remote Jobs in 2026 — Comprehensive Industry Ranking & Outlook",
    excerpt: "Discover the top remote jobs hiring in 2026, from AI systems engineering to customer success operations. Includes salary ranges, required skills, and where to apply.",
    date: "2026-08-22",
    readTime: "15 min",
    category: "Career Guide",
  },
  {
    slug: "how-to-get-remote-job-no-experience",
    title: "How to Get a Remote Job with No Experience — 2026 Practical Playbook",
    excerpt: "Step-by-step roadmap to landing your first work-from-home role with zero remote experience. Resume templates, skill-building tips, and outreach scripts.",
    date: "2026-08-23",
    readTime: "14 min",
    category: "Career Advice",
  },
  {
    slug: "remote-jobs-usa-vs-europe",
    title: "Remote Jobs USA vs. Europe — Salaries, Work Culture & Benefits Compared",
    excerpt: "Comprehensive comparison between US and European remote work. Discover salary differences, PTO policies, work culture, and tax obligations.",
    date: "2026-08-24",
    readTime: "15 min",
    category: "Global Remote",
  },
  {
    slug: "highest-paying-remote-jobs",
    title: "Highest Paying Remote Jobs in 2026 — Roles Earning $150K to $350K+",
    excerpt: "Explore the most lucrative remote careers of 2026. From AI prompt engineering to cloud architecture, see what it takes to earn top-tier remote compensation.",
    date: "2026-08-25",
    readTime: "15 min",
    category: "Salary Guide",
  },
  {
    slug: "remote-work-tools-2026",
    title: "Essential Remote Work Tools in 2026 — The Modern Distributed Tech Stack",
    excerpt: "The definitive toolkit for remote success: async communication, task management, ergonomic hardware, and cybersecurity tools for distributed teams.",
    date: "2026-08-26",
    readTime: "13 min",
    category: "Productivity",
  },
  {
    slug: "remote-job-interview-tips",
    title: "Remote Job Interview Tips in 2026 — How to Ace Virtual Interviews & Get Hired",
    excerpt: "Master virtual interviews with proven strategies for video calls, technical assessments, and async hiring processes used by top remote companies.",
    date: "2026-08-27",
    readTime: "14 min",
    category: "Interview Prep",
  },
];

export default function BlogPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "RemoteJobDesk Blog",
    description: "Expert guides on remote work, job search tips, and career advice.",
    url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://remotejobdesk.com"}/blog`,
    publisher: {
      "@type": "Organization",
      name: "RemoteJobDesk",
    },
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── HERO BANNER (Clean White Stripe/Linear Style) ── */}
      <header
        className="fade-up glass-card relative overflow-hidden"
        style={{
          padding: "clamp(1.75rem, 5vw, 3rem) clamp(1.5rem, 4vw, 2.5rem)",
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "1.5rem",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.03), 0 10px 30px rgba(0, 0, 0, 0.02)",
        }}
      >
        <div className="hero-orb-1" style={{ opacity: 0.12 }} />
        <div className="hero-orb-2" style={{ opacity: 0.1 }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 12px",
              borderRadius: "9999px",
              background: "#eff6ff",
              border: "1px solid #dbeafe",
              color: "#2563eb",
              fontSize: "0.72rem",
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            📚 Remote Work Blog & Guides
          </span>

          <h1
            style={{
              marginTop: "0.85rem",
              fontFamily: "var(--font-playfair), Georgia, serif",
              fontSize: "clamp(1.75rem, 3.5vw, 2.6rem)",
              fontWeight: 800,
              color: "#0f172a",
              lineHeight: 1.25,
              letterSpacing: "-0.02em",
            }}
          >
            Remote Work Guides & Career Advice
          </h1>

          <p
            style={{
              marginTop: "0.75rem",
              fontSize: "0.95rem",
              lineHeight: 1.7,
              color: "#64748b",
              maxWidth: "680px",
            }}
          >
            Actionable, in-depth guides on finding legitimate work-from-home jobs, negotiating salaries,
            acing virtual interviews, and accelerating your distributed career in 2026.
          </p>
        </div>
      </header>

      {/* ── BLOG CARDS GRID ── */}
      <section className="grid gap-5 sm:grid-cols-2">
        {BLOG_POSTS.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group fade-up glass-card"
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "1.5rem 1.6rem",
              textDecoration: "none",
              borderRadius: "1.25rem",
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
              transition: "all 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {/* Meta Row */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "3px 9px",
                  borderRadius: "6px",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  background: "#eff6ff",
                  color: "#2563eb",
                  border: "1px solid #bfdbfe",
                }}
              >
                {post.category}
              </span>
              <span style={{ fontSize: "0.74rem", color: "#64748b", fontWeight: 600 }}>
                ⏱️ {post.readTime}
              </span>
              <span style={{ marginLeft: "auto", fontSize: "0.72rem", color: "#94a3b8", fontWeight: 500 }}>
                {new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>

            {/* Title */}
            <h2
              className="group-hover:text-blue-600"
              style={{
                fontSize: "1.08rem",
                fontWeight: 800,
                color: "#0f172a",
                lineHeight: 1.4,
                letterSpacing: "-0.015em",
                margin: 0,
                transition: "color 0.18s ease",
              }}
            >
              {post.title}
            </h2>

            {/* Excerpt */}
            <p
              style={{
                marginTop: "0.5rem",
                fontSize: "0.85rem",
                lineHeight: 1.65,
                color: "#475569",
                flex: 1,
              }}
            >
              {post.excerpt}
            </p>

            {/* Read More Link */}
            <div
              style={{
                marginTop: "1.1rem",
                paddingTop: "0.75rem",
                borderTop: "1px solid #f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: "#2563eb",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                Read Full Guide
                <span className="transition-transform group-hover:translate-x-1" style={{ fontSize: "1rem" }}>→</span>
              </span>
              <span style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 600 }}>
                2026 Edition
              </span>
            </div>
          </Link>
        ))}
      </section>

      {/* ── BROWSE JOBS CTA ── */}
      <section
        className="glass-card fade-up"
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "1.5rem",
          padding: "2rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
        }}
      >
        <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
          Browse Live Remote Openings
        </h2>
        <p style={{ marginTop: "0.4rem", fontSize: "0.86rem", color: "#64748b", margin: 0 }}>
          Done reading? Jump straight into verified remote job listings updated hourly.
        </p>
        <div style={{ marginTop: "1rem", display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
          <Link href="/" className="btn-primary" style={{ fontSize: "0.82rem", padding: "0.55rem 1.25rem" }}>
            Browse All Jobs →
          </Link>
          <Link href="/remote-jobs-in-us" className="btn-outline" style={{ fontSize: "0.82rem", padding: "0.55rem 1.15rem" }}>
            🇺🇸 US Jobs
          </Link>
          <Link href="/remote-jobs-in-uk" className="btn-outline" style={{ fontSize: "0.82rem", padding: "0.55rem 1.15rem" }}>
            🇬🇧 UK Jobs
          </Link>
          <Link href="/remote-software-engineer-jobs" className="btn-outline" style={{ fontSize: "0.82rem", padding: "0.55rem 1.15rem" }}>
            💻 Software Jobs
          </Link>
        </div>
      </section>
    </div>
  );
}
