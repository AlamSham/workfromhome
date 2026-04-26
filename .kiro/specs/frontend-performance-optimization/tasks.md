# Implementation Plan: Frontend Performance Optimization

## Overview

This implementation plan converts the frontend performance optimization design into discrete coding tasks. The approach focuses on three simple, high-impact changes: increasing revalidation periods (1-4 hours based on page type), implementing request deduplication using React's cache() function, and removing WordPress API calls. This is designed for quick implementation (1-2 hours) with no new dependencies, targeting a 40% CPU reduction for low-traffic scenarios.

## Tasks

- [x] 1. Update revalidation periods across page components
  - [x] 1.1 Update home page revalidation period to 1 hour
    - Modify `src/app/page.tsx` to change `export const revalidate = 900;` to `export const revalidate = 3600;`
    - _Requirements: 1.1_
  
  - [x] 1.2 Update country page revalidation period to 2 hours
    - Modify `src/app/country/[country]/page.tsx` to change `export const revalidate = 900;` to `export const revalidate = 7200;`
    - _Requirements: 1.2_
  
  - [x] 1.3 Update job detail page revalidation period to 2 hours
    - Modify `src/app/jobs/[id]/page.tsx` to change `export const revalidate = 1800;` to `export const revalidate = 7200;`
    - _Requirements: 1.3_
  
  - [x] 1.4 Update job category page revalidation period to 4 hours
    - Modify `src/app/job-categories/[slug]/page.tsx` to change `export const revalidate = 900;` to `export const revalidate = 14400;`
    - _Requirements: 1.4_
  
  - [x] 1.5 Update company page revalidation period to 4 hours
    - Modify `src/app/companies/[slug]/page.tsx` to change `export const revalidate = 900;` to `export const revalidate = 14400;`
    - _Requirements: 1.5_

- [x] 2. Implement request deduplication with React cache()
  - [x] 2.1 Add cache() wrapper to fetchJobs function in home page
    - Import `cache` from React in `src/app/page.tsx`
    - Wrap `fetchJobs` function with `cache()` to deduplicate identical requests
    - _Requirements: 2.1, 2.2_
  
  - [x] 2.2 Add cache() wrapper to fetchJobs function in country page
    - Import `cache` from React in `src/app/country/[country]/page.tsx`
    - Wrap `fetchJobs` function with `cache()` to deduplicate identical requests
    - _Requirements: 2.1, 2.2_
  
  - [x] 2.3 Add cache() wrapper to fetch functions in job category page
    - Import `cache` from React in `src/app/job-categories/[slug]/page.tsx`
    - Wrap `fetchJobs` function with `cache()` to deduplicate identical requests
    - _Requirements: 2.1, 2.2_
  
  - [x] 2.4 Add cache() wrapper to fetch functions in company page
    - Import `cache` from React in `src/app/companies/[slug]/page.tsx`
    - Wrap `fetchCompany`, `fetchJobs`, `fetchTopCompanies`, and `fetchCompanyCountries` functions with `cache()`
    - _Requirements: 2.1, 2.2_

- [x] 3. Checkpoint - Verify revalidation and caching changes
  - Ensure all revalidation periods are updated correctly
  - Verify all fetch functions are wrapped with cache()
  - Run grep commands to confirm changes: `grep -r "export const revalidate" src/app/` and `grep -r "cache(" src/app/`
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Remove WordPress API integration from job detail pages
  - [x] 4.1 Remove fetchWordPressDetail function
    - Delete the `fetchWordPressDetail` function from `src/app/jobs/[id]/page.tsx`
    - Remove the `extractDomain` helper function as it's no longer needed
    - _Requirements: 3.1, 3.3_
  
  - [x] 4.2 Simplify buildRichDescription function
    - Remove WordPress API call from `buildRichDescription` function
    - Simplify logic to use only existing job data fields (summary, rawItem.description, etc.)
    - Remove the conditional WordPress fetch logic for Google RSS jobs
    - _Requirements: 3.2, 3.4_

- [x] 5. Verify WordPress API removal
  - [x] 5.1 Confirm WordPress functions are removed
    - Run `grep -r "fetchWordPressDetail" src/app/` to verify function removal
    - Run `grep -r "extractDomain" src/app/` to verify helper removal
    - _Requirements: 3.1, 3.3_
  
  - [x] 5.2 Test job detail pages display descriptions
    - Verify job detail pages still render job descriptions using available data
    - Ensure no WordPress API network requests are made
    - _Requirements: 3.4, 3.5_

- [x] 6. Final verification and deployment preparation
  - [x] 6.1 Run smoke tests on all page types
    - Test home page loads and displays jobs correctly
    - Test country pages load with proper filtering
    - Test job detail pages display full information without WordPress calls
    - Test category pages show correct job listings
    - Test company pages show company-specific jobs
    - _Requirements: 1.6, 2.5, 3.5_
  
  - [x] 6.2 Verify memory optimization requirements are met
    - Confirm job listing pagination remains at 10 items per page
    - Confirm related jobs are limited to 4 items maximum
    - Verify no unused imports were introduced
    - _Requirements: 4.1, 4.2, 4.3_

- [x] 7. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
  - Verify all acceptance criteria are met
  - Prepare for deployment to staging environment

## Notes

- This implementation focuses on configuration changes and simple code modifications
- No new dependencies are required - uses Next.js and React built-ins only
- Expected implementation time: 1-2 hours total
- Target: 40% CPU reduction through longer revalidation periods and request deduplication
- WordPress API removal eliminates external dependency and reduces latency
- Memory optimization is already sufficient in current implementation
- Error handling remains simple and appropriate for low-traffic scenarios