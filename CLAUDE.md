# THE CAP ROOM

NBA salary-cap explorer. Live: https://the-cap-room.vercel.app

## Stack
Next.js + TypeScript, Vitest, GitHub Actions CI, deployed on Vercel (auto-deploy from main).

## Commands
- Dev: `npm run dev`
- Test: `npm test` | Typecheck: `npm run typecheck`
- Build: `npm run build` (prebuild step runs first)

## Deploy
Push to main deploys via Vercel. A fix is done only after it is observed on the live URL.

## Rules
- No em dashes in user-facing text.
- CI (Actions workflow) must be green after push.
