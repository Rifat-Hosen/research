# Nutrition Survey App

Next.js app for the research survey inside the `D:\research` Turborepo. Convex lives at `D:\research\packages\backend\convex`, matching the KI monolith architecture.

## Routes

- `/` - public survey form
- `/success` - survey submit success
- `/admin/login` - admin login
- `/admin/dashboard` - live dashboard
- `/admin/submissions` - response table and CSV export
- `/admin/submissions/[id]` - full response detail
- `/admin/share` - form link and QR code

## Default Admin Login

```text
username: admin
password: configured in `.env.local`
```

## Environment

`.env.local` is already configured:

```env
NEXT_PUBLIC_CONVEX_URL=
CONVEX_HTTP_ACTIONS_URL=
NEXT_PUBLIC_SURVEY_FORM_URL=
ADMIN_USERNAME=
ADMIN_PASSWORD=
```

## Run Locally

```bash
cd D:\research
bun install
bun run convex:dev
bun run dev --filter=@workspace/nutrition-survey
```

Open `http://localhost:3003`.

## Deploy

```bash
cd D:\research
bun run deploy:convex
bun run build --filter=@workspace/nutrition-survey
```

Deploy the Next.js app folder to Vercel and set the same environment variables.

## Note

The project files are standalone and no longer import from the KI monolith.
