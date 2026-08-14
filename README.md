# WeCard

Aplikasi web card game untuk pasangan — kartu pertanyaan (Talk) & tantangan (Action) yang dimainkan berdua di satu device.

## Tech Stack

- **Monorepo**: Turborepo + pnpm
- **Frontend**: Next.js 16 (App Router) + TypeScript
- **Database**: Supabase (PostgreSQL + Auth)
- **Styling**: Tailwind CSS 4 + shadcn/ui (base-nova)
- **Animasi**: Framer Motion
- **State**: Zustand dengan localStorage persistence

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Setup Supabase

1. Buat project di [Supabase](https://supabase.com)
2. Di SQL Editor, jalankan migration: `packages/supabase/migrations/00001_initial_schema.sql`
3. Lalu jalankan seed data (urut):
   - `packages/supabase/seed.sql` — kategori **Pasangan**
   - `packages/supabase/seed_anak_orang_tua.sql` — kategori **Anak & Orang Tua**
4. Copy URL dan anon key ke `apps/web/.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

### 3. Run dev server

```bash
pnpm dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Struktur

```
apps/
  web/                 # Next.js app
packages/
  types/               # Shared TypeScript types
  supabase/            # SQL migrations & seed
  config/              # Shared configs
```

## Konten

| Kategori | Section |
| --- | --- |
| **Pasangan** | Warm Up · Appreciation · Deep Talk · Intimate · Future & Dreams |
| **Anak & Orang Tua** | Orang Tua & Anak · Kids & Life |

- **Orang Tua & Anak** — pertanyaan dua arah antara orang tua dan anak, plus action ringan untuk dilakukan bareng.
- **Kids & Life** — role play dan studi kasus dari cerita serta pengalaman anak di sekolah.

## Fitur MVP (Phase 1)

- [x] Auth (email/password)
- [x] Browse categories
- [x] Section picker (pilih level yang mau dimainkan)
- [x] Card game session:
  - Card flip animation (ketuk untuk buka)
  - Swipe left/right untuk navigasi
  - Progress bar
  - Difficulty colors (easy/medium/hard)
  - Special cards (Free Pass, Switch, Double)
  - Completion screen
- [x] Profile + logout
- [x] Store placeholder

## Roadmap

- **Phase 2**: PWA, SEO landing polish, Google OAuth, OG image
- **Phase 3**: Midtrans payment, unlock flow, kategori berbayar
- **Phase 4**: Analytics, share/invite, more categories, admin panel
