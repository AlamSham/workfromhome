"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  applyJobFiltersToParams,
  clearJobFiltersFromParams,
  DEFAULT_JOB_FILTERS,
  EXPERIENCE_OPTIONS,
  hasActiveJobFilters,
  JobFilterState,
  MIN_SALARY_OPTIONS,
  SENIORITY_OPTIONS,
} from "../lib/jobFilters";

interface JobSearchToolbarProps {
  baseUrl: string;
  initialFilters: JobFilterState;
  search: string;
  country: string;
  company?: string;
  alertLabel: string;
}

export default function JobSearchToolbar({
  baseUrl,
  initialFilters,
  search,
  country,
  company,
  alertLabel,
}: JobSearchToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<JobFilterState>(initialFilters);
  const [email, setEmail] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const activeFilters = useMemo(() => hasActiveJobFilters(filters), [filters]);

  function pushWithFilters(nextFilters: JobFilterState) {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.delete("page");
    applyJobFiltersToParams(params, nextFilters);
    const query = params.toString();
    router.push(query ? `${baseUrl}?${query}` : baseUrl);
  }

  function handleApply() {
    pushWithFilters(filters);
  }

  function handleClear() {
    setFilters(DEFAULT_JOB_FILTERS);
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.delete("page");
    clearJobFiltersFromParams(params);
    const query = params.toString();
    router.push(query ? `${baseUrl}?${query}` : baseUrl);
  }

  async function handleSaveAlert(event: React.FormEvent<HTMLFormElement>) {
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
          frequency,
          search,
          country,
          company,
          seniority: filters.seniority,
          experience: filters.experience,
          minSalary: filters.minSalary ? Number(filters.minSalary) : 0,
          basePath: baseUrl,
          label: alertLabel,
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.message || "Unable to save alert.");
      }

      setStatus("success");
      setMessage(payload?.message || "Search alert saved.");
      setEmail("");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to save alert.");
    }
  }

  return (
    <section className="fade-up">
      <div className="glass-card rounded-3xl p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.18em] text-slate-500">
              Refine This Search
            </p>
            <h2 className="mt-2 text-lg font-bold text-slate-100">
              Filter by salary, experience, and seniority
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              Narrow this page to higher-intent jobs, then save the search so you can come back to the same criteria faster.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <label className="flex flex-col gap-1 text-sm font-semibold text-slate-300">
                Seniority
                <select
                  value={filters.seniority}
                  onChange={(event) => setFilters((current) => ({ ...current, seniority: event.target.value }))}
                  className="rounded-xl border border-slate-700 bg-slate-800/50 px-3 py-3 text-sm font-medium text-slate-200 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                >
                  {SENIORITY_OPTIONS.map((option) => (
                    <option key={option.value || "all"} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1 text-sm font-semibold text-slate-300">
                Experience
                <select
                  value={filters.experience}
                  onChange={(event) => setFilters((current) => ({ ...current, experience: event.target.value }))}
                  className="rounded-xl border border-slate-700 bg-slate-800/50 px-3 py-3 text-sm font-medium text-slate-200 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                >
                  {EXPERIENCE_OPTIONS.map((option) => (
                    <option key={option.value || "all"} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1 text-sm font-semibold text-slate-300">
                Minimum salary
                <select
                  value={filters.minSalary}
                  onChange={(event) => setFilters((current) => ({ ...current, minSalary: event.target.value }))}
                  className="rounded-xl border border-slate-700 bg-slate-800/50 px-3 py-3 text-sm font-medium text-slate-200 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                >
                  {MIN_SALARY_OPTIONS.map((option) => (
                    <option key={option.value || "all"} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={handleApply} className="btn-primary">
                Apply Filters
              </button>
              {activeFilters && (
                <button type="button" onClick={handleClear} className="btn-outline">
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          <div className="w-full lg:max-w-sm">
            <div className="rounded-2xl border border-slate-800 bg-slate-800/30 p-4 sm:p-5">
              <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.18em] text-cyan-400">
                Save Search Alert
              </p>
              <h3 className="mt-2 text-base font-bold text-slate-100">
                Save jobs like these
              </h3>
              <p className="mt-1 text-sm leading-6 text-slate-400">
                {alertLabel}
              </p>

              <form className="mt-4 flex flex-col gap-3" onSubmit={handleSaveAlert}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter your email"
                  disabled={status === "loading"}
                  className="rounded-xl border border-slate-700 bg-slate-900/50 px-3 py-3 text-sm text-slate-200 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand disabled:opacity-60"
                />
                <select
                  value={frequency}
                  onChange={(event) => setFrequency(event.target.value)}
                  disabled={status === "loading"}
                  className="rounded-xl border border-slate-700 bg-slate-900/50 px-3 py-3 text-sm font-medium text-slate-200 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand disabled:opacity-60"
                >
                  <option value="daily">Daily alert</option>
                  <option value="weekly">Weekly digest</option>
                </select>
                <button type="submit" disabled={status === "loading"} className="btn-primary w-full">
                  {status === "loading" ? "Saving..." : "Save Alert"}
                </button>
              </form>

              <p className="mt-3 text-xs text-slate-500">
                Filters selected above are included in this saved search.
              </p>
              {message && (
                <p className={`mt-3 text-sm font-semibold ${status === "error" ? "text-rose-600" : "text-brand-ink"}`}>
                  {message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
