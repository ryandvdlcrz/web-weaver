// public/data.js

export const RANKS = [
  { minMissions: 0, title: "Thread Novice" },
  { minMissions: 1, title: "Apprentice Weaver" },
  { minMissions: 2, title: "Journeyman Weaver" },
  { minMissions: 3, title: "Master Weaver" },
  { minMissions: 4, title: "MYTHIC WORD WEAVER" }
];

export const MISSIONS = [
  {
    id: 1,
    title: "Mission 1: The Warp",
    subtitle: "Easy Round • Foundation Threads",
    keyPhrase: "RIGHT THREAD",
    badge: "APPRENTICE WEAVER",
    lesson: {
      title: "Start the Weave: Foundation Words!",
      screens: [
        {
          id: "opening",
          label: "Opening",
          speech:
            "Hello, Word Weaver! Welcome to your first mission! Before we weave a beautiful textile of words, we must first set up our foundation threads. Remember: RIGHT THREAD is our key in this mission!",
          dictationText:
            "Hello, Word Weaver! Welcome to your first mission! Before we weave a beautiful textile of words, we must first set up our foundation threads. Remember: RIGHT THREAD is our key in this mission!",
          visualType: "keyPhrase",
          keyPhrase: "RIGHT THREAD"
        },
        {
          id: "scene1",
          label: "Scene 1 – Listen Carefully",
          speech: "Listen carefully to each syllable of the word.",
          dictationText: "Listen carefully to each syllable of the word: afternoon.",
          visualType: "syllables",
          word: "afternoon",
          parts: ["af", "ter", "noon"],
          highlightIndex: 1
        },
        {
          id: "scene2",
          label: "Scene 2 – Use in Context",
          speech: "Read the sentence clue to understand how the word is used.",
          dictationText: "We eat merienda in the afternoon.",
          visualType: "context",
          before: "We eat merienda in the ",
          blank: "__________",
          after: ".",
          filled: "afternoon"
        },
        {
          id: "scene3",
          label: "Scene 3 – Match Sound and Letter",
          speech: "Match every sound to its correct letter—like afternoon, rooster, and sugar.",
          dictationText: "Match every sound to its correct letter—like afternoon, rooster, and sugar.",
          visualType: "tricky",
          samples: [
            { word: "afternoon", mark: "oo" },
            { word: "rooster", mark: "oo" },
            { word: "sugar", mark: "su" }
          ]
        },
        {
          id: "scene4",
          label: "Scene 4 – Check Before Submitting",
          speech: "Check every letter from left to right before locking in your weave.",
          dictationText: "Check every letter from left to right before locking in your weave: follow.",
          visualType: "checkWord",
          word: "follow"
        },
        {
          id: "closing",
          label: "Closing",
          speech:
            "Remember, Word Weaver: Listen, understand, and weave every letter correctly. Are you ready? Let's start your first challenge!",
          dictationText:
            "Remember, Word Weaver: Listen, understand, and weave every letter correctly. Are you ready? Let's start your first challenge!",
          visualType: "ready"
        }
      ]
    },
    levels: [
      {
        level: 1,
        title: "Weaver’s Beginning (Recognition)",
        shuffleOptions: false,
        items: [
          {
            id: "m1-l1-i1",
            type: "mc",
            prompt:
              "Item 1 – Afternoon Snack: Choose the correct spelling of the word that completes the sentence: “We usually eat merienda with Grandma in the __________.”",
            audioText: "We usually eat merienda with Grandma in the afternoon.",
            audioUrl: "/audio/m1-l1-i1.mp3",
            options: ["afternon", "afternoon", "afternune", "afterrnoon"],
            answer: "afternoon",
            feedbackCorrect:
              "🎉 Great job, Word Weaver! afternoon has the correct combination of after + noon.",
            feedbackIncorrect: "💡 Try again! Combine the two words after and noon."
          },
          {
            id: "m1-l1-i2",
            type: "mc",
            prompt:
              "Item 2 – School Class: Which word card has the correct spelling for the sentence: “Our Grade 5 __________ planted pechay seeds in the school garden.”",
            audioText: "Our Grade 5 class planted pechay seeds in the school garden.",
            audioUrl: "/audio/m1-l1-i2.mp3",
            options: ["clas", "class", "klass"],
            answer: "class",
            feedbackCorrect: "✅ Accurate, Word Weaver! Two s letters are at the end of class.",
            feedbackIncorrect: "🔎 Look closely! A double s is required at the end of the word."
          },
          {
            id: "m1-l1-i3",
            type: "mc",
            prompt:
              "Item 3 – Follow Guidelines: Choose the correct spelling of the word meaning to obey or go after: “Please __________ the community guidelines on proper waste segregation.”",
            audioText: "Please follow the community guidelines on proper waste segregation.",
            audioUrl: "/audio/m1-l1-i3.mp3",
            options: ["folow", "follow", "follou", "fallowe"],
            answer: "follow",
            feedbackCorrect: "🌟 Excellent, Word Weaver! follow has a double l and ends in ow.",
            feedbackIncorrect: "💡 Think again. There is a twin letter l in the middle of this word."
          },
          {
            id: "m1-l1-i4",
            type: "tf",
            prompt:
              "Item 4 – Sweet Sugar: Choose TRUE if the spelling of the highlighted word is correct and FALSE if not: “Negros Occidental is famous for producing sweet shugar cane.”",
            audioText: "Negros Occidental is famous for producing sweet sugar cane.",
            audioUrl: "/audio/m1-l1-i4.mp3",
            options: ["TRUE", "FALSE"],
            answer: "FALSE",
            feedbackCorrect:
              "✅ Correct, Word Weaver! Although it sounds like sh, it is spelled as s-u-g-a-r.",
            feedbackIncorrect: "💡 Remember: There is no letter h in the word sugar."
          },
          {
            id: "m1-l1-i5",
            type: "mc",
            prompt:
              "Item 5 – Everyday Threads: Which of the following word groups has all correct spellings?",
            audioText: "clear, forget, cloth, month",
            audioUrl: "/audio/m1-l1-i5.mp3",
            options: [
              "clear, forget, cloth, month",
              "cleer, forgett, kloth, munth",
              "clear, forgit, cloth, monthe",
              "cliar, forget, clote, month"
            ],
            answer: "clear, forget, cloth, month",
            feedbackCorrect:
              "🛡️ Outstanding, Word Weaver! You arranged all foundation threads in Level 1.",
            feedbackIncorrect:
              "🔎 Carefully inspect each word—find the group with no incorrect vowels or consonants."
          }
        ]
      },
      {
        level: 2,
        title: "Fix the Word Weave (Application)",
        shuffleOptions: false,
        items: [
          {
            id: "m1-l2-i1",
            type: "tiles",
            prompt:
              "Item 1 – Weave the Letters: Tap the letter tiles in order to spell the word: “The loud crowing of the __________ wakes everyone up at dawn.”",
            audioText: "The loud crowing of the rooster wakes everyone up at dawn.",
            audioUrl: "/audio/m1-l2-i1.mp3",
            tiles: ["T", "O", "R", "S", "E", "O", "R"],
            answer: "ROOSTER",
            feedbackCorrect: "🎉 Excellent, Word Weaver! You wove rooster correctly.",
            feedbackIncorrect: "🔎 Look closely! There is a double o in the middle of this word."
          },
          {
            id: "m1-l2-i2",
            type: "mc",
            prompt:
              "Item 2 – Find the Missing Thread: Fill in the missing vowels to complete the word: “Many families visit Baguio City during the hot s _ m m _ r break.”",
            audioText: "Many families visit Baguio City during the hot summer break.",
            audioUrl: "/audio/m1-l2-i2.mp3",
            options: ["u, e", "a, e", "o, e", "u, a"],
            answer: "u, e",
            feedbackCorrect: "✅ Spot on! S-U-M-M-E-R is the proper spelling.",
            feedbackIncorrect: "💡 Check the vowel sounds in summer: u and e."
          },
          {
            id: "m1-l2-i3",
            type: "mc",
            prompt:
              "Item 3 – Find the Wrong Thread: In “Do not forgit to bring your umbrella during the rainy season,” choose the right correction for “forgit.”",
            audioText: "Do not forget to bring your umbrella during the rainy season.",
            audioUrl: "/audio/m1-l2-i3.mp3",
            options: ["forget", "forgat"],
            answer: "forget",
            feedbackCorrect: "💡 Correct, Word Weaver! Letter e should be used instead of i.",
            feedbackIncorrect: "🔎 Look closely at the vowel in the second syllable: forget."
          },
          {
            id: "m1-l2-i4",
            type: "sort",
            prompt:
              "Item 4 – Thread Sorting: Tap a word card, then tap Correct Spelling or Misspelled.",
            audioText: "Sort the words: broom, blood, chalk, and chain.",
            audioUrl: "/audio/m1-l2-i4.mp3",
            bins: [
              { id: "correct", label: "🟢 CORRECT SPELLING" },
              { id: "misspelled", label: "🔴 MISSPELLED" }
            ],
            cards: [
              { id: "c1", label: "broom", bin: "correct" },
              { id: "c2", label: "blud", bin: "misspelled" },
              { id: "c3", label: "chalk", bin: "correct" },
              { id: "c4", label: "chian", bin: "misspelled" }
            ],
            feedbackCorrect: "🛡️ Outstanding! You can instantly distinguish clean from tangled threads.",
            feedbackIncorrect:
              "🔎 Check each thread: broom and chalk are right; blud and chian are misspelled."
          },
          {
            id: "m1-l2-i5",
            type: "match",
            prompt:
              "Item 5 – Word Matching: Tap a meaning on the left, then tap its matching word on the right.",
            audioText: "Match each meaning to cloth, month, or clear.",
            audioUrl: "/audio/m1-l2-i5.mp3",
            pairs: [
              { left: "Used to wipe a table", right: "cloth" },
              { left: "Twelve parts of a year", right: "month" },
              { left: "Not cloudy or muddy", right: "clear" }
            ],
            feedbackCorrect: "🏆 Level 2 weave is complete!",
            feedbackIncorrect:
              "💡 Match cloth to wiping a table, month to twelve parts of a year, and clear to not cloudy."
          }
        ]
      },
      {
        level: 3,
        title: "Final Warp Challenge (Contextual Mastery)",
        shuffleOptions: false,
        items: [
          {
            id: "m1-l3-i1",
            type: "mc",
            prompt:
              "Item 1 – “Maya’s Report”: Maya is writing her report about classroom cleanliness: “We used a broom and a damp _____ to clean the blackboard.” Which word should she write?",
            audioText: "We used a broom and a damp cloth to clean the blackboard.",
            audioUrl: "/audio/m1-l3-i1.mp3",
            options: ["kloth", "cloth", "clote", "clothe"],
            answer: "cloth",
            feedbackCorrect: "✅ Great choice! Damp cloth fits Maya's report.",
            feedbackIncorrect: "💡 Check the spelling: c-l-o-t-h."
          },
          {
            id: "m1-l3-i2",
            type: "mc",
            prompt:
              "Item 2 – “Summer Packing List”: Carlo is preparing his vacation checklist (1. summer clothes | 2. clear water bottle | 3. afternon snacks). Which word needs correction?",
            audioText: "summer clothes, clear water bottle, afternoon snacks.",
            audioUrl: "/audio/m1-l3-i2.mp3",
            options: ["summer", "clear", "afternon (→ afternoon)", "None"],
            answer: "afternon (→ afternoon)",
            feedbackCorrect: "✅ Spot on! afternon is missing an o and an n.",
            feedbackIncorrect: "🔎 Look at item 3 on Carlo's list."
          },
          {
            id: "m1-l3-i3",
            type: "mc",
            prompt:
              "Item 3 – “Community Reminder”: You are making a poster for National Language Month. Choose the sentence with zero spelling errors:",
            audioText: "August is the month when we follow school activities.",
            audioUrl: "/audio/m1-l3-i3.mp3",
            options: [
              "August is the monthe when we folow school activities.",
              "August is the month when we follow school activities.",
              "August is the month when we folow school activitis."
            ],
            answer: "August is the month when we follow school activities.",
            feedbackCorrect: "🌟 Clean weave! Every word in that sentence is spelled right.",
            feedbackIncorrect: "💡 Check month, follow, and activities carefully."
          },
          {
            id: "m1-l3-i4",
            type: "mc",
            prompt:
              "Item 4 – “Complete the Sentence”: Choose the two words that correctly complete: “Every __________, our Grade 5 __________ waters the plants before going home.”",
            audioText: "Every afternoon, our Grade 5 class waters the plants before going home.",
            audioUrl: "/audio/m1-l3-i4.mp3",
            options: ["afternoon + class", "afternon + clas", "morning + rooster"],
            answer: "afternoon + class",
            feedbackCorrect: "🎉 Well woven! afternoon and class complete the sentence accurately.",
            feedbackIncorrect: "💡 Both afternoon and class need their standard spellings."
          },
          {
            id: "m1-l3-i5",
            type: "mc",
            prompt:
              "Item 5 – “Weaver’s Final Check”: Read the paragraph and identify how many words are misspelled: “Do not forgit to buy shugar at the store this afternoon.”",
            audioText: "Do not forget to buy sugar at the store this afternoon.",
            audioUrl: "/audio/m1-l3-i5.mp3",
            options: ["1", "2 (forgit, shugar)", "3", "0"],
            answer: "2 (forgit, shugar)",
            feedbackCorrect: "🛡️ You caught both misspelled words: forgit and shugar!",
            feedbackIncorrect: "🔎 Count carefully: forgit and shugar are misspelled."
          }
        ]
      }
    ]
  },
  {
    id: 2,
    title: "Mission 2: The Weft",
    subtitle: "Average Round • Crossing Threads",
    keyPhrase: "STRONG WEAVE",
    badge: "JOURNEYMAN WEAVER",
    lesson: {
      title: "Hidden Threads: Silent Letters and Vowel Pairs!",
      screens: [
        {
          id: "opening",
          label: "Opening",
          speech:
            "Congratulations on finishing your first mission, Word Weaver! Now, our weaving becomes more artistic. In The Weft, we will encounter words with silent letters and vowel pairs. Remember: STRONG WEAVE is our key!",
          dictationText:
            "Congratulations on finishing your first mission, Word Weaver! Now, our weaving becomes more artistic. In The Weft, we will encounter words with silent letters and vowel pairs. Remember: STRONG WEAVE is our key!",
          visualType: "keyPhrase",
          keyPhrase: "STRONG WEAVE"
        },
        {
          id: "scene1",
          label: "Scene 1 – Silent Letters",
          speech:
            "In words like answer and bridge, there are unpronounced letters essential to spelling (w in answer, d in bridge).",
          dictationText:
            "In words like answer and bridge, there are unpronounced letters essential to spelling: w in answer, d in bridge.",
          visualType: "tricky",
          samples: [
            { word: "answer", mark: "silent w" },
            { word: "bridge", mark: "silent d" }
          ]
        },
        {
          id: "scene2",
          label: "Scene 2 – Vowel Pairs",
          speech: "In already and against, ea and ai work together.",
          dictationText: "In already and against, ea and ai work together.",
          visualType: "tricky",
          samples: [
            { word: "already", mark: "ea" },
            { word: "against", mark: "ai" }
          ]
        },
        {
          id: "scene3",
          label: "Scene 3 – Three Syllables",
          speech: "Break down longer words like choc-o-late and but-ter-fly.",
          dictationText: "Break down longer words like chocolate and butterfly.",
          visualType: "syllables",
          word: "butterfly",
          parts: ["but", "ter", "fly"],
          highlightIndex: 2
        },
        {
          id: "closing",
          label: "Closing",
          speech: "Keep your threads crossed with care, Word Weaver. Ready to weave The Weft?",
          dictationText: "Keep your threads crossed with care, Word Weaver. Ready to weave The Weft?",
          visualType: "ready"
        }
      ]
    },
    levels: [
      {
        level: 1,
        title: "Recognize the Hidden Threads",
        shuffleOptions: false,
        items: [
          {
            id: "m2-l1-i1",
            type: "mc",
            prompt:
              "Item 1 – Full Jeepney: Choose the correct spelling: “The jeepney was __________ full when it reached the market stop.”",
            audioText: "The jeepney was already full when it reached the market stop.",
            audioUrl: "/audio/m2-l1-i1.mp3",
            options: ["alredy", "already", "allready", "alreadi"],
            answer: "already",
            feedbackCorrect: "✅ Great job! already is spelled a-l-r-e-a-d-y.",
            feedbackIncorrect: "💡 Check the vowels in already: e-a."
          },
          {
            id: "m2-l1-i2",
            type: "mc",
            prompt: "Item 2 – Silent Letter: Which letter is silent in the word answer?",
            audioText: "Which letter is silent in the word answer?",
            audioUrl: "/audio/m2-l1-i2.mp3",
            options: ["n", "s", "w", "r"],
            answer: "w",
            feedbackCorrect: "🎉 Spot on! The w in answer is silent.",
            feedbackIncorrect: "🔎 Listen to how answer is pronounced—w is silent."
          },
          {
            id: "m2-l1-i3",
            type: "mc",
            prompt:
              "Item 3 – Pampanga River Bridge: Choose the correct spelling: “We crossed the long __________ over the Pampanga River.”",
            audioText: "We crossed the long bridge over the Pampanga River.",
            audioUrl: "/audio/m2-l1-i3.mp3",
            options: ["brige", "bridge", "brij", "bridje"],
            answer: "bridge",
            feedbackCorrect: "✅ Well woven! bridge has silent d before ge.",
            feedbackIncorrect: "💡 Remember the silent d in bridge."
          },
          {
            id: "m2-l1-i4",
            type: "tf",
            prompt:
              "Item 4 – Davao Chocolate: Choose TRUE if the spelling of the highlighted word is correct and FALSE if not: “Cacao tablets from Davao are used to make rich, hot choclate.”",
            audioText: "Cacao tablets from Davao are used to make rich, hot chocolate.",
            audioUrl: "/audio/m2-l1-i4.mp3",
            options: ["TRUE", "FALSE"],
            answer: "FALSE",
            feedbackCorrect: "✅ Correct! The proper spelling is chocolate (choc-o-late).",
            feedbackIncorrect: "💡 Check the middle syllable: choc-o-late."
          },
          {
            id: "m2-l1-i5",
            type: "mc",
            prompt:
              "Item 5 – Village Captain: Choose the correct spelling: “The village __________ led the clean-up drive along the creek.”",
            audioText: "The village captain led the clean-up drive along the creek.",
            audioUrl: "/audio/m2-l1-i5.mp3",
            options: ["captian", "captain", "capten", "captayn"],
            answer: "captain",
            feedbackCorrect: "🛡️ Strong weave! captain ends with -ain.",
            feedbackIncorrect: "💡 Check the ending of captain: -ain."
          }
        ]
      },
      {
        level: 2,
        title: "Arrange the Design",
        shuffleOptions: false,
        items: [
          {
            id: "m2-l2-i1",
            type: "tiles",
            prompt:
              "Item 1 – Letter Loom: Arrange the letters for the word meaning leaning on / opposed to:",
            audioText: "Arrange the letters for the word meaning leaning on or opposed to: against.",
            audioUrl: "/audio/m2-l2-i1.mp3",
            tiles: ["T", "A", "I", "N", "G", "A", "S"],
            answer: "AGAINST",
            feedbackCorrect: "🎉 Excellent! You wove against.",
            feedbackIncorrect: "🔎 Look at the vowel pair ai in against."
          },
          {
            id: "m2-l2-i2",
            type: "sort",
            prompt:
              "Item 2 – Silent Letter Detective: Tap a word, then tap the box showing its silent letter.",
            audioText: "Sort bridge, answer, minute, and choose by their silent letter.",
            audioUrl: "/audio/m2-l2-i2.mp3",
            bins: [
              { id: "silent-d", label: "Silent d" },
              { id: "silent-w", label: "Silent w" },
              { id: "silent-e", label: "Silent e" }
            ],
            cards: [
              { id: "s1", label: "bridge", bin: "silent-d" },
              { id: "s2", label: "answer", bin: "silent-w" },
              { id: "s3", label: "minute", bin: "silent-e" },
              { id: "s4", label: "choose", bin: "silent-e" }
            ],
            feedbackCorrect: "🛡️ Sharp detective work! Every silent letter is sorted.",
            feedbackIncorrect:
              "💡 bridge has silent d, answer has silent w, and minute and choose have silent e."
          },
          {
            id: "m2-l2-i3",
            type: "sort",
            prompt:
              "Item 3 – Weave Sorting: Tap a word card, then tap Correct Spelling or Needs Fixing.",
            audioText: "Sort careless, circle, minute, and choose.",
            audioUrl: "/audio/m2-l2-i3.mp3",
            bins: [
              { id: "correct", label: "🟢 CORRECT SPELLING" },
              { id: "needs-fixing", label: "🔴 NEEDS FIXING" }
            ],
            cards: [
              { id: "w1", label: "careless", bin: "correct" },
              { id: "w2", label: "cirle", bin: "needs-fixing" },
              { id: "w3", label: "minute", bin: "correct" },
              { id: "w4", label: "chuse", bin: "needs-fixing" }
            ],
            feedbackCorrect:
              "✅ Great sorting! careless and minute are right; cirle and chuse need fixing.",
            feedbackIncorrect: "🔎 Check each spelling: circle and choose need fixing."
          },
          {
            id: "m2-l2-i4",
            type: "mc",
            prompt:
              "Item 4 – Syllable Builder: Combine the syllables to form the word: but + ter + fly",
            audioText: "Combine the syllables to form the word: butterfly.",
            audioUrl: "/audio/m2-l2-i4.mp3",
            options: ["butterfly", "buterfly", "butterfli", "buttorfly"],
            answer: "butterfly",
            feedbackCorrect: "🌟 Spot on! but + ter + fly makes butterfly.",
            feedbackIncorrect: "💡 Combine the three syllables: butterfly."
          },
          {
            id: "m2-l2-i5",
            type: "mc",
            prompt:
              "Item 5 – Classroom Blackboard: Choose the correct spelling of the compound word:",
            audioText: "blackboard",
            audioUrl: "/audio/m2-l2-i5.mp3",
            options: ["blakboard", "blackboard", "blackbord", "blacboard"],
            answer: "blackboard",
            feedbackCorrect: "🏆 Level 2 Weft is complete!",
            feedbackIncorrect: "💡 Combine black + board into blackboard."
          }
        ]
      },
      {
        level: 3,
        title: "Final Weft Challenge",
        shuffleOptions: false,
        items: [
          {
            id: "m2-l3-i1",
            type: "mc",
            prompt:
              "Item 1 – “Outdoor Circle Game”: “The pupils formed a wide _____ to play traditional outdoor games.”",
            audioText: "The pupils formed a wide circle to play traditional outdoor games.",
            audioUrl: "/audio/m2-l3-i1.mp3",
            options: ["circel", "circle", "sircle", "cirkle"],
            answer: "circle",
            feedbackCorrect: "✅ Correct! circle is spelled c-i-r-c-l-e.",
            feedbackIncorrect: "💡 Check the ending: -cle in circle."
          },
          {
            id: "m2-l3-i2",
            type: "mc",
            prompt:
              "Item 2 – “Exam Caution”: “A _____ mistake on the math test cost him two points.”",
            audioText: "A careless mistake on the math test cost him two points.",
            audioUrl: "/audio/m2-l3-i2.mp3",
            options: ["careles", "careless", "cairless", "carless"],
            answer: "careless",
            feedbackCorrect: "🎉 Spot on! careless ends with -less.",
            feedbackIncorrect: "💡 Spell careless with care + less."
          },
          {
            id: "m2-l3-i3",
            type: "mc",
            prompt:
              "Item 3 – “Just a Minute”: “Wait just one _____ while I tie my shoelaces.”",
            audioText: "Wait just one minute while I tie my shoelaces.",
            audioUrl: "/audio/m2-l3-i3.mp3",
            options: ["minit", "minute", "minuet", "minut"],
            answer: "minute",
            feedbackCorrect: "✅ Great job! minute is spelled m-i-n-u-t-e.",
            feedbackIncorrect: "💡 Remember the silent e at the end of minute."
          },
          {
            id: "m2-l3-i4",
            type: "mc",
            prompt:
              "Item 4 – “Lunch Options”: “You may _____ between grilled chicken or vegetable stew for lunch.”",
            audioText: "You may choose between grilled chicken or vegetable stew for lunch.",
            audioUrl: "/audio/m2-l3-i4.mp3",
            options: ["chose", "choose", "chuse", "choos"],
            answer: "choose",
            feedbackCorrect: "🌟 Well done! choose has double o.",
            feedbackIncorrect: "💡 Choose uses double o: c-h-o-o-s-e."
          },
          {
            id: "m2-l3-i5",
            type: "mc",
            prompt:
              "Item 5 – “Final Weft Check”: Choose the sentence with completely correct spelling:",
            audioText: "The captain already wrote the answer on the blackboard.",
            audioUrl: "/audio/m2-l3-i5.mp3",
            options: [
              "The captain already wrote the answer on the blackboard.",
              "The captian alredy wrote the anser on the blackboard.",
              "The captain already wrote the answer on the blakboard."
            ],
            answer: "The captain already wrote the answer on the blackboard.",
            feedbackCorrect: "🛡️ Strong weave! Every word in that sentence is spelled accurately.",
            feedbackIncorrect: "🔎 Check captain, already, answer, and blackboard carefully."
          }
        ]
      }
    ]
  },
  {
    id: 3,
    title: "Mission 3: The Pattern",
    subtitle: "Difficult Round • Masterpiece Weave",
    keyPhrase: "MASTERPIECE",
    badge: "MASTER WORD WEAVER",
    lesson: {
      title: "The Masterpiece: The Trickiest Threads!",
      screens: [
        {
          id: "opening",
          label: "Opening",
          speech:
            "You have reached the highest tier, Word Weaver! In The Pattern, we will build the most intricate and beautiful design. Here, your proficiency with words like beautiful, believe, daughter, and cough will be tested. Remember: MASTERPIECE is our key!",
          dictationText:
            "You have reached the highest tier, Word Weaver! In The Pattern, we will build the most intricate and beautiful design. Here, your proficiency with words like beautiful, believe, daughter, and cough will be tested. Remember: MASTERPIECE is our key!",
          visualType: "keyPhrase",
          keyPhrase: "MASTERPIECE"
        },
        {
          id: "scene1",
          label: "Scene 1 – i before e",
          speech: "In the word believe, remember i comes before e.",
          dictationText: "In the word believe, remember i comes before e.",
          visualType: "tricky",
          samples: [{ word: "believe", mark: "ie" }]
        },
        {
          id: "scene2",
          label: "Scene 2 – gh Sounds",
          speech: "In daughter, gh is silent; in cough, gh makes an f sound!",
          dictationText: "In daughter, gh is silent; in cough, gh makes an f sound!",
          visualType: "tricky",
          samples: [
            { word: "daughter", mark: "silent gh" },
            { word: "cough", mark: "gh = f" }
          ]
        },
        {
          id: "scene3",
          label: "Scene 3 – Three Consecutive Vowels",
          speech: "In beautiful, remember the e-a-u at the beginning!",
          dictationText: "In beautiful, remember the e-a-u at the beginning!",
          visualType: "tricky",
          samples: [{ word: "beautiful", mark: "eau" }]
        },
        {
          id: "closing",
          label: "Closing",
          speech: "Weave your masterpiece with focus and pride, Word Weaver!",
          dictationText: "Weave your masterpiece with focus and pride, Word Weaver!",
          visualType: "ready"
        }
      ]
    },
    levels: [
      {
        level: 1,
        title: "Inspect Intricate Threads",
        shuffleOptions: false,
        items: [
          {
            id: "m3-l1-i1",
            type: "mc",
            prompt:
              "Item 1 – Banaue Rice Terraces: Choose the correct spelling: “The Banaue Rice Terraces look __________ under the morning sun.”",
            audioText: "The Banaue Rice Terraces look beautiful under the morning sun.",
            audioUrl: "/audio/m3-l1-i1.mp3",
            options: ["beatiful", "beautiful", "beutiful", "beautifull"],
            answer: "beautiful",
            feedbackCorrect: "✅ Spot on! beautiful begins with b-e-a-u.",
            feedbackIncorrect: "💡 Remember e-a-u in beautiful."
          },
          {
            id: "m3-l1-i2",
            type: "mc",
            prompt:
              "Item 2 – Spirit of Unity: Choose the correct spelling: “Filipinos __________ in the spirit of community cooperation during hard times.”",
            audioText:
              "Filipinos believe in the spirit of community cooperation during hard times.",
            audioUrl: "/audio/m3-l1-i2.mp3",
            options: ["beleive", "believe", "bilieve", "beleeve"],
            answer: "believe",
            feedbackCorrect: "🎉 Well done! i comes before e in believe.",
            feedbackIncorrect: "💡 Remember: i before e in believe."
          },
          {
            id: "m3-l1-i3",
            type: "mc",
            prompt:
              "Item 3 – Stomach Ache: Choose the correct spelling: “Eating too many green mangoes gave Juan a sudden stomach __________.”",
            audioText: "Eating too many green mangoes gave Juan a sudden stomach ache.",
            audioUrl: "/audio/m3-l1-i3.mp3",
            options: ["ake", "ache", "aiche", "ach"],
            answer: "ache",
            feedbackCorrect: "✅ Correct! ache is spelled a-c-h-e.",
            feedbackIncorrect: "💡 Check the spelling: a-c-h-e."
          },
          {
            id: "m3-l1-i4",
            type: "tf",
            prompt:
              "Item 4 – Cover Your Mouth When Coughing: Choose TRUE if the spelling of the highlighted word is correct and FALSE if not: “Cover your mouth with your elbow whenever you sneeze or coff.”",
            audioText: "Cover your mouth with your elbow whenever you sneeze or cough.",
            audioUrl: "/audio/m3-l1-i4.mp3",
            options: ["TRUE", "FALSE"],
            answer: "FALSE",
            feedbackCorrect: "✅ Correct! The proper spelling is cough.",
            feedbackIncorrect: "💡 Cough ends with -ough."
          },
          {
            id: "m3-l1-i5",
            type: "mc",
            prompt:
              "Item 5 – Philippine Languages: Choose the correct spelling: “The Philippines has over a hundred __________ languages and dialects.”",
            audioText: "The Philippines has over a hundred different languages and dialects.",
            audioUrl: "/audio/m3-l1-i5.mp3",
            options: ["diferent", "different", "diffrent", "differrent"],
            answer: "different",
            feedbackCorrect: "🛡️ Masterful! different has double f.",
            feedbackIncorrect: "💡 Remember the double f in different."
          }
        ]
      },
      {
        level: 2,
        title: "Arrange the Masterpiece",
        shuffleOptions: false,
        items: [
          {
            id: "m3-l2-i1",
            type: "tiles",
            prompt: "Item 1 – Letter Loom: Arrange the letters for the word meaning female child:",
            audioText: "Arrange the letters for the word meaning female child: daughter.",
            audioUrl: "/audio/m3-l2-i1.mp3",
            tiles: ["H", "T", "E", "R", "D", "A", "U", "G"],
            answer: "DAUGHTER",
            feedbackCorrect: "🎉 Outstanding! You wove daughter.",
            feedbackIncorrect: "🔎 Check the letter order: d-a-u-g-h-t-e-r."
          },
          {
            id: "m3-l2-i2",
            type: "match",
            prompt:
              "Item 2 – Sound-to-Spelling Match: Tap a word on the left, then tap its spelling pattern on the right.",
            audioText: "Match accident, butcher, clothes, and automobile to their spelling patterns.",
            audioUrl: "/audio/m3-l2-i2.mp3",
            pairs: [
              { left: "accident", right: "Double c (cc)" },
              { left: "butcher", right: "Silent-consonant mix (tch)" },
              { left: "clothes", right: "Ends in -thes" },
              { left: "automobile", right: "Starts with auto-" }
            ],
            feedbackCorrect: "✅ Every pattern matched cleanly!",
            feedbackIncorrect: "💡 Check each word's distinct spelling feature."
          },
          {
            id: "m3-l2-i3",
            type: "sort",
            prompt:
              "Item 3 – Complex Word Sorting: Tap a word card, then tap Correct Spelling or Misspelled.",
            audioText: "Sort tomorrow, although, experience, and machine.",
            audioUrl: "/audio/m3-l2-i3.mp3",
            bins: [
              { id: "correct", label: "🟢 CORRECT SPELLING" },
              { id: "misspelled", label: "🔴 MISSPELLED" }
            ],
            cards: [
              { id: "p1", label: "tomorrow", bin: "correct" },
              { id: "p2", label: "altho", bin: "misspelled" },
              { id: "p3", label: "experience", bin: "correct" },
              { id: "p4", label: "masheen", bin: "misspelled" }
            ],
            feedbackCorrect:
              "🛡️ Spot on! tomorrow and experience are correct; altho and masheen are misspelled.",
            feedbackIncorrect: "🔎 Look closely at altho (although) and masheen (machine)."
          },
          {
            id: "m3-l2-i4",
            type: "mc",
            prompt:
              "Item 4 – Find the Wrong Letter: Choose the correct spelling of the word meaning not able to occur:",
            audioText: "impossible",
            audioUrl: "/audio/m3-l2-i4.mp3",
            options: ["imposible", "impossible", "impossibel", "inpossible"],
            answer: "impossible",
            feedbackCorrect: "🌟 Correct! impossible has double s and ends in -ble.",
            feedbackIncorrect: "💡 Spell impossible with im- + poss- + -ible."
          },
          {
            id: "m3-l2-i5",
            type: "mc",
            prompt:
              "Item 5 – Guess the Word: Choose the correct spelling: “Can you __________ the answer to the teacher's riddle?”",
            audioText: "Can you guess the answer to the teacher's riddle?",
            audioUrl: "/audio/m3-l2-i5.mp3",
            options: ["gess", "guess", "gues", "guiss"],
            answer: "guess",
            feedbackCorrect: "🏆 Level 2 Pattern is complete!",
            feedbackIncorrect: "💡 Remember the u and double s in guess."
          }
        ]
      },
      {
        level: 3,
        title: "Final Pattern Challenge",
        shuffleOptions: false,
        items: [
          {
            id: "m3-l3-i1",
            type: "mc",
            prompt:
              "Item 1 – “Road Safety”: “Wearing a helmet helps prevent serious injury in a bicycle _____.”",
            audioText: "Wearing a helmet helps prevent serious injury in a bicycle accident.",
            audioUrl: "/audio/m3-l3-i1.mp3",
            options: ["acident", "accident", "accedent", "axident"],
            answer: "accident",
            feedbackCorrect: "✅ Correct! accident has double c.",
            feedbackIncorrect: "💡 Check the double c in accident."
          },
          {
            id: "m3-l3-i2",
            type: "mc",
            prompt:
              "Item 2 – “At the Wet Market”: “Father bought fresh pork belly from the local _____ at the wet market.”",
            audioText: "Father bought fresh pork belly from the local butcher at the wet market.",
            audioUrl: "/audio/m3-l3-i2.mp3",
            options: ["bucher", "butcher", "butsher", "botcher"],
            answer: "butcher",
            feedbackCorrect: "🎉 Spot on! butcher uses -tch-.",
            feedbackIncorrect: "💡 Remember -tch- in butcher."
          },
          {
            id: "m3-l3-i3",
            type: "mc",
            prompt:
              "Item 3 – “Spelling Bee Glory”: “Mrs. Maria is very proud of her _____ who won the regional spelling bee.”",
            audioText:
              "Mrs. Maria is very proud of her daughter who won the regional spelling bee.",
            audioUrl: "/audio/m3-l3-i3.mp3",
            options: ["dauter", "daughter", "daughther", "doghter"],
            answer: "daughter",
            feedbackCorrect: "🌟 Well woven! daughter is spelled d-a-u-g-h-t-e-r.",
            feedbackIncorrect: "💡 Check the spelling: d-a-u-g-h-t-e-r."
          },
          {
            id: "m3-l3-i4",
            type: "mc",
            prompt:
              "Item 4 – “Unity in Diversity”: Choose the sentence with zero spelling errors:",
            audioText: "Although we speak different languages, we believe in unity.",
            audioUrl: "/audio/m3-l3-i4.mp3",
            options: [
              "Although we speak different languages, we believe in unity.",
              "Althogh we speak diferent languages, we beleive in unity.",
              "Although we speak different languages, we beleive in unity."
            ],
            answer: "Although we speak different languages, we believe in unity.",
            feedbackCorrect: "🛡️ Clean weave! Every word in that sentence is spelled right.",
            feedbackIncorrect: "🔎 Check although, different, and believe carefully."
          },
          {
            id: "m3-l3-i5",
            type: "mc",
            prompt:
              "Item 5 – “The Word Weaver's Final Design”: Select the three correctly spelled words: “Please fold your clean (1) ____ neatly. Tomorrow, we will ride an (2) ____ to see the (3) ____ Banaue Rice Terraces.”",
            audioText:
              "Please fold your clean clothes neatly. Tomorrow, we will ride an automobile to see the beautiful Banaue Rice Terraces.",
            audioUrl: "/audio/m3-l3-i5.mp3",
            options: [
              "clothes, automobile, beautiful",
              "cloths, otomobile, beatiful",
              "clothes, otomobile, beautiful"
            ],
            answer: "clothes, automobile, beautiful",
            feedbackCorrect:
              "👑 Masterpiece complete! clothes, automobile, and beautiful are all spelled right.",
            feedbackIncorrect: "💡 Look for clothes, automobile, and beautiful."
          }
        ]
      }
    ]
  }
];

export const WORD_BANK = {
  round1: [
    "act",
    "alone",
    "arm",
    "bank",
    "bleed",
    "blind",
    "blood",
    "broom",
    "bump",
    "burnt",
    "chain",
    "chalk",
    "cheek",
    "child",
    "fork"
  ],
  round2: [
    "bandage",
    "bathe",
    "begin",
    "begun",
    "blackboard",
    "body",
    "bow",
    "butterfly",
    "catch",
    "chance",
    "change",
    "chief",
    "church",
    "cocoa",
    "mirror"
  ],
  round3: [
    "although",
    "carefully",
    "determine",
    "difficult",
    "division",
    "electric",
    "entire",
    "equation",
    "experience",
    "factories",
    "guess",
    "impossible",
    "machine",
    "neither",
    "tomorrow"
  ]
};