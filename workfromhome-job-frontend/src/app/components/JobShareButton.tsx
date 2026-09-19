"use client";

import { useState, useEffect, useRef } from "react";

interface JobShareButtonProps {
  jobTitle: string;
  jobPath: string;
  company?: string;
  variant?: "card" | "detail" | "icon" | "inline";
  className?: string;
}

export default function JobShareButton({
  jobTitle,
  jobPath,
  company,
  variant = "card",
  className = "",
}: JobShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Compute full URL safely on client
  const [fullUrl, setFullUrl] = useState("");
  useEffect(() => {
    if (typeof window !== "undefined") {
      setFullUrl(`${window.location.origin}${jobPath}`);
    }
  }, [jobPath]);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const targetUrl = fullUrl || `https://remotejobdesk.com${jobPath}`;
  const shareText = `Check out this remote job: ${jobTitle}${company ? ` at ${company}` : ""}!`;

  const copyToClipboard = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(targetUrl);
      } else {
        // Fallback for non-https or older browsers
        const textArea = document.createElement("textarea");
        textArea.value = targetUrl;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  const handleNativeShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: jobTitle,
          text: shareText,
          url: targetUrl,
        });
        return;
      } catch (err) {
        // User cancelled or share failed, fallback to dropdown
        if ((err as Error)?.name === "AbortError") return;
      }
    }
    setOpen((prev) => !prev);
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${targetUrl}`)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(targetUrl)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(targetUrl)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(targetUrl)}&text=${encodeURIComponent(shareText)}`;

  // Variant: INLINE (displays full buttons in a row or stack, e.g. for sidebar)
  if (variant === "inline") {
    return (
      <div className={`space-y-2.5 ${className}`}>
        <button
          type="button"
          onClick={copyToClipboard}
          className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-slate-700 hover:text-blue-600 font-semibold text-xs transition duration-200"
        >
          {copied ? (
            <>
              <span className="text-emerald-600 text-sm">✓</span>
              <span className="text-emerald-700 font-bold">Link Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy Direct Job Link</span>
            </>
          )}
        </button>

        <div className="grid grid-cols-4 gap-1.5 pt-1">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center py-2 px-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200 transition"
            title="Share via WhatsApp"
          >
            WhatsApp
          </a>
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center py-2 px-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 transition"
            title="Share on LinkedIn"
          >
            LinkedIn
          </a>
          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center py-2 px-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-300 transition"
            title="Share on X / Twitter"
          >
            𝕏 Post
          </a>
          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center py-2 px-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold border border-sky-200 transition"
            title="Share on Telegram"
          >
            Telegram
          </a>
        </div>
      </div>
    );
  }

  // Variant: ICON ONLY (e.g. mobile bar)
  if (variant === "icon") {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={handleNativeShare}
          className={`p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-600 transition shadow-sm ${className}`}
          title="Share direct job link"
          aria-label="Share direct job link"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
        {renderDropdown()}
      </div>
    );
  }

  // Helper for Dropdown Menu
  function renderDropdown() {
    if (!open) return null;
    return (
      <div
        className="absolute right-0 bottom-full mb-2 sm:bottom-auto sm:top-full sm:mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150"
        style={{ filter: "drop-shadow(0 10px 25px rgba(0, 0, 0, 0.12))" }}
      >
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-900">Share Direct Job Link</span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setOpen(false); }}
            className="text-slate-400 hover:text-slate-600 text-xs p-1"
          >
            ✕
          </button>
        </div>

        {/* Copy Link Row */}
        <button
          type="button"
          onClick={copyToClipboard}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 transition text-xs font-semibold text-slate-700 hover:text-blue-600 mb-2"
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            {copied ? "Link Copied!" : "Copy Direct Link"}
          </span>
          {copied ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-slate-400">Ctrl+C</span>}
        </button>

        {/* Social Share Buttons */}
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium transition"
          >
            <span>💬</span> WhatsApp
          </a>
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium transition"
          >
            <span>💼</span> LinkedIn
          </a>
          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
          >
            <span>𝕏</span> Twitter / X
          </a>
          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-medium transition"
          >
            <span>✈️</span> Telegram
          </a>
        </div>
      </div>
    );
  }

  // Variant: DETAIL PAGE (beside Apply Now button)
  if (variant === "detail") {
    return (
      <div className={`relative inline-block ${className}`} ref={dropdownRef}>
        <button
          type="button"
          onClick={handleNativeShare}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-600 font-bold text-sm transition duration-200 shadow-sm"
          title="Share this job link"
        >
          {copied ? (
            <>
              <span className="text-emerald-600 font-bold">✓</span>
              <span className="text-emerald-600 font-bold">Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span>Share Job</span>
            </>
          )}
        </button>
        {renderDropdown()}
      </div>
    );
  }

  // Default Variant: CARD (compact button for Job Feed cards)
  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={handleNativeShare}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-200 text-slate-600 hover:text-blue-600 text-xs font-semibold transition duration-200"
        title="Share direct link to this job"
      >
        {copied ? (
          <span className="text-emerald-600 font-bold flex items-center gap-1">
            ✓ Copied
          </span>
        ) : (
          <>
            <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span>Share</span>
          </>
        )}
      </button>
      {renderDropdown()}
    </div>
  );
}
