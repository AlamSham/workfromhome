"use client";

import { useState } from "react";
import Link from "next/link";
import BrandLogo from "./BrandLogo";

const navLinks = [
  { href: "/", label: "Jobs" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/blog", label: "Blog" },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center shrink-0 text-decoration-none"
          onClick={() => setMobileMenuOpen(false)}
        >
          <BrandLogo size="md" />
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 text-sm font-semibold text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/remote-jobs-in-us"
            className="ml-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg shadow-sm hover:shadow transition-all whitespace-nowrap"
          >
            <span>🇺🇸</span>
            <span>US Jobs</span>
          </Link>
        </div>

        {/* Mobile Action & Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href="/remote-jobs-in-us"
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition whitespace-nowrap"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span>🇺🇸</span>
            <span>US Jobs</span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            className="inline-flex items-center justify-center p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none transition"
          >
            {mobileMenuOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg animate-in slide-in-from-top-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-100 space-y-1">
            <Link
              href="/editorial-policy"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800"
            >
              Editorial Policy
            </Link>
            <Link
              href="/how-we-source-jobs"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800"
            >
              How We Source Jobs
            </Link>
            <Link
              href="/privacy"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
