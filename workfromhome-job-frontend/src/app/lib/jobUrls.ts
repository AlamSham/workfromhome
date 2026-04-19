export function slugifyJobTitle(value: string): string {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function getJobSlug(value: { seo?: { slug?: string }; originalTitle?: string }): string {
  const seoSlug = String(value?.seo?.slug || "").trim();
  if (seoSlug) return seoSlug;
  return slugifyJobTitle(String(value?.originalTitle || "remote-job")) || "remote-job";
}

export function getJobPath(value: { _id: string; seo?: { slug?: string }; originalTitle?: string }): string {
  return `/jobs/${getJobSlug(value)}-${value._id}`;
}

export function extractJobId(param: string): string {
  const raw = String(param || "").trim();
  if (/^[a-f0-9]{24}$/i.test(raw)) return raw;

  const match = raw.match(/([a-f0-9]{24})$/i);
  return match?.[1] || raw;
}
