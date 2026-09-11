import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Remote Bookkeeping Jobs with No Experience (2026 Career Guide) | RemoteJobDesk",
  description: "Learn how to land entry-level remote bookkeeping jobs with no prior experience in 2026. Includes salary data ($35K–$65K), free certifications, software skills, and top hiring companies.",
  keywords: ["remote bookkeeping jobs no experience","entry level remote bookkeeping jobs","work from home bookkeeping","online bookkeeping jobs for beginners","virtual bookkeeper no degree","remote accounting jobs entry level"],
  alternates: { canonical: "/blog/remote-bookkeeping-jobs-no-experience" },
};

export default function BlogPostPage() {
  const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Remote Bookkeeping Jobs with No Experience — Complete 2026 Career Guide",
  "description": "Learn how to land entry-level remote bookkeeping jobs with no prior experience in 2026. Includes salary data ($35K–$65K), free certifications, software skills, and top hiring companies.",
  "datePublished": "2026-08-15",
  "dateModified": "2026-09-11",
  "author": {
    "@type": "Organization",
    "name": "RemoteJobDesk"
  },
  "publisher": {
    "@type": "Organization",
    "name": "RemoteJobDesk"
  }
};
  const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Can I really get a remote bookkeeping job without prior experience or an accounting degree?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, absolutely. Unlike certified public accountants (CPAs) who perform auditing, tax planning, and statutory compliance, virtual bookkeepers focus on transactional recordkeeping: categorizing receipts, reconciling monthly bank statements, generating client invoices, and tracking accounts payable. Many virtual assistant agencies and remote staffing firms hire candidates based on organizational ability, basic numeracy, and software certifications (such as QuickBooks ProAdvisor) rather than formal university degrees."
      }
    },
    {
      "@type": "Question",
      "name": "How much do entry-level remote bookkeepers earn in 2026?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Entry-level remote bookkeepers in the United States and Europe typically earn between $20 and $30 per hour, which equates to $40,000 to $62,000 annually for full-time positions. Independent freelance bookkeepers on platforms like Upwork or working with private small business retainers often scale their rates to $45–$75 per hour once they manage multiple client books."
      }
    },
    {
      "@type": "Question",
      "name": "Which certifications carry the most weight for beginner remote bookkeepers?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The QuickBooks Online Certified ProAdvisor certification is universally recognized, 100% free, and can be completed online within 10 to 15 hours directly through Intuit Education. Pair this with the Xero Advisor Certification and a foundational certificate in Microsoft Excel or Google Sheets to dramatically outperform other entry-level applicants."
      }
    },
    {
      "@type": "Question",
      "name": "What hardware and home office setup do I need to work from home as a bookkeeper?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You will need a reliable laptop or desktop computer with at least 16GB of RAM, dual monitors (highly recommended for cross-referencing ledgers with receipts), high-speed fiber or cable internet (minimum 50 Mbps), and a secure password manager (such as 1Password or Bitwarden) to safeguard confidential client financial credentials."
      }
    },
    {
      "@type": "Question",
      "name": "Are remote bookkeeping jobs flexible or strictly 9-to-5?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Most remote bookkeeping roles are inherently asynchronous. Because bank reconciliations and ledger entries do not require real-time collaboration with customers, many employers allow you to complete your weekly hours whenever it suits your schedule, provided month-end closes and invoicing deadlines are met."
      }
    }
  ]
};

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* ── Breadcrumb ── */}
      <nav className="fade-up flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
        <span>/</span>
        <Link href="/blog" className="hover:text-blue-600 transition-colors">Blog</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold line-clamp-1">Remote Bookkeeping Jobs with No Experience — Complete 2026 Career Guide</span>
      </nav>

      {/* ── Main Article Card (Clean White Theme) ── */}
      <article
        className="fade-up glass-card"
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "1.5rem",
          padding: "clamp(1.5rem, 5vw, 2.75rem)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
        }}
      >
        {/* Header Tags */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "4px 10px",
              borderRadius: "6px",
              fontSize: "0.74rem",
              fontWeight: 700,
              background: "#eff6ff",
              color: "#2563eb",
              border: "1px solid #bfdbfe",
            }}
          >
            Career Guide
          </span>
          <span style={{ fontSize: "0.76rem", color: "#64748b", fontWeight: 600 }}>
            ⏱️ 12 min Comprehensive Guide
          </span>
          <span style={{ marginLeft: "auto", fontSize: "0.76rem", color: "#94a3b8", fontWeight: 500 }}>
            Updated September 2026
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontFamily: "var(--font-playfair), Georgia, serif",
            fontSize: "clamp(1.75rem, 3.5vw, 2.4rem)",
            fontWeight: 800,
            color: "#0f172a",
            lineHeight: 1.25,
            letterSpacing: "-0.02em",
            margin: "0 0 1rem 0",
          }}
        >
          Remote Bookkeeping Jobs with No Experience — Complete 2026 Career Guide
        </h1>

        {/* Lead Excerpt */}
        <p
          style={{
            fontSize: "1.05rem",
            lineHeight: 1.75,
            color: "#475569",
            fontWeight: 400,
            borderLeft: "3px solid #2563eb",
            paddingLeft: "1rem",
            margin: "1.25rem 0",
          }}
        >
          Learn how to land entry-level remote bookkeeping jobs with no prior experience in 2026. Includes salary data ($35K–$65K), free certifications, software skills, and top hiring companies.
        </p>

        {/* Quick Stats Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "0.75rem",
            margin: "1.75rem 0",
            padding: "1.25rem",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "1rem",
          }}
        >
          
            <div>
              <p style={{ margin: 0, fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Starting Salary
              </p>
              <p style={{ margin: "4px 0 0 0", fontSize: "0.88rem", fontWeight: 800, color: "#0f172a" }}>
                $22 – $32 / hr ($42K–$65K/yr)
              </p>
            </div>
          
            <div>
              <p style={{ margin: 0, fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Experience Needed
              </p>
              <p style={{ margin: "4px 0 0 0", fontSize: "0.88rem", fontWeight: 800, color: "#0f172a" }}>
                Zero prior experience (Training provided)
              </p>
            </div>
          
            <div>
              <p style={{ margin: 0, fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Key Software
              </p>
              <p style={{ margin: "4px 0 0 0", fontSize: "0.88rem", fontWeight: 800, color: "#0f172a" }}>
                QuickBooks Online, Xero, Excel
              </p>
            </div>
          
            <div>
              <p style={{ margin: 0, fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Hiring Speed
              </p>
              <p style={{ margin: "4px 0 0 0", fontSize: "0.88rem", fontWeight: 800, color: "#0f172a" }}>
                Typically 1 – 3 weeks
              </p>
            </div>
          
        </div>

        {/* Body Content */}
        <div
          className="blog-prose"
          style={{
            fontSize: "0.95rem",
            lineHeight: 1.8,
            color: "#334155",
            marginTop: "1.5rem",
          }}
          dangerouslySetInnerHTML={{
            __html: `
      <h2>The Expanding Demand for Virtual Bookkeepers in 2026</h2>
      <p>As micro-businesses, e-commerce brands, SaaS startups, and independent consulting firms continue operating without physical offices, the need for localized in-person accountants has sharply declined. In their place, the <strong>virtual bookkeeping market</strong> has surged by over 34% over the past two years.</p>
      <p>Modern bookkeeping relies entirely on cloud-based accounting platforms. Bank feeds automatically import transactions; OCR apps scan receipt photos; and payroll runs via automated ACH APIs. Because the heavy mechanical lifting is handled by software, employers now look for dependable, detail-oriented professionals who can review categorized items, flag discrepancies, and ensure balance sheets reconcile accurately at month-end.</p>

      <h2>Core Day-to-Day Responsibilities of a Beginner Remote Bookkeeper</h2>
      <p>When you secure an entry-level work-from-home bookkeeping position, your daily workflow generally centers around four predictable, high-value tasks:</p>
      <ul>
        <li><strong>Bank and Credit Card Reconciliation:</strong> Matching transactions from bank feeds against point-of-sale records and supplier invoices to ensure every penny is accounted for.</li>
        <li><strong>Accounts Receivable (Invoicing & Collections):</strong> Generating customer invoices, tracking payment statuses, and sending polite, automated reminders for overdue balances.</li>
        <li><strong>Accounts Payable (Bill Processing):</strong> Verifying vendor bills, logging expenses to the correct cost centers, and scheduling outgoing payments for owner approval.</li>
        <li><strong>Financial Reporting:</strong> Compiling monthly Profit & Loss (P&L) statements, Balance Sheets, and Cash Flow summaries for business owners.</li>
      </ul>

      <h2>Comparative Salary Breakdown: Beginner to Experienced</h2>
      <div style="overflow-x: auto; margin: 1.5rem 0;">
        <table style="width: 100%; border-collapse: collapse; font-size: 0.88rem; text-align: left;">
          <thead>
            <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
              <th style="padding: 10px 14px; color: #0f172a; font-weight: 700;">Career Level</th>
              <th style="padding: 10px 14px; color: #0f172a; font-weight: 700;">Hourly Rate</th>
              <th style="padding: 10px 14px; color: #0f172a; font-weight: 700;">Annual Salary</th>
              <th style="padding: 10px 14px; color: #0f172a; font-weight: 700;">Key Qualifications</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 14px; font-weight: 600; color: #1e293b;">Entry-Level / Junior</td>
              <td style="padding: 10px 14px; color: #2563eb; font-weight: 700;">$20 – $28 / hr</td>
              <td style="padding: 10px 14px; color: #334155;">$40,000 – $58,000</td>
              <td style="padding: 10px 14px; color: #64748b;">QuickBooks Online certification, basic Excel</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9; background: #fafafa;">
              <td style="padding: 10px 14px; font-weight: 600; color: #1e293b;">Mid-Level Bookkeeper</td>
              <td style="padding: 10px 14px; color: #2563eb; font-weight: 700;">$28 – $40 / hr</td>
              <td style="padding: 10px 14px; color: #334155;">$58,000 – $80,000</td>
              <td style="padding: 10px 14px; color: #64748b;">Multi-entity experience, payroll, inventory tracking</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 14px; font-weight: 600; color: #1e293b;">Senior / Lead Bookkeeper</td>
              <td style="padding: 10px 14px; color: #2563eb; font-weight: 700;">$40 – $55 / hr</td>
              <td style="padding: 10px 14px; color: #334155;">$80,000 – $110,000</td>
              <td style="padding: 10px 14px; color: #64748b;">Full-charge bookkeeping, cash flow forecasting, ERP tools</td>
            </tr>
            <tr style="background: #eff6ff;">
              <td style="padding: 10px 14px; font-weight: 700; color: #1e40af;">Freelance Agency Owner</td>
              <td style="padding: 10px 14px; color: #1e40af; font-weight: 800;">$50 – $95 / hr</td>
              <td style="padding: 10px 14px; color: #1e40af; font-weight: 800;">$90,000 – $150,000+</td>
              <td style="padding: 10px 14px; color: #1e40af;">Managing a client portfolio of 10–20 small businesses</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Top 5 Remote Companies & Platforms Hiring Entry-Level Bookkeepers</h2>
      <p>If you are ready to begin applying, the following organizations have dedicated remote onboarding pipelines for non-degreed candidates:</p>
      <ol>
        <li><strong>AccountingDepartment.com:</strong> One of the pioneers in 100% remote accounting services. They provide extensive paid virtual training on internal software stacks and assign you to structured client teams with ongoing mentorship.</li>
        <li><strong>Belay Solutions:</strong> A leading US remote staffing agency that places virtual bookkeepers and executive assistants with church organizations, non-profits, and small business owners. Highly flexible 15 to 30 hour per week schedules.</li>
        <li><strong>Intuit (QuickBooks Live):</strong> Intuit frequently hires remote associate bookkeepers. If you hold their free ProAdvisor credential and demonstrate customer-centric communication, they provide live customer matching and technical support.</li>
        <li><strong>Boldly:</strong> A premium subscription staffing agency that hires W-2 remote staff across the US and Europe. They offer paid time off, health benefits, and guaranteed minimum hourly commitments.</li>
        <li><strong>Upwork & Freelancer Marketplaces:</strong> Creating an optimized freelance profile focused on "E-commerce Bookkeeping for Shopify Sellers" or "Stripe Reconciliation Specialist" allows beginners to win their first $300–$500 monthly recurring client within 2 to 4 weeks.</li>
      </ol>

      <h2>Your 30-Day Step-by-Step Roadmap to Getting Hired</h2>
      <p>Follow this exact chronological checklist to go from zero accounting background to your first signed remote bookkeeping offer:</p>
      <ul>
        <li><strong>Days 1–7: Complete the Free QuickBooks Online ProAdvisor Course.</strong> Register at Intuit Accountant University. Watch the modular training videos and pass the open-book certification exam. Add the verified badge to your LinkedIn and resume immediately.</li>
        <li><strong>Days 8–14: Build a Mock Portfolio Ledger.</strong> Create a sample QuickBooks company for a fictional digital agency. Enter 30 mock expenses, create 5 invoices, and generate a clean P&L. Take screenshots to link inside your applications as concrete "Proof of Competency."</li>
        <li><strong>Days 15–21: Optimize Your Resume for Remote ATS Filters.</strong> Highlight keywords like <em>Bank Feeds, Double-Entry Verification, Asynchronous Client Communication, Google Sheets, Zoom Collaboration</em>. Mention your home office specifications.</li>
        <li><strong>Days 22–30: Submit 5 Targeted Applications Daily.</strong> Apply directly on remote company job portals (like RemoteJobDesk.com) and search for terms like "Junior Bookkeeper", "Virtual Accounting Assistant", and "Accounts Payable Clerk".</li>
      </ul>
    `
          }}
        />
      </article>

      {/* ── FAQ Section (Google Rich Snippets Accordion) ── */}
      <section
        className="fade-up glass-card"
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "1.5rem",
          padding: "clamp(1.5rem, 4vw, 2.25rem)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
        }}
      >
        <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.5rem 0" }}>
          Frequently Asked Questions (FAQ)
        </h2>
        <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "0 0 1.25rem 0" }}>
          Essential answers for job seekers targeting this remote career path.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          
            <details
              open
              className="group"
              style={{
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                background: "#f8fafc",
                padding: "1rem 1.25rem",
                transition: "all 0.2s ease",
              }}
            >
              <summary
                style={{
                  cursor: "pointer",
                  fontSize: "0.92rem",
                  fontWeight: 700,
                  color: "#0f172a",
                  lineHeight: 1.4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>Can I really get a remote bookkeeping job without prior experience or an accounting degree?</span>
                <span className="text-blue-600 transition-transform group-open:rotate-180" style={{ fontSize: "0.8rem", marginLeft: "8px" }}>▼</span>
              </summary>
              <p
                style={{
                  marginTop: "0.75rem",
                  fontSize: "0.86rem",
                  lineHeight: 1.7,
                  color: "#475569",
                  borderTop: "1px solid #e2e8f0",
                  paddingTop: "0.75rem",
                  marginBottom: 0,
                }}
              >
                Yes, absolutely. Unlike certified public accountants (CPAs) who perform auditing, tax planning, and statutory compliance, virtual bookkeepers focus on transactional recordkeeping: categorizing receipts, reconciling monthly bank statements, generating client invoices, and tracking accounts payable. Many virtual assistant agencies and remote staffing firms hire candidates based on organizational ability, basic numeracy, and software certifications (such as QuickBooks ProAdvisor) rather than formal university degrees.
              </p>
            </details>
          
            <details
              
              className="group"
              style={{
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                background: "#f8fafc",
                padding: "1rem 1.25rem",
                transition: "all 0.2s ease",
              }}
            >
              <summary
                style={{
                  cursor: "pointer",
                  fontSize: "0.92rem",
                  fontWeight: 700,
                  color: "#0f172a",
                  lineHeight: 1.4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>How much do entry-level remote bookkeepers earn in 2026?</span>
                <span className="text-blue-600 transition-transform group-open:rotate-180" style={{ fontSize: "0.8rem", marginLeft: "8px" }}>▼</span>
              </summary>
              <p
                style={{
                  marginTop: "0.75rem",
                  fontSize: "0.86rem",
                  lineHeight: 1.7,
                  color: "#475569",
                  borderTop: "1px solid #e2e8f0",
                  paddingTop: "0.75rem",
                  marginBottom: 0,
                }}
              >
                Entry-level remote bookkeepers in the United States and Europe typically earn between $20 and $30 per hour, which equates to $40,000 to $62,000 annually for full-time positions. Independent freelance bookkeepers on platforms like Upwork or working with private small business retainers often scale their rates to $45–$75 per hour once they manage multiple client books.
              </p>
            </details>
          
            <details
              
              className="group"
              style={{
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                background: "#f8fafc",
                padding: "1rem 1.25rem",
                transition: "all 0.2s ease",
              }}
            >
              <summary
                style={{
                  cursor: "pointer",
                  fontSize: "0.92rem",
                  fontWeight: 700,
                  color: "#0f172a",
                  lineHeight: 1.4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>Which certifications carry the most weight for beginner remote bookkeepers?</span>
                <span className="text-blue-600 transition-transform group-open:rotate-180" style={{ fontSize: "0.8rem", marginLeft: "8px" }}>▼</span>
              </summary>
              <p
                style={{
                  marginTop: "0.75rem",
                  fontSize: "0.86rem",
                  lineHeight: 1.7,
                  color: "#475569",
                  borderTop: "1px solid #e2e8f0",
                  paddingTop: "0.75rem",
                  marginBottom: 0,
                }}
              >
                The QuickBooks Online Certified ProAdvisor certification is universally recognized, 100% free, and can be completed online within 10 to 15 hours directly through Intuit Education. Pair this with the Xero Advisor Certification and a foundational certificate in Microsoft Excel or Google Sheets to dramatically outperform other entry-level applicants.
              </p>
            </details>
          
            <details
              
              className="group"
              style={{
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                background: "#f8fafc",
                padding: "1rem 1.25rem",
                transition: "all 0.2s ease",
              }}
            >
              <summary
                style={{
                  cursor: "pointer",
                  fontSize: "0.92rem",
                  fontWeight: 700,
                  color: "#0f172a",
                  lineHeight: 1.4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>What hardware and home office setup do I need to work from home as a bookkeeper?</span>
                <span className="text-blue-600 transition-transform group-open:rotate-180" style={{ fontSize: "0.8rem", marginLeft: "8px" }}>▼</span>
              </summary>
              <p
                style={{
                  marginTop: "0.75rem",
                  fontSize: "0.86rem",
                  lineHeight: 1.7,
                  color: "#475569",
                  borderTop: "1px solid #e2e8f0",
                  paddingTop: "0.75rem",
                  marginBottom: 0,
                }}
              >
                You will need a reliable laptop or desktop computer with at least 16GB of RAM, dual monitors (highly recommended for cross-referencing ledgers with receipts), high-speed fiber or cable internet (minimum 50 Mbps), and a secure password manager (such as 1Password or Bitwarden) to safeguard confidential client financial credentials.
              </p>
            </details>
          
            <details
              
              className="group"
              style={{
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                background: "#f8fafc",
                padding: "1rem 1.25rem",
                transition: "all 0.2s ease",
              }}
            >
              <summary
                style={{
                  cursor: "pointer",
                  fontSize: "0.92rem",
                  fontWeight: 700,
                  color: "#0f172a",
                  lineHeight: 1.4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>Are remote bookkeeping jobs flexible or strictly 9-to-5?</span>
                <span className="text-blue-600 transition-transform group-open:rotate-180" style={{ fontSize: "0.8rem", marginLeft: "8px" }}>▼</span>
              </summary>
              <p
                style={{
                  marginTop: "0.75rem",
                  fontSize: "0.86rem",
                  lineHeight: 1.7,
                  color: "#475569",
                  borderTop: "1px solid #e2e8f0",
                  paddingTop: "0.75rem",
                  marginBottom: 0,
                }}
              >
                Most remote bookkeeping roles are inherently asynchronous. Because bank reconciliations and ledger entries do not require real-time collaboration with customers, many employers allow you to complete your weekly hours whenever it suits your schedule, provided month-end closes and invoicing deadlines are met.
              </p>
            </details>
          
        </div>
      </section>

      {/* ── High-Converting Bottom CTA ── */}
      <section
        className="fade-up glass-card text-center"
        style={{
          background: "linear-gradient(135deg, #1e40af, #2563eb)",
          borderRadius: "1.5rem",
          padding: "clamp(2rem, 5vw, 3rem) 1.5rem",
          color: "#ffffff",
          boxShadow: "0 10px 25px rgba(37, 99, 235, 0.25)",
        }}
      >
        <span style={{ fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: "#93c5fd" }}>
          Verified Work-From-Home Openings
        </span>
        <h2 style={{ fontFamily: "var(--font-playfair), Georgia, serif", fontSize: "1.8rem", fontWeight: 800, margin: "0.5rem 0", color: "#ffffff" }}>
          Ready to Start Your Remote Career?
        </h2>
        <p style={{ maxWidth: "560px", margin: "0 auto 1.5rem", fontSize: "0.92rem", lineHeight: 1.6, color: "#dbeafe" }}>
          Browse thousands of fresh, verified remote jobs across the US, UK, and Europe with competitive salaries.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/"
            style={{
              background: "#ffffff",
              color: "#1e40af",
              fontWeight: 800,
              fontSize: "0.85rem",
              padding: "0.65rem 1.4rem",
              borderRadius: "10px",
              textDecoration: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            Search All Remote Jobs →
          </Link>
          <Link
            href="/remote-jobs-in-us"
            style={{
              background: "rgba(255,255,255,0.15)",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "0.85rem",
              padding: "0.65rem 1.25rem",
              borderRadius: "10px",
              textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.3)",
            }}
          >
            🇺🇸 US Remote Jobs
          </Link>
        </div>
      </section>
    </div>
  );
}
