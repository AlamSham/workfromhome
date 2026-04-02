import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — RemoteJobDesk",
  description:
    "Privacy Policy for RemoteJobDesk. Learn how we collect, use, and protect your information.",
};

export default function PrivacyPage() {
  const updated = "March 31, 2025";
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6 lg:px-10">
      <header className="fade-up glass-card p-6 sm:p-10">
        <span className="inline-flex rounded-full bg-brand/10 px-3 py-1 text-xs font-bold tracking-widest text-brand-ink uppercase">
          Legal
        </span>
        <h1 className="mt-3 font-serif text-3xl font-bold text-slate-900 sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: {updated}</p>
      </header>

      {[
        {
          title: "1. Information We Collect",
          body: `RemoteJobDesk does not require account creation or personal information to browse job listings. We may collect anonymized usage data (e.g., page views, search queries) through analytics tools to improve our service. We do not sell or share your personal data with third parties.`,
        },
        {
          title: "2. Cookies",
          body: `We may use cookies and similar technologies to enhance your browsing experience and analyze site traffic. You can control cookie settings through your browser preferences. Disabling cookies may affect some site functionality.`,
        },
        {
          title: "3. Third-Party Links",
          body: `Job listings on RemoteJobDesk link to third-party employer websites. We are not responsible for the privacy practices or content of those external sites. We encourage you to review their privacy policies before submitting any personal information.`,
        },
        {
          title: "4. Data Security",
          body: `We implement industry-standard security measures to protect any data we collect. However, no online transmission is 100% secure. Use this site at your own risk.`,
        },
        {
          title: "5. CCPA / California Residents",
          body: `If you are a California resident, you have rights under the California Consumer Privacy Act (CCPA) to request disclosure of personal information we collect, request deletion of your personal information, and opt-out of the sale of personal information. We do not sell personal information. To exercise your rights, contact us at the email below.`,
        },
        {
          title: "6. GDPR / European Residents",
          body: `If you are located in the European Economic Area (EEA), your data is processed under the General Data Protection Regulation (GDPR). You have the right to access, correct, or delete your data. Contact us for any GDPR-related requests.`,
        },
        {
          title: "7. Changes to This Policy",
          body: `We may update this Privacy Policy periodically. Changes will be posted on this page with an updated date. Continued use of the site after changes constitutes your agreement to the updated policy.`,
        },
        {
          title: "8. Contact",
          body: `For privacy-related questions, contact us at: privacy@remotejobdesk.com`,
        },
      ].map(({ title, body }) => (
        <section key={title} className="fade-up glass-card p-6 sm:p-8 space-y-3">
          <h2 className="section-title">{title}</h2>
          <p className="text-sm leading-7 text-slate-600">{body}</p>
        </section>
      ))}
    </div>
  );
}
