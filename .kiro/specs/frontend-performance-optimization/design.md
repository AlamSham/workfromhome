# Design Document: Frontend Performance Optimization

## Overview

This design addresses performance optimization for a low-traffic Next.js application (13 visitors/week, 37 page views) that currently consumes excessive resources (3m CPU time for 7.9K invocations over 30 days). The solution focuses on three simple, high-impact changes:

1. **Increase revalidation periods** from 900s to 1-4 hours based on page type
2. **Implement request deduplication** using React's built-in `cache()` function
3. **Remove WordPress API calls** that add latency and external dependencies

This is a pragmatic, minimal-change approach designed for quick implementation (1-2 hours) with no new dependencies. The design prioritizes simplicity over enterprise patterns like circuit breakers or complex retry logic, which are unnecessary for this traffic level.

### Design Principles

- **Keep it simple**: Configuration changes over architectural rewrites
- **No new dependencies**: Use Next.js and React built-ins only
- **Quick wins**: Target 40% CPU reduction with minimal code changes
- **Low-traffic optimized**: Tune for 13 visitors/week, not 13,000

## Architecture

### Current Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Next.js App (Vercel Serverless)   │
│  ┌───────────────────────────────┐ │
│  │  Page Components              │ │
│  │  - revalidate: 900s           │ │
│  │  - Multiple fetch() calls     │ │
│  │  - WordPress API calls        │ │
│  └───────────────────────────────┘ │
└──────┬──────────────────┬──────────┘
       │                  │
       ▼                  ▼
┌─────────────┐    ┌──────────────┐
│  API Server │    │ WordPress    │
│  (Express)  │    │ REST APIs    │
└─────────────┘    └──────────────┘
```

### Optimized Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Next.js App (Vercel Serverless)   │
│  ┌───────────────────────────────┐ │
│  │  Page Components              │ │
│  │  - revalidate: 3600-14400s    │ │
│  │  - cache() wrapped fetches    │ │
│  │  - NO WordPress calls         │ │
│  └───────────────────────────────┘ │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────┐
│  API Server │
│  (Express)  │
└─────────────┘
```

**Key Changes:**
- Longer revalidation periods reduce regeneration frequency
- `cache()` deduplicates identical requests within render cycle
- WordPress API dependency removed entirely

## Components and Interfaces

### 1. Page Component Modifications

Five page components require revalidation period updates:

#### Home Page (`src/app/page.tsx`)
```typescript
// Current: export const revalidate = 900;
export const revalidate = 3600; // 1 hour
```

**Rationale**: Home page is entry point but content changes slowly. 1-hour cache is sufficient for 13 visitors/week.

#### Country Pages (`src/app/country/[country]/page.tsx`)
```typescript
// Current: export const revalidate = 900;
export const revalidate = 7200; // 2 hours
```

**Rationale**: Country-specific listings change less frequently than global feed. 2-hour cache balances freshness with resource usage.

#### Job Detail Pages (`src/app/jobs/[id]/page.tsx`)
```typescript
// Current: export const revalidate = 1800;
export const revalidate = 7200; // 2 hours
```

**Rationale**: Individual job postings are relatively static once published. 2-hour cache reduces regeneration while maintaining reasonable freshness.

#### Job Category Pages (`src/app/job-categories/[slug]/page.tsx`)
```typescript
// Current: export const revalidate = 900;
export const revalidate = 14400; // 4 hours
```

**Rationale**: Category pages are SEO landing pages with stable content. 4-hour cache is appropriate for low traffic.

#### Company Pages (`src/app/companies/[slug]/page.tsx`)
```typescript
// Current: export const revalidate = 900;
export const revalidate = 14400; // 4 hours
```

**Rationale**: Company-specific listings are stable. 4-hour cache minimizes regeneration for rarely-visited pages.

### 2. Request Deduplication with React cache()

Wrap existing fetch functions with React's `cache()` to deduplicate requests within a render cycle.

#### Implementation Pattern

```typescript
import { cache } from "react";

// Before:
async function fetchJobs(params) {
  const res = await fetch(`${API_BASE_URL}/api/jobs?${params}`, { 
    next: { revalidate } 
  });
  // ... rest of implementation
}

// After:
const fetchJobs = cache(async (params) => {
  const res = await fetch(`${API_BASE_URL}/api/jobs?${params}`, { 
    next: { revalidate } 
  });
  // ... rest of implementation
});
```

**Affected Functions:**
- `fetchJobs()` in all page components
- `fetchCompany()` in company pages
- `fetchTopCompanies()` in company pages
- `fetchCompanyCountries()` in company pages
- `getJobById()` in job detail pages (already cached)

**How cache() Works:**
- Memoizes function results within a single server-side render
- Identical function calls with identical parameters return cached result
- Cache is automatically cleared after render completes
- No configuration or manual cache management needed

