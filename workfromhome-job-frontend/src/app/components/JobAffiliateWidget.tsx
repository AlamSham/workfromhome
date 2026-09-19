import { 
  getResumeBuilderUrl, 
  getResumeScannerUrl, 
  getInterviewPrepUrl, 
  getCoursesUrl 
} from "../lib/affiliates";

interface JobAffiliateWidgetProps {
  jobTitle: string;
  company?: string;
  category?: string;
  variant?: "banner" | "sidebar" | "card";
  className?: string;
}

export default function JobAffiliateWidget({
  jobTitle,
  company,
  category,
  variant = "banner",
  className = "",
}: JobAffiliateWidgetProps) {
  const resumeBuilderUrl = getResumeBuilderUrl(jobTitle, company);
  const resumeScannerUrl = getResumeScannerUrl(jobTitle);
  const interviewPrepUrl = getInterviewPrepUrl(jobTitle);
  const coursesUrl = getCoursesUrl(category || jobTitle);

  // 1. SIDEBAR TOOLKIT VARIANT
  if (variant === "sidebar") {
    return (
      <div className={`glass-card rounded-3xl p-5 sm:p-6 border border-blue-100 bg-gradient-to-b from-white to-blue-50/30 ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🎯</span>
          <div>
            <h2 className="text-sm font-bold text-slate-900 leading-tight">Job Application Toolkit</h2>
            <p className="text-[11px] text-slate-500">Tools to increase your interview chances</p>
          </div>
        </div>

        <div className="space-y-3 mt-4">
          {/* ATS Resume Builder */}
          <a
            href={resumeBuilderUrl}
            target="_blank"
            rel="nofollow sponsored noopener noreferrer"
            className="group block p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition flex items-center gap-1.5">
                <span>📄</span> ATS Resume Builder
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                Top Pick
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 line-clamp-2">
              Create an ATS-friendly resume tailored specifically for {jobTitle}.
            </p>
            <div className="mt-2 text-xs font-bold text-blue-600 flex items-center gap-1 group-hover:gap-1.5 transition-all">
              <span>Build My Resume</span>
              <span>→</span>
            </div>
          </a>

          {/* ATS Scanner */}
          <a
            href={resumeScannerUrl}
            target="_blank"
            rel="nofollow sponsored noopener noreferrer"
            className="group block p-3 rounded-2xl bg-white/80 border border-slate-200 hover:border-slate-300 hover:bg-white transition duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 transition flex items-center gap-1.5">
                <span>⚡</span> Scan CV for ATS Match
              </span>
              <span className="text-[10px] font-semibold text-slate-400">Score Check</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Test your current resume against recruiter screening algorithms.
            </p>
          </a>

          {/* AI Interview Prep */}
          <a
            href={interviewPrepUrl}
            target="_blank"
            rel="nofollow sponsored noopener noreferrer"
            className="group block p-3 rounded-2xl bg-white/80 border border-slate-200 hover:border-slate-300 hover:bg-white transition duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 transition flex items-center gap-1.5">
                <span>💬</span> Interview Prep
              </span>
              <span className="text-[10px] font-semibold text-emerald-600">Practice</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Top interview questions and STAR answer framework for {jobTitle}.
            </p>
          </a>

          {/* Upskill Courses */}
          <a
            href={coursesUrl}
            target="_blank"
            rel="nofollow sponsored noopener noreferrer"
            className="group block p-3 rounded-2xl bg-white/80 border border-slate-200 hover:border-slate-300 hover:bg-white transition duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 transition flex items-center gap-1.5">
                <span>🎓</span> Skill Certifications
              </span>
              <span className="text-[10px] font-semibold text-purple-600">Courses</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Certificates to make your application stand out to hiring teams.
            </p>
          </a>
        </div>
      </div>
    );
  }

  // 2. MAIN BANNER VARIANT (Placed strategically above/below Job Overview)
  return (
    <div
      className={`glass-card rounded-2xl p-5 sm:p-7 border border-blue-200 bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-white relative overflow-hidden shadow-sm ${className}`}
    >
      {/* Background subtle badge accent */}
      <div className="absolute top-0 right-0 transform translate-x-3 -translate-y-3 opacity-10 pointer-events-none text-8xl">
        📄
      </div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-100/90 text-blue-800 text-[11px] font-extrabold tracking-wide uppercase mb-2">
            <span>⚡ High Interview Success Tip</span>
            <span>•</span>
            <span>ATS Resume Filter</span>
          </div>

          <h3 className="text-base sm:text-lg font-serif font-bold text-slate-900 leading-snug">
            Need an ATS-Optimized Resume for this {jobTitle} role?
          </h3>

          <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
            Over <strong>75% of applications</strong> are automatically rejected by Applicant Tracking Systems (ATS) before a human recruiter reads them. Create an ATS-compliant resume with the exact keywords for <strong>{jobTitle}</strong>{company ? ` at ${company}` : ""}.
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-600">
            <span className="flex items-center gap-1">
              <span className="text-emerald-600 font-bold">✓</span> 100% ATS-Compliant Layout
            </span>
            <span className="flex items-center gap-1">
              <span className="text-emerald-600 font-bold">✓</span> Keyword Optimizer
            </span>
            <span className="flex items-center gap-1">
              <span className="text-emerald-600 font-bold">✓</span> Ready in 3 Minutes
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0 min-w-[200px]">
          <a
            href={resumeBuilderUrl}
            target="_blank"
            rel="nofollow sponsored noopener noreferrer"
            className="btn-job-cta justify-center text-center py-3 px-5 text-sm font-bold shadow-md hover:shadow-lg transition duration-200"
          >
            <span>Create ATS Resume →</span>
          </a>

          <a
            href={resumeScannerUrl}
            target="_blank"
            rel="nofollow sponsored noopener noreferrer"
            className="btn-outline justify-center text-center py-2 px-4 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:border-blue-300 transition"
          >
            <span>Check My Resume ATS Score</span>
          </a>
        </div>
      </div>
    </div>
  );
}
