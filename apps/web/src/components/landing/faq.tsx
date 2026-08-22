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
    <section className="bg-neutral-50 px-6 py-20">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Yang biasanya ditanyakan
        </h2>

        <div className="mt-10 divide-y divide-neutral-200 border-y border-neutral-200">
          <Item question={`Jatah ${AI_GENERATION_LIMIT} deck itu untuk main atau untuk bikin?`}>
            Untuk bikin. Sekali deck-nya jadi, kartunya bisa dimainkan
            berkali-kali, kapan pun, tanpa batas — sendirian maupun ramai-ramai.
          </Item>

          <Item question="Kalau hasil AI-nya kurang cocok, jatahnya hangus?">
            Deck yang gagal dibuat — misalnya layanan AI-nya bermasalah — tidak
            memotong jatah sama sekali. Tapi deck yang berhasil jadi tetap
            terhitung meski isinya kurang kamu suka, jadi sebutkan konteksnya
            sespesifik mungkin sebelum menekan generate.
          </Item>

          <Item question="Deck buatanku bisa dilihat orang lain?">
            Tidak. Deck AI cuma muncul di akunmu, tidak masuk toko, dan tidak
            dibagikan ke pemain lain.
          </Item>

          <Item question="Berapa lama bikinnya?">
            Sekitar 20–40 detik untuk satu deck utuh — biasanya 2–5 bagian,
            masing-masing 5–15 kartu, sesuai yang kamu minta.
          </Item>

          <Item question="Harus install aplikasi?">
            Tidak. Buka di browser HP, langsung main. Satu HP dioper
            bergantian, jadi yang lain tidak perlu ikut daftar.
          </Item>

          <Item question="Kalau jatah gratisnya habis?">
            Deck yang sudah jadi tetap bisa dimainkan selamanya, dan deck
            bawaan tetap terbuka. Untuk bikin deck baru, nanti ada paket
            tambahan {AI_TOPUP_PACK.generations} deck seharga Rp{" "}
            {formatIdr(AI_TOPUP_PACK.priceIdr)} — sekali bayar, bukan
            langganan.
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
