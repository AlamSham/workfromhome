"use client";

import { COUNTRY_LABELS } from "./SharedJobsFeed";

const COUNTRY_OPTIONS = [
  "US","UK","DE","FR","NL","IE","ES","IT",
  "SE","CH","NO","DK","FI","AT","BE","PT",
  "PL","CZ","HU","RO","GR","IN",
] as const;

export default function HeroSearchForm({ search, country }: { search: string, country: string }) {
  return (
    <form action="/" method="GET" style={{ display: "grid", gap: "0.75rem", gridTemplateColumns: "1fr auto auto", alignItems: "center" }}>
      <input
        name="search"
        defaultValue={search}
        placeholder="Search role, keyword, or skill…"
        style={{
          height: "48px", borderRadius: "0.875rem",
          border: "1.5px solid rgba(11,143,117,0.2)",
          background: "rgba(255,255,255,0.9)",
          padding: "0 1rem", fontSize: "0.9rem", outline: "none",
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)", width: "100%",
        }}
      />
      {/* If we're on a dynamic route, we still allow them to filter back to global search by having standard select */}
      <select
        name="country"
        defaultValue={country}
        onChange={(e) => {
          if (e.target.value) {
            window.location.href = `/remote-jobs-in-${e.target.value.toLowerCase()}${search ? `?search=${search}` : ''}`;
          } else {
            window.location.href = `/${search ? `?search=${search}` : ''}`;
          }
        }}
        style={{
          height: "48px", borderRadius: "0.875rem",
          border: "1.5px solid rgba(11,143,117,0.2)",
          background: "rgba(255,255,255,0.9)",
          padding: "0 0.875rem", fontSize: "0.87rem", outline: "none",
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)", cursor: "pointer",
          minWidth: "140px",
        }}
      >
        <option value="">🌏 All Countries</option>
        {COUNTRY_OPTIONS.map((item) => (
          <option value={item} key={item}>{COUNTRY_LABELS[item] || item}</option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => {
           // Provide native navigation action on button click as well, avoiding generic "?country=" params from GET form
           const form = document.querySelector('form');
           const input = form?.querySelector('input[name="search"]') as HTMLInputElement;
           const select = form?.querySelector('select[name="country"]') as HTMLSelectElement;
           const sVal = input?.value || "";
           const cVal = select?.value || "";

           if (cVal) {
             window.location.href = `/remote-jobs-in-${cVal.toLowerCase()}${sVal ? `?search=${sVal}` : ''}`;
           } else {
             window.location.href = `/${sVal ? `?search=${sVal}` : ''}`;
           }
        }}
        style={{
          height: "48px", borderRadius: "0.875rem",
          background: "var(--brand)", color: "#fff",
          padding: "0 1.5rem", fontSize: "0.9rem", fontWeight: 700,
          border: "none", cursor: "pointer", whiteSpace: "nowrap",
          boxShadow: "0 2px 8px rgba(11,143,117,0.3)", transition: "background 0.18s",
        }}
      >
        Find Jobs
      </button>
    </form>
  );
}