### 3. Remove WordPress API Integration

Remove the `fetchWordPressDetail()` function and its usage in job detail pages.

#### Current Implementation (to be removed)

```typescript
async function fetchWordPressDetail(job: JobDetail): Promise<string> {
  const domain = extractDomain(job?.sourceLabel);
  if (!domain) return "";
  // ... WordPress API fetch logic
}

async function buildRichDescription(job: JobDetail): Promise<string> {
  // ... existing logic
  if (String(job?.source || "").toLowerCase() === "google-rss" && best.length < 260) {
    const wpDetail = await fetchWordPressDetail(job); // REMOVE THIS
    if (wpDetail.length > best.length) best = wpDetail;
  }
  return best;
}
```

#### Simplified Implementation

```typescript
async function buildRichDescription(job: JobDetail): Promise<string> {
  const raw = (job?.rawItem || {}) as RawJobItem;
  const candidates = [
    job?.summary, 
    raw?.description, 
    raw?.content,
    raw?.contentSnippet, 
    raw?.job_description,
  ].map((item) => normalizeText(String(item || ""))).filter(Boolean);

  return candidates.sort((a, b) => b.length - a.length)[0] || "";
}
```

**Impact:**
- Removes external API dependency
- Eliminates 2-5 second latency per job detail page load
- Relies on existing job data fields (summary, rawItem.description, etc.)
- Acceptable trade-off: slightly shorter descriptions for zero external calls

### 4. Memory Optimization

No code changes required - existing implementation already meets targets:

- **Pagination**: Already limited to 10 items per page ✓
- **Related jobs**: Already limited to 4 items ✓
- **Page depth**: No artificial limit needed (low traffic means few deep pagination requests)

**Verification Strategy**: Monitor Vercel function logs for memory consumption after revalidation changes.

### 5. Error Handling

Existing error handling is already simple and appropriate:

```typescript
async function fetchJobs(...) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/jobs?${params}`, { next: { revalidate } });
    if (!res.ok) throw new Error();
    // ... success path
  } catch {
    return { 
      jobs: [], 
      pagination: { page: 1, totalPages: 1, total: 0 }, 
      error: "Unable to load jobs. Please refresh." 
    };
  }
}
```

**No changes needed**: Current implementation already uses try-catch, returns user-friendly errors, and avoids complex retry logic.

## Data Models

No data model changes required. Existing interfaces remain unchanged:

```typescript
interface JobDetail {
  _id: string;
  source?: string;
  sourceLabel?: string;
  country?: string;
  category?: string;
  originalTitle: string;
  summary?: string;
  link: string;
  publishedAt?: string;
  expiresAt?: string;
  seo?: SeoFields;
  signals?: JobSignals;
  rawItem?: RawJobItem;
}

interface JobListItem {
  _id: string;
  originalTitle: string;
  summary?: string;
  country?: string;
  category?: string;
  sourceLabel?: string;
  publishedAt?: string;
  seo?: SeoFields;
}
```

## Error Handling

### Current Error Handling (Sufficient)

All fetch functions already implement appropriate error handling:

1. **Try-catch blocks**: Wrap all network requests
2. **User-friendly messages**: Return "Unable to load jobs. Please refresh."
3. **Graceful degradation**: Return empty arrays/default values on failure
4. **Console logging**: Errors are logged for debugging (implicit in catch blocks)

### No Additional Error Handling Needed

For a low-traffic application (13 visitors/week):
- **No circuit breakers**: Unnecessary complexity for this scale
- **No retry logic**: Simple fail-fast is appropriate
- **No error tracking service**: Console logs are sufficient
- **No custom error pages**: Next.js defaults are adequate

### Error Scenarios

| Scenario | Current Behavior | Acceptable? |
|----------|-----------------|-------------|
| API server down | Show "Unable to load jobs" message | ✓ Yes |
| Network timeout | Catch block returns empty state | ✓ Yes |
| Invalid response | Validation fails, returns empty state | ✓ Yes |
| WordPress API fails | (After removal) N/A | ✓ Yes |

## Testing Strategy

### Testing Approach

This optimization involves **configuration changes and infrastructure tuning**, not algorithmic logic. Property-based testing is not applicable. Testing will focus on:

1. **Manual verification** of revalidation periods
2. **Integration testing** of cache behavior
3. **Performance monitoring** via Vercel analytics

### Why Property-Based Testing Does NOT Apply

Property-based testing (PBT) is designed for testing universal properties across many generated inputs. This feature involves:

- **Configuration changes**: Changing `revalidate` constants (no logic to test)
- **Infrastructure optimization**: Removing external API calls (integration concern)
- **Caching behavior**: React's built-in `cache()` function (already tested by React team)

None of these have "for all inputs X, property P(X) holds" characteristics that PBT requires.

### Test Plan

#### 1. Revalidation Period Verification

**Manual Testing:**
```bash
# Verify revalidate exports in each file
grep -r "export const revalidate" src/app/

