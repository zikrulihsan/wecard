# Rencana Monetisasi & Viral Loop

Ringkasan keputusan produk yang sudah disepakati, plus status penerapannya di
repo ini. Angka harga masih contoh — diuji dulu sebelum dikunci.

## 1. Prinsip dasar

| Prinsip | Artinya |
| --- | --- |
| Pemain gratis, pembuat yang bayar | Siapa pun bisa main lewat link tanpa daftar |
| Jual hasil, bukan proses AI | 1 kredit = 1 deck jadi, bukan 1 request |
| Deck personal bebas dibagikan | Jadi mesin viral |
| Deck premium dibatasi | Jadi produk yang dijual |

## 2. Produk dan harga awal

| Produk | Isi | Harga contoh |
| --- | --- | --- |
| Gratis saat daftar | 2 kredit + beberapa deck dasar | Rp 0 |
| Paket kredit | Bikin deck custom dengan AI | Rp 15rb/5, Rp 25rb/10 |
| Deck premium (seri) | Deck kurasi per volume | Rp 10rb/volume, Rp 35rb/seri |
| Plan Host | Semua seri premium + kredit bulanan + sesi live lebih banyak pemain | Rp 49–99rb/bulan |
| Cetak deck | Deck custom atau premium dicetak + box | Rp 99–149rb |

## 3. Aturan kredit

| Aturan | Detail |
| --- | --- |
| Kredit terpotong | Saat deck disimpan atau mulai dimainkan |
| Revisi gratis | 3x regenerate penuh + ganti 5 kartu satuan per deck |
| Lewat batas | Pakai 1 kredit lagi |
| Modifikasi deck premium | 1 kredit untuk menambah kartu personal |

## 4. Aturan akses dan sharing

| | Deck custom | Deck premium |
| --- | --- | --- |
| Main di HP pemilik | Ya | Ya |
| Link main ke grup | Ya, bisa dimatikan pemilik | Hanya preview 3–5 kartu |
| Sesi live | Gratis maks 4 pemain, Host lebih banyak | Maks 6–8 pemain, link mati setelah sesi |
| Duplikat ke akun lain | 1 kredit | Tidak bisa, harus beli |
| Gift ke orang lain | Ya | Ya, sebagai pembelian |

## 5. Fitur pendukung viral

| Fitur | Contoh |
| --- | --- |
| Nama tanpa akun | Pemain cukup isi nama sebelum main |
| Papan skor grup (kuis) | "Budi 9/10, Siti 8/10" |
| Hasil bisa dibagikan | "Saya dapat 8/10 di Kuis Sejarah Sumbawa 🎯" + link |
| CTA akhir sesi | "Bikin deck sendiri, dapat 2 kredit gratis" |

## 6. Tahapan

| Fase | Fokus | Isi | Status |
| --- | --- | --- | --- |
| 1 | Viral loop | Link main tanpa login, papan skor, CTA akhir sesi | **Diterapkan** — lihat di bawah |
| 2 | Monetisasi dasar | Paket kredit (minimal top-up), aturan revisi | **Diterapkan** — lihat di bawah |
| 3 | Seri premium pertama | English Speaking Practice, 3 volume siap sebelum rilis, uji di sesimu sendiri | **Diterapkan** — tinggal diuji di sesimu sendiri |
| 4 | Plan Host + sesi live | Untuk tutor dan fasilitator | Belum |
| 5 | Cetak | Uji manual dulu lewat percetakan lokal sebelum dibangun sistemnya | Belum (manual) |

## 7. Angka yang dipantau

| Metrik | Pertanyaan yang dijawab | Bisa diukur sejak |
| --- | --- | --- |
| Pemain → pembuat | Berapa persen pemain yang akhirnya bikin deck sendiri | Fase 1 |
| Pembuat → pembayar | Berapa persen pembuat yang beli kredit atau premium | Fase 2 (`credit_orders`) |
| Pembelian ulang | Berapa yang beli lebih dari sekali | Fase 2 (`credit_orders`) |
| Biaya AI per deck | Rata-rata total generate + revisi per deck, harus jauh di bawah harga kredit | Sekarang (`ai_generations`) |

---

## Fase 1 — yang sudah ada

Migration: `packages/supabase/migrations/00009_share_links.sql`.

