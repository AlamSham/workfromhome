import { getJobPath } from "../lib/jobUrls";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://remotejobdesk.com";

export const revalidate = 3600; // 1 hour - ISR cache

function escapeXml(unsafe: string): string {
  if (!unsafe) return "";
  return unsafe
    .replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    })
    // Remove invalid XML characters (control characters except tab, LF, CR)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');
}

export async function GET() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/jobs?page=1&limit=100`, { 
      next: { revalidate: 3600 }
    });
    
    if (!res.ok) throw new Error("Failed to fetch jobs");
    
    const payload = await res.json();
    const jobs = payload?.data || [];

    const rssItems = jobs.map((job: any) => {
      const url = `${SITE_URL}${getJobPath(job)}`;
      const title = job.seo?.metaTitle || job.originalTitle || "Remote Job";
      const desc = job.seo?.metaDescription || job.summary || "";
      const pubDate = new Date(job.publishedAt || Date.now()).toUTCString();
      const company = job.sourceLabel || "Remote Company";
      
      return `
    <item>
      <title>${escapeXml(title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${escapeXml(desc)}]]></description>
      <author>${escapeXml(company)}</author>
      <category>${escapeXml(job.category || "WFH")}</category>
    </item>`;
    }).join('');

    const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>RemoteJobDesk - Latest Remote Jobs</title>
    <link>${SITE_URL}</link>
    <description>Fresh remote work-from-home jobs across the US and Europe, curated daily.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    ${rssItems}
  </channel>
</rss>`;

    return new Response(rssFeed, {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "s-maxage=3600, stale-while-revalidate",
      },
    });
  } catch (error) {
    return new Response("Error generating RSS feed", { status: 500 });
  }
}
