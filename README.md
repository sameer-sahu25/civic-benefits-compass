# Civic Benefits Compass (NAGSI)

Academic prototype for discovering Indian government schemes and exploring public-sector AI governance. This is **not** an official government platform.

## Development

You need Node.js and npm.

```sh
git clone https://github.com/sameer-sahu25/civic-benefits-compass.git
cd civic-benefits-compass
cp .env.example .env
npm i
npm run dev
```

## Stack

- TanStack Start + React + Vite
- Supabase (Postgres + Auth + RLS)
- Sahayak scheme assistant (`src/lib/chat.server.ts` + `/api/chat`)