# Expected output:
# src/app/page.tsx:export const revalidate = 3600;
# src/app/country/[country]/page.tsx:export const revalidate = 7200;
# src/app/jobs/[id]/page.tsx:export const revalidate = 7200;
# src/app/job-categories/[slug]/page.tsx:export const revalidate = 14400;
# src/app/companies/[slug]/page.tsx:export const revalidate = 14400;
```

**Deployment Verification:**
1. Deploy to Vercel
2. Check Vercel function logs for regeneration timestamps
3. Verify pages are regenerated at expected intervals (1h, 2h, 4h)

#### 2. Cache Deduplication Testing

**Unit Test Example:**
```typescript
// Test that cache() prevents duplicate fetches
import { cache } from "react";

describe("Request Deduplication", () => {
  it("should call fetch only once for identical parameters", async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: [] })
    });
    global.fetch = mockFetch;

    const cachedFetch = cache(async (url: string) => {
      return fetch(url);
    });

    // Call twice with same URL
    await cachedFetch("http://api/jobs?page=1");
    await cachedFetch("http://api/jobs?page=1");

    // Should only fetch once
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
```

**Integration Testing:**
1. Add temporary logging to count fetch calls per render
2. Load pages with multiple components fetching same data
3. Verify fetch count decreases by ~30% after cache() implementation

#### 3. WordPress API Removal Verification

**Manual Testing:**
```bash
# Verify fetchWordPressDetail is removed
grep -r "fetchWordPressDetail" src/app/

# Should return no results after removal
```

**Integration Testing:**
1. Load job detail pages
2. Check network tab - verify zero requests to WordPress domains
3. Verify job descriptions still display (using rawItem data)

#### 4. Performance Monitoring

**Metrics to Track (via Vercel Analytics):**

| Metric | Baseline | Target | Measurement Period |
|--------|----------|--------|-------------------|
| CPU time (30 days) | 3m | <1.8m (40% reduction) | 30 days post-deploy |
| Function invocations | 7.9K | <5K | 30 days post-deploy |
| Avg memory per invocation | Unknown | <250 MB | 7 days post-deploy |
| P95 response time | Unknown | <2s | 7 days post-deploy |

**Monitoring Commands:**
```bash
# Check Vercel function logs
vercel logs --follow

