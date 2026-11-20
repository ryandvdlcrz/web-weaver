// public/voice.js

const FEMALE_HINTS = [
  "blessica", "zira", "hazel", "susan", "catherine",
  "samantha", "victoria", "karen", "fiona", "jenny", "aria", "michelle",
  "sonia", "libby", "natasha", "clara", "emma", "ava", "allison", "tessa",
  "moira", "female", "woman"
  // "maria" and "rosa" removed — they commonly match Filipino/Spanish voices
  // and were boosting non-English voices for English text.
];

const MALE_REGEX = new RegExp(
  "\\b(male|david|mark|guy|george|daniel|arthur|paul|james|steven|angelo|alex|" +
    "fred|tom|aaron|oliver|ralph|rishi|evan|gordon|ryan|christopher|eric|brian|" +
    "roger|thomas|ravi|sean|liam|william|jorge|diego)\\b",
  "i"
);

// Default language Ate Habi speaks when the caller doesn't specify one.
// "en-US" is the safest fallback. Use "en-PH" or "en-GB" if you prefer.
const DEFAULT_LANG = "en-US";

function normalizeLang(lang) {
  return (lang || "").toLowerCase().replace("_", "-");
}

function baseLang(lang) {
  return normalizeLang(lang).split("-")[0];
}

class AteHabiVoiceController {
  constructor() {
    this.currentAudio = null;
    this.synth =
      typeof window !== "undefined" && window.speechSynthesis ? window.speechSynthesis : null;
    this.selectedVoice = null;        // kept for backwards compat (English pick)
    this.isMuted = false;
    this.token = 0;                   // bumps on every stop/speak so stale callbacks are ignored

    this.initSpeechSynthesis();
  }

  initSpeechSynthesis() {
    if (!this.synth) return;

    const loadVoices = () => {
      const voices = this.synth.getVoices();
      if (voices.length > 0) {
        // Keep selectedVoice as the "default English voice" for legacy callers.
        this.selectedVoice = this._pickVoiceForLang(DEFAULT_LANG, voices);
      }
    };

    loadVoices();
    this.synth.onvoiceschanged = loadVoices;

    // Android sometimes fires onvoiceschanged late; poll once as a safety net.
    if (typeof setTimeout === "function") {
      setTimeout(loadVoices, 500);
    }
  }

  /**
   * Score a voice against the language we actually want to speak.
   * Higher = better match. Negative = clearly wrong language.
   */
  _scoreVoice(v, targetLang = DEFAULT_LANG) {
    const name = (v.name || "").toLowerCase();
    const lang = normalizeLang(v.lang);
    const target = normalizeLang(targetLang);
    const targetBase = baseLang(target);
    let score = 0;

    if (MALE_REGEX.test(name)) score -= 500;
    if (FEMALE_HINTS.some((hint) => name.includes(hint))) score += 150;

    // Language match — this is what decides the SPOKEN LANGUAGE.
    if (lang === target) {
      score += 100;                                   // exact locale match
    } else if (baseLang(lang) === targetBase) {
      score += 80;                                    // same language, other region
    } else if (targetBase === "en" && lang.startsWith("en-ph")) {
      score += 60;                                    // PH English is fine for English
    } else if (lang.startsWith("en") || lang.startsWith("fil") || lang.startsWith("tl")) {
      score += 10;                                    // English/Filipino family, weak match
    } else {
      score -= 100;                                   // unrelated language
    }

    // Extra heuristics for nicer / more reliable voices.
    if (name.includes("google us english") || name.includes("google uk english female")) {
      score += 60;
    }
    if (name.includes("natural") || name.includes("online")) score += 20;
    if (v.localService) score += 5;

    return score;
  }

  /**
   * Pick the best voice for a target language.
   * Returns null if no acceptable voice exists — callers should still set
   * utterance.lang so the system falls back to the right language.
   */
  _pickVoiceForLang(targetLang = DEFAULT_LANG, voicesArg = null) {
    const voices = voicesArg || (this.synth ? this.synth.getVoices() : []);
    if (!voices || !voices.length) return null;

    const ranked = [...voices].sort(
      (a, b) => this._scoreVoice(b, targetLang) - this._scoreVoice(a, targetLang)
    );
    const best = ranked[0];
    return best && this._scoreVoice(best, targetLang) >= 0 ? best : null;
  }

