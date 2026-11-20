// public/voice.js

const FILIPINO_PRONUNCIATION_MAP = {
  baguio: "BAHG-yoh",
  merienda: "mer-YEN-dah",
  pechay: "PEH-chai",
  pampanga: "Pam-PANG-gah",
  banaue: "Bah-NAH-weh",
  davao: "DAH-vow",
  jeepney: "JEEP-nee",
  banig: "BAH-nig",
  inabel: "ee-nah-BEL",
  cacao: "kah-KOW",
  negros: "NEG-rohs",
  occidental: "ok-see-den-TAHL",
  juan: "Hwahn",
  maria: "mah-REE-ah",
  carlo: "KAR-loh",
  maya: "MAH-yah"
};

const PREFERRED_FEMALE_HINTS = [
  "female",
  "aria",
  "ava",
  "clara",
  "emma",
  "hazel",
  "jenny",
  "michelle",
  "olivia",
  "rosa",
  "samantha",
  "sonia",
  "sofia",
  "victoria",
  "zara"
];

function matchCase(source, replacement) {
  if (!source) return replacement;
  if (source === source.toUpperCase()) return replacement.toUpperCase();
  if (source[0] === source[0].toUpperCase()) {
    return replacement.charAt(0).toUpperCase() + replacement.slice(1);
  }
  return replacement.toLowerCase();
}

export function prepareDictationSpeech(rawText = "") {
  let text = String(rawText)
    .replace(/_{2,}/g, " blank ")
    .replace(/\s+/g, " ")
    .trim();

  for (const [word, phonetic] of Object.entries(FILIPINO_PRONUNCIATION_MAP)) {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    text = text.replace(regex, (matched) => matchCase(matched, phonetic));
  }

  return text;
}

export class AteHabiVoice {
  constructor({ defaultRate = 0.92, defaultPitch = 1.08 } = {}) {
    this.enabled = true;
    this.defaultRate = defaultRate;
    this.defaultPitch = defaultPitch;
    this.voices = [];
    this.selectedVoice = null;
    this.activeAudio = null;

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this._loadVoices();
      window.speechSynthesis.addEventListener("voiceschanged", () => {
        this._loadVoices();
      });
    }
  }

  _loadVoices() {
    if (!("speechSynthesis" in window)) return;
    this.voices = window.speechSynthesis.getVoices() || [];
    this.selectedVoice = this._pickFemaleVoice(this.voices);
  }

  _pickFemaleVoice(voices) {
    if (!voices.length) return null;

    // Filter out known male voice identifiers completely to prevent male system defaults
    const nonMaleVoices = voices.filter((v) =>
      !/\b(male|david|mark|guy|george|daniel|arthur|paul|james|steven)\b/i.test(v.name || "")
    );

    const candidates = nonMaleVoices.length > 0 ? nonMaleVoices : voices;

    const scoreVoice = (v) => {
      const name = (v.name || "").toLowerCase();
      const lang = (v.lang || "").toLowerCase();
      let score = 0;

      if (lang.startsWith("en-ph") || lang.startsWith("fil") || lang.startsWith("tl")) {
        score += 40;
      } else if (lang.startsWith("en")) {
        score += 20;
      }

      if (PREFERRED_FEMALE_HINTS.some((hint) => name.includes(hint))) {
        score += 50;
      }
      if (v.localService) {
        score += 5;
      }

      return score;
    };

    return [...candidates].sort((a, b) => scoreVoice(b) - scoreVoice(a))[0] || null;
  }

  setEnabled(enabled) {
    this.enabled = Boolean(enabled);
    if (!this.enabled) this.stop();
  }

  stop() {
    if (this.activeAudio) {
      this.activeAudio.pause();
      this.activeAudio.currentTime = 0;
      this.activeAudio = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        window.speechSynthesis.cancel();
      }
    }
  }

  speak(
    text,
    {
      rate,
      pitch,
      isDictation = false,
      audioUrl = null,
      onStart,
      onEnd,
      onError
    } = {}
  ) {
    if (!this.enabled) {
      if (onEnd) onEnd();
      return false;
    }

    this.stop();

    if (audioUrl) {
      const audio = new Audio(audioUrl);
      this.activeAudio = audio;
      audio.playbackRate = rate ?? (isDictation ? 0.84 : 1.0);

      let fellBack = false;
      const fallBack = () => {
        if (fellBack || this.activeAudio !== audio) return;
        fellBack = true;
        this.activeAudio = null;
        if (text) {
          this.speak(text, {
            rate,
            pitch,
            isDictation,
            audioUrl: null,
            onStart,
            onEnd,
            onError
          });
        } else {
          if (onError) onError(new Error("Audio playback failed"));
          if (onEnd) onEnd();
        }
      };

      audio.onplay = () => {
        if (onStart) onStart();
      };
      audio.onended = () => {
        this.activeAudio = null;
        if (onEnd) onEnd();
      };
      audio.onerror = fallBack;
      audio.play().catch(fallBack);
      return true;
    }

    if (!text) {
      if (onEnd) onEnd();
      return false;
    }

    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      if (onError) onError(new Error("Speech synthesis not supported"));
      if (onEnd) onEnd();
      return false;
    }

    if (!this.voices.length) {
      this._loadVoices();
    }
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    const spokenText = prepareDictationSpeech(text);
    const utterance = new SpeechSynthesisUtterance(spokenText);

    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
      utterance.lang = this.selectedVoice.lang;
    } else {
      utterance.lang = "en-PH";
    }

    utterance.rate = rate ?? (isDictation ? 0.82 : this.defaultRate);
    utterance.pitch = pitch ?? this.defaultPitch;

    utterance.onstart = () => {
      if (onStart) onStart();
    };
    utterance.onend = () => {
      if (onEnd) onEnd();
    };
    utterance.onerror = (err) => {
      if (onError) onError(err);
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
    return true;
  }
}