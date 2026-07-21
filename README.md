# Nutrition Research Monorepo

Turborepo workspace for the nutrition survey research app, following the same `apps/*` and `packages/backend/convex` architecture as `D:\KI-QUDRAT\ki2-monolith-solution`.

## Structure

```text
D:\research
  apps\nutrition-survey
  packages\backend\convex
```

## Install

Run package installation from the monorepo root:

```powershell
cd D:\research
bun install
```

`turbo install` is also available as a convenience task because this project defines an `install` task in `turbo.json`.

## Develop

```powershell
cd D:\research
bun run dev --filter=@workspace/nutrition-survey
```

The app runs on:

```text
http://localhost:3003
```

## Convex

```powershell
cd D:\research
bun run convex:dev
```

Configured URLs:

```env
NEXT_PUBLIC_CONVEX_URL=
CONVEX_HTTP_ACTIONS_URL=
```

## Build

```powershell
cd D:\research
bun run build --filter=@workspace/nutrition-survey
```
