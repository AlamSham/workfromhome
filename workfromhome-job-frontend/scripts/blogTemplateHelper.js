const fs = require('fs');
const path = require('path');

const blogsDir = path.join(__dirname, '../src/app/blog');

// Helper to generate the Next.js React component for each blog post
function generateBlogTsx(post) {
  const schemaArticle = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.metaDescription,
    "author": {
      "@type": "Person",
      "name": "Sarah Jenkins",
      "jobTitle": "Head of Remote Career Research"
    },
    "publisher": {
      "@type": "Organization",
      "name": "RemoteJobDesk",
      "logo": {
        "@type": "ImageObject",
        "url": "https://remotejobdesk.com/icon.svg"
      }
    },
    "datePublished": post.date,
    "dateModified": post.date,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://remotejobdesk.com/blog/${post.slug}`
    }
  };

  const schemaFaq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": post.faqs.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };

  return `import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "${post.metaTitle.replace(/"/g, '\\"')}",
  description: "${post.metaDescription.replace(/"/g, '\\"')}",
  keywords: ${JSON.stringify(post.keywords)},
  alternates: {
    canonical: "/blog/${post.slug}",
  },
  openGraph: {
    title: "${post.metaTitle.replace(/"/g, '\\"')}",
    description: "${post.metaDescription.replace(/"/g, '\\"')}",
    url: "https://remotejobdesk.com/blog/${post.slug}",
    type: "article",
    publishedTime: "${post.date}T00:00:00.000Z",
    siteName: "RemoteJobDesk",
  },
  twitter: {
    card: "summary_large_image",
    title: "${post.metaTitle.replace(/"/g, '\\"')}",
    description: "${post.metaDescription.replace(/"/g, '\\"')}",
  },
};

export default function BlogPost() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      {/* ── JSON-LD Structured Data for Google Ranking ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(${JSON.stringify(schemaArticle)})
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(${JSON.stringify(schemaFaq)})
        }}
      />

      {/* ── Breadcrumbs ── */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
        <span className="mx-2 text-slate-400">/</span>
        <Link href="/blog" className="hover:text-blue-600 transition-colors">Blog</Link>
        <span className="mx-2 text-slate-400">/</span>
        <span className="text-slate-700 truncate max-w-[280px] sm:max-w-none">${post.category}</span>
      </nav>

      {/* ── Article Header ── */}
      <header className="mb-10 pb-8 border-b border-slate-200">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            ${post.category}
          </span>
          <span className="text-xs font-medium text-slate-500">
            ⏱️ ${post.readTime} read
          </span>
          <span className="text-slate-300">•</span>
          <time dateTime="${post.date}" className="text-xs font-medium text-slate-500">
            Updated for 2026
          </time>
        </div>

        <h1 className="font-serif text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl leading-tight">
          ${post.title}
        </h1>

        <p className="mt-4 text-base sm:text-lg leading-relaxed text-slate-600 font-normal">
          ${post.metaDescription}
        </p>

        {/* ── Author & Trust Bar ── */}
        <div className="mt-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            SJ
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Sarah Jenkins</div>
            <div className="text-xs text-slate-500">Head of Remote Career Research • Verified by Editorial Board</div>
          </div>
        </div>
      </header>

      {/* ── Quick Summary Matrix Box ── */}
      <div className="mb-10 rounded-2xl bg-slate-50 border border-slate-200/80 p-5 sm:p-6 shadow-sm">
        <div className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-3">
          ⚡ Quick Guide Summary (At a Glance)
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          ${post.quickStats.map(s => `
            <div className="flex items-start gap-2.5">
              <span className="text-blue-500 font-bold">✔</span>
              <div>
                <strong className="text-slate-800">${s.label}:</strong>{' '}
                <span className="text-slate-600">${s.value}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      {/* ── Main High-Authority Article Body ── */}
      <article
        className="blog-content prose prose-slate max-w-none prose-headings:font-serif prose-headings:text-slate-900 prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-2 prose-p:text-slate-700 prose-p:leading-relaxed prose-p:text-[0.98rem] prose-li:text-slate-700 prose-li:leading-relaxed prose-strong:text-slate-900 prose-strong:font-bold"
        dangerouslySetInnerHTML={{ __html: \`${post.contentHtml}\` }}
      />

      {/* ── Interactive FAQ Accordion Section ── */}
      <section className="mt-14 mb-12 pt-8 border-t border-slate-200">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
          Frequently Asked Questions (FAQ)
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Essential answers for job seekers targeting this remote career path.
        </p>

        <div className="flex flex-col gap-3">
          ${post.faqs.map((faq, idx) => `
            <details
              ${idx === 0 ? 'open' : ''}
              className="group rounded-xl border border-slate-200 bg-slate-50/70 p-4 transition-all hover:bg-slate-50"
            >
              <summary className="cursor-pointer text-sm font-bold text-slate-900 flex items-center justify-between list-none">
                <span>${faq.q}</span>
                <span className="text-blue-600 transition-transform duration-200 group-open:rotate-180 text-xs ml-2">▼</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 border-t border-slate-200/60 pt-3 mb-0">
                ${faq.a}
              </p>
            </details>
          `).join('')}
        </div>
      </section>

      {/* ── High-Converting Bottom CTA ── */}
      <section className="rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-6 sm:p-10 text-center text-white shadow-xl">
        <span className="text-xs font-extrabold uppercase tracking-widest text-blue-200">
          Verified Work-From-Home Openings
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-white mt-2 mb-3">
          Ready to Start Your Remote Career?
        </h2>
        <p className="max-w-xl mx-auto text-sm sm:text-base leading-relaxed text-blue-100 mb-6">
          Browse thousands of fresh, verified remote jobs across the US, UK, and Europe with competitive salaries.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/"
            className="bg-white text-blue-700 font-extrabold text-sm px-6 py-3 rounded-xl shadow hover:bg-blue-50 transition"
          >
            Search All Remote Jobs →
          </Link>
          <Link
            href="/remote-jobs-in-us"
            className="bg-blue-800/40 text-white font-bold text-sm px-5 py-3 rounded-xl border border-white/20 hover:bg-blue-800/60 transition"
          >
            🇺🇸 US Remote Jobs
          </Link>
        </div>
      </section>
    </div>
  );
}
`;
}

module.exports = { generateBlogTsx, blogsDir };
