import { AI_GENERATION_LIMIT } from "@/lib/ai/quota";

/**
 * Bagian inti halaman: menjelaskan fitur bikin deck AI dari sisi pemakainya.
 *
 * Urutannya sengaja masalah dulu, baru caranya. Orang tidak mencari "generate
 * deck pakai LLM" — mereka mencari jalan keluar dari ngumpul yang obrolannya
 * mentok, dan fitur ini kebetulan jawabannya.
 */
export function HowItWorks() {
  return (
    <section id="cara-kerja" className="bg-white px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <div className="mx-auto max-w-2xl space-y-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Deck bawaan nggak selalu pas. Bikin punyamu sendiri.
          </h2>
          <p className="text-lg leading-relaxed text-neutral-600">
            Ngumpul sama rekan kerja beda serunya dengan malam santai bareng
            pasangan. Main kuis tata surya sama anak, atau menguji diri soal AI
            Engineering, beda lagi. Sebutkan situasi atau topiknya — AI yang
            menuliskan kartunya, lengkap dengan jawabannya.
          </p>
        </div>

        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          <Step
            step={1}
            title="Pilih jenis & topiknya"
            description="Kartu obrolan, kuis pengetahuan, atau latihan mendengar. Sebut mau dimainkan sama siapa dan topiknya — misalnya “baru kenal di kantor baru” atau “tata surya untuk anak SD”."
          />
          <Step
            step={2}
            title="AI menulis kartunya"
            description="Sekitar 20–40 detik. Level kesulitannya naik bertahap per bagian, dan kartunya dicek ulang di server — kuis tanpa jawaban yang lengkap langsung dibuang."
          />
          <Step
            step={3}
            title="Langsung dimainkan"
            description="Satu HP dioper bergantian, atau main sendiri untuk belajar. Kartu kuis dibalik untuk lihat jawaban, dan skormu tampil di akhir."
          />
        </ol>

        <p className="mt-10 text-center text-sm text-neutral-500">
          Semua akun baru dapat {AI_GENERATION_LIMIT} deck AI gratis — cukup
          untuk membuktikan hasilnya sebelum keluar uang.
        </p>
      </div>
    </section>
  );
}

function Step({
  step,
  title,
  description,
}: {
  step: number;
  title: string;
  description: string;
}) {
  return (
    <li className="rounded-2xl border border-neutral-200 p-6">
      <div className="mb-4 flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-sm font-semibold text-white">
        {step}
      </div>
      <h3 className="mb-2 font-semibold">{title}</h3>
      <p className="text-sm leading-relaxed text-neutral-600">{description}</p>
    </li>
  );
}
