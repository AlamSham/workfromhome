"use client";

import { useState } from "react";
import type { JobFilterState } from "../lib/jobFilters";

interface NewsletterCTAProps {
  title?: string;
  description?: string;
  buttonLabel?: string;
  search?: string;
  country?: string;
  company?: string;
  basePath?: string;
  filters?: JobFilterState;
  alertLabel?: string;
}

export default function NewsletterCTA({
  title = "Save this remote job alert.",
  description = "Store your email with the current page context so you can keep track of similar remote opportunities and reuse this search later.",
  buttonLabel = "Save Alert",
  search = "",
  country = "",
  company = "",
  basePath = "/",
  filters,
  alertLabel = "Daily remote jobs alert",
}: NewsletterCTAProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email) return;

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          frequency: "daily",
          search,
          country,
          company,
          seniority: filters?.seniority || "",
          experience: filters?.experience || "",
          minSalary: filters?.minSalary ? Number(filters.minSalary) : 0,
          basePath,
          label: alertLabel,
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.message || "Unable to subscribe right now.");
      }

      setStatus("success");
      setMessage(payload?.message || "Alert saved successfully.");
      setEmail("");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to subscribe right now.");
    }
  };

  return (
    <section className="fade-up mb-6 mt-10 w-full">
      <div className="relative overflow-hidden rounded-3xl bg-[rgba(15,23,42,0.8)] px-6 py-10 text-center shadow-2xl sm:px-10 md:p-14 border border-slate-800">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-cyan-500 opacity-10 blur-3xl mix-blend-screen" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-blue-500 opacity-10 blur-3xl mix-blend-screen" />

        <div className="relative z-10 mx-auto max-w-xl">
          <h2 className="font-serif text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
            {title.includes("remote job alert") ? (
              <>
                Save this <span className="gradient-text">remote job alert</span>.
              </>
            ) : (
              title
            )}
          </h2>
          <p className="mt-4 text-sm leading-6 text-slate-300 sm:text-base">
            {description}
          </p>

          <form className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={status === "loading" || status === "success"}
              placeholder="Enter your email address"
              className="flex-1 rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3.5 text-sm text-white placeholder-slate-500 backdrop-blur-sm transition-all focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={status === "loading" || status === "success"}
              className="btn-primary flex min-w-[120px] w-full items-center justify-center py-3.5 sm:w-auto"
            >
              {status === "loading" ? "Saving..." : status === "success" ? "Saved! 🎉" : buttonLabel}
            </button>
          </form>

          <p className="mt-4 text-xs text-slate-400">
            Search alerts are stored with your current page context so you can track similar jobs over time.
          </p>
          {message && (
            <p className={`mt-3 text-sm font-semibold ${status === "error" ? "text-rose-300" : "text-emerald-300"}`}>
              {message}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
