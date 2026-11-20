// public/voice.js

const FEMALE_HINTS = [
  "blessica", "rosa", "maria", "zira", "hazel", "susan", "catherine",
  "samantha", "victoria", "karen", "fiona", "jenny", "aria", "michelle",
  "sonia", "libby", "natasha", "clara", "emma", "ava", "allison", "tessa",
  "moira", "female", "woman"
];

const MALE_REGEX = new RegExp(
  "\\b(male|david|mark|guy|george|daniel|arthur|paul|james|steven|angelo|alex|" +
    "fred|tom|aaron|oliver|ralph|rishi|evan|gordon|ryan|christopher|eric|brian|" +
    "roger|thomas|ravi|sean|liam|william|jorge|diego)\\b",
  "i"
);

class AteHabiVoiceController {
  constructor() {
    this.currentAudio = null;
    this.synth =
      typeof window !== "undefined" && window.speechSynthesis ? window.speechSynthesis : null;
    this.selectedVoice = null;
    this.isMuted = false;
    this.token = 0; // bumps on every stop/speak so stale callbacks are ignored

    this.initSpeechSynthesis();
  }

  initSpeechSynthesis() {
    if (!this.synth) return;

    const loadVoices = () => {
      const voices = this.synth.getVoices();
      if (voices.length > 0) {
        this.selectedVoice = this._pickFemaleVoice(voices);
      }
    };

    loadVoices();
    this.synth.onvoiceschanged = loadVoices;
  }

  _scoreVoice(v) {
    const name = (v.name || "").toLowerCase();
    const lang = (v.lang || "").toLowerCase().replace("_", "-");
    let score = 0;

    if (MALE_REGEX.test(name)) score -= 500;
    if (FEMALE_HINTS.some((hint) => name.includes(hint))) score += 150;

    if (lang.startsWith("en-ph") || lang.startsWith("fil") || lang.startsWith("tl")) {
      score += 100;
    } else if (lang.startsWith("en")) {
      score += 30;
    } else {
      score -= 50; // avoid non-English voices reading English spelling words
    }

    // Chrome's default "Google US English" is a female voice but has no gender in its name
    if (name.includes("google us english") || name.includes("google uk english female")) {
      score += 60;
    }
    if (name.includes("natural") || name.includes("online")) score += 20;
    if (v.localService) score += 5;

    return score;
  }

  _pickFemaleVoice(voices) {
    if (!voices || !voices.length) return null;
    return [...voices].sort((a, b) => this._scoreVoice(b) - this._scoreVoice(a))[0] || null;
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
   * options: { audioUrl, rate, pitch, audioRate, onStart, onEnd }
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

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = this.selectedVoice || this._pickFemaleVoice(this.synth.getVoices());
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    }

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