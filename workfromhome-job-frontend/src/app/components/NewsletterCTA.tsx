"use client";

import { useState } from "react";

export default function NewsletterCTA() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    
    // Simulate API call
    setTimeout(() => {
      setStatus("success");
      setEmail("");
    }, 800);
  };

  return (
    <section className="fade-up w-full mt-10 mb-6">
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-10 md:p-14 sm:px-10 text-center shadow-2xl">
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-brand opacity-20 blur-3xl mix-blend-screen" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-violet-600 opacity-20 blur-3xl mix-blend-screen" />
        
        <div className="relative z-10 mx-auto max-w-xl">
          <h2 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl leading-tight">
            Never miss a <span className="text-brand">remote opportunity</span> again.
          </h2>
          <p className="mt-4 text-sm leading-6 text-slate-300 sm:text-base">
            Join 15,000+ knowledge workers getting the best Work-From-Home jobs in the US & Europe sent directly to their inbox daily.
          </p>
          
          <form className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={handleSubmit}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === "loading" || status === "success"}
              placeholder="Enter your email address"
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white placeholder-slate-400 backdrop-blur-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand disabled:opacity-50 transition-all"
            />
            <button
              type="submit"
              disabled={status === "loading" || status === "success"}
              className="rounded-xl bg-brand px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-brand-ink disabled:opacity-50 sm:w-auto w-full flex items-center justify-center min-w-[120px]"
            >
              {status === "loading" ? "Subscribing..." : status === "success" ? "Subscribed! 🎉" : "Subscribe"}
            </button>
          </form>
          
          <p className="mt-4 text-xs text-slate-400">
            No spam, ever. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  );
}
