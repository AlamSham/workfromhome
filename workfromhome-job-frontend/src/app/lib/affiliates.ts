/**
 * Centralized Job Affiliate & Career Tools Configuration
 * 
 * You can easily update your affiliate links here or via environment variables in .env.local:
 * - NEXT_PUBLIC_AFFILIATE_RESUME_BUILDER_URL
 * - NEXT_PUBLIC_AFFILIATE_RESUME_SCANNER_URL
 * - NEXT_PUBLIC_AFFILIATE_INTERVIEW_PREP_URL
 * - NEXT_PUBLIC_AFFILIATE_COURSES_URL
 */

export interface AffiliateTool {
  id: string;
  name: string;
  badge: string;
  title: string;
  description: (jobTitle: string, company?: string) => string;
  ctaText: string;
  url: (jobTitle: string, company?: string) => string;
  icon: string;
}

// Fallback affiliate URLs — replace these with your Impact, ShareASale, CJ, or direct partner affiliate links
const DEFAULT_RESUME_BUILDER_BASE = 
  process.env.NEXT_PUBLIC_AFFILIATE_RESUME_BUILDER_URL || "https://novoresume.com";

const DEFAULT_RESUME_SCANNER_BASE = 
  process.env.NEXT_PUBLIC_AFFILIATE_RESUME_SCANNER_URL || "https://www.jobscan.co";

const DEFAULT_INTERVIEW_PREP_BASE = 
  process.env.NEXT_PUBLIC_AFFILIATE_INTERVIEW_PREP_URL || "https://www.coursera.org";

const DEFAULT_COURSES_BASE = 
  process.env.NEXT_PUBLIC_AFFILIATE_COURSES_URL || "https://www.coursera.org/search";

/**
 * Returns dynamic affiliate link for ATS Resume Builder tailored to job title
 */
export function getResumeBuilderUrl(jobTitle: string, company?: string): string {
  try {
    const url = new URL(DEFAULT_RESUME_BUILDER_BASE);
    url.searchParams.set("utm_source", "remotejobdesk");
    url.searchParams.set("utm_medium", "job_affiliate");
    url.searchParams.set("utm_campaign", "ats_resume");
    if (jobTitle) url.searchParams.set("role", jobTitle);
    return url.toString();
  } catch {
    return DEFAULT_RESUME_BUILDER_BASE;
  }
}

/**
 * Returns dynamic affiliate link for ATS Resume Scanner / Checker
 */
export function getResumeScannerUrl(jobTitle: string): string {
  try {
    const url = new URL(DEFAULT_RESUME_SCANNER_BASE);
    url.searchParams.set("utm_source", "remotejobdesk");
    url.searchParams.set("utm_medium", "job_affiliate");
    url.searchParams.set("utm_campaign", "resume_scanner");
    if (jobTitle) url.searchParams.set("job_title", jobTitle);
    return url.toString();
  } catch {
    return DEFAULT_RESUME_SCANNER_BASE;
  }
}

/**
 * Returns dynamic affiliate link for Interview Prep
 */
export function getInterviewPrepUrl(jobTitle: string): string {
  try {
    const url = new URL(DEFAULT_INTERVIEW_PREP_BASE);
    url.searchParams.set("utm_source", "remotejobdesk");
    url.searchParams.set("utm_medium", "job_affiliate");
    url.searchParams.set("utm_campaign", "interview_prep");
    if (jobTitle) url.searchParams.set("query", `${jobTitle} interview`);
    return url.toString();
  } catch {
    return DEFAULT_INTERVIEW_PREP_BASE;
  }
}

/**
 * Returns dynamic affiliate link for Professional Courses & Upskilling
 */
export function getCoursesUrl(categoryOrTitle: string): string {
  try {
    const url = new URL(DEFAULT_COURSES_BASE);
    url.searchParams.set("utm_source", "remotejobdesk");
    url.searchParams.set("utm_medium", "job_affiliate");
    url.searchParams.set("query", categoryOrTitle || "remote work skills");
    return url.toString();
  } catch {
    return DEFAULT_COURSES_BASE;
  }
}
