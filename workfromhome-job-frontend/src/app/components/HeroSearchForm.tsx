"use client";

import { COUNTRY_LABELS } from "./SharedJobsFeed";

const COUNTRY_OPTIONS = [
  "US","UK","DE","FR","NL","IE","ES","IT",
  "SE","CH","NO","DK","FI","AT","BE","PT",
  "PL","CZ","HU","RO","GR","IN",
] as const;

export default function HeroSearchForm({ search, country }: { search: string, country: string }) {
  function buildDestination(searchValue: string, countryValue: string) {
    const params = new URLSearchParams(window.location.search);
    const nextSearch = String(searchValue || "").trim();
    const nextCountry = String(countryValue || "").trim().toUpperCase();

    params.delete("page");

    if (nextSearch) {
      params.set("search", nextSearch);
    } else {
      params.delete("search");
    }

    if (nextCountry) {
      params.delete("country");
      const query = params.toString();
      return `/remote-jobs-in-${nextCountry.toLowerCase()}${query ? `?${query}` : ""}`;
    }

    params.delete("country");
    const query = params.toString();
    return `/${query ? `?${query}` : ""}`;
  }

  return (
    <>
      <style>{`
        .hero-search-form {
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
        }
        .hero-search-form input,
        .hero-search-form select {
          width: 100%;
        }
        .hero-search-form button {
          width: 100%;
        }
        @media (min-width: 600px) {
          .hero-search-form {
            display: grid;
            grid-template-columns: 1fr auto auto;
            align-items: center;
            gap: 0.75rem;
          }
          .hero-search-form input,
          .hero-search-form select,
          .hero-search-form button {
            width: auto;
          }
        }
      `}</style>
      <form action="/" method="GET" className="hero-search-form">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search role, keyword, or skill…"
          style={{
            height: "48px", borderRadius: "0.875rem",
            border: "1.5px solid rgba(11,143,117,0.2)",
            background: "rgba(255,255,255,0.9)",
            padding: "0 1rem", fontSize: "0.9rem", outline: "none",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          }}
        />
        <select
          name="country"
          defaultValue={country}
          onChange={(e) => {
            const form = document.querySelector('.hero-search-form');
            const input = form?.querySelector('input[name="search"]') as HTMLInputElement;
            window.location.href = buildDestination(input?.value || search, e.target.value);
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
            const form = document.querySelector('.hero-search-form');
            const input = form?.querySelector('input[name="search"]') as HTMLInputElement;
            const select = form?.querySelector('select[name="country"]') as HTMLSelectElement;
            const sVal = input?.value || "";
            const cVal = select?.value || "";
            window.location.href = buildDestination(sVal, cVal);
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
    </>
  );
}
