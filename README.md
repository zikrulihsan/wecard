# FlipCard

Aplikasi web card game — kartu pertanyaan (Talk) & tantangan (Action) buat ngobrol sama teman, keluarga, pasangan, atau anak. Dimainkan bareng di satu device.

## Format Kartu

Selain kartu obrolan, deck bisa berisi kartu kuis & latihan yang punya sisi jawaban. Kartu dibuka (sampul → pertanyaan), lalu dibalik sekali lagi untuk melihat jawabannya.

| Format | `card_type` | Isi `details` |
| --- | --- | --- |
| Talk / Action / Special | `talk` `action` `special` | — |
| Tanya jawab | `quiz` | `answer` |
| Pilihan ganda | `multiple_choice` | `options`, `correctIndex` |
| Mitos atau fakta | `true_false` | `isTrue` |
| Tebak clue | `clue` | `clues`, `answer` |
| Urutkan | `ordering` | `items` (urutan benar; diacak saat main) |
| Mendengar | `listening` | `questions[{question, answer}]` — teks yang dibacakan ada di `content_text` |

Semua format kuis boleh punya `explanation`. Tingkat kesulitannya memakai kolom `level` (1–5 bintang). Pilihan ganda & mitos/fakta dinilai otomatis; format lain dinilai sendiri oleh pemain (Benar/Belum), dan skornya tampil di layar selesai. Bentuk `details` didefinisikan di `packages/types/src/database.ts` dan divalidasi di `apps/web/src/lib/cards/formats.ts`.

## Tech Stack

