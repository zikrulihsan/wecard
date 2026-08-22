import { LandingCardDemo } from "@/components/cards/landing-card-demo";
import { DeckCard } from "./deck-card";

/**
 * Bukti isi. Halaman boleh menjanjikan apa saja soal "kartu yang pas", tapi
 * orang baru percaya setelah membaca kartunya sendiri — jadi enam kartu asli
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
            Dua jenis: <strong className="font-semibold">Talk</strong> untuk
            pertanyaan, <strong className="font-semibold">Action</strong> untuk
            tantangan kecil yang langsung dikerjakan. Ini beberapa yang ada di
            deck gratisnya.
          </p>
        </div>

        <div className="mt-12 grid items-center gap-10 rounded-[2rem] border border-pink-100 bg-white px-6 py-10 shadow-sm md:grid-cols-[0.8fr_1fr] md:px-12 md:py-12">
          <div className="space-y-4 text-center md:text-left">
            <p className="text-sm font-semibold uppercase tracking-widest text-pink-600">
              Coba langsung
            </p>
            <h3 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
              Ketuk kartunya, lalu mulai ngobrol
            </h3>
            <p className="leading-relaxed text-neutral-600">
              Saat bermain, satu kartu tampil dalam satu waktu. Balik untuk
              membuka pertanyaan, lalu jawab bergantian tanpa terburu-buru.
            </p>
          </div>

          <LandingCardDemo />
        </div>

        <h3 className="mt-16 text-center text-xl font-semibold text-neutral-900">
          Contoh kartu lainnya
        </h3>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DeckCard theme="pink" kind="Talk" deck="Pasangan" className="h-44">
            Hal apa dari aku yang bikin kamu merasa dicintai?
          </DeckCard>
          <DeckCard theme="pink" kind="Action" deck="Pasangan" className="h-44">
            Ceritakan 1 hal lucu hari ini dengan gaya lebay 😄
          </DeckCard>
          <DeckCard theme="pink" kind="Talk" deck="Pasangan" className="h-44">
            Apa kelebihan aku yang jarang aku sadari?
          </DeckCard>
          <DeckCard
            theme="sky"
            kind="Talk"
            deck="Anak & Orang Tua"
            className="h-44"
          >
            Apa kegiatan bareng yang paling kamu tunggu-tunggu?
          </DeckCard>
          <DeckCard
            theme="sky"
            kind="Talk"
            deck="Anak & Orang Tua"
            className="h-44"
          >
            Ada cerita yang ingin kamu bagi ke aku tapi belum sempat?
          </DeckCard>
          <DeckCard
            theme="sky"
            kind="Talk"
            deck="Anak & Orang Tua"
            className="h-44"
          >
            Kenangan bareng kita yang paling kamu ingat sampai sekarang apa?
          </DeckCard>
        </div>

        <p className="mt-8 text-center text-sm text-neutral-500">
          Deck buatan AI mengikuti bentuk yang sama — dengan isi yang mengikuti
          situasi yang kamu sebutkan.
        </p>
      </div>
    </section>
  );
}
