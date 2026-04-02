import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 items-center px-4 py-16 sm:px-6">
      <section className="glass-card fade-up w-full rounded-3xl p-8 text-center">
        <p className="text-sm font-semibold tracking-[0.12em] text-brand-ink">
          404
        </p>
        <h1 className="mt-2 font-serif text-3xl text-slate-900">
          Job Not Found
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate-700">
          Ye listing expire ho chuki hai ya remove ho gayi hai.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-2xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-ink"
        >
          Back To Home
        </Link>
      </section>
    </div>
  );
}
