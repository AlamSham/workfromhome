export function slugifyJobTitle(value: string): string {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 65);
}

export function getJobSlug(value: { seo?: { slug?: string }; originalTitle?: string }): string {
  const seoSlug = String(value?.seo?.slug || "").trim();
  if (seoSlug) return seoSlug;
  return slugifyJobTitle(String(value?.originalTitle || "remote-job")) || "remote-job";
}

export function getJobPath(value: { 
  _id: string; 
  shortId?: string; 
  sourceLabel?: string; 
  seo?: { slug?: string }; 
  originalTitle?: string 
}): string {
  const titleSlug = getJobSlug(value);
  const companySlug = slugifyJobTitle(value?.sourceLabel || "");
  const shortId = (value.shortId || value._id?.slice(-6) || "").toLowerCase();

  // If company slug exists and is not already part of title slug, include it for maximum SEO power
  if (companySlug && !titleSlug.includes(companySlug)) {
    return `/jobs/${titleSlug}-${companySlug}-${shortId}`;
  }
  return `/jobs/${titleSlug}-${shortId}`;
}

export function extractJobId(param: string): string {
  const raw = String(param || "").trim();

  // 1. Full 24-char ObjectId (legacy links backwards compatibility)
  const fullMatch = raw.match(/([a-f0-9]{24})$/i);
  if (fullMatch?.[1]) return fullMatch[1];

  // 2. Short 6-char hex ID at the end of the URL slug
  const shortMatch = raw.match(/([a-f0-9]{6})$/i);
  if (shortMatch?.[1]) return shortMatch[1];

  return raw;
}