| Bagian | Letak | Catatan |
| --- | --- | --- |
| Link main per deck | tabel `deck_shares`, panel di `/play/:deckId` (`components/share/deck-share-panel.tsx`) | Hanya untuk deck custom milik sendiri. Token 16 karakter dibuat database. Mematikan link tidak menghapusnya — dinyalakan lagi, link lama hidup lagi. |
| Main tanpa akun | `/main/:token` (`pages/shared-play.tsx`) | Pemain isi nama (diingat di perangkat), lalu main semua kartu. Kartu dibaca lewat `get_shared_deck()`, yang menolak link yang sudah mati. |
| Papan skor grup | `shared_plays` + `get_shared_scoreboard()` | Skor terbaik per nama, 30 hari terakhir, 20 teratas. Hanya untuk deck yang punya kartu kuis. |
| Bagikan hasil | `components/share/share-actions.tsx` | Lembar bagikan bawaan HP, salin teks + link, dan tombol WhatsApp. Juga muncul di akhir deck coba (`/coba`). |
| CTA akhir sesi | `components/share/maker-cta.tsx` | "Bikin deck sendiri, dapat 2 kredit gratis" → daftar → `/create`. Angkanya dari `AI_GENERATION_LIMIT`. |
| Atribusi pendaftaran | `share_referrals` + `claim_share_referral()` | Token link diingat saat CTA diklik, diklaim begitu akun baru (umur < 1 hari) masuk. |
| Hitungan main | `shared_plays` | Pemilik melihat "Dimainkan N× lewat link" di panelnya. |

Batas yang disengaja di fase ini:

- Deck kurasi/premium belum bisa dibagikan lewat link — aturan preview 3–5
  kartu ikut fase 3.
- Sesi live (banyak HP, satu sesi) belum ada; link main adalah permainan
  sendiri-sendiri yang skornya digabung. Sesi live ikut fase 4.
- "Kredit" di teks CTA kini saldo kredit sungguhan (fase 2).
- Anti-spam papan skor masih kasar: maksimal 300 permainan per deck per jam,
  nama 1–40 karakter, skor harus masuk akal.

## Fase 2 — yang sudah ada

Migration: `packages/supabase/migrations/00010_credits.sql`. Detail teknis dan
penjagaannya ada di README, bagian "Kredit, draf & revisi".

| Bagian | Letak | Catatan |
| --- | --- | --- |
| Saldo kredit | `credit_ledger`, `credit_balance()` | Akun baru +2 (trigger). Akun lama: sisa jatah lama jadi kredit. Saldo = jumlah semua baris. |
| Kredit terpotong saat disimpan | `categories.status` (`draft`/`saved`), `save_deck()`, halaman `/create/:deckId` | Generate menghasilkan draf. Tombol "Simpan & main · 1 kredit" memotong kredit dan langsung membuka deck. Draf tidak bisa dimainkan atau dibagikan. |
| Revisi gratis | `/api/decks/revise`, `use_revision()` | 3x generate ulang + 5x ganti kartu per deck. Lewat batas: 1 kredit membuka jatah baru. Bisa juga dari deck yang sudah tersimpan ("Revisi kartu" di halaman deck). |
| Paket kredit | `/store`, `/api/credits/checkout`, `/api/payments/midtrans`, `credit_orders` | 5 kredit Rp 15.000 · 10 kredit Rp 25.000 lewat Midtrans Snap. Tertutup ("segera hadir") sampai kunci Midtrans diset. |
| Riwayat kredit | `/store` | 10 perubahan saldo terakhir. |

Keputusan yang diambil saat menerapkan (silakan diubah):

- **Satu draf terbuka per akun, maksimal 5 draf baru per 24 jam.** Draf
  belum memotong kredit, jadi tanpa batas ini orang bisa generate terus
  lalu membuang drafnya — biaya AI tanpa pembayaran.
- **Generate butuh saldo ≥ 1** walau kreditnya baru dipotong saat simpan.
- **1 kredit lewat batas membuka jatah revisi penuh yang baru** (bukan cuma
  satu revisi).
- **Midtrans** dipilih karena sudah ada di roadmap repo. Selama belum aktif,
  admin bisa menambah kredit manual lewat SQL (lihat README).

## Fase 3 — yang sudah ada

Migration `00011_premium.sql`, seed `seed_english_speaking.sql`. Detail aturan
dan cara menguji ada di README, bagian "Deck Premium".

