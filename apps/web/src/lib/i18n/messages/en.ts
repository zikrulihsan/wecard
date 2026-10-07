import type { Messages } from "./id";

/** English UI copy. Must mirror every key in `id.ts` — typecheck enforces it. */
export const en: Messages = {
  meta: {
    title: "FlipCard — Play, Learn & Have Fun Together",
    description:
      "Never let free time go awkwardly quiet again: play, learn, and have fun together with conversation cards, quizzes, and listening practice. Make your own deck with AI from any topic.",
  },

  language: {
    label: "Language",
    switchTo: "Change language",
    settingTitle: "App language",
    settingHint:
      "Changes the app's text. Built-in decks stay in Indonesian.",
  },

  common: {
    back: "Back",
    retry: "Try again",
    retrying: "Retrying…",
    loading: "Loading",
    or: "or",
    cards: (count: number) => `${count} ${count === 1 ? "card" : "cards"}`,
    levelOf: (level: number) => `Level ${level} of 5`,
    exit: "Exit",
  },

  nav: {
    home: "Home",
    create: "Create",
    store: "Store",
    profile: "Profile",
    limited: (label: string) => `${label} (limited)`,
  },

  loadError: {
    title: "Couldn't load",
    description: "Trouble reaching the server. It's usually brief.",
  },

  app: {
    loginUnavailableTitle: "Sign-in isn't available yet",
    loginUnavailableDescription:
      "The sign-in service isn't configured yet. Please try again later.",
    checkingSession: "Checking your session",
    openingPage: "Opening page",
  },

  landing: {
    hero: {
      pillars: "Play · Learn · Have fun together",
      titleLead: "Free Time Together,",
      titleAccent: "Never Awkward Again",
      bodyLead:
        "Waiting for food, at a family get-together, or on a long trip? Draw a card: a fun conversation, a quiz showdown, or listening practice with your kids. Can't find the right one?",
      bodyStrong: "Make your own with AI",
      bodyEnd: ".",
      tryFree: "Try free — no sign-up",
      haveAccount: "I have an account",
      footnote: (limit: number) =>
        `Play right away without an account · Sign up free for ${limit} AI decks`,
    },
    heroStack: {
      animate: (name: string) =>
        `Animate the ${name} card; tap again to open the demo`,
      open: (name: string) => `Open the demo from the ${name} card`,
      left: {
        kind: "Listening",
        deck: "Listening Practice",
        content: "Ben is eating a red apple.",
      },
      center: {
        kind: "Talk",
        deck: "Couples",
        content: "What's one little habit of mine that you love?",
      },
      right: {
        kind: "Quiz",
        deck: "Made by AI",
        content: "What does “context window” mean?",
      },
    },
    how: {
      title: "Built-in decks don't always fit. Make your own.",
      body: "A get-together with coworkers is a different kind of fun from a cozy night with your partner. A solar-system quiz with your kids, or testing yourself on AI Engineering, is different again. Describe the situation or topic — AI writes the cards, answers included.",
      steps: [
        {
          title: "Pick the type & topic",
          description:
            "Conversation cards, a knowledge quiz, or listening practice. Say who you're playing with and the topic — like “just met at a new job” or “the solar system for 3rd graders”.",
        },
        {
          title: "AI writes the cards",
          description:
            "About 20–40 seconds. Difficulty ramps up section by section, and every card is re-checked on the server — quizzes without a complete answer are thrown out.",
        },
        {
          title: "Play right away",
          description:
            "Pass one phone around, or play solo to study. Flip quiz cards to see the answer, and your score shows up at the end.",
        },
      ],
      footnote: (limit: number) =>
        `Every new account gets ${limit} free AI decks — enough to see the results before spending anything.`,
    },
    samples: {
      title: "What do the cards look like?",
      body: "One card, one turn. Whether you want laughs, a battle of wits, or focus practice — just pick a deck and your free time has something in it.",
      groups: [
        {
          emoji: "💬",
          pillar: "Fun",
          title: "Conversation",
          description:
            "Talk for questions, Action for small challenges. No right or wrong answers — it's all about the stories.",
          formats: ["Talk", "Action"],
        },
        {
          emoji: "🧠",
          pillar: "Play",
          title: "Quiz",
          description:
            "Answer first, then flip the card to see the answer and explanation. Your score is tallied at the end.",
          formats: [
            "Q&A",
            "Multiple choice",
            "Myth / fact",
            "Guess the clue",
            "Put in order",
          ],
        },
        {
          emoji: "👂",
          pillar: "Learn",
          title: "Listening",
          description:
            "One person reads aloud — or the phone does — and the others answer. Great for building kids' concentration.",
          formats: ["⭐ to ⭐⭐⭐⭐⭐"],
        },
      ],
      tryEyebrow: "Try it now",
      tryTitle: "Tap the card, then flip it again",
      tryBody:
        "Tap once to reveal the prompt. On conversation cards, take turns answering. On quiz cards, pick your answer — or flip once more to see the answer and explanation.",
      tryHint:
        "Swipe to try a conversation card, myth/fact, multiple choice, and listening practice.",
      moreTitle: "More sample cards",
      footnote:
        "AI-made decks take the same shape — filled with content that fits the situation or topic you describe.",
      carouselLabel: "Carousel of more sample cards",
      carouselPrev: "Scroll sample cards left",
      carouselNext: "Scroll sample cards right",
      cards: [
        { theme: "pink", kind: "Talk", deck: "Couples", content: "What do I do that makes you feel loved?" },
        { theme: "indigo", kind: "Quiz", deck: "Self-Test: AI Engineering", content: "What is an embedding?", level: 2 },
        { theme: "sky", kind: "Talk", deck: "Kids & Parents", content: "What's the activity together you look forward to most?" },
        { theme: "teal", kind: "Myth / fact", deck: "Trivia Quiz", content: "Bats are blind.", level: 2 },
        { theme: "pink", kind: "Action", deck: "Couples", content: "Tell one funny thing from today in the most dramatic way possible 😄" },
        { theme: "sky", kind: "Listening", deck: "Listening Practice", content: "This morning Sarah watered the flowers in the front yard.", level: 2 },
        { theme: "teal", kind: "Guess the clue", deck: "Trivia Quiz", content: "You can find me in the kitchen and in the sea. What am I?", level: 3 },
        { theme: "indigo", kind: "Myth / fact", deck: "Self-Test: AI Engineering", content: "Raising the temperature makes a model's answers more accurate.", level: 2 },
      ],
    },
    demo: {
      flip: "Flip the card",
      showAnswer: "See the answer",
      flipBack: "Flip back",
      previous: "Previous card",
      next: "Next card",
      position: (current: number, total: number) =>
        `Card ${current} of ${total}`,
      show: (index: number) => `Show card ${index}`,
      swipeHint: "Swipe left or right",
      cards: [
        {
          id: "landing-demo-appreciation",
          content:
            "What's a small thing I do that quietly always makes you happy?",
          cardType: "talk",
          difficulty: "medium",
          specialKind: null,
          sectionName: "Appreciation",
          sectionSlug: "apresiasi",
        },
        {
          id: "landing-demo-myth",
          content: "Bats are blind.",
          cardType: "true_false",
          difficulty: "easy",
          level: 2,
          details: {
            isTrue: false,
            explanation:
              "Bats can see. Many species also use echolocation to hunt in the dark.",
          },
          specialKind: null,
          sectionName: "Trivia Quiz",
          sectionSlug: "kuis-pengetahuan",
        },
        {
          id: "landing-demo-choice",
          content: "The largest island in Indonesia is…",
          cardType: "multiple_choice",
          difficulty: "easy",
          level: 2,
          details: {
            options: ["Sumatra", "Borneo", "New Guinea", "Sulawesi"],
            correctIndex: 2,
            explanation:
              "New Guinea is the second-largest island in the world, after Greenland.",
          },
          specialKind: null,
          sectionName: "Trivia Quiz",
          sectionSlug: "kuis-pengetahuan",
        },
        {
          id: "landing-demo-listening",
          content:
            "Because her bike tire was flat, Rachel decided to take the bus, and then went to the kids' activity center.",
          cardType: "listening",
          difficulty: "hard",
          level: 4,
          details: {
            questions: [
              { question: "What happened?", answer: "Rachel's bike tire was flat" },
              { question: "What did Rachel decide?", answer: "To take the bus" },
              { question: "Why did Rachel do that?", answer: "Because her bike tire was flat" },
            ],
          },
          specialKind: null,
          sectionName: "Listening Practice",
          sectionSlug: "latihan-mendengar",
        },
      ],
    },
    pricing: {
      title: "Try first, pay only if you use it",
      body: (limit: number) =>
        `Built-in decks are free forever. The only paid part is making new decks with AI — and only after your ${limit} free decks are used up.`,
      freeTitle: "Free",
      freePrice: "Rp 0",
      freeSubtitle: "Every account, no credit card",
      freeAiStrong: (limit: number) => `${limit} AI decks`,
      freeAiRest: "made by you",
      freeDecks:
        "The Couples, Kids & Parents, Listening Practice, and Self-Test: AI Engineering decks — every card",
      freePlay: "Play as much as you like — the allowance is for creating, not playing",
      freeKeep: "Decks you've made stay yours",
      freeCta: "Create a free account",
      topupTitle: (count: number) => `Add ${count} AI decks`,
      comingSoon: "Coming soon",
      price: (amount: string) => `Rp ${amount}`,
      perDeck: (amount: string) =>
        `About Rp ${amount} per deck · one-time payment, not a subscription`,
      topupStrong: (count: number) => `${count} new AI decks`,
      topupRest: "to use whenever you like",
      topupNoExpiry: "Credits never expire",
      topupAgain: "Top up again whenever you run out",
      topupFailed: "Failed generations don't use up credits",
      buy: "Buy pack",
      closedTitle: "Purchases aren't open yet",
      closedBody: (limit: number) =>
        `For now, the Free plan already includes ${limit} AI decks for every account.`,
    },
    faq: {
      title: "Frequently asked questions",
      items: (limit: number, packCount: number, packPrice: string) => [
        {
          question: "Can I use it to study, not just to chat?",
          answer:
            "Yes. Besides conversation cards there are quiz cards — Q&A, multiple choice, myth/fact, guess the clue, and put in order — with the answer on the back, plus listening practice for kids. Multiple choice and myth/fact are graded automatically, you grade the rest yourself, and your score appears at the end. Any topic works: from the solar system to AI Engineering.",
        },
        {
          question: "Are the AI's quiz answers always right?",
          answer:
            "The AI is told to only write durable, checkable facts, and quizzes with incomplete answers are thrown out automatically. But AI can still be wrong — for important material like exam prep, double-check the answers, especially on fast-changing topics.",
        },
        {
          question: `Are the ${limit} decks for playing or for creating?`,
          answer:
            "For creating. Once a deck is made, you can play it again and again, anytime, with no limit — solo or with a crowd.",
        },
        {
          question: "If I don't like the AI's result, is the credit gone?",
          answer:
            "A deck that fails to generate — say the AI service has a problem — doesn't use a credit at all. But a deck that's created successfully still counts even if you don't love it, so describe the context as specifically as you can before hitting generate.",
        },
        {
          question: "Can other people see the decks I make?",
          answer:
            "No. AI decks only show up in your account, never go into the store, and are never shared with other players.",
        },
        {
          question: "Can I make decks in English?",
          answer:
            "Yes. The create-deck form has a card-language option — Indonesian or English — independent of the app's language.",
        },
        {
          question: "How long does it take?",
          answer:
            "About 20–40 seconds for a whole deck — usually 2–5 sections of 5–15 cards each, whatever you ask for.",
        },
        {
          question: "Do I need to install an app?",
          answer:
            "No. Open it in your phone's browser and start playing. One phone gets passed around, so nobody else needs to sign up. The phone can even read listening cards aloud.",
        },
        {
          question: "What happens when my free allowance runs out?",
          answer: `Decks you've made stay playable forever, and the built-in decks stay open. To make new decks, there will be an add-on pack of ${packCount} decks for Rp ${packPrice} — a one-time payment, not a subscription.`,
        },
      ],
    },
    finalCta: {
      title: "Make your next free moment anything but awkward",
      body: (limit: number) =>
        `Play, learn, and have fun together — starting with a single card. Pick a built-in deck, or make your own from any situation or topic; your first ${limit} AI decks are free.`,
      button: "Create a free account",
    },
    footer: (year: number) => `© ${year} FlipCard. Made with love.`,
  },

  deckCard: {
    answerBehind: "↻ Answer on the back",
  },

  formats: {
    talk: { label: "TALK", hint: "Answer with a story" },
    action: { label: "ACTION", hint: "Do the challenge" },
    special: { label: "SPECIAL", hint: "Game rule card" },
    quiz: { label: "QUIZ", hint: "Answer, then flip the card" },
    multiple_choice: {
      label: "MULTIPLE CHOICE",
      hint: "Tap the answer you think is right",
    },
    true_false: { label: "MYTH / FACT", hint: "Myth or fact?" },
    clue: {
      label: "GUESS THE CLUE",
      hint: "Reveal clues one at a time — the fewer, the better",
    },
    ordering: { label: "PUT IN ORDER", hint: "Arrange them in the right order" },
    listening: {
      label: "LISTENING",
      hint: "Read the text aloud, then answer the questions",
    },
  },

  card: {
    talkDifficulty: { easy: "Light", medium: "Deep", hard: "Intimate" },
    plainDifficulty: { easy: "Easy", medium: "Medium", hard: "Hard" },
    answerHeader: "✅ ANSWER",
    tapToOpen: "Tap to open",
    fact: "Fact",
    myth: "Myth",
    factChoice: "✅ Fact",
    mythChoice: "❌ Myth",
    factVerdict: "✅ FACT",
    mythVerdict: "❌ MYTH",
    clue: (index: number) => `Clue ${index}:`,
    nextClue: (shown: number, total: number) =>
      `Reveal next clue (${shown}/${total})`,
    stopReading: "Stop",
    readAloud: "Read aloud",
    showText: "Show text",
    hideText: "Hide text",
    questions: "Questions",
    correct: "Correct! 🎉",
    wrong: (picked: string) => `Not quite — you picked ${picked}`,
    selfGradeQuestion: "Did you get it right?",
    selfGradeRight: "✅ Right",
    selfGradeWrong: "❌ Not yet",
  },

  game: {
    progress: (current: number, total: number) =>
      `Card ${current} of ${total}`,
    timeUp: "Time's up",
    timeUpShort: "Time!",
    timerPaused: (seconds: number) =>
      `Timer paused, ${seconds} seconds left. Tap to resume`,
    timerRunning: (seconds: number) =>
      `${seconds} seconds left. Tap to pause`,
    resetTimer: "Restart timer",
    scoreGreat: "Awesome, you've mastered this deck!",
    scoreOkay: "Not bad! Go through it once more to make it stick.",
    scoreLow: "Plenty left to learn — give it another go.",
    scoreLabel: (percent: number) => `correct answers (${percent}%)`,
    confirmExit: "Leave the game? Your progress won't be saved.",
    openCard: "Open Card",
    previousCard: "Previous card",
    showAnswer: "See Answer",
    nextCard: "Next Card",
    skip: "Skip",
    swipeHint: "Swipe the card left to continue, right to go back",
    done: "All done!",
    doneTalk:
      "Hope that conversation brought you closer. Want to play another round?",
    playAgain: "Play Again",
    backToDeck: "Back to Deck",
  },

  picker: {
    timerOff: "Off",
    seconds: (value: number) => `${value} sec`,
    minutes: (value: number) => `${value} min`,
    fetchFailed: "Couldn't fetch the cards. Check your connection and try again.",
    emptyLevel: "This level has no cards yet. Try picking another level.",
    unsupported:
      "The cards in this level can't be played in this version of the app yet.",
    chooseLevel: "Choose Levels",
    timerTitle: "Timer per Card",
    timerGroup: "Timer duration per card",
    autoAdvance: "Auto-advance",
    autoAdvanceHint: "Move to the next card as soon as time runs out.",
    timerOnHint:
      "The timer starts when a card is opened. Tap the timer to pause.",
    timerOffHint: "No time limit — talk as long as you like.",
    preparing: "Preparing cards...",
    start: (count: number) =>
      `Start Playing (${count} ${count === 1 ? "card" : "cards"})`,
  },

  home: {
    title: "Pick a Category",
    subtitle: "Which cards are we playing today?",
    loading: "Fetching your decks",
    errorTitle: "Couldn't load your decks",
    errorDescription:
      "Trouble reaching the server, so your decks aren't showing yet. They're safe — try again in a moment.",
    yourDecks: "Your decks",
    free: "Free",
    unlocked: "Unlocked",
    locked: "Locked",
    play: (name: string) => `Play ${name}`,
    buy: (name: string) => `Buy ${name}`,
    empty: "No categories available yet.",
    emptyCta: "Make your own deck with AI",
    aiSpentTitle: "You've used all your AI decks",
    aiSpentBody: (used: number, limit: number | null) =>
      `${used} of ${limit} used.`,
    aiCtaTitle: "Make a deck with AI",
    aiCtaUnlimited: "Make unlimited AI decks.",
    aiCtaRemaining: (limit: number | null, remaining: number) =>
      `${limit} free decks, ${remaining} left.`,
  },

  play: {
    loading: "Opening deck",
    errorTitle: "Couldn't open this deck",
    errorDescription: "Trouble reaching the server. Try again in a moment.",
  },

  create: {
    title: "Make Your Own Deck",
    subtitle:
      "Fill in the context and AI writes the cards. This deck is only visible in your account.",
    quotaError: "Couldn't read your allowance.",
    preparing: "Preparing the form",
    spentTitle: "You've used all your deck credits",
    spentBody: (used: number, limit: number) =>
      `Each account gets ${limit} AI decks, and you've used them all (${used} of ${limit}). Decks you've made are still on your home screen and playable anytime.`,
    topupAvailable: (count: number, price: string) =>
      `Want to make more? There's an add-on pack of ${count} decks for Rp ${price}.`,
    topupSoon: (count: number, price: string) =>
      `An add-on pack of ${count} decks (Rp ${price}) is on the way — it can't be bought just yet.`,
    playExisting: "Play your existing decks",
    disabledTitle: "Currently unavailable",
    disabledBody:
      "Making decks with AI is turned off for your account right now. AI decks you've already made can still be played.",
    playExistingFirst: "Play the existing decks for now",
    form: {
      audience: "Who are you playing with?",
      audienceHint: "Sets the point of view and style of the questions.",
      cardLanguage: "Card language",
      cardLanguageHint:
        "The language of the deck's content. It doesn't have to match the app language.",
      cardMix: "Card content",
      storyTheme: "Story theme (optional)",
      topic: "Topic",
      storyHint: "Leave empty for everyday stories at home and school.",
      topicHint: "The subject to test. Leave empty for general knowledge.",
      storyPlaceholder: "E.g. animals at the zoo",
      topicPlaceholder: "E.g. AI Engineering, the solar system, Islamic history",
      tone: "Card mood",
      difficulty: "Difficulty",
      depth: "Depth",
      difficultyHint: "The cards' star level. Each section gets harder.",
      depthHint: "How personal the questions are allowed to get.",
      sectionCount: "Number of sections",
      cardsPerSection: "Cards per section",
      total: (count: number) => `${count} cards in total.`,
      specialLead: "Include",
      specialStrong: "Special",
      specialRest: "cards — Free Pass, Switch, Double.",
      deckName: "Deck name",
      deckNameHint: "Leave empty to let AI name it.",
      context: "Extra context",
      contextHint:
        "Specific details that make the cards fit better. Don't include personal data.",
      avoid: "Topics to avoid",
      unlimited: "You can make unlimited AI decks.",
      remainingLead: "Credits left:",
      remainingRest: (limit: number | null) => `of ${limit} AI decks.`,
      lastChance: " This is your last one, so make it count.",
      generating: "Writing your cards…",
      generate: "Generate deck",
      waitHint: "Takes about 20–40 seconds. Don't close this page.",
      connectionError: "Connection problem. Please try again.",
      genericError: "Couldn't create the deck. Please try again.",
    },
    languages: { id: "Indonesian", en: "English" },
    audiences: [
      { value: "pasangan", label: "Partner / spouse" },
      { value: "sahabat", label: "Best friends / close friends" },
      { value: "keluarga", label: "Family" },
      { value: "anak-orang-tua", label: "Kids & parents" },
      { value: "rekan-kerja", label: "Coworkers / team" },
      { value: "kenalan-baru", label: "New acquaintances" },
      { value: "belajar-sendiri", label: "Just me — study & self-test" },
      { value: "lainnya", label: "Other (explain in the context)" },
    ],
    tones: [
      { value: "santai", label: "Relaxed & light" },
      { value: "romantis", label: "Romantic & warm" },
      { value: "reflektif", label: "Reflective & honest" },
      { value: "lucu", label: "Fun & silly" },
      { value: "mendalam", label: "Deep & serious" },
    ],
    depths: [
      { value: "ringan", label: "Light — safe for anyone" },
      { value: "sedang", label: "Medium — getting personal" },
      { value: "dalam", label: "Deep — heavy, honest questions" },
    ],
    knowledgeDepths: {
      ringan: "Easy — ⭐ to ⭐⭐",
      sedang: "Medium — ⭐⭐ to ⭐⭐⭐⭐",
      dalam: "Challenging — ramps up to ⭐⭐⭐⭐⭐",
    },
    cardMixes: [
      {
        value: "campuran",
        label: "Mixed — questions & challenges",
        hint: "About a third of the cards are challenges.",
      },
      {
        value: "talk",
        label: "Questions only",
        hint: "Every card is answered with a story. All about conversation.",
      },
      {
        value: "action",
        label: "Challenges only",
        hint: "Every card is a challenge you do on the spot — nothing to answer.",
      },
      {
        value: "kuis",
        label: "Knowledge quiz — with answers",
        hint: "A mix of Q&A, multiple choice, myth/fact, guess the clue, and put in order. Answers are on the back.",
      },
      {
        value: "mendengar",
        label: "Listening & concentration practice",
        hint: "One person reads a short text aloud, the others answer questions about it. Levels ramp up gradually.",
      },
    ],
    placeholders: {
      pasangan: {
        deckName: "E.g. Friday Night for Two",
        context: "E.g. we've been long-distance for 2 years and only meet once a month",
        avoid: "E.g. exes, work, politics",
      },
      sahabat: {
        deckName: "E.g. Hanging Out Till Dawn",
        context: "E.g. we've been friends since high school, now live in different cities",
        avoid: "E.g. weight, salary, group drama",
      },
      keluarga: {
        deckName: "E.g. Big Family Reunion",
        context:
          "E.g. played during Eid, with uncles, aunts, and cousins from kids to adults",
        avoid: "E.g. politics, inheritance, “when are you getting married?”",
      },
      "anak-orang-tua": {
        deckName: "E.g. Bedtime Chats",
        context: "E.g. a 9-year-old, usually played before bed",
        avoid: "E.g. school grades, being compared to siblings",
      },
      "rekan-kerja": {
        deckName: "E.g. Monday Morning Icebreaker",
        context:
          "E.g. a 6-person team, half remote and never met in person",
        avoid: "E.g. salary, promotions, office gossip",
      },
      "kenalan-baru": {
        deckName: "E.g. Meeting Without the Awkward",
        context:
          "E.g. a community event, most people meeting for the first time that day",
        avoid: "E.g. religion, politics, relationship status",
      },
      "belajar-sendiri": {
        deckName: "E.g. AI Engineering Self-Test",
        context:
          "E.g. I'm a software engineer who knows LLM basics and wants to test RAG and agents",
        avoid: "E.g. memorizing numbers, specific product names",
      },
      lainnya: {
        deckName: "E.g. Fun Night Together",
        context: "E.g. played with neighbors at our monthly gathering",
        avoid: "E.g. politics, religion, money",
      },
    },
    errors: {
      unauthenticated: "You're not signed in. Sign in, then try again.",
      ai_disabled: "Making AI decks is turned off for your account.",
      quota_spent: (limit: number | null) =>
        `You've used all your AI deck credits (${limit} decks). Decks you've already made can still be played.`,
      invalid_input: "Some form fields aren't valid. Check them and try again.",
      safety_blocked:
        "This request was blocked by the model's safety filter. Try changing the context or topic.",
      truncated:
        "The result got cut off. Try fewer sections or cards.",
      invalid_output: "The model didn't return a valid deck. Please try again.",
      empty_deck: "The generated deck was empty. Please try again.",
      busy: "The AI model is at capacity. Try again in a little while.",
      unreachable: "Couldn't reach the AI service. Try again in a moment.",
      save_failed: "The deck was created but couldn't be saved.",
    },
  },

  auth: {
    email: "Email",
    password: "Password",
    loginTitle: "Welcome Back",
    loginSubtitle: "Sign in to your FlipCard account",
    oauthFailed: "Authentication failed. Please try again.",
    loginUnreachable: "Couldn't reach the sign-in service. Please try again.",
    signingIn: "Signing in...",
    signIn: "Sign in",
    noAccount: "Don't have an account?",
    registerHere: "Sign up here",
    registerTitle: "Create an Account",
    registerSubtitle: "Join and start deeper conversations",
    name: "Name",
    namePlaceholder: "What should we call you?",
    passwordHint: "At least 6 characters",
    registering: "Signing up...",
    register: "Sign up",
    registerUnreachable:
      "Couldn't reach the sign-up service. Please try again.",
    haveAccount: "Already have an account?",
    loginHere: "Sign in here",
    checkEmailTitle: "Check Your Email",
    checkEmailLead: "We sent a confirmation link to",
    checkEmailRest: ". Click it to activate your account.",
    backToLogin: "Back to Sign in",
    googleConnecting: "Connecting to Google...",
    google: "Continue with Google",
    finishing: "Finishing sign-in",
  },

  profile: {
    title: "Profile",
    errorTitle: "Couldn't load your profile",
    logout: "Sign out",
  },

  store: {
    title: "Store",
    subtitle: "Buy paid categories to unlock new cards",
    soon: "Paid categories are coming soon.",
  },

  notFound: {
    title: "We couldn't find that page",
    body: "The link may have changed, or the deck was deleted. Your other decks are still on your home screen.",
    home: "Go home",
    landing: "Front page",
  },

  trial: {
    backHome: "Home",
    title: "Try it first, no sign-up",
    intro:
      "Pick a deck, tap the card, and start playing — conversation, quiz, or listening practice.",
    remainingLead: "You can try",
    remainingStrong: (count: number) =>
      `${count} more ${count === 1 ? "deck" : "decks"}`,
    remainingRest: "before you need an account.",
    spent: "You've used your free tries — decks you've opened can still be replayed.",
    tried: " · tried",
    locked: "Locked",
    playAgain: "Play again",
    play: "Play",
    convinced: "Convinced?",
    createAccount: "Create a free account",
    signIn: "sign in",
    meter: (used: number, limit: number) =>
      `${used} of ${limit} trial decks used`,
    deckDone: (name: string) => `${name} deck complete!`,
    moreLeft: (count: number) =>
      `You can still try ${count} more ${count === 1 ? "deck" : "decks"} without an account.`,
    continuePitch: (limit: number) =>
      `Want more? Create a free account to unlock the full decks and make ${limit} of your own with AI.`,
    tryAnother: "Try another deck",
    seeOthers: "See other decks",
    mode: "Trial mode",
    gateTitle: "Fun, right? Keep going with an account",
    gateTried: (count: number) =>
      `You've tried ${count} ${count === 1 ? "deck" : "decks"}. `,
    gateBody: (limit: number) =>
      `Create a free account to unlock every built-in deck in full and make ${limit} decks of your own with AI.`,
    gateLogin: "Have an account? Sign in",
    gateLater: "Maybe later",
  },
};
