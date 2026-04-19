export interface JobCategoryDefinition {
  slug: string;
  label: string;
  query: string;
  heroTitle: string;
  heroDescription: string;
  metaTitle: string;
  metaDescription: string;
  introTitle: string;
  introBody: string;
  relatedSlugs: string[];
}

export const JOB_CATEGORIES: JobCategoryDefinition[] = [
  {
    slug: "software-engineer",
    label: "Software Engineer",
    query: "software",
    heroTitle: "Find Remote Software Engineer Jobs",
    heroDescription:
      "Browse fresh remote software engineering roles across startups, SaaS teams, and global employers hiring in the US, UK, and Europe.",
    metaTitle: "Remote Software Engineer Jobs — Updated Daily",
    metaDescription:
      "Browse remote software engineer jobs across the US, UK, and Europe. Fresh work-from-home engineering roles updated daily.",
    introTitle: "Why This Page Exists",
    introBody:
      "Software engineering is one of the strongest remote hiring categories, but quality listings are scattered across many sources. This landing page groups current engineering roles into a single crawlable destination for both job seekers and search engines.",
    relatedSlugs: ["react-developer", "python-developer", "data-analyst"],
  },
  {
    slug: "react-developer",
    label: "React Developer",
    query: "react",
    heroTitle: "Find Remote React Developer Jobs",
    heroDescription:
      "Discover current React, frontend, and JavaScript-focused remote jobs from companies hiring distributed product and engineering teams.",
    metaTitle: "Remote React Developer Jobs — Work From Home",
    metaDescription:
      "Explore remote React developer jobs and frontend roles updated daily. Find work-from-home openings across the US and Europe.",
    introTitle: "Built For Frontend Job Search",
    introBody:
      "React jobs are often buried inside general software listings. This page creates a dedicated hub for frontend-focused remote opportunities so candidates can find them faster and return for fresh openings.",
    relatedSlugs: ["software-engineer", "python-developer", "product-manager"],
  },
  {
    slug: "customer-support",
    label: "Customer Support",
    query: "support",
    heroTitle: "Find Remote Customer Support Jobs",
    heroDescription:
      "Browse remote customer support, help desk, and service roles from companies hiring distributed support and operations teams.",
    metaTitle: "Remote Customer Support Jobs — Updated Daily",
    metaDescription:
      "Find remote customer support jobs, help desk roles, and service positions across the US, UK, and Europe.",
    introTitle: "A Dedicated Support Jobs Hub",
    introBody:
      "Customer support hiring moves quickly and many roles expire fast. This page brings together remote support opportunities in one place, with freshness and source transparency prioritized.",
    relatedSlugs: ["sales", "marketing", "product-manager"],
  },
  {
    slug: "sales",
    label: "Sales",
    query: "sales",
    heroTitle: "Find Remote Sales Jobs",
    heroDescription:
      "Explore remote sales openings including account management, renewals, partnerships, revenue operations, and business development roles.",
    metaTitle: "Remote Sales Jobs — Work From Home Roles",
    metaDescription:
      "Browse remote sales jobs including account management, business development, and revenue roles updated daily.",
    introTitle: "Remote Revenue Roles In One Place",
    introBody:
      "Sales titles vary widely across employers, from account executive to partner manager to renewals lead. This page groups those intent-driven roles into a more discoverable landing page.",
    relatedSlugs: ["customer-support", "marketing", "product-manager"],
  },
  {
    slug: "data-analyst",
    label: "Data Analyst",
    query: "data",
    heroTitle: "Find Remote Data Analyst Jobs",
    heroDescription:
      "Browse remote data analyst and analytics roles for reporting, insights, operations, and decision-support teams hiring across multiple regions.",
    metaTitle: "Remote Data Analyst Jobs — Updated Daily",
    metaDescription:
      "Find remote data analyst jobs and analytics roles across the US, UK, and Europe. Fresh work-from-home listings updated daily.",
    introTitle: "For Analytics-Focused Candidates",
    introBody:
      "Data roles often overlap with BI, operations, and reporting jobs. This page helps surface those opportunities under a single long-tail landing page with clearer intent.",
    relatedSlugs: ["software-engineer", "python-developer", "product-manager"],
  },
  {
    slug: "product-manager",
    label: "Product Manager",
    query: "product",
    heroTitle: "Find Remote Product Manager Jobs",
    heroDescription:
      "Explore remote product management roles spanning product strategy, lifecycle management, roadmap planning, and cross-functional execution.",
    metaTitle: "Remote Product Manager Jobs — Updated Daily",
    metaDescription:
      "Browse remote product manager jobs and product strategy roles across the US and Europe with fresh listings updated daily.",
    introTitle: "For Product-Led Remote Teams",
    introBody:
      "Product roles are often high-value organic search terms. This landing page helps capture those searches with a dedicated destination that stays aligned to remote-first job intent.",
    relatedSlugs: ["software-engineer", "customer-support", "marketing"],
  },
  {
    slug: "marketing",
    label: "Marketing",
    query: "marketing",
    heroTitle: "Find Remote Marketing Jobs",
    heroDescription:
      "Browse remote marketing roles including growth, performance, brand, lifecycle, content, and campaign management positions.",
    metaTitle: "Remote Marketing Jobs — Work From Home",
    metaDescription:
      "Discover remote marketing jobs including growth, content, and performance marketing roles updated daily.",
    introTitle: "A Better Marketing Search Page",
    introBody:
      "Marketing candidates often search by broad intent before narrowing to specialty areas. This page provides a strong category hub that can grow into narrower subpages over time.",
    relatedSlugs: ["sales", "customer-support", "product-manager"],
  },
  {
    slug: "python-developer",
    label: "Python Developer",
    query: "python",
    heroTitle: "Find Remote Python Developer Jobs",
    heroDescription:
      "Explore remote Python jobs across backend, AI, automation, and platform teams hiring engineers for distributed work.",
    metaTitle: "Remote Python Developer Jobs — Updated Daily",
    metaDescription:
      "Find remote Python developer jobs across backend, automation, and AI-related teams hiring in the US and Europe.",
    introTitle: "For Backend and AI-Oriented Searchers",
    introBody:
      "Python roles show up across backend engineering, AI tooling, and technical automation. This page gives those searches a dedicated SEO destination and creates stronger internal topical coverage.",
    relatedSlugs: ["software-engineer", "react-developer", "data-analyst"],
  },
];

export function getJobCategoryBySlug(slug: string): JobCategoryDefinition | undefined {
  return JOB_CATEGORIES.find((category) => category.slug === String(slug || "").trim().toLowerCase());
}

export function getJobCategoryPath(slug: string): string {
  return `/remote-${slug}-jobs`;
}

export function getJobCategoryCountryPath(categorySlug: string, countrySlug: string): string {
  return `/remote-${categorySlug}-jobs-in-${countrySlug}`;
}
