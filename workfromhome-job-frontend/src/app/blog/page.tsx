import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Remote Work Blog — Guides, Tips & Career Advice",
  description:
    "Expert guides on finding remote jobs, work-from-home tips, salary insights, and career advice for remote professionals in 2026.",
  keywords: [
    "remote work blog", "work from home tips", "remote job advice",
    "remote career guide", "wfh tips", "remote work 2026",
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
    slug: "best-remote-jobs-2026",
    title: "15 Best Remote Jobs in 2026 — High Paying & No Experience Required",
    excerpt: "Discover the top remote jobs hiring in 2026, from software engineering to customer support. Includes salary ranges, required skills, and where to apply.",
    date: "2026-05-01",
    readTime: "8 min",
    category: "Career Guide",
  },
  {
    slug: "how-to-get-remote-job-no-experience",
    title: "How to Get a Remote Job With No Experience — Complete Guide",
    excerpt: "Step-by-step guide to landing your first work-from-home job even without prior remote experience. Includes resume tips, interview prep, and best entry-level roles.",
    date: "2026-04-28",
    readTime: "10 min",
    category: "Getting Started",
  },
  {
    slug: "remote-jobs-usa-vs-europe",
    title: "Remote Jobs in USA vs Europe — Salary, Benefits & Work Culture Compared",
    excerpt: "A comprehensive comparison of remote work in the US versus Europe, covering salaries, benefits, work-life balance, taxes, and legal considerations.",
    date: "2026-04-25",
    readTime: "7 min",
    category: "Insights",
  },
  {
    slug: "highest-paying-remote-jobs",
    title: "Top 10 Highest Paying Remote Jobs in 2026 ($100K–$300K+)",
    excerpt: "The most lucrative remote careers ranked by salary. Software engineering, product management, data science, and more — with real salary data.",
    date: "2026-04-20",
    readTime: "6 min",
    category: "Salary Guide",
  },
  {
    slug: "remote-work-tools-2026",
    title: "25 Essential Remote Work Tools Every WFH Professional Needs in 2026",
    excerpt: "The ultimate toolkit for remote workers — from communication and project management to time tracking and cybersecurity. Includes free and paid options.",
    date: "2026-04-15",
    readTime: "9 min",
    category: "Productivity",
  },
  {
    slug: "remote-job-interview-tips",
    title: "Remote Job Interview Tips — How to Ace Your Virtual Interview",
    excerpt: "Master virtual interviews with proven strategies for video calls, technical assessments, and async hiring processes used by top remote companies.",
    date: "2026-04-10",
    readTime: "7 min",
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
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="fade-up glass-card rounded-3xl p-6 sm:p-10 relative overflow-hidden">
        <div className="hero-orb-1" />
        <div className="hero-orb-2" />
        <div style={{ position: "relative", zIndex: 1 }}>
          <span className="inline-flex rounded-full bg-brand/10 px-3 py-1 text-xs font-bold tracking-widest text-brand-ink uppercase">
            📚 Remote Work Blog
          </span>
          <h1 className="mt-3 font-serif text-3xl font-bold text-slate-900 sm:text-4xl">
            Remote Work Guides & Career Advice
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600 max-w-2xl">
            Expert guides on finding remote jobs, negotiating salaries, acing virtual interviews,
            and building a successful work-from-home career.
          </p>
        </div>
      </header>

      <section className="grid gap-5 sm:grid-cols-2">
        {BLOG_POSTS.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="glass-card fade-up rounded-2xl p-6 transition hover:shadow-lg hover:border-brand/30"
            style={{ textDecoration: "none", borderLeft: "3px solid transparent", transition: "all 0.2s" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="badge bg-brand/10 text-brand-ink">{post.category}</span>
              <span className="text-xs text-slate-400 font-semibold">{post.readTime} read</span>
              <span className="ml-auto text-xs text-slate-400">{new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
            </div>
            <h2 className="text-base font-bold text-slate-900 leading-snug">{post.title}</h2>
            <p className="mt-2 text-sm text-slate-600 leading-6">{post.excerpt}</p>
            <span className="mt-3 inline-flex text-sm font-bold text-brand-ink">Read more →</span>
          </Link>
        ))}
      </section>

      <section className="glass-card fade-up rounded-3xl p-6 sm:p-8">
        <h2 className="section-title">Browse Remote Jobs</h2>
        <p className="mt-2 text-sm text-slate-600">Done reading? Jump straight into fresh remote job listings.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/" className="btn-primary">Browse All Jobs →</Link>
          <Link href="/remote-jobs-in-us" className="btn-outline">🇺🇸 US Jobs</Link>
          <Link href="/remote-jobs-in-uk" className="btn-outline">🇬🇧 UK Jobs</Link>
          <Link href="/remote-software-engineer-jobs" className="btn-outline">💻 Software Jobs</Link>
        </div>
      </section>
    </div>
  );
}