- **Monorepo**: Turborepo + pnpm
- **Frontend**: React + Vite + TypeScript + React Router
- **Backend**: TypeScript Netlify Functions (`/api/ai-access`, `/api/decks/generate`)
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
3. Jalankan migration AI deck berurutan: `packages/supabase/migrations/00002_ai_decks.sql`, `00003_ai_access.sql`, `00004_deck_theme.sql` (warna deck), `00005_ai_quota.sql` (akses AI untuk semua akun + kuota 2 deck), lalu `20260930094439_unlimited_ai_for_zikrulihsanmd.sql` (pengecualian kuota untuk satu akun). Sampai migration terakhir dijalankan, aplikasi tetap memakai kuota bawaan. Setelah itu jalankan `00006_card_formats.sql` (format kartu kuis & mendengar) sebagai eksekusi tersendiri. Lalu `00007_deck_mode.sql` (jenis deck: ngobrol, tantangan, kuis, mendengar). Lalu `00008_deck_language.sql` (bahasa isi deck: Indonesia atau Inggris). Lalu `00009_share_links.sql` (link main tanpa akun, papan skor grup, atribusi pendaftaran — lihat [Link Main](#link-main)). Lalu `00010_credits.sql` (saldo kredit, draf deck, revisi, pesanan paket kredit — lihat [Kredit, draf & revisi](#kredit-draf--revisi)). **Jalankan `00010` sebelum mendeploy versi web yang memakainya** — generate menyimpan draf berstatus `draft`, kolom yang baru ada setelah migration ini. Terakhir `00011_premium.sql` (seri premium, pembelian volume/seri, hadiah, versi pribadi, salin deck — lihat [Deck Premium](#deck-premium)).
4. Lalu jalankan seed data (urut):
   - `packages/supabase/seed.sql` — kategori **Pasangan**
   - `packages/supabase/seed_anak_orang_tua.sql` — kategori **Anak & Orang Tua**
   - `packages/supabase/seed_kuis_mendengar.sql` — deck **Latihan Mendengar** dan **Uji Diri: AI Engineering** (butuh migration `00006` dan `00007`)
   - `packages/supabase/seed_english.sql` — versi English keempat deck di atas: **Couples**, **Kids & Parents**, **Listening Practice**, **Self-Test: AI Engineering** (butuh migration `00006`–`00008`)
   - `packages/supabase/seed_english_speaking.sql` — seri premium **English Speaking Practice**, 3 volume × 24 kartu (butuh migration `00011`)
5. Salin `.env.example` ke `apps/web/.env.local`, lalu isi URL dan anon key:

```bash
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
VITE_TRIAL_FREE_CARDS=4   # opsional: jumlah kartu pertama tiap deck yang bisa dimainkan tanpa akun di /coba
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
```

### 2a. Setup URL konfirmasi email

Tautan di email konfirmasi dibentuk Supabase. Setel **Authentication → URL
Configuration** pada project produksi agar kembali ke origin aplikasi.

Isi di dashboard Supabase project produksi:

| Field | Nilai |
| --- | --- |
| **Site URL** | `https://flipcard.id` |
| **Redirect URLs** | `https://flipcard.id/callback`, plus `http://localhost:5173/callback` untuk dev |

Catatan penting:

- `emailRedirectTo` dari aplikasi menunjuk `/callback` pada origin tempat
  pengguna mendaftar. URL itu harus ada di daftar **Redirect URLs**.
- Tautan lama berbentuk `/?code=...` masih diarahkan oleh React Router ke
  `/callback`; host yang salah pada tautan email perlu diperbaiki di dashboard.

### 2b. Login dengan Google

1. Buat OAuth client bertipe **Web application** di Google Cloud. Isi
   **Authorized JavaScript origins** dengan `https://flipcard.id` dan
   **Authorized redirect URIs** dengan
   `https://<project-ref>.supabase.co/auth/v1/callback` dari dashboard Supabase.
2. Di Supabase **Authentication → Providers → Google**, aktifkan provider dan
   isi Client ID serta Client Secret dari Google Cloud.
3. Pastikan `https://flipcard.id/callback` ada di **Redirect URLs** Supabase.
   Untuk dev, tambahkan `http://localhost:5173/callback`.

Callback Google memakai alur PKCE di browser. Client Secret hanya disimpan di
dashboard Supabase, tidak di repo atau variabel `VITE_`.

Variabel produksi `NEXT_PUBLIC_SUPABASE_URL` dan
`NEXT_PUBLIC_SUPABASE_ANON_KEY` yang lama masih dibaca sementara untuk
membantu migrasi. Nama baru yang disarankan adalah `VITE_SUPABASE_URL` dan
`VITE_SUPABASE_ANON_KEY`; kedua nilai ini masuk ke bundle browser. Untuk
Functions, setel `SUPABASE_URL` dan `SUPABASE_ANON_KEY` di Netlify. Setelah
mengubah env build, lakukan deploy ulang.

### 2c. Setup AI (fitur generate deck)

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

Key hanya dipakai di Netlify Function `/api/decks/generate` dan tidak dikirim ke browser. Jangan pakai prefix `VITE_`.

### 3. Run dev server

```bash
pnpm dev
```

Buka [http://localhost:5173](http://localhost:5173). Plugin Netlify Vite
menjalankan Functions secara lokal pada origin yang sama.

### Deploy di Netlify

Gunakan base directory root repo. `netlify.toml` membangun `apps/web/dist` dan
membundel `apps/web/netlify/functions`. Rewrite `/api/*` harus berada sebelum
rewrite SPA `/* → /index.html` supaya endpoint tidak menjadi HTML. File
`apps/web/netlify.toml` dipakai plugin Netlify saat `pnpm dev` dijalankan dari
workspace web.

## Struktur

```
apps/
  web/                 # Vite app dan Netlify Functions
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

- [x] Auth (email/password dan Google OAuth)
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
- [x] Generate deck pakai AI (`/create`) — kartu ditulis AI berdasarkan input user, jadi draf yang bisa direvisi lalu disimpan dengan 1 kredit

## Generate Deck dengan AI

Halaman `/create` membuat deck baru lewat LLM dengan structured output. Provider bisa Gemini (default `gemini-3.5-flash`) atau Claude (default `claude-opus-5`) — lihat setup di atas. Prompt, validasi, dan penyimpanan sama persis untuk keduanya; yang berbeda hanya file di `apps/web/src/lib/ai/providers/`.

### Kredit, draf & revisi

Sejak migration `00010`, jatah "2 deck AI per akun" diganti **saldo kredit**.
Rencana bisnisnya ada di [`docs/monetisasi.md`](docs/monetisasi.md).

| Aturan | Detail |
| --- | --- |
| Kredit awal | Akun baru dapat 2 kredit (trigger `on_auth_user_created_credits`). Akun lama dapat sisa jatah lamanya sebagai kredit. |
| 1 kredit = 1 deck jadi | Generate menghasilkan **draf** (`categories.status = 'draft'`). Kredit baru terpotong saat draf disimpan lewat tombol "Simpan & main" (`save_deck()`). |
| Syarat generate | Akses aktif, saldo ≥ 1 (atau `ai_unlimited`), tidak ada draf lain yang masih terbuka, maksimal 5 draf per 24 jam. |
| Revisi gratis | Per deck: 3x generate ulang penuh + 5x ganti kartu satuan (`/api/decks/revise`). Jatah dicatat setelah revisinya berhasil (`use_revision()`), jadi revisi gagal tidak memakan jatah. |
| Lewat batas | 1 kredit membuka jatah revisi baru (hitungan mulai dari revisi itu). |
| Paket kredit | 5 kredit Rp 15.000, 10 kredit Rp 25.000, dibayar lewat Midtrans Snap. |

Angka aturannya ada di dua tempat dan harus diubah bersamaan:
fungsi `signup_credits()`, `free_regenerations()`, `free_card_swaps()` di
migration `00010`, dan `apps/web/src/lib/credits.ts` (yang juga berisi daftar
paket dan batas draf harian).

**Penjagaan:**

| Lapis | Yang dicegah |
| --- | --- |
| `credit_ledger` hanya bisa dibaca user; ditulis lewat fungsi `SECURITY DEFINER` atau service_role | user menambah saldonya sendiri |
| Policy insert kategori: `status = 'draft'`, jatah revisi 0, `has_ai_access()` (saldo ≥ 1) | deck tersimpan tanpa membayar |
| Privilege kolom: user hanya boleh mengubah `name`, `description`, `theme` kategori | user mengubah status atau mereset jatah revisi |
| Unique index `deck_save` per kategori dan `purchase` per pesanan, plus kunci per akun di `spend_credit()` | potongan/penambahan ganda saat dua permintaan datang bersamaan |
| `credit_orders` hanya ditulis Function memakai service_role; harga diambil dari daftar paket di server | user mengubah harga atau menandai pesanan lunas |

**Admin — tambah atau koreksi kredit manual** (mis. transfer bank):

```sql
insert into credit_ledger (user_id, delta, reason, note)
values ('<user-id>', 5, 'admin', 'transfer manual 10 Okt');

-- saldo satu akun
select coalesce(sum(delta), 0) from credit_ledger where user_id = '<user-id>';
```

`profiles.ai_enabled = false` tetap jadi sakelar pemutus untuk akun yang
menyalahgunakan fitur, dan `profiles.ai_unlimited = true` membebaskan satu
akun dari potongan kredit.

### Setup pembayaran (Midtrans)

Selama kunci Midtrans belum diset, paket kredit tampil "segera hadir" dan
checkout menolak. Untuk membukanya:

1. Di env Netlify, set `SUPABASE_SERVICE_ROLE_KEY` (dari Supabase → Project
   Settings → API) dan `MIDTRANS_SERVER_KEY` (dari dashboard Midtrans). Pakai
   kunci sandbox dulu; `MIDTRANS_PRODUCTION=true` hanya untuk transaksi
   sungguhan. Jangan beri prefix `VITE_`.
2. Di dashboard Midtrans, isi **Payment Notification URL** dengan
   `https://flipcard.id/api/payments/midtrans`.
3. Set `VITE_CREDITS_ON_SALE=true` supaya landing dan `/coba` ikut menyebut
   paketnya bisa dibeli, lalu redeploy.

Alurnya: `/store` → `/api/credits/checkout` (pesanan dicatat, harga dari
server) → halaman bayar Midtrans → kembali ke `/store?order=<id>` →
Midtrans memanggil webhook → tanda tangan diperiksa, status diambil ulang dari
API Midtrans, nominal dicocokkan → `fulfill_credit_order()` menambah saldo
sekali saja per pesanan.

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

**Yang dihasilkan:** satu row `categories` berstatus `draft` (`is_ai_generated = true`, `created_by = user`), N row `sections`, dan N×M row `cards`. Pemain diarahkan ke `/create/[deckId]` untuk memeriksa dan merevisi drafnya; setelah disimpan, deck bisa dimainkan lewat `/play/[deckId]`.

**Batasan:**

- Butuh saldo kredit (lihat "Kredit, draf & revisi" di atas). Generate atau revisi yang gagal tidak memotong apa pun.
- Akun yang aksesnya dicabut (`profiles.ai_enabled = false`) ditolak lebih dulu, sebelum saldo dicek.
- Output model divalidasi ulang dengan zod sebelum masuk DB; kartu `special` tanpa `special_kind` dan kartu kelebihan dibuang di server.
- Deck AI hanya terlihat oleh pembuatnya; kategori kurasi (`created_by IS NULL`) tetap publik. Dijaga di level RLS, bukan di query.
- Input user disisipkan ke prompt sebagai data, bukan instruksi, dan setiap generate dicatat di `ai_generations` (input, provider, model, token, status).

> Konteks yang diisi user tersimpan apa adanya di `ai_generations.input`. Kalau fitur ini dipakai di produksi, pastikan ada dasar pemrosesan dan kebijakan retensi untuk kolom itu sebelum rilis.

### Kalau formulir bikin deck tidak muncul

Cek log Netlify Functions. Helper `getAiAccess()` mencatat
penyebabnya, bukan sekadar gagal diam-diam:

| Baris log | Artinya |
| --- | --- |
| `[ai-access] gagal membaca profiles` dengan `code: 42703` | kolom `ai_enabled` tidak ada — migration `00003` belum jalan di project itu |
| `[ai-access] gagal membaca saldo kredit` | fungsi `credit_balance()` gagal dipanggil — saldo tidak terbaca, jadi ditolak. Kalau fungsinya belum ada (migration `00010` belum jalan), aplikasi memakai hitungan jatah lama |
| `[ai-access] profil tidak terlihat` | tidak ada baris `profiles` untuk `userId` tersebut. Ini **tidak** menutup akses (saldo tetap dijaga `credit_ledger`), tapi tandanya trigger pendaftaran bermasalah |
| tidak ada log sama sekali, tapi halamannya menolak | saldonya memang habis, masih ada draf terbuka, atau `ai_enabled` di-set `false` |

Saldo dan draf terbuka satu akun bisa dicek langsung:

```sql
select coalesce(sum(delta), 0) as saldo from credit_ledger where user_id = '<user-id>';
select id, name from categories where created_by = '<user-id>' and status = 'draft';
```

Setiap baris log menyertakan `supabaseHost` dan `userId`. Dua hal itu yang paling sering jadi biang masalah:

- **`supabaseHost` bukan project yang Anda kira.** `VITE_SUPABASE_URL` ditanam saat build, jadi mengubah env di hosting tanpa redeploy tidak berpengaruh. Gejalanya menipu: halaman home tetap normal karena deck bawaan bisa dibaca tanpa login.
- **`userId` bukan baris yang Anda update.** Tabel `profiles` tidak punya kolom email, jadi cocokkan lewat `auth.users`:

```sql
select u.id, u.email, (p.id is not null) as punya_baris_profil, p.ai_enabled
from auth.users u left join public.profiles p on p.id = u.id
where u.email = 'email@anda.com';
```

## Link Main

Pemilik deck custom bisa membuat **link main** dari halaman deck-nya
(`/play/:deckId`). Siapa pun yang membuka link `/main/<token>` bisa main tanpa
akun — cukup isi nama. Di akhir sesi pemain melihat skornya, **papan skor
grup** (deck kuis), tombol bagikan hasil (lembar bagikan HP, salin, WhatsApp),
dan ajakan "Bikin deck sendiri, dapat 2 kredit gratis". Pemilik bisa
mematikan link kapan saja; menyalakannya lagi memakai link yang sama.

Semua akses pemain tanpa akun lewat fungsi `SECURITY DEFINER` di migration
`00009` — kartu deck custom tetap tidak terbaca lewat RLS biasa. Rencana
lengkap (kredit, premium, Plan Host, cetak) dan query metriknya ada di
[`docs/monetisasi.md`](docs/monetisasi.md).

## Deck Premium

Seri kurasi berbayar. Seri pertama: **English Speaking Practice**
(`seed_english_speaking.sql`) — 3 volume, 24 kartu per volume: prompt
bicara, role-play, dan pola kalimat ("💡 Try: …"), dari pemula sampai
menengah atas.

| Aturan | Detail |
| --- | --- |
| Harga | Rp 10.000 per volume (`categories.price_idr`), Rp 35.000 per seri (`series.price_idr`). Beli seri membuka semua volume, **termasuk volume yang terbit belakangan**. |
| Preview | Tanpa membeli, hanya kartu `is_free_preview` (4 per volume) yang terbaca — dijaga RLS kartu, termasuk untuk tamu. Halaman publik `/seri/<slug>` menampilkan volume, preview gratis, dan tombol beli. |
| Hadiah | Tombol hadiah di halaman seri: pembeli membayar, mendapat kode di Toko, penerima menukarnya di `/hadiah/<kode>`. Kode yang ditukar orang yang sudah punya produknya tidak terpakai. |
| Versi pribadi | Pemilik volume bisa menyalinnya ke akun sendiri seharga 1 kredit (`personalize_premium`) lalu menambah kartu sendiri. Salinan ini ditandai `premium_copy`: tidak bisa dibagikan lewat link, disalin, atau dihadiahkan. |
| Duplikat | Deck premium tidak bisa diduplikat ke akun lain — harus beli atau dihadiahi. |

Deck custom ikut mendapat dua aturan yang tersisa dari rencana:

| Aturan | Detail |
| --- | --- |
| Duplikat ke akun lain | Pemain yang masuk bisa menyimpan deck dari link main ke akunnya, 1 kredit (`copy_shared_deck`). |
| Hadiah | Pemilik membuat kode hadiah seharga 1 kredit (`gift_custom_deck`); penerima mendapat salinannya. |

Pembelian volume/seri memakai checkout & webhook Midtrans yang sama dengan
paket kredit (`credit_orders.product_type`), dan `fulfill_order()` memberi
akses atau kode hadiah sekali saja per pesanan.

**Menguji di sesi sendiri sebelum dijual** — beri akun sendiri akses tanpa
membayar:

```sql
insert into series_purchases (user_id, series_id)
select u.id, s.id from auth.users u, series s
where u.email = 'email@anda.com' and s.slug = 'english-speaking-practice'
on conflict do nothing;
```

Menambah volume baru: insert kategori dengan `series_id` dan `volume`
berikutnya, `is_free = false`, `price_idr`, lalu tandai 3–5 kartu pertamanya
`is_free_preview = true`. Pembeli seri otomatis mendapat volume itu.

## Roadmap

- **Phase 2**: PWA, SEO landing polish, OG image
- **Phase 3**: ~~unlock flow, kategori berbayar~~ — sudah ada lewat seri premium
- **Phase 4**: Analytics, more categories, admin panel

Rencana monetisasi & viral loop yang lebih baru ada di [`docs/monetisasi.md`](docs/monetisasi.md).
