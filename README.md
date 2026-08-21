# FlipCard

Aplikasi web card game — kartu pertanyaan (Talk) & tantangan (Action) buat ngobrol sama teman, keluarga, pasangan, atau anak. Dimainkan bareng di satu device.

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
3. Jalankan migration AI deck berurutan: `packages/supabase/migrations/00002_ai_decks.sql`, `00003_ai_access.sql`, `00004_deck_theme.sql` (warna deck), lalu `00005_ai_quota.sql` (akses AI untuk semua akun + kuota 2 deck)
4. Lalu jalankan seed data (urut):
   - `packages/supabase/seed.sql` — kategori **Pasangan**
   - `packages/supabase/seed_anak_orang_tua.sql` — kategori **Anak & Orang Tua**
5. Copy URL dan anon key ke `apps/web/.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# Origin publik aplikasi — dipakai untuk menyusun tautan konfirmasi email.
# Lokal: http://localhost:3000 · Produksi: https://domain-kamu.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 2a. Setup URL konfirmasi email

Tautan di email konfirmasi dibentuk Supabase, bukan aplikasi ini. Kalau
**Authentication → URL Configuration** di dashboard belum disetel per
environment, tautannya akan menunjuk ke `http://localhost:3000` walaupun
pendaftarannya dari domain produksi.

Isi di dashboard Supabase project produksi:

| Field | Nilai |
| --- | --- |
| **Site URL** | `https://domain-kamu.com` |
| **Redirect URLs** | `https://domain-kamu.com/callback`, plus `http://localhost:3000/callback` untuk dev |

Catatan penting:

- Supabase hanya menghormati `emailRedirectTo` kalau URL-nya cocok dengan salah
  satu entri **Redirect URLs**. Kalau tidak cocok, entri itu dibuang diam-diam
  dan pengguna dilempar ke **Site URL** — inilah kenapa tautannya bisa mendarat
  di `http://localhost:3000/?code=...` alih-alih `/callback`.
- `NEXT_PUBLIC_SITE_URL` di deploy produksi harus domain produksi. Variabel ini
  dibaca saat build, jadi setelah diubah perlu redeploy.
- Sebagai jaring pengaman, middleware aplikasi mengalihkan `/?code=...` ke
  `/callback`, jadi tautan lama tetap bisa dipakai selama host-nya benar. Host
  yang salah (`localhost` di email pengguna) tetap hanya bisa dibetulkan lewat
  dua setelan di atas.

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

### Akses & kuota

Fitur ini **terbuka untuk semua akun**, dengan jatah **2 deck AI per akun** —
sekali seumur akun, bukan per jam. Jatah dihitung dari baris `ai_generations`
berstatus `success`, jadi generate yang gagal (LLM error, output ditolak
validasi) tidak memakan jatah.

`profiles.ai_enabled` masih ada, tapi fungsinya berubah: dari gerbang masuk
jadi **sakelar pemutus** untuk mencabut akses satu akun yang menyalahgunakan
fitur.

```sql
-- cabut akses satu akun
UPDATE profiles SET ai_enabled = false WHERE id = '<user-id>';

-- kembalikan
UPDATE profiles SET ai_enabled = true WHERE id = '<user-id>';

-- beri jatah tambahan: hapus catatan generate akun tersebut (service_role /
-- SQL Editor — user tidak bisa melakukannya sendiri)
DELETE FROM ai_generations WHERE user_id = '<user-id>' AND status = 'success';
```

Angka kuotanya ada di dua tempat dan harus diubah bersamaan:
`public.ai_generation_limit()` (migration `00005`) dan `AI_GENERATION_LIMIT` di
`apps/web/src/lib/ai/quota.ts`. Seluruh teks yang menyebut angka ini — landing
page, kartu di halaman utama, halaman `/create` — membacanya dari konstanta itu,
jadi tidak ada angka yang ditulis tangan di salinan teks.

Gerbangnya berlapis, dan urutannya penting:

| Lapis | Letak | Yang dicegah |
| --- | --- | --- |
| API route | `api/decks/generate`, sebelum `generateDeck()` | biaya token AI — panggilan LLM terjadi sebelum insert apa pun |
| RLS | policy `Insert own AI categories` + `has_ai_access()` (akses **dan** kuota) | insert langsung ke Supabase pakai anon key, melewati API route |
| Privilege tabel | `REVOKE UPDATE, DELETE ON ai_generations` | user mereset jatahnya sendiri dengan menghapus riwayat generate |
| Privilege kolom | `REVOKE UPDATE ON profiles` + `GRANT UPDATE (display_name, …)` | user menyalakan kembali `ai_enabled` yang dicabut |
| UI | sisa jatah tampil di `/home` dan `/create`, nav "Bikin" bergembok saat habis | menu yang menggoda tapi selalu gagal |

