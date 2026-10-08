import type { CardType, DeckMode, DeckTheme, GameCard } from "@flipcard/types";

/**
 * Teks antarmuka bahasa Indonesia. Bentuk objek ini sekaligus jadi tipe
 * `Messages` — kamus bahasa lain wajib punya kunci yang sama persis, jadi
 * teks yang lupa diterjemahkan langsung ketahuan saat typecheck.
 */

type SampleCard = {
  theme: DeckTheme;
  kind: string;
  deck: string;
  content: string;
  level?: number;
};

type FormatGroup = {
  emoji: string;
  pillar: string;
  title: string;
  description: string;
  formats: string[];
};

type Option = { value: string; label: string; hint?: string };

type Placeholders = { deckName: string; context: string; avoid: string };

export const id = {
  meta: {
    title: "FlipCard — Bermain, Belajar & Seru-seruan Bareng",
    description:
      "Isi waktu luang biar nggak krik-krik: bermain, belajar, dan seru-seruan bareng lewat kartu obrolan, kuis, dan latihan mendengar. Bikin deck sendiri pakai AI dari topik apa pun.",
  },

  language: {
    label: "Bahasa",
    switchTo: "Ganti bahasa",
    settingTitle: "Bahasa aplikasi",
    settingHint:
      "Mengubah teks aplikasi, dan deck berbahasa ini tampil lebih dulu di beranda.",
  },

  common: {
    back: "Kembali",
    retry: "Coba lagi",
    retrying: "Mencoba lagi…",
    loading: "Memuat",
    or: "atau",
    cards: (count: number) => `${count} kartu`,
    levelOf: (level: number) => `Level ${level} dari 5`,
    exit: "Keluar",
  },

  nav: {
    home: "Home",
    create: "Bikin",
    store: "Toko",
    profile: "Profil",
    limited: (label: string) => `${label} (terbatas)`,
  },

  loadError: {
    title: "Gagal memuat",
    description: "Sambungan ke server bermasalah. Biasanya sebentar saja.",
  },

  app: {
    loginUnavailableTitle: "Login belum tersedia",
    loginUnavailableDescription:
      "Konfigurasi layanan login belum tersedia. Coba lagi nanti.",
    checkingSession: "Memeriksa sesi",
    openingPage: "Membuka halaman",
  },

  landing: {
    hero: {
      pillars: "Bermain · Belajar · Seru-seruan bareng",
      titleLead: "Waktu Luang Bareng,",
      // U+2011 (non-breaking hyphen) di "Krik‑Krik" — hyphen biasa jadi titik
      // putus yang sah buat perata baris, dan kata ini pernah kepotong
      // "Krik-" / "Krik" di layar sempit.
      titleAccent: "Nggak Krik‑Krik Lagi",
      bodyLead:
        "Ambil satu kartu: ngobrol, adu kuis, atau latihan mendengar. Nggak nemu yang pas?",
      bodyStrong: "Bikin sendiri pakai AI",
      bodyEnd: ".",
      tryFree: "Coba gratis — tanpa daftar",
      haveAccount: "Sudah punya akun",
      footnote: (limit: number) => `Daftar gratis dapat ${limit} deck AI`,
    },
    heroStack: {
      animate: (name: string) =>
        `Animasikan kartu ${name}; ketuk lagi untuk membuka simulasi`,
      open: (name: string) => `Buka simulasi dari kartu ${name}`,
      left: {
        kind: "Mendengar",
        deck: "Latihan Mendengar",
        content: "Budi makan apel merah.",
      },
      center: {
        kind: "Talk",
        deck: "Pasangan",
        content: "Apa kebiasaan kecil aku yang kamu suka?",
      },
      right: {
        kind: "Kuis",
        deck: "Bikinan AI",
        content: "Apa yang dimaksud dengan context window?",
      },
    },
    how: {
      eyebrow: "Bikin pakai AI",
      title: "Nggak ada deck yang pas? Bikin sendiri.",
      body: "Sebut topiknya, kartunya jadi dalam ±30 detik.",
      steps: [
        "Sebut topik & lawan mainnya",
        "AI menulis kartu & jawabannya",
        "Langsung main",
      ],
      footnote: (limit: number) => `${limit} deck AI pertama gratis.`,
      demoTopicLabel: "Topik",
      demoTopic: "Tata surya untuk anak SD",
      demoChips: ["Kuis", "Anak", "10 kartu"],
      demoCards: [
        { kind: "Pilihan ganda", content: "Planet mana yang paling dekat dengan Matahari?" },
        { kind: "Mitos / fakta", content: "Matahari juga sebuah bintang." },
      ],
      demoDeck: "Bikinan AI",
    },
    samples: {
      eyebrow: "Tiga cara main",
      title: "Satu kartu, satu giliran.",
      groups: [
        {
          emoji: "💬",
          pillar: "Seru-seruan",
          title: "Ngobrol",
          description: "Pertanyaan dan tantangan kecil. Nggak ada benar-salah.",
          formats: ["Talk", "Action"],
        },
        {
          emoji: "🧠",
          pillar: "Bermain",
          title: "Kuis",
          description: "Jawab, balik kartunya, skor di akhir.",
          formats: ["Tanya jawab", "Pilihan ganda", "Mitos / fakta", "Tebak clue", "Urutkan"],
        },
        {
          emoji: "👂",
          pillar: "Belajar",
          title: "Mendengar",
          description: "HP membacakan, anak menjawab. Melatih fokus.",
          formats: ["Level ⭐ – ⭐⭐⭐⭐⭐"],
        },
      ] as FormatGroup[],
      tryEyebrow: "Coba langsung",
      tryTitle: "Ketuk kartunya.",
      tryBody:
        "Ketuk untuk buka, balik lagi untuk lihat jawaban. Geser untuk kartu lainnya.",
      moreTitle: "Contoh kartu lainnya",
      carouselLabel: "Carousel contoh kartu lainnya",
      carouselPrev: "Geser contoh kartu ke kiri",
      carouselNext: "Geser contoh kartu ke kanan",
      // Dikutip apa adanya dari seed.sql, seed_anak_orang_tua.sql,
      // seed_kuis_mendengar.sql, dan deck coba — kecuali kartu tebak clue,
      // yang menampilkan clue pertamanya digabung dengan pertanyaannya.
      cards: [
        { theme: "pink", kind: "Talk", deck: "Pasangan", content: "Hal apa dari aku yang bikin kamu merasa dicintai?" },
        { theme: "indigo", kind: "Kuis", deck: "Uji Diri: AI Engineering", content: "Apa itu embedding?", level: 2 },
        { theme: "sky", kind: "Talk", deck: "Anak & Orang Tua", content: "Apa kegiatan bareng yang paling kamu tunggu-tunggu?" },
        { theme: "teal", kind: "Mitos / fakta", deck: "Kuis Pengetahuan", content: "Kelelawar itu buta.", level: 2 },
        { theme: "pink", kind: "Action", deck: "Pasangan", content: "Ceritakan 1 hal lucu hari ini dengan gaya lebay 😄" },
        { theme: "sky", kind: "Mendengar", deck: "Latihan Mendengar", content: "Pagi ini Sari menyiram bunga di halaman rumah.", level: 2 },
        { theme: "teal", kind: "Tebak clue", deck: "Kuis Pengetahuan", content: "Aku bisa ditemukan di dapur dan di laut. Aku ini apa?", level: 3 },
        { theme: "indigo", kind: "Mitos / fakta", deck: "Uji Diri: AI Engineering", content: "Menaikkan temperature membuat jawaban model lebih akurat.", level: 2 },
      ] as SampleCard[],
    },
    demo: {
      flip: "Balik kartunya",
      showAnswer: "Lihat jawaban",
      flipBack: "Balik lagi",
      previous: "Kartu sebelumnya",
      next: "Kartu berikutnya",
      position: (current: number, total: number) =>
        `Kartu ${current} dari ${total}`,
      show: (index: number) => `Tampilkan kartu ${index}`,
      swipeHint: "Geser kanan atau kiri",
      cards: [
        {
          id: "landing-demo-appreciation",
          content:
            "Hal kecil apa yang aku lakukan dan diam-diam selalu bikin kamu senang?",
          cardType: "talk",
          difficulty: "medium",
          specialKind: null,
          sectionName: "Apresiasi",
          sectionSlug: "apresiasi",
        },
        {
          id: "landing-demo-myth",
          content: "Kelelawar itu buta.",
          cardType: "true_false",
          difficulty: "easy",
          level: 2,
          details: {
            isTrue: false,
            explanation:
              "Kelelawar bisa melihat. Banyak jenisnya juga memakai ekolokasi untuk berburu dalam gelap.",
          },
          specialKind: null,
          sectionName: "Kuis Pengetahuan",
          sectionSlug: "kuis-pengetahuan",
        },
        {
          id: "landing-demo-choice",
          content: "Pulau terbesar di Indonesia adalah…",
          cardType: "multiple_choice",
          difficulty: "easy",
          level: 2,
          details: {
            options: ["Sumatra", "Kalimantan", "Papua", "Sulawesi"],
            correctIndex: 2,
            explanation:
              "Papua adalah pulau terbesar kedua di dunia setelah Greenland.",
          },
          specialKind: null,
          sectionName: "Kuis Pengetahuan",
          sectionSlug: "kuis-pengetahuan",
        },
        {
          id: "landing-demo-listening",
          content:
            "Karena ban sepeda kempis, Rara memutuskan untuk naik bus, lalu pergi ke pusat kegiatan anak.",
          cardType: "listening",
          difficulty: "hard",
          level: 4,
          details: {
            questions: [
              { question: "Apa yang terjadi?", answer: "Ban sepeda Rara kempis" },
              { question: "Apa yang diputuskan Rara?", answer: "Naik bus" },
              { question: "Mengapa Rara melakukan itu?", answer: "Karena ban sepedanya kempis" },
            ],
          },
          specialKind: null,
          sectionName: "Latihan Mendengar",
          sectionSlug: "latihan-mendengar",
        },
      ] as GameCard[],
    },
    pricing: {
      title: "Mulai gratis",
      body: "Deck bawaan gratis selamanya. Yang berbayar cuma jatah bikin deck AI.",
      freeTitle: "Gratis",
      freePrice: "Rp 0",
      freeSubtitle: "Semua akun, tanpa kartu kredit",
      freeAiStrong: (limit: number) => `${limit} deck AI`,
      freeAiRest: "buatanmu sendiri",
      freeDecks: "Semua deck bawaan",
      freePlay: "Main sepuasnya, tanpa batas",
      freeCta: "Buat akun gratis",
      topupTitle: (count: number) => `Tambah ${count} deck AI`,
      comingSoon: "Segera hadir",
      price: (amount: string) => `Rp ${amount}`,
      perDeck: (amount: string) => `±Rp ${amount} per deck · sekali bayar`,
      topupStrong: (count: number) => `${count} deck AI`,
      topupRest: "tambahan",
      topupNoExpiry: "Bukan langganan, tidak hangus",
      topupFailed: "Gagal dibuat = tidak terpotong",
      buy: "Beli paket",
      closedTitle: "Pembelian belum dibuka",
    },
    faq: {
      eyebrow: "FAQ",
      title: "Masih ragu?",
      items: (limit: number, packCount: number, packPrice: string) => [
        {
          question: "Harus install aplikasi?",
          answer:
            "Tidak. Buka di browser HP, lalu oper HP-nya bergantian. Yang lain tidak perlu daftar.",
        },
        {
          question: "Bisa untuk belajar, bukan cuma ngobrol?",
          answer:
            "Bisa. Ada kartu kuis dengan topik bebas, dari tata surya sampai AI Engineering, plus latihan mendengar untuk anak.",
        },
        {
          question: "Jawaban kuis buatan AI pasti benar?",
          answer:
            "Kuis tanpa jawaban lengkap otomatis dibuang, tapi AI tetap bisa keliru. Untuk bahan ujian, cek ulang jawabannya.",
        },
        {
          question: `Jatah ${limit} deck itu untuk main atau bikin?`,
          answer:
            "Untuk bikin. Deck yang sudah jadi bisa dimainkan tanpa batas. Deck yang gagal dibuat tidak memotong jatah.",
        },
        {
          question: "Deck buatanku bisa dilihat orang lain?",
          answer: "Tidak. Deck AI cuma ada di akunmu.",
        },
        {
          question: "Bisa bikin deck bahasa Inggris?",
          answer:
            "Bisa. Pilih bahasa kartunya di formulir bikin deck — Indonesia atau Inggris.",
        },
        {
          question: "Kalau jatah gratisnya habis?",
          answer: `Deck yang sudah jadi tetap bisa dimainkan. Nanti ada paket ${packCount} deck seharga Rp ${packPrice}, sekali bayar.`,
        },
      ],
    },
    finalCta: {
      title: "Mulai dari satu kartu.",
      body: (limit: number) =>
        `Main sekarang tanpa daftar, atau bikin akun untuk ${limit} deck AI gratis.`,
      tryButton: "Coba gratis",
      button: "Bikin akun",
    },
    footer: (year: number) => `© ${year} FlipCard. Dibuat dengan cinta.`,
  },

  deckCard: {
    answerBehind: "↻ Jawabannya di balik kartu",
  },

  formats: {
    talk: { label: "TALK", hint: "Jawab dengan cerita" },
    action: { label: "ACTION", hint: "Kerjakan tantangannya" },
    special: { label: "SPECIAL", hint: "Kartu aturan main" },
    quiz: { label: "KUIS", hint: "Jawab, lalu balik kartunya" },
    multiple_choice: {
      label: "PILIHAN GANDA",
      hint: "Ketuk jawaban yang menurutmu benar",
    },
    true_false: { label: "MITOS / FAKTA", hint: "Mitos atau fakta?" },
    clue: {
      label: "TEBAK CLUE",
      hint: "Buka clue satu per satu — makin sedikit makin hebat",
    },
    ordering: { label: "URUTKAN", hint: "Susun urutan yang benar" },
    listening: {
      label: "MENDENGAR",
      hint: "Bacakan teksnya, lalu jawab pertanyaannya",
    },
  } as Record<CardType, { label: string; hint: string }>,

  card: {
    talkDifficulty: { easy: "Santai", medium: "Dalam", hard: "Intimate" },
    plainDifficulty: { easy: "Santai", medium: "Sedang", hard: "Sulit" },
    answerHeader: "✅ JAWABAN",
    tapToOpen: "Ketuk untuk buka",
    fact: "Fakta",
    myth: "Mitos",
    factChoice: "✅ Fakta",
    mythChoice: "❌ Mitos",
    factVerdict: "✅ FAKTA",
    mythVerdict: "❌ MITOS",
    clue: (index: number) => `Clue ${index}:`,
    nextClue: (shown: number, total: number) =>
      `Buka clue berikutnya (${shown}/${total})`,
    stopReading: "Berhenti",
    readAloud: "Bacakan",
    showText: "Tampilkan teks",
    hideText: "Sembunyikan teks",
    questions: "Pertanyaan",
    correct: "Benar! 🎉",
    wrong: (picked: string) => `Belum tepat — kamu pilih ${picked}`,
    selfGradeQuestion: "Jawabanmu tadi benar?",
    selfGradeRight: "✅ Benar",
    selfGradeWrong: "❌ Belum",
  },

  game: {
    progress: (current: number, total: number) =>
      `Kartu ${current} dari ${total}`,
    timeUp: "Waktu habis",
    timeUpShort: "Habis!",
    timerPaused: (seconds: number) =>
      `Timer dijeda, sisa ${seconds} detik. Ketuk untuk lanjut`,
    timerRunning: (seconds: number) =>
      `Sisa ${seconds} detik. Ketuk untuk jeda`,
    resetTimer: "Ulangi timer",
    scoreGreat: "Mantap, kamu sudah menguasai deck ini!",
    scoreOkay: "Lumayan! Ulangi sekali lagi supaya makin nempel.",
    scoreLow: "Masih banyak yang bisa dipelajari — coba lagi, ya.",
    scoreLabel: (percent: number) => `jawaban benar (${percent}%)`,
    confirmExit: "Yakin keluar? Progres tidak akan disimpan.",
    openCard: "Buka Kartu",
    previousCard: "Kartu sebelumnya",
    showAnswer: "Lihat Jawaban",
    nextCard: "Kartu Berikutnya",
    skip: "Lewati",
    swipeHint: "Geser kartu ke kiri untuk lanjut, ke kanan untuk kembali",
    done: "Selesai!",
    doneTalk:
      "Semoga obrolan kalian tadi bikin makin dekat. Mau main sekali lagi?",
    playAgain: "Main Lagi",
    backToDeck: "Kembali ke Deck",
  },

  picker: {
    timerOff: "Mati",
    seconds: (value: number) => `${value} dtk`,
    minutes: (value: number) => `${value} mnt`,
    fetchFailed: "Kartunya gagal diambil. Cek sambunganmu, lalu coba lagi.",
    emptyLevel: "Level ini belum ada kartunya. Coba pilih level lain.",
    unsupported:
      "Kartu di level ini belum bisa dimainkan di versi aplikasi ini.",
    chooseLevel: "Pilih Level",
    timerTitle: "Timer per Kartu",
    timerGroup: "Durasi timer per kartu",
    autoAdvance: "Otomatis lanjut",
    autoAdvanceHint: "Pindah ke kartu berikutnya begitu waktunya habis.",
    timerOnHint:
      "Timer mulai berjalan saat kartu dibuka. Ketuk timernya untuk jeda.",
    timerOffHint: "Tanpa batas waktu — ngobrol sepuasnya.",
    preparing: "Menyiapkan kartu...",
    start: (count: number) => `Mulai Main (${count} kartu)`,
  },

  /** Jenis deck (`categories.mode`): label tab & petunjuk singkatnya. */
  modes: {
    ngobrol: { label: "Ngobrol", hint: "Pertanyaan yang dijawab dengan cerita." },
    tantangan: { label: "Tantangan", hint: "Tantangan yang langsung dikerjakan bareng." },
    kuis: { label: "Kuis", hint: "Uji pengetahuan, jawabannya di balik kartu." },
    mendengar: { label: "Mendengar", hint: "Satu membacakan, yang lain menjawab." },
  } as Record<DeckMode, { label: string; hint: string }>,

  home: {
    title: "Mau main apa hari ini?",
    subtitle: "Lanjutkan yang tadi, cari deck, atau bikin sendiri.",
    deckLanguage: { id: "Deck berbahasa Indonesia", en: "Deck berbahasa Inggris" },
    recent: "Terakhir dimainkan",
    browse: "Jelajahi deck",
    modeTabs: "Jenis deck",
    all: "Semua",
    search: "Cari deck…",
    searchLabel: "Cari deck",
    clearSearch: "Hapus pencarian",
    filterGroup: "Saring deck",
    filterAll: "Semua",
    filterFree: "Gratis",
    filterMine: "Buatanku",
    filterLocked: "Terkunci",
    collection: "Koleksi FlipCard",
    continue: "Lanjutkan main",
    continueProgress: (current: number, total: number) =>
      `${current}/${total} kartu`,
    noMatch: (query: string) => `Belum ada deck yang cocok dengan “${query}”.`,
    noneInFilter: "Belum ada deck di pilihan ini.",
    showAll: "Tampilkan semua deck",
    makeWithAi: "Bikin sendiri pakai AI",
    loading: "Mengambil daftar deck",
    errorTitle: "Daftar deck belum bisa dimuat",
    errorDescription:
      "Sambungan ke server bermasalah, jadi deck-mu belum kelihatan. Deck-nya aman — coba lagi sebentar.",
    yourDecks: "Deck buatanmu",
    free: "Gratis",
    unlocked: "Terbuka",
    locked: "Terkunci",
    play: (name: string) => `Mainkan ${name}`,
    buy: (name: string) => `Beli ${name}`,
    empty: "Belum ada kategori yang tersedia.",
    emptyCta: "Bikin deck sendiri pakai AI",
    aiSpentTitle: "Jatah deck AI sudah habis",
    aiSpentBody: (used: number, limit: number | null) =>
      `${used} dari ${limit} terpakai.`,
    aiCtaTitle: "Bikin deck pakai AI",
    aiCtaUnlimited: "Bikin deck AI tanpa batas.",
    aiCtaRemaining: (limit: number | null, remaining: number) =>
      `${limit} deck gratis, sisamu ${remaining}.`,
  },

  play: {
    loading: "Membuka deck",
    errorTitle: "Deck belum bisa dibuka",
    errorDescription: "Sambungan ke server bermasalah. Coba lagi sebentar.",
  },

  create: {
    title: "Bikin Deck Sendiri",
    subtitle:
      "Isi konteksnya, AI yang nulis kartunya. Deck ini cuma kelihatan di akunmu.",
    quotaError: "Jatah belum bisa dibaca.",
    preparing: "Menyiapkan formulir",
    spentTitle: "Jatah bikin deck sudah habis",
    spentBody: (used: number, limit: number) =>
      `Tiap akun dapat ${limit} deck AI, dan punyamu sudah terpakai semua (${used} dari ${limit}). Deck yang sudah jadi tetap ada di beranda dan bisa dimainkan kapan saja.`,
    topupAvailable: (count: number, price: string) =>
      `Mau bikin lagi? Ada paket tambahan ${count} deck seharga Rp ${price}.`,
    topupSoon: (count: number, price: string) =>
      `Paket tambahan ${count} deck (Rp ${price}) lagi disiapkan — belum bisa dibeli sekarang.`,
    playExisting: "Main deck yang sudah ada",
    disabledTitle: "Sedang tidak aktif",
    disabledBody:
      "Fitur bikin deck dengan AI lagi tidak aktif untuk akunmu. Deck AI yang sudah terlanjur dibuat tetap bisa dimainkan.",
    playExistingFirst: "Main deck yang ada dulu",
    form: {
      modeLegend: "Mau main apa?",
      modeGroup: "Jenis deck",
      withChallenges: "Selipkan tantangan — sekitar sepertiga kartu.",
      audience: "Mau dimainkan sama siapa?",
      audienceHint: "Menentukan sudut pandang dan gaya pertanyaannya.",
      audienceKnowledge: "Siapa yang main?",
      audienceKnowledgeHint: "Menentukan kosakata dan tingkat soalnya.",
      cardLanguage: "Bahasa kartu",
      cardLanguageHint:
        "Bahasa isi deck. Tidak harus sama dengan bahasa aplikasi.",
      cardMix: "Isi kartu",
      storyTheme: "Tema cerita (opsional)",
      topic: "Topik",
      storyHint: "Kosongkan untuk cerita sehari-hari di rumah dan sekolah.",
      topicHint: "Bidang yang mau diuji. Kosongkan untuk pengetahuan umum.",
      storyPlaceholder: "Misal: hewan di kebun binatang",
      topicPlaceholder: "Misal: AI Engineering, tata surya, sejarah Islam",
      tone: "Nuansa kartu",
      difficulty: "Tingkat kesulitan",
      depth: "Kedalaman",
      difficultyHint: "Level bintang kartunya. Section berikutnya makin sulit.",
      depthHint: "Seberapa personal pertanyaannya boleh masuk.",
      sectionCount: "Jumlah section",
      cardsPerSection: "Kartu per section",
      total: (count: number) => `Total ${count} kartu.`,
      specialLead: "Sertakan kartu",
      specialStrong: "Special",
      specialRest: "— Free Pass, Switch, Double.",
      deckName: "Nama deck",
      deckNameHint: "Kosongkan kalau mau dibuatkan AI.",
      context: "Konteks tambahan",
      contextHint:
        "Situasi spesifik yang bikin kartunya lebih pas. Jangan isi data pribadi.",
      avoid: "Topik yang dihindari",
      unlimited: "Kamu bisa membuat deck AI tanpa batas.",
      remainingLead: "Sisa jatah:",
      remainingRest: (limit: number | null) => `dari ${limit} deck AI.`,
      lastChance: " Ini kesempatan terakhirmu, pikirkan baik-baik.",
      generating: "Lagi bikin kartunya…",
      generate: "Generate deck",
      waitHint: "Butuh sekitar 20–40 detik. Jangan tutup halaman ini.",
      connectionError: "Koneksi bermasalah. Coba lagi.",
      genericError: "Gagal membuat deck. Coba lagi.",
    },
    languages: { id: "Indonesia", en: "Inggris" },
    audiences: [
      { value: "pasangan", label: "Pasangan" },
      { value: "sahabat", label: "Sahabat / teman dekat" },
      { value: "keluarga", label: "Keluarga" },
      { value: "anak-orang-tua", label: "Anak & orang tua" },
      { value: "rekan-kerja", label: "Rekan kerja / tim" },
      { value: "kenalan-baru", label: "Kenalan baru" },
      { value: "belajar-sendiri", label: "Diri sendiri — belajar & uji kemampuan" },
      { value: "lainnya", label: "Lainnya (jelaskan di konteks)" },
    ] as Option[],
    /** Label pengganti di jenis deck tertentu, misal "Tim / kelas" untuk kuis. */
    audienceModeLabels: {
      sahabat: { kuis: "Bareng teman", mendengar: "Bareng teman" },
      "anak-orang-tua": { mendengar: "Anak — dibacakan orang tua" },
      "rekan-kerja": { kuis: "Tim / kelas", mendengar: "Tim / kelas" },
      "belajar-sendiri": { kuis: "Sendiri — belajar & uji kemampuan" },
    } as Record<string, Partial<Record<DeckMode, string>>>,
    tones: [
      { value: "santai", label: "Santai & ringan" },
      { value: "romantis", label: "Romantis & hangat" },
      { value: "reflektif", label: "Reflektif & jujur" },
      { value: "lucu", label: "Seru & kocak" },
      { value: "mendalam", label: "Mendalam & serius" },
    ] as Option[],
    depths: [
      { value: "ringan", label: "Ringan — aman untuk siapa saja" },
      { value: "sedang", label: "Sedang — mulai personal" },
      { value: "dalam", label: "Dalam — pertanyaan berat & jujur" },
    ] as Option[],
    knowledgeDepths: {
      ringan: "Mudah — ⭐ sampai ⭐⭐",
      sedang: "Sedang — ⭐⭐ sampai ⭐⭐⭐⭐",
      dalam: "Menantang — naik bertahap sampai ⭐⭐⭐⭐⭐",
    } as Record<string, string>,
    placeholders: {
      pasangan: {
        deckName: "Misal: Malam Jumat Berdua",
        context: "Misal: kami LDR sudah 2 tahun dan baru ketemu sebulan sekali",
        avoid: "Misal: mantan, kerjaan, politik",
      },
      sahabat: {
        deckName: "Misal: Nongkrong Sampai Pagi",
        context: "Misal: kami sahabat dari SMA, sekarang beda kota dan jarang ketemu",
        avoid: "Misal: berat badan, gaji, drama grup",
      },
      keluarga: {
        deckName: "Misal: Kumpul Keluarga Besar",
        context:
          "Misal: dimainkan pas lebaran, ada om, tante, dan sepupu dari anak-anak sampai dewasa",
        avoid: "Misal: politik, warisan, kapan nikah",
      },
      "anak-orang-tua": {
        deckName: "Misal: Ngobrol Sebelum Tidur",
        context: "Misal: anak umur 9 tahun, biasanya main sebelum tidur",
        avoid: "Misal: nilai sekolah, dibanding-bandingkan sama saudara",
      },
      "rekan-kerja": {
        deckName: "Misal: Icebreaker Senin Pagi",
        context:
          "Misal: tim 6 orang, setengahnya remote dan belum pernah ketemu langsung",
        avoid: "Misal: gaji, promosi, gosip kantor",
      },
      "kenalan-baru": {
        deckName: "Misal: Kenalan Tanpa Canggung",
        context:
          "Misal: acara komunitas, kebanyakan baru pertama kali ketemu hari itu",
        avoid: "Misal: agama, politik, status hubungan",
      },
      "belajar-sendiri": {
        deckName: "Misal: Uji Diri AI Engineering",
        context:
          "Misal: aku software engineer, sudah paham dasar LLM, mau menguji RAG dan agents",
        avoid: "Misal: soal hafalan angka, nama produk tertentu",
      },
      lainnya: {
        deckName: "Misal: Malam Seru Bareng",
        context: "Misal: dimainkan sama tetangga kompleks pas arisan bulanan",
        avoid: "Misal: politik, agama, uang",
      },
    } as Record<string, Placeholders>,
    /**
     * Pesan error dari server, dipetakan lewat `code` di respons. Pesan
     * aslinya (bahasa Indonesia) tetap dipakai kalau kodenya tidak dikenal.
     */
    errors: {
      unauthenticated: "Kamu belum login. Masuk dulu, lalu coba lagi.",
      ai_disabled: "Fitur bikin deck AI sedang tidak aktif untuk akunmu.",
      quota_spent: (limit: number | null) =>
        `Jatah bikin deck AI kamu sudah habis (${limit} deck). Deck yang sudah jadi tetap bisa dimainkan.`,
      invalid_input: "Isian formulir belum valid. Cek lagi, lalu coba lagi.",
      safety_blocked:
        "Permintaan ini ditolak oleh filter keamanan model. Coba ubah konteks atau topiknya.",
      truncated:
        "Hasil generate terpotong. Coba kurangi jumlah section atau kartu.",
      invalid_output: "Model tidak mengembalikan deck yang valid. Coba lagi.",
      empty_deck: "Deck yang dihasilkan kosong. Coba lagi.",
      busy: "Model AI sedang penuh. Coba lagi beberapa saat lagi.",
      unreachable: "Gagal menghubungi layanan AI. Coba lagi sebentar.",
      save_failed: "Deck berhasil dibuat tapi gagal disimpan.",
    },
  },

  auth: {
    email: "Email",
    password: "Password",
    loginTitle: "Selamat Datang Kembali",
    loginSubtitle: "Masuk ke akun FlipCard kamu",
    oauthFailed: "Autentikasi gagal. Silakan coba lagi.",
    loginUnreachable: "Tidak bisa menghubungi layanan login. Coba lagi.",
    signingIn: "Masuk...",
    signIn: "Masuk",
    noAccount: "Belum punya akun?",
    registerHere: "Daftar di sini",
    registerTitle: "Buat Akun Baru",
    registerSubtitle: "Gabung dan mulai ngobrol lebih dalam",
    name: "Nama",
    namePlaceholder: "Panggilan kamu",
    passwordHint: "Minimal 6 karakter",
    registering: "Mendaftar...",
    register: "Daftar",
    registerUnreachable:
      "Tidak bisa menghubungi layanan pendaftaran. Coba lagi.",
    haveAccount: "Sudah punya akun?",
    loginHere: "Masuk di sini",
    checkEmailTitle: "Cek Email Kamu",
    checkEmailLead: "Kami sudah kirim link konfirmasi ke",
    checkEmailRest: ". Klik link itu untuk mengaktifkan akunmu.",
    backToLogin: "Kembali ke Login",
    googleConnecting: "Menghubungkan ke Google...",
    google: "Lanjutkan dengan Google",
    finishing: "Menyelesaikan login",
  },

  profile: {
    title: "Profil",
    errorTitle: "Profil belum bisa dimuat",
    logout: "Keluar",
  },

  store: {
    title: "Toko",
    subtitle: "Beli kategori berbayar untuk membuka kartu baru",
    soon: "Kategori berbayar akan segera hadir.",
  },

  notFound: {
    title: "Halamannya nggak ketemu",
    body: "Mungkin tautannya sudah berubah, atau decknya sudah dihapus. Deck lainmu tetap ada di beranda.",
    home: "Ke beranda",
    landing: "Halaman depan",
  },

  trial: {
    backHome: "Beranda",
    titleGuest: "Coba semua deck, gratis",
    titleSignedIn: "Deck coba, terbuka penuh",
    introSignedIn:
      "Kamu sudah masuk, jadi semua kartu di sini bisa dimainkan sampai habis.",
    introLead: "Pilih jenisnya, lalu mainkan",
    introStrong: (count: number) => `${count} kartu pertama`,
    introRest: "tiap deck tanpa daftar. Suka? Masuk untuk lanjut sampai habis.",
    modeTabs: "Jenis deck",
    freeUsedUp: "Gratisnya habis",
    freeCount: (count: number) => `${count} kartu gratis`,
    lockedMore: (count: number) => `${count} lagi`,
    freeMeter: (used: number, free: number) =>
      `${used} dari ${free} kartu gratis dimainkan`,
    playAgain: "Main lagi",
    play: "Main",
    makeWithAi: "Bikin deck sendiri pakai AI",
    ladderTitle: "Dari coba sampai punya deck sendiri",
    ladderTryTitle: "Coba tanpa akun",
    ladderTryTag: "Kamu di sini",
    ladderTryPoints: (free: number) => [
      `${free} kartu pertama tiap deck`,
      "Semua jenis: ngobrol, tantangan, kuis, mendengar",
    ],
    ladderFreeTitle: "Akun gratis",
    ladderFreeTag: "Gratis",
    ladderFreePoints: (limit: number) => [
      "Semua kartu terbuka, lanjut dari kartu terakhir",
      `${limit} deck buatanmu sendiri pakai AI`,
    ],
    ladderTopupTitle: "Top-up deck AI",
    ladderTopupSoon: "Segera hadir",
    ladderPrice: (price: string) => `Rp${price}`,
    ladderTopupPoints: (count: number, price: string) => [
      `+${count} deck AI seharga Rp${price}`,
      "Topik apa saja, untuk siapa saja",
    ],
    createAccount: "Buat akun gratis",
    signIn: "Masuk",
    deckDone: (name: string) => `Deck ${name} selesai!`,
    doneSignedIn: (limit: number) =>
      `Mau deck dengan topik kalian sendiri? Bikin pakai AI — akunmu punya jatah ${limit} deck gratis.`,
    doneGuest: "Masih banyak deck lain yang bisa kamu coba gratis.",
    makeOwn: "Bikin deck sendiri",
    tryAnother: "Coba deck lain",
    freeBadge: (current: number, free: number) => `${current}/${free} gratis`,
    lockTitle: (next: number) => `Seru, kan? Lanjut dari kartu ke-${next}`,
    lockRemaining: (count: number) => `${count} kartu lagi terkunci`,
    lockBody: (deck: string, limit: number) =>
      `Masuk gratis untuk membuka sisa deck ${deck} — plus semua deck lain tanpa batas, dan ${limit} deck buatanmu sendiri pakai AI.`,
    lockScoreLead: "Sejauh ini",
    lockScoreRest: "jawaban benar",
    lockEmail: "Masuk pakai email",
    lockRegister: "Daftar",
  },
};

export type Messages = typeof id;
