import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Remote Jobs for Beginners — Complete Guide 2026",
  description: "The ultimate guide to finding remote jobs for beginners. Discover the top 5 roles you can land with no prior remote work experience.",
  keywords: ["remote jobs for beginners", "entry level wfh", "how to start working remotely", "first remote job", "beginner remote jobs"],
  alternates: {
    canonical: "/blog/remote-jobs-for-beginners",
  },
};

export default function BlogPost() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      {/* ── Breadcrumb ── */}
      <nav className="mb-8 flex items-center text-sm font-semibold text-slate-500">
        <Link href="/" className="hover:text-brand">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/blog" className="hover:text-brand">Blog</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-300">Getting Started</span>
      </nav>

      {/* ── Header ── */}
      <header className="mb-10">
        <div className="mb-4 flex items-center gap-3">
          <span className="badge badge-accent">Getting Started</span>
          <time className="text-xs font-semibold text-slate-400">
            {new Date("2026-05-12T00:00:00.000Z").toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </time>
        </div>
        <h1 className="font-serif text-3xl font-extrabold leading-tight text-slate-100 sm:text-4xl md:text-5xl">
          Remote Jobs for Beginners — Complete Guide 2026
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-400">
          The ultimate guide to finding remote jobs for beginners. Discover the top 5 roles you can land with no prior remote work experience.
        </p>
      </header>

      {/* ── Content ── */}
      <article className="prose prose-invert prose-slate max-w-none">
        
      <h2>Breaking Into the Remote Work World</h2>
      <p>Transitioning from an office or retail job to a remote career can feel daunting. The good news is that in 2026, companies are more willing than ever to hire beginners for remote roles, provided they have the right mindset and soft skills.</p>

      <h2>Top 5 Beginner-Friendly Remote Roles</h2>
      <h3>1. Virtual Assistant (VA)</h3>
      <p>If you are highly organized, becoming a VA is an excellent start. Tasks include managing emails, scheduling appointments, and basic data entry.</p>

      <h3>2. Social Media Manager</h3>
      <p>Do you live on TikTok, Instagram, and X? Many small businesses need help managing their online presence. You don't need a marketing degree, just a proven track record of growing an audience.</p>

      <h3>3. Content Writer / Copywriter</h3>
      <p>If you have a way with words, freelance writing is highly accessible. Start by writing on Medium or your own blog to build a portfolio, then pitch to content agencies.</p>

      <h3>4. QA Tester</h3>
      <p>Quality Assurance testing involves using software or websites and reporting bugs. While advanced QA requires coding, manual QA simply requires attention to detail and a willingness to break things.</p>

      <h3>5. Sales Development Representative (SDR)</h3>
      <p>If you are outgoing and can handle rejection, SDR roles are the entry point to lucrative tech sales careers. Most companies provide full training.</p>

      <h2>How to Optimize Your Resume</h2>
      <p>When applying for your first remote job, highlight your ability to work autonomously. Mention tools you already know how to use: Slack, Zoom, Google Workspace, or Notion. Proving you are a self-starter is more important than years of experience.</p>
    
      </article>

      {/* ── CTA ── */}
      <div className="mt-16 rounded-3xl border border-slate-800 bg-[rgba(15,23,42,0.8)] p-8 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-cyan-500 opacity-10 blur-3xl mix-blend-screen" />
        <h3 className="font-serif text-2xl font-bold text-slate-100">Ready to find your next remote role?</h3>
        <p className="mt-3 text-slate-400 mb-6">Browse thousands of remote jobs across the US, UK, and Europe.</p>
        <Link href="/" className="btn-primary inline-flex">
          Search Remote Jobs →
        </Link>
      </div>
    </div>
  );
}