| Bagian | Letak | Catatan |
| --- | --- | --- |
| Seri English Speaking Practice | `seed_english_speaking.sql` | Vol. 1 Everyday English · Vol. 2 Stories & Opinions · Vol. 3 Speak with Confidence. 24 kartu per volume, 4 preview. |
| Halaman seri publik | `/seri/english-speaking-practice` | Bisa dibagikan ke grup; tamu bisa mencoba kartu preview tanpa akun. |
| Beli volume / seri / hadiah | `/api/credits/checkout`, `fulfill_order()` | Satu jalur Midtrans untuk semua produk. |
| Tukar hadiah | `/hadiah/<kode>`, Toko | |
| Versi pribadi premium | halaman deck, `personalize_premium()` | 1 kredit, lalu tambah kartu sendiri. |
| Duplikat & hadiah deck custom | layar selesai link main, halaman deck | 1 kredit masing-masing. |

Keputusan yang diambil saat menerapkan (silakan diubah):

- **Harga seri Rp 35.000 untuk 3 volume lebih mahal dari 3 × Rp 10.000.**
  Supaya tetap masuk akal, beli seri membuka **semua volume termasuk yang
  terbit nanti**. Kalau tidak ingin begitu, turunkan harga seri (mis.
  Rp 25.000) di `series.price_idr`.
- **Preview 4 kartu per volume** (kartu pertama tiap section + satu lagi).
- **Versi pribadi tidak bisa dibagikan/dihadiahkan** — isinya konten
  berbayar.
- "Uji di sesimu sendiri": beri akunmu akses lewat SQL di README, mainkan
  dengan murid/kelasmu, lalu revisi kartunya sebelum membuka penjualan.

## Query metrik

Jalankan di SQL Editor Supabase.

**Pemain → pembuat (30 hari terakhir)**

```sql
select
  (select count(*) from shared_plays
     where created_at > now() - interval '30 days')            as main_lewat_link,
  (select count(*) from share_referrals
     where created_at > now() - interval '30 days')            as daftar_dari_link,
  (select count(distinct r.user_id) from share_referrals r
     join ai_generations g on g.user_id = r.user_id and g.status = 'success'
     where r.created_at > now() - interval '30 days')          as jadi_pembuat;
```

**Deck yang paling viral**

```sql
select c.name, count(p.*) as dimainkan, count(distinct lower(p.player_name)) as pemain
from shared_plays p join categories c on c.id = p.category_id
where p.created_at > now() - interval '30 days'
group by c.name order by dimainkan desc limit 20;
```

**Biaya AI per deck jadi** (generate gagal ikut dihitung sebagai biaya)

```sql
select
  provider, model,
  count(*) filter (where status = 'success')                       as deck_jadi,
  round(sum(coalesce(input_tokens, 0))::numeric
        / nullif(count(*) filter (where status = 'success'), 0))   as input_token_per_deck,
  round(sum(coalesce(output_tokens, 0))::numeric
        / nullif(count(*) filter (where status = 'success'), 0))   as output_token_per_deck
from ai_generations
where created_at > now() - interval '30 days'
group by provider, model;
```

**Pembuat → pembayar & pembelian ulang**

```sql
with pembuat as (
  select distinct user_id from credit_ledger where reason = 'deck_save'
), pembeli as (
  select user_id, count(*) as kali from credit_orders where status = 'paid' group by user_id
)
select
  (select count(*) from pembuat)                                         as pembuat,
  (select count(*) from pembeli where user_id in (select user_id from pembuat)) as pembuat_yang_bayar,
  (select count(*) from pembeli where kali > 1)                          as beli_ulang,
  (select coalesce(sum(amount_idr), 0) from credit_orders where status = 'paid') as pendapatan_idr;
```

**Biaya AI per deck termasuk revisi** (`kind`: `deck`, `regenerate`, `swap`)

```sql
select kind, count(*) as panggilan,
       round(avg(input_tokens)) as input_rata2, round(avg(output_tokens)) as output_rata2
from ai_generations
where status = 'success' and created_at > now() - interval '30 days'
group by kind;
```

**Penjualan premium**

```sql
select product_type, is_gift, count(*) as pesanan, sum(amount_idr) as pendapatan_idr
from credit_orders
where status = 'paid' and product_type <> 'credits'
group by product_type, is_gift;
```