  // Backwards-compatible name used elsewhere in the app.
  _pickFemaleVoice(voices) {
    return this._pickVoiceForLang(DEFAULT_LANG, voices);
  }

  stop() {
    this.token += 1;

    if (this.currentAudio) {
      const a = this.currentAudio;
      this.currentAudio = null;
      a.onplaying = null;
      a.onended = null;
      a.onerror = null;
      a.pause();
    }

    if (this.synth) this.synth.cancel();
  }

  /**
   * speak(text, options)
   * options: { audioUrl, rate, pitch, audioRate, lang, onStart, onEnd }
   * Also still accepts the old form: speak(text, "audio/file.mp3", onEndCallback)
   */
  speak(text, options = null, legacyOnEnd = null) {
    let opts = {};
    if (typeof options === "string") opts = { audioUrl: options };
    else if (typeof options === "function") opts = { onEnd: options };
    else if (options && typeof options === "object") opts = { ...options };
    if (legacyOnEnd && !opts.onEnd) opts.onEnd = legacyOnEnd;

    if (this.isMuted) {
      if (opts.onEnd) opts.onEnd();
      return;
    }

    this.stop();
    const myToken = this.token;
    const alive = () => myToken === this.token;

    if (opts.audioUrl) {
      const isAbsolute = /^(https?:)?\/\//.test(opts.audioUrl) || opts.audioUrl.startsWith("/");
      const url = isAbsolute ? opts.audioUrl : `/${opts.audioUrl}`;

      const audio = new Audio(url);
      audio.playbackRate = opts.audioRate || 1;
      this.currentAudio = audio;

      let fellBack = false;
      const fallback = (reason) => {
        if (fellBack || !alive()) return;
        fellBack = true;
        console.warn(`[Audio] Could not play "${url}". Falling back to browser TTS.`, reason);
        if (this.currentAudio === audio) this.currentAudio = null;
        this._speakWithTts(text, opts, myToken);
      };

      audio.onplaying = () => {
        if (alive() && opts.onStart) opts.onStart();
      };
      audio.onended = () => {
        if (!alive()) return;
        this.currentAudio = null;
        if (opts.onEnd) opts.onEnd();
      };
      audio.onerror = () => fallback(audio.error);

      audio.play().catch((err) => {
        if (err && err.name === "AbortError") return; // we paused it ourselves
        fallback(err);
      });
      return;
    }

    this._speakWithTts(text, opts, myToken);
  }

  _speakWithTts(text, opts, token) {
    if (token !== this.token) return;
    if (!this.synth || !text) {
      if (opts.onEnd) opts.onEnd();
      return;
    }

    const targetLang = opts.lang || DEFAULT_LANG;
    const targetBase = baseLang(targetLang);

    // Pick the voice that matches the language of THIS utterance.
    const voice = this._pickVoiceForLang(targetLang);

    const utterance = new SpeechSynthesisUtterance(text);

    if (voice) {
      utterance.voice = voice;
    }

    // ---- THE ANDROID FIX ----
    // Android Chrome frequently ignores `utterance.voice` and picks the system
    // default TTS language. `utterance.lang` is the only reliably honored knob,
    // so always set it explicitly to the target language.
    if (voice) {
      const voiceLang = normalizeLang(voice.lang);
      utterance.lang = baseLang(voiceLang) === targetBase ? voiceLang : targetLang;
    } else {
      utterance.lang = targetLang;
    }
    // -------------------------

    utterance.rate = opts.rate || 0.95;
    utterance.pitch = opts.pitch || 1.1;

    utterance.onstart = () => {
      if (token === this.token && opts.onStart) opts.onStart();
    };
    utterance.onend = () => {
      if (token === this.token && opts.onEnd) opts.onEnd();
    };
    utterance.onerror = (e) => {
      if (token !== this.token) return;
      if (e.error === "canceled" || e.error === "interrupted") return;
      console.error("[TTS Error]:", e);
      if (opts.onEnd) opts.onEnd();
    };

    this.synth.speak(utterance);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) this.stop();
    return this.isMuted;
  }
}

export const ateHabiVoice = new AteHabiVoiceController();