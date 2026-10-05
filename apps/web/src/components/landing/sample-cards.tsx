import { LandingCardDemo } from "@/components/cards/landing-card-demo";
import { SampleCardCarousel } from "./sample-card-carousel";

/**
 * Tiga keluarga format kartu. Urutannya sama dengan cara orang biasanya
 * mengenal FlipCard: datang untuk ngobrol, lalu tahu bisa dipakai belajar.
 */
const FORMAT_GROUPS = [
  {
    emoji: "💬",
    title: "Ngobrol",
    description:
      "Talk untuk pertanyaan, Action untuk tantangan kecil. Tanpa jawaban benar-salah — yang penting ceritanya.",
    formats: ["Talk", "Action"],
  },
  {
    emoji: "🧠",
    title: "Kuis",
    description:
      "Jawab dulu, lalu balik kartunya untuk lihat jawaban dan penjelasannya. Skor dihitung di akhir.",
    formats: [
      "Tanya jawab",
      "Pilihan ganda",
      "Mitos / fakta",
      "Tebak clue",
      "Urutkan",
    ],
  },
  {
    emoji: "👂",
    title: "Mendengar",
    description:
      "Satu orang membacakan — atau HP yang membacakan — lalu yang lain menjawab. Melatih konsentrasi anak.",
    formats: ["⭐ sampai ⭐⭐⭐⭐⭐"],
  },
] as const;

/**
 * Bukti isi. Halaman boleh menjanjikan apa saja soal "kartu yang pas", tapi
 * orang baru percaya setelah membaca kartunya sendiri — jadi kartu asli
 * ditampilkan di sini, bukan diringkas jadi klaim.
 */
export function SampleCards() {
  return (
    <section className="bg-neutral-50 px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl space-y-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Kartunya seperti apa?
          </h2>
          <p className="text-lg leading-relaxed text-neutral-600">
            Satu kartu, satu giliran — tapi cara mainnya bisa beda-beda. Ada
            yang buat ngobrol, ada yang jawabannya menunggu di balik kartu.
          </p>
        </div>

        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {FORMAT_GROUPS.map((group) => (
            <li
              key={group.title}
              className="rounded-2xl border border-neutral-200 bg-white p-5"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl" aria-hidden>
                  {group.emoji}
                </span>
                <h3 className="font-semibold">{group.title}</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                {group.description}
              </p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {group.formats.map((format) => (
                  <li
                    key={format}
                    className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700"
                  >
                    {format}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>

        <div
          id="coba-kartu"
          className="mt-12 grid scroll-mt-8 items-center gap-10 rounded-[2rem] border border-pink-100 bg-white px-6 py-10 shadow-sm md:scroll-mt-16 md:grid-cols-[0.8fr_1fr] md:px-12 md:py-12"
        >
          <div className="space-y-4 text-center md:text-left">
            <p className="text-sm font-semibold uppercase tracking-widest text-pink-600">
              Coba langsung
            </p>
            <h3 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
              Ketuk kartunya, lalu balik lagi
            </h3>
            <p className="leading-relaxed text-neutral-600">
              Ketuk sekali untuk membuka soalnya. Di kartu obrolan, langsung
              jawab bergantian. Di kartu kuis, pilih jawabanmu — atau balik
              sekali lagi untuk melihat jawaban dan penjelasannya.
            </p>
            <p className="text-sm text-neutral-500">
              Geser untuk mencoba kartu obrolan, mitos/fakta, pilihan ganda,
              dan latihan mendengar.
            </p>
          </div>

          <LandingCardDemo />
        </div>

        <h3 className="mt-16 text-center text-xl font-semibold text-neutral-900">
          Contoh kartu lainnya
        </h3>

        <SampleCardCarousel />

        <p className="mt-8 text-center text-sm text-neutral-500">
          Deck buatan AI mengikuti bentuk yang sama — dengan isi yang mengikuti
          situasi atau topik yang kamu sebutkan.
        </p>
      </div>
    </section>
  );
}
