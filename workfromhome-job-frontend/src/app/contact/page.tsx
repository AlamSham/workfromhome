import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us — RemoteJobDesk",
  description:
    "Get in touch with the RemoteJobDesk team. Report issues, suggest improvements, or ask questions.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6 lg:px-10">
      <header className="fade-up glass-card p-6 sm:p-10">
        <span className="inline-flex rounded-full bg-brand/10 px-3 py-1 text-xs font-bold tracking-widest text-brand-ink uppercase">
          Contact
        </span>
        <h1 className="mt-3 font-serif text-3xl font-bold text-slate-900 sm:text-4xl">
          Get in Touch
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Have a question, found a broken link, or want to suggest an improvement?
          We&apos;d love to hear from you.
        </p>
      </header>

      <section className="fade-up glass-card p-6 sm:p-10">
        <form
          action="mailto:contact@remotejobdesk.com"
          method="get"
          encType="text/plain"
          className="space-y-5"
        >
          <div>
            <label className="block mb-1.5 text-sm font-semibold text-slate-700">
              Your Name
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="Jane Smith"
              className="w-full h-11 rounded-2xl border border-brand/20 bg-white px-4 text-sm outline-none ring-brand transition focus:ring-2"
            />
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-semibold text-slate-700">
              Your Email
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="jane@example.com"
              className="w-full h-11 rounded-2xl border border-brand/20 bg-white px-4 text-sm outline-none ring-brand transition focus:ring-2"
            />
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-semibold text-slate-700">
              Message
            </label>
            <textarea
              name="body"
              required
              rows={5}
              placeholder="Tell us how we can help…"
              className="w-full rounded-2xl border border-brand/20 bg-white px-4 py-3 text-sm outline-none ring-brand transition focus:ring-2 resize-none"
            />
          </div>

          <button
            type="submit"
            className="btn-primary w-full h-12 rounded-2xl text-sm"
          >
            Send Message ✉️
          </button>
        </form>

        <div className="mt-8 border-t border-slate-100 pt-6 text-center text-sm text-slate-500">
          <p>Or email us directly at{" "}
            <a
              href="mailto:contact@remotejobdesk.com"
              className="font-semibold text-brand-ink hover:underline"
            >
              contact@remotejobdesk.com
            </a>
          </p>
        </div>
      </section>

      <section className="fade-up glass-card p-6 sm:p-8 grid sm:grid-cols-3 gap-4 text-center">
        {[
          { icon: "🐛", label: "Report a Bug", desc: "Broken link or listing?" },
          { icon: "💡", label: "Suggest a Feature", desc: "Help us improve" },
          { icon: "🤝", label: "Partner With Us", desc: "Job boards & publishers" },
        ].map(({ icon, label, desc }) => (
          <div key={label} className="rounded-2xl bg-brand-light p-4">
            <p className="text-2xl">{icon}</p>
            <p className="mt-1 text-sm font-bold text-slate-800">{label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
