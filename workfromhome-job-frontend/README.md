## RemoteJobDesk Frontend

Modern Next.js + Tailwind frontend for your Work From Home jobs portal.
It reads jobs from your backend API and renders a searchable, country-filtered UI.
Each job card opens a dedicated detail page at `/jobs/[id]`.

## Requirements

- Node.js `>= 20.9.0` (Next.js 16 requirement)
- Backend server running on `http://localhost:5000`

## Setup

1. Create env file:

```bash
cp .env.example .env.local
```

2. Start frontend:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)

## Backend API used

- `GET /api/jobs?page=1&limit=10&search=&country=`

Default API base URL is set in `.env.example`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

## Scripts

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`

## Deployment note

Set `NEXT_PUBLIC_API_BASE_URL` to your live backend URL before deploy.
