# 📋 RemoteJobDesk — Affiliate & Monetization Tracker

> **Saved On:** September 19, 2026  
> **Registered Email:** `shamshadalamansari2@gmail.com`  
> **Website URL:** `https://remotejobdesk.com/`

---

## 1. Kickresume Partner Program (ATS Resume Builder)

- **Product:** AI Resume Builder & ATS-Friendly CV Templates
- **Partner Network:** Tapfiliate
- **Login Portal:** [https://kickresume.tapfiliate.com/](https://kickresume.tapfiliate.com/)
- **Registered Email:** `shamshadalamansari2@gmail.com`
- **Application Date:** September 19, 2026
- **Commission Rate:** **30% per purchase (Recurring)**
- **Current Status:** 🟡 **Pending Review** (Usually takes a few hours to 24 hours)
- **Payout Method:** PayPal (`shamshadalamansari2@gmail.com`)
- **Next Step:** 
  - जैसे ही ईमेल पर अप्रूवल आए, Tapfiliate में लॉगिन करें।
  - "Programs" या "Deeplink generator" से अपना Referral Link कॉपी करें।
  - लिंक को वेबसाइट की `.env.local` में `NEXT_PUBLIC_AFFILIATE_RESUME_BUILDER_URL` पर सेट करें।

---

## 2. Jobscan Partner Program (ATS Resume Scanner)

- **Product:** Top Recruiter ATS Resume Checker & Keyword Matcher
- **Official Portal:** [https://www.jobscan.co/partnerships](https://www.jobscan.co/partnerships)
- **Registered Email:** `shamshadalamansari2@gmail.com`
- **Application Date:** September 19, 2026
- **Affiliate Network:** Impact.com
- **Commission Rate:** **Up to $40 per paid subscription**
- **Current Status:** 🟡 **Form Submitted** (Review takes 1–2 business days)
- **Next Step:**
  - Jobscan की पार्टनरशिप टीम ईमेल पर संपर्क करेगी।
  - अपना Impact.com अकाउंट लिंक करके ट्रैकिंग लिंक प्राप्त करें।
  - `.env.local` में `NEXT_PUBLIC_AFFILIATE_RESUME_SCANNER_URL` पर लिंक डालें।

---

## 3. Fiverr Affiliate Program (Professional Resume Writing)

- **Product:** Expert ATS Resume Writers, CV Redesign, LinkedIn Makeovers
- **Official Portal:** [https://affiliates.fiverr.com/](https://affiliates.fiverr.com/)
- **Registered Email:** `shamshadalamansari2@gmail.com`
- **Application Date:** September 19, 2026
- **Commission Rate:** **$15 – $150 CPA** (First-time buyers)
- **Current Status:** 🟡 **Under Review** (Takes 2–4 business days)
- **Next Step:**
  - Fiverr से अप्रूवल ईमेल आने पर डैशबोर्ड लॉगिन करें।
  - "Default and Deep Links" में जाकर Resume Writing कैटेगरी का लिंक कॉपी करें।

---

## 4. Impact.com (Global Affiliate Network)

- **Official Portal:** [https://app.impact.com/](https://app.impact.com/)
- **Registered Email:** `shamshadalamansari2@gmail.com`
- **Payout Method:** **Direct Indian Bank Transfer (EFT / NEFT via IFSC)** — No PayPal required!
- **Current Status:** 🟢 **Account Active** (Direct brand links like Coursera, Canva, Hostinger allow applying directly through their landing pages).

---

## 5. Monetag Ad Network (Display & Pop Ads)

- **Official Portal:** [https://monetag.com/](https://monetag.com/)
- **Current Status:** 🟢 **Active & Live**
- **Type:** Impression & Click Ads running on website traffic.

---

## 🛠️ वेबसाइट पर लिंक एक्टिवेट कैसे करें?

जब भी किसी कंपनी से आपको आपका **Affiliate Link** मिले:

1. `workfromhome-job-frontend/.env.local` फाइल खोलें और अपना लिंक पेस्ट करें:
```env
NEXT_PUBLIC_AFFILIATE_RESUME_BUILDER_URL="YOUR_KICKRESUME_OR_FIVERR_LINK"
NEXT_PUBLIC_AFFILIATE_RESUME_SCANNER_URL="YOUR_JOBSCAN_LINK"
```

2. `src/app/jobs/[id]/page.tsx` में `JobAffiliateWidget` को अनकमेंट (Uncomment) कर दें:
```tsx
<JobAffiliateWidget
  jobTitle={displayTitle}
  company={job.sourceLabel}
  category={job.category}
  variant="banner"
/>
```
3. Git Commit & Push कर दें।
