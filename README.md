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
3. Jalankan migration AI deck: `packages/supabase/migrations/00002_ai_decks.sql`, lalu `packages/supabase/migrations/00003_ai_access.sql`
4. Lalu jalankan seed data (urut):
   - `packages/supabase/seed.sql` — kategori **Pasangan**
   - `packages/supabase/seed_anak_orang_tua.sql` — kategori **Anak & Orang Tua**
5. Copy URL dan anon key ke `apps/web/.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

### 2b. Setup AI (fitur generate deck)

Fitur generate mendukung dua provider. Isi salah satu (atau dua-duanya) di `apps/web/.env.local`:

```bash
# Google Gemini
GEMINI_API_KEY=xxx

# Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-xxx
```

**Provider mana yang dipakai:**

1. Kalau `AI_PROVIDER` diisi (`gemini` atau `anthropic`), itu yang menang.
2. Kalau tidak, dipakai key yang tersedia — Gemini lebih dulu.

Opsional, untuk mengunci versi model:

```bash
AI_PROVIDER=gemini          # paksa provider tertentu
GEMINI_MODEL=gemini-3.5-flash
ANTHROPIC_MODEL=claude-opus-5
```

Key hanya dipakai di server (route handler `/api/decks/generate`) dan tidak pernah dikirim ke browser. Jangan pakai prefix `NEXT_PUBLIC_`.

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
- [x] Generate deck pakai AI (`/create`) — kartu ditulis Claude berdasarkan input user, tersimpan sebagai deck privat milik akun tersebut

## Generate Deck dengan AI

Halaman `/create` membuat deck baru lewat LLM dengan structured output. Provider bisa Gemini (default `gemini-3.5-flash`) atau Claude (default `claude-opus-5`) — lihat setup di atas. Prompt, validasi, dan penyimpanan sama persis untuk keduanya; yang berbeda hanya file di `apps/web/src/lib/ai/providers/`.

### Akses terbatas

Fitur ini **mati secara default** untuk semua akun (`profiles.ai_enabled` default `false`). Untuk membuka akses:

```sql
UPDATE profiles SET ai_enabled = true WHERE id = '<user-id>';
```

Atau centang kolom `ai_enabled` lewat Table Editor Supabase. Mencabut akses tinggal set kembali ke `false` — deck AI yang sudah terlanjur dibuat tetap bisa dimainkan pemiliknya.

Gerbangnya berlapis, dan urutannya penting:

| Lapis | Letak | Yang dicegah |
| --- | --- | --- |
| API route | `api/decks/generate`, sebelum `generateDeck()` | biaya token AI — panggilan LLM terjadi sebelum insert apa pun |
| RLS | policy `Insert own AI categories` + `has_ai_access()` | insert langsung ke Supabase pakai anon key, melewati API route |
| Privilege kolom | `REVOKE UPDATE ON profiles` + `GRANT UPDATE (display_name, …)` | user memberi akses ke dirinya sendiri lewat `update({ ai_enabled: true })` |
| UI | nav "Bikin" bergembok, `/create` menampilkan status terkunci | menu yang menggoda tapi selalu gagal |

Lapis privilege kolom perlu karena RLS tidak mengenal batasan per kolom: policy `Update own profile` mengizinkan user menulis ke baris profilnya sendiri, termasuk kolom `ai_enabled`, kalau tidak dibatasi lewat `GRANT`. Setelah migration `00003`, kolom itu hanya bisa diubah lewat `service_role` / SQL Editor.

**Field input:**

| Field | Wajib | Keterangan |
| --- | --- | --- |
| Mau dimainkan sama siapa | ya | pasangan / sahabat / keluarga / anak & orang tua / rekan kerja / kenalan baru / lainnya |
| Nuansa | ya | santai · romantis · reflektif · seru · mendalam |
| Kedalaman | ya | ringan · sedang · dalam — menentukan sebaran `difficulty` |
| Jumlah section | ya | 2–5 |
| Kartu per section | ya | 5–15 |
| Sertakan kartu Action | — | default aktif; ±⅓ kartu jadi tipe `action` |
| Sertakan kartu Special | — | default nonaktif; 1 kartu Free Pass/Switch/Double per section |
| Nama deck | — | kosong = dibuatkan AI |
| Konteks tambahan | — | maks 500 karakter, situasi spesifik pemain |
| Topik yang dihindari | — | maks 300 karakter |

**Yang dihasilkan:** satu row `categories` (`is_ai_generated = true`, `created_by = user`), N row `sections`, dan N×M row `cards` — langsung bisa dimainkan lewat flow `/play/[deckId]` yang sudah ada.

**Batasan:**

- Hanya untuk akun dengan `profiles.ai_enabled = true` (lihat "Akses terbatas" di atas).
- 5 generate per user per jam (dicek lewat tabel `ai_generations`).
- Output model divalidasi ulang dengan zod sebelum masuk DB; kartu `special` tanpa `special_kind` dan kartu kelebihan dibuang di server.
- Deck AI hanya terlihat oleh pembuatnya; kategori kurasi (`created_by IS NULL`) tetap publik. Dijaga di level RLS, bukan di query.
- Input user disisipkan ke prompt sebagai data, bukan instruksi, dan setiap generate dicatat di `ai_generations` (input, provider, model, token, status).

> Konteks yang diisi user tersimpan apa adanya di `ai_generations.input`. Kalau fitur ini dipakai di produksi, pastikan ada dasar pemrosesan dan kebijakan retensi untuk kolom itu sebelum rilis.

### Kalau fitur tetap terkunci padahal `ai_enabled` sudah `true`

Cek log server (Netlify/Vercel/Cloudflare). Helper `getAiAccess()` mencatat penyebabnya, bukan sekadar gagal diam-diam:

| Baris log | Artinya |
| --- | --- |
| `[ai-access] gagal membaca profiles` dengan `code: 42703` | kolom `ai_enabled` tidak ada — migration `00003` belum jalan di project itu |
| `[ai-access] baris profil tidak terlihat untuk sesi ini` | tidak ada baris `profiles` untuk `userId` tersebut, atau RLS menyembunyikannya |
| tidak ada log sama sekali, tapi tetap terkunci | baris terbaca dan `ai_enabled` memang `false` |

Setiap baris log menyertakan `supabaseHost` dan `userId`. Dua hal itu yang paling sering jadi biang masalah:

- **`supabaseHost` bukan project yang Anda kira.** `NEXT_PUBLIC_SUPABASE_URL` ditanam saat build, jadi mengubah env di hosting tanpa redeploy tidak berpengaruh. Gejalanya menipu: halaman home tetap normal karena deck bawaan bisa dibaca tanpa login.
- **`userId` bukan baris yang Anda update.** Tabel `profiles` tidak punya kolom email, jadi cocokkan lewat `auth.users`:

```sql
select u.id, u.email, (p.id is not null) as punya_baris_profil, p.ai_enabled
from auth.users u left join public.profiles p on p.id = u.id
where u.email = 'email@anda.com';
```

## Roadmap

- **Phase 2**: PWA, SEO landing polish, Google OAuth, OG image
- **Phase 3**: Midtrans payment, unlock flow, kategori berbayar
- **Phase 4**: Analytics, share/invite, more categories, admin panel
