import { AI_GENERATION_LIMIT } from "@/lib/ai/quota";
import { AI_TOPUP_PACK, formatIdr } from "@/lib/pricing";

/**
 * Keberatan yang muncul sebelum orang menekan tombol daftar, dijawab di
 * tempat yang sama.
 *
 * Pakai `<details>` bawaan browser, bukan komponen accordion — tidak butuh
 * JavaScript, ikut terbuka saat halaman dicari (Ctrl+F), dan isinya tetap
 * terbaca mesin pencari.
 */
export function Faq() {
  return (
    <section className="bg-white px-6 py-20">
      <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[1fr_1.6fr] md:gap-16">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-widest text-pink-600">
            FAQ
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Masih ragu?
          </h2>
        </div>

        <div className="divide-y divide-neutral-200 border-y border-neutral-200">
          <Item question="Harus install aplikasi?">
            Tidak. Buka di browser HP, lalu oper HP-nya bergantian. Yang lain
            tidak perlu daftar.
          </Item>

          <Item question="Bisa untuk belajar, bukan cuma ngobrol?">
            Bisa. Ada kartu kuis dengan topik bebas, dari tata surya sampai AI
            Engineering, plus latihan mendengar untuk anak.
          </Item>

          <Item question="Jawaban kuis buatan AI pasti benar?">
            Kuis tanpa jawaban lengkap otomatis dibuang, tapi AI tetap bisa
            keliru. Untuk bahan ujian, cek ulang jawabannya.
          </Item>

          <Item question={`Jatah ${AI_GENERATION_LIMIT} deck itu untuk main atau bikin?`}>
            Untuk bikin. Deck yang sudah jadi bisa dimainkan tanpa batas. Deck
            yang gagal dibuat tidak memotong jatah.
          </Item>

          <Item question="Deck buatanku bisa dilihat orang lain?">
            Tidak. Deck AI cuma ada di akunmu.
          </Item>

          <Item question="Kalau jatah gratisnya habis?">
            Deck yang sudah jadi tetap bisa dimainkan. Nanti ada paket{" "}
            {AI_TOPUP_PACK.generations} deck seharga Rp{" "}
            {formatIdr(AI_TOPUP_PACK.priceIdr)}, sekali bayar.
          </Item>
        </div>
      </div>
    </section>
  );
}

function Item({
  question,
  children,
}: {
  question: string;
  children: React.ReactNode;
}) {
  return (
    <details className="group py-5">
      <summary className="flex cursor-pointer items-center justify-between gap-4 font-medium marker:content-none [&::-webkit-details-marker]:hidden">
        {question}
        <span
          aria-hidden
          className="shrink-0 text-xl leading-none text-neutral-400 transition-transform group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <p className="mt-3 text-sm leading-relaxed text-neutral-600">
        {children}
      </p>
    </details>
  );
}