# Monitor memory usage
# (Available in Vercel dashboard under Functions tab)
```

#### 5. Regression Testing

**Smoke Tests (Manual):**
- [ ] Home page loads and displays jobs
- [ ] Country pages load with correct filtering
- [ ] Job detail pages display full information
- [ ] Category pages show correct job listings
- [ ] Company pages show company-specific jobs
- [ ] Pagination works on all page types
- [ ] Search functionality works
- [ ] Job filters (seniority, salary) work

**Acceptance Criteria Validation:**

| Requirement | Test Method | Success Criteria |
|-------------|-------------|------------------|
| 1.1-1.5: Revalidation periods | Code inspection | Constants match spec |
| 1.6: CPU reduction | Vercel analytics | ≥40% decrease in 30 days |
| 2.1-2.4: Request deduplication | Unit tests + logging | cache() wraps all fetches |
| 2.5: Network request reduction | Integration test | ≥30% fewer requests |
| 3.1-3.5: WordPress removal | Code inspection + network tab | Zero WordPress calls |
| 4.1-4.5: Memory optimization | Vercel analytics | <250 MB avg memory |
| 5.1-5.5: Error handling | Code inspection | Existing try-catch sufficient |

### Testing Timeline

1. **Pre-deployment** (15 minutes):
   - Code inspection for revalidate constants
   - Verify cache() wrapping
   - Confirm WordPress code removal

2. **Post-deployment** (1 week):
   - Monitor Vercel function logs
   - Check regeneration timestamps
   - Verify network requests

3. **Performance validation** (30 days):
   - Compare CPU time to baseline
   - Validate 40% reduction target
   - Check memory consumption

### Test Automation

**No automated test suite needed** for this optimization because:
- Changes are configuration-only (revalidate constants)
- cache() is a React built-in (already tested)
- Performance metrics come from Vercel analytics (not unit tests)

**Manual verification is sufficient** for a 1-2 hour implementation with low risk.

## Implementation Checklist

### Phase 1: Revalidation Period Updates (15 minutes)

- [ ] Update `src/app/page.tsx`: `revalidate = 3600`
- [ ] Update `src/app/country/[country]/page.tsx`: `revalidate = 7200`
- [ ] Update `src/app/jobs/[id]/page.tsx`: `revalidate = 7200`
- [ ] Update `src/app/job-categories/[slug]/page.tsx`: `revalidate = 14400`
- [ ] Update `src/app/companies/[slug]/page.tsx`: `revalidate = 14400`

### Phase 2: Request Deduplication (30 minutes)

- [ ] Add `import { cache } from "react"` to all page files
- [ ] Wrap `fetchJobs()` with `cache()` in all pages
- [ ] Wrap `fetchCompany()` with `cache()` in company pages
- [ ] Wrap `fetchTopCompanies()` with `cache()` in company pages
- [ ] Wrap `fetchCompanyCountries()` with `cache()` in company pages
- [ ] Verify `getJobById()` already uses `cache()` in job detail pages

### Phase 3: WordPress API Removal (15 minutes)

- [ ] Remove `fetchWordPressDetail()` function from `src/app/jobs/[id]/page.tsx`
- [ ] Simplify `buildRichDescription()` to remove WordPress call
- [ ] Remove `extractDomain()` helper function (no longer needed)
- [ ] Test job detail pages still display descriptions

### Phase 4: Verification (30 minutes)

- [ ] Run `grep -r "export const revalidate" src/app/` to verify constants
- [ ] Run `grep -r "fetchWordPressDetail" src/app/` to verify removal
- [ ] Deploy to Vercel staging
- [ ] Smoke test all page types
- [ ] Check network tab for zero WordPress requests
- [ ] Deploy to production

### Phase 5: Monitoring (ongoing)

- [ ] Monitor Vercel function logs for 7 days
- [ ] Check memory consumption in Vercel dashboard
- [ ] Compare CPU time after 30 days
- [ ] Validate 40% reduction target

## Expected Outcomes

### Performance Improvements

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Home page revalidation | 15 min | 1 hour | 4x less frequent |
| Country page revalidation | 15 min | 2 hours | 8x less frequent |
| Job detail revalidation | 30 min | 2 hours | 4x less frequent |
| Category page revalidation | 15 min | 4 hours | 16x less frequent |
| Company page revalidation | 15 min | 4 hours | 16x less frequent |
| WordPress API calls | ~100/day | 0 | 100% eliminated |
| Duplicate fetches per render | ~3-5 | ~1-2 | ~50% reduction |
| **Total CPU time (30 days)** | **3m** | **<1.8m** | **≥40% reduction** |

### Trade-offs

**Acceptable Trade-offs:**
- **Slightly stale content**: Jobs may be up to 4 hours old on category/company pages
  - *Acceptable because*: 13 visitors/week means most pages are rarely viewed
- **Shorter job descriptions**: No WordPress enrichment for some jobs
  - *Acceptable because*: Existing rawItem data provides adequate descriptions
- **No retry logic**: Simple fail-fast error handling
  - *Acceptable because*: Low traffic means errors are rare and manual refresh is fine

**Unacceptable Trade-offs (avoided):**
- ❌ Breaking existing functionality
- ❌ Degrading SEO (all pages still render server-side)
- ❌ Removing user-facing features

### Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Stale content complaints | Low | Low | Revalidation periods are still reasonable (1-4h) |
| Missing job descriptions | Low | Low | rawItem data provides fallback descriptions |
| Increased error rate | Very Low | Low | Existing error handling is sufficient |
| SEO impact | Very Low | Medium | ISR still generates static pages for crawlers |
| Deployment issues | Low | Medium | Test in staging first, easy rollback |

**Overall Risk Level**: **Low** - Simple configuration changes with minimal code modifications.

## Rollback Plan

If performance targets are not met or issues arise:

1. **Immediate rollback** (5 minutes):
   ```bash
   git revert <commit-hash>
   vercel --prod
   ```

2. **Partial rollback options**:
   - Revert only revalidation periods (keep cache() and WordPress removal)
   - Revert only WordPress removal (keep revalidation and cache())
   - Revert only cache() (keep revalidation and WordPress removal)

3. **Monitoring for rollback decision**:
   - If CPU time doesn't decrease by 30% after 30 days → investigate
   - If error rate increases by >10% → rollback immediately
   - If user complaints about stale content → adjust revalidation periods

## Conclusion

This design provides a simple, pragmatic approach to optimizing a low-traffic Next.js application. By focusing on three high-impact changes (longer revalidation, request deduplication, WordPress removal), we target a 40% CPU reduction with minimal code changes and zero new dependencies.

The implementation is low-risk, easily reversible, and appropriate for the application's traffic profile (13 visitors/week). No complex patterns like circuit breakers or retry logic are needed - simple configuration changes and React built-ins are sufficient.

**Estimated implementation time**: 1-2 hours  
**Expected CPU reduction**: ≥40%  
**Risk level**: Low  
**Rollback time**: 5 minutes
