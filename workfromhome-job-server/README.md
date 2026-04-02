# Work From Home Job Server (Node.js MVC)

Ye backend SEO-focused job ingestion API hai. Har 2 ghante Google RSS se jobs fetch hoti hain (80% WFH + 20% mixed), OpenAI-compatible LLM se better SEO metadata banta hai, aur MongoDB me save hota hai. Next.js frontend directly jobs API se data read kar sakta hai.

## Features

- Node.js + Express MVC structure
- `node-cron` scheduler (default: every 2 hours)
- Multi-country RSS ingestion with US + Europe focus (configurable)
- Ingestion mix target: 80% WFH + 20% mixed
- Per run max 10 jobs
- Freshness filter (default last 72 hours)
- Strict job relevance filter to remove general news/noise
- Automatic old-job cleanup (TTL based)
- OpenAI SEO enrichment:
  - `title`
  - `metaTitle`
  - `metaDescription`
  - `keywords`
  - `slug`
- Duplicate prevention by unique `link` + `dedupeKey` (country + normalized title)
- Country tag stored per job (`US`, `IN`, `UK`)
- Clean APIs for listing jobs + manual ingestion

## Project Structure

```bash
src/
  app.js
  server.js
  config/
    db.js
    env.js
    openai.js
  controllers/
    adminController.js
    jobController.js
  cron/
    jobCron.js
  middleware/
    asyncHandler.js
    errorHandler.js
  models/
    Job.js
  routes/
    adminRoutes.js
    index.js
    jobRoutes.js
  services/
    jobIngestionService.js
    rssService.js
    seoService.js
  utils/
    runIngestOnce.js
```

## Setup

1. Install dependencies

```bash
npm install
```

2. Environment file banao

```bash
cp .env.example .env
```

3. `.env` me required values set karo:

- `MONGODB_URI`
- `OPENAI_API_KEY` (ya NVIDIA key)
- optional: `OPENAI_BASE_URL` (NVIDIA ke liye: `https://integrate.api.nvidia.com/v1`), `CRON_SCHEDULE`, `TARGET_COUNTRIES`, `RSS_RECENCY_DAYS`, `GOOGLE_RSS_URL_*_WFH`, `GOOGLE_RSS_URL_*_MIXED`, `INGEST_MAX_JOBS_PER_RUN`, `INGEST_FRESH_HOURS`, `INGEST_WFH_RATIO`, `INGEST_MIN_JOB_RELEVANCE_SCORE`, `JOB_TTL_DAYS`, `BODY_LIMIT`, `MAX_SEARCH_CHARS`, `ADMIN_API_KEY`, `OPENAI_MODEL`

4. Start server

```bash
npm run dev
```

Server default port: `5000`

## Cron Behavior

- Default schedule: `0 */2 * * *` (har 2 ghante)
- Timezone: `Asia/Kolkata`
- Server start hone ke ~3 second baad initial ingestion run hota hai

## API Endpoints

### Health

- `GET /api/health`

### Jobs

- `GET /api/jobs?page=1&limit=10&search=remote&country=US`
- `GET /api/jobs/:id`

### Admin

- `POST /api/admin/jobs/ingest`

## Example Requests

Get US jobs:

```bash
curl "http://localhost:5000/api/jobs?page=1&limit=20&country=US"
```

Manual ingest:

```bash
curl -X POST http://localhost:5000/api/admin/jobs/ingest
```

## Notes

- `OPENAI_API_KEY` missing ho to fallback SEO generator use hoga.
- Job duplicate detection `link` + normalized-title dedupe key se hota hai.
- Non-job/general news ko relevance scoring se filter kiya jata hai.
- `JOB_TTL_DAYS` ke baad old jobs auto-delete ho jati hain.
- `ADMIN_API_KEY` set karoge to `/api/admin/jobs/ingest` endpoint secured ho jayega (`x-admin-key` header required).
- Country target list `TARGET_COUNTRIES` se manage hoti hai (example: `US,UK,DE,FR,NL,IE,ES,IT,SE,CH,NO,DK,FI,AT,BE,PT,PL,CZ,HU,RO,GR`).
- Frontend (Next.js) directly `/api/jobs` consume karega.

## Optional Script

One-time ingestion run:

```bash
npm run ingest
```