**Di mana batasnya disebut ke pemain:**

| Tempat | Yang ditampilkan |
| --- | --- |
| Landing page `/` | bagian "Bikin Deck dengan AI": cara kerjanya dalam tiga langkah, plus kotak "Batasnya: 2 deck per akun" — jatah sekali seumur akun, generate gagal tidak memotong jatah, deck-nya privat |
| `/home` | kartu ajakan berisi sisa jatah (`2 deck gratis, sisamu 2`), berubah jadi catatan abu-abu begitu habis |
| `/create` | sub-judul menyebut jatah per akun, sisa jatah tepat di atas tombol generate, dan catatan tersendiri kalau jatahnya habis |
| Nav bawah | gembok di tab "Bikin" begitu tidak bisa generate lagi |

Dua lapis privilege itu perlu karena RLS tidak mengenal batasan per kolom dan
policy lama `Manage own generations` (`FOR ALL`) mengizinkan user menghapus
barisnya sendiri — artinya jatah 2 deck bisa direset lewat satu `delete()`
dengan anon key. Setelah migration `00005`, `ai_generations` hanya bisa dibaca
dan ditambah dari sisi user, dan `profiles.ai_enabled` hanya bisa diubah lewat
`service_role` / SQL Editor.

**Field input:**

| Field | Wajib | Keterangan |
| --- | --- | --- |
| Mau dimainkan sama siapa | ya | pasangan / sahabat / keluarga / anak & orang tua / rekan kerja / kenalan baru / lainnya |
| Nuansa | ya | santai · romantis · reflektif · seru · mendalam |
| Kedalaman | ya | ringan · sedang · dalam — menentukan sebaran `difficulty` |
| Jumlah section | ya | 2–5 |
| Kartu per section | ya | 5–15 |
| Isi kartu | ya | campuran (±⅓ action) · pertanyaan saja · **tantangan saja** |
| Sertakan kartu Special | — | default nonaktif; 1 kartu Free Pass/Switch/Double per section |
| Nama deck | — | kosong = dibuatkan AI |
| Konteks tambahan | — | maks 500 karakter, situasi spesifik pemain |
| Topik yang dihindari | — | maks 300 karakter |

**Yang dihasilkan:** satu row `categories` (`is_ai_generated = true`, `created_by = user`), N row `sections`, dan N×M row `cards` — langsung bisa dimainkan lewat flow `/play/[deckId]` yang sudah ada.

**Batasan:**

- 2 deck AI per akun, dihitung dari generate yang berhasil (lihat "Akses & kuota" di atas). Generate yang gagal tidak memakan jatah.
- Akun yang aksesnya dicabut (`profiles.ai_enabled = false`) ditolak lebih dulu, sebelum kuota dicek.
- Output model divalidasi ulang dengan zod sebelum masuk DB; kartu `special` tanpa `special_kind` dan kartu kelebihan dibuang di server.
- Deck AI hanya terlihat oleh pembuatnya; kategori kurasi (`created_by IS NULL`) tetap publik. Dijaga di level RLS, bukan di query.
- Input user disisipkan ke prompt sebagai data, bukan instruksi, dan setiap generate dicatat di `ai_generations` (input, provider, model, token, status).

> Konteks yang diisi user tersimpan apa adanya di `ai_generations.input`. Kalau fitur ini dipakai di produksi, pastikan ada dasar pemrosesan dan kebijakan retensi untuk kolom itu sebelum rilis.

### Kalau formulir bikin deck tidak muncul

Cek log server (Netlify/Vercel/Cloudflare). Helper `getAiAccess()` mencatat
penyebabnya, bukan sekadar gagal diam-diam:

| Baris log | Artinya |
| --- | --- |
| `[ai-access] gagal membaca profiles` dengan `code: 42703` | kolom `ai_enabled` tidak ada — migration `00003` belum jalan di project itu |
| `[ai-access] gagal menghitung ai_generations` | tabel `ai_generations` tidak ada (migration `00002`) atau RLS menyembunyikannya — sisa jatah tidak terbaca, jadi ditolak |
| `[ai-access] baris profil tidak terlihat untuk sesi ini` | tidak ada baris `profiles` untuk `userId` tersebut. Ini **tidak** menutup akses (kuota tetap dijaga hitungan `ai_generations`), tapi tandanya trigger pendaftaran bermasalah |
| tidak ada log sama sekali, tapi halamannya menolak | jatahnya memang habis, atau `ai_enabled` di-set `false` |

Sisa jatah satu akun bisa dicek langsung:

```sql
select count(*) as terpakai
from ai_generations
where user_id = '<user-id>' and status = 'success';
```

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
