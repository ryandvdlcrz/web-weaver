// public/lesson.js
import { AteHabiVoice } from "./voice.js";

export class AteHabiLesson {
  constructor({ onComplete }) {
    this.onComplete = onComplete;
    this.lessonData = null;
    this.missionId = 1;
    this.stepIndex = 0;
    this.voiceEnabled = true;
    this.typingTimer = null;
    this.isTyping = false;

    this.voice = new AteHabiVoice({ defaultRate: 0.92, defaultPitch: 1.08 });

    this.panel = document.getElementById("lesson-panel");
    this.missionPill = document.getElementById("lesson-mission-pill");
    this.titleEl = document.getElementById("lesson-title");
    this.sceneLabelEl = document.getElementById("lesson-scene-label");
    this.counterEl = document.getElementById("lesson-step-counter");
    this.speechEl = document.getElementById("speech-text");
    this.visualEl = document.getElementById("lesson-visual-aid");
    this.svgEl = document.getElementById("ate-habi-svg");

    this.backBtn = document.getElementById("lesson-back-btn");
    this.nextBtn = document.getElementById("lesson-next-btn");
    this.skipTypingBtn = document.getElementById("skip-typing-btn");
    this.skipLessonBtn = document.getElementById("skip-lesson-btn");
    this.voiceBtn = document.getElementById("voice-toggle-btn");
    this.charBtn = document.getElementById("character-stage-btn");

    this._bindEvents();
  }

  _bindEvents() {
    this.backBtn?.addEventListener("click", () => {
      if (this.stepIndex > 0) this.goToStep(this.stepIndex - 1);
    });

    this.nextBtn?.addEventListener("click", () => {
      if (!this.lessonData || !this.lessonData.screens) return;
      if (this.stepIndex < this.lessonData.screens.length - 1) {
        this.goToStep(this.stepIndex + 1);
      } else {
        this.stopSpeech();
        this.hide();
        if (typeof this.onComplete === "function") {
          this.onComplete(this.missionId);
        }
      }
    });

    this.skipTypingBtn?.addEventListener("click", () => this.finishTypingNow());
    this.skipLessonBtn?.addEventListener("click", () => {
      this.stopSpeech();
      this.hide();
      if (typeof this.onComplete === "function") {
        this.onComplete(this.missionId);
      }
    });

    this.voiceBtn?.addEventListener("click", () => {
      this.voiceEnabled = !this.voiceEnabled;
      if (this.voice) this.voice.setEnabled(this.voiceEnabled);
      if (this.voiceBtn) {
        this.voiceBtn.textContent = this.voiceEnabled ? "🔊 Voice: On" : "🔇 Voice: Off";
      }
      if (this.voiceEnabled && this.lessonData) {
        this._speakCurrentScreen();
      } else {
        this.stopSpeech();
      }
    });

    this.charBtn?.addEventListener("click", () => {
      this._speakCurrentScreen();
    });
  }

  _speakCurrentScreen(options = {}) {
    if (!this.lessonData || !this.voiceEnabled) return;
    const screens = this.lessonData.screens || [];
    const current = screens[this.stepIndex];
    if (!current) return;

    const textToSpeak = current.dictationText || current.speech;
    this.speak(textToSpeak, {
      isDictation: Boolean(current.dictationText),
      audioUrl: current.audioUrl || null,
      ...options
    });
  }

  open(mission) {
    if (!mission || !mission.lesson) return;
    this.missionId = mission.id;
    this.lessonData = mission.lesson;

    if (this.missionPill) this.missionPill.textContent = `MISSION ${mission.id}`;
    if (this.titleEl) this.titleEl.textContent = mission.lesson.title || "";
    if (this.panel) this.panel.classList.remove("hidden");
    this.goToStep(0);
  }

  hide() {
    this.stopSpeech();
    if (this.typingTimer) clearInterval(this.typingTimer);
    this.isTyping = false;
    if (this.panel) this.panel.classList.add("hidden");
  }

  goToStep(index) {
    if (this.typingTimer) clearInterval(this.typingTimer);
    this.stopSpeech();
    this.stepIndex = index;

    const screens = this.lessonData?.screens || [];
    const screen = screens[index];
    if (!screen) return;

    if (this.sceneLabelEl) this.sceneLabelEl.textContent = screen.label || "";
    if (this.counterEl) this.counterEl.textContent = `${index + 1} / ${screens.length}`;
    if (this.backBtn) this.backBtn.disabled = index === 0;
    if (this.nextBtn) {
      this.nextBtn.textContent = index === screens.length - 1 ? "Start Level 1" : "Next";
    }

    this._renderVisualAid(screen);
    this._typeText(screen.speech || "");
    this._speakCurrentScreen();
  }

  _typeText(fullText) {
    this.isTyping = true;
    if (this.speechEl) this.speechEl.textContent = "";
    if (this.skipTypingBtn) this.skipTypingBtn.classList.remove("hidden");

    let i = 0;
    this.typingTimer = setInterval(() => {
      if (this.speechEl) this.speechEl.textContent += fullText.charAt(i);
      i += 1;
      if (i >= fullText.length) {
        clearInterval(this.typingTimer);
        this.isTyping = false;
        if (this.skipTypingBtn) this.skipTypingBtn.classList.add("hidden");
      }
    }, 22);
  }

  finishTypingNow() {
    if (!this.lessonData || !this.isTyping) return;
    if (this.typingTimer) clearInterval(this.typingTimer);
    const screens = this.lessonData.screens || [];
    const screen = screens[this.stepIndex];
    if (screen && this.speechEl) {
      this.speechEl.textContent = screen.speech;
    }
    this.isTyping = false;
    if (this.skipTypingBtn) this.skipTypingBtn.classList.add("hidden");
  }

  speak(text, options = {}) {
    if (!this.voiceEnabled || !this.voice) return;
    this.voice.speak(text, {
      isDictation: false,
      ...options,
      onStart: () => {
        if (this.svgEl) this.svgEl.classList.add("speaking");
        if (typeof options.onStart === "function") options.onStart();
      },
      onEnd: () => {
        if (this.svgEl) this.svgEl.classList.remove("speaking");
        if (typeof options.onEnd === "function") options.onEnd();
      },
      onError: (err) => {
        if (this.svgEl) this.svgEl.classList.remove("speaking");
        if (typeof options.onError === "function") options.onError(err);
      }
    });
  }

  stopSpeech() {
    if (this.voice) this.voice.stop();
    if (this.svgEl) this.svgEl.classList.remove("speaking");
  }

  _renderVisualAid(screen) {
    if (!this.visualEl) return;
    this.visualEl.innerHTML = "";

    if (screen.visualType === "keyPhrase") {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "badge-pill badge-mastered";
      btn.style.cursor = "pointer";
      btn.textContent = `🔑 Key Phrase: ${screen.keyPhrase} (Tap to hear)`;
      btn.addEventListener("click", () => {
        this.speak(screen.keyPhrase, { isDictation: true, rate: 0.85 });
      });
      this.visualEl.appendChild(btn);
      return;
    }

    if (screen.visualType === "syllables") {
      const parts = Array.isArray(screen.parts) ? screen.parts : [];
      const fullWord = screen.word || parts.join("");

      parts.forEach((part, idx) => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "syllable-chip" + (idx === screen.highlightIndex ? " lit" : "");
        chip.style.cursor = "pointer";
        chip.textContent = part;
        chip.title = `Tap to hear syllable "${part}"`;
        chip.addEventListener("click", () => {
          this.speak(part, { isDictation: true, rate: 0.76 });
        });
        this.visualEl.appendChild(chip);
      });

      if (fullWord) {
        const sayWordBtn = document.createElement("button");
        sayWordBtn.type = "button";
        sayWordBtn.className = "btn btn-ghost btn-sm";
        sayWordBtn.textContent = `🔊 Say "${fullWord}"`;
        sayWordBtn.addEventListener("click", () => {
          this.speak(fullWord, { isDictation: true, rate: 0.84 });
        });
        this.visualEl.appendChild(sayWordBtn);
      }
      return;
    }

    if (screen.visualType === "context") {
      const fullSentence =
        screen.dictationText || `${screen.before || ""}${screen.filled || ""}${screen.after || ""}`;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "highlight-word";
      btn.style.background = "transparent";
      btn.style.border = "none";
      btn.style.cursor = "pointer";
      btn.style.textAlign = "left";
      btn.title = "Tap to hear sentence";
      btn.innerHTML = `${screen.before || ""}<span class="tricky-letter">${screen.filled || ""}</span>${screen.after || ""} 🔊`;
      btn.addEventListener("click", () => {
        this.speak(fullSentence, { isDictation: true, rate: 0.82 });
      });
      this.visualEl.appendChild(btn);
      return;
    }

    if (screen.visualType === "tricky") {
      (screen.samples || []).forEach((s) => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "syllable-chip";
        chip.style.cursor = "pointer";
        chip.innerHTML = `${s.word} <span class="tricky-letter">(${s.mark})</span>`;
        chip.title = `Tap to hear "${s.word}"`;
        chip.addEventListener("click", () => {
          this.speak(s.word, { isDictation: true, rate: 0.82 });
        });
        this.visualEl.appendChild(chip);
      });
      return;
    }

    if (screen.visualType === "checkWord") {
      const word = screen.word || "";
      word.split("").forEach((ch) => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "syllable-chip lit";
        chip.style.cursor = "pointer";
        chip.textContent = ch;
        chip.title = `Tap to hear letter "${ch}"`;
        chip.addEventListener("click", () => {
          this.speak(ch, { isDictation: true, rate: 0.78 });
        });
        this.visualEl.appendChild(chip);
      });

      if (word) {
        const sayWordBtn = document.createElement("button");
        sayWordBtn.type = "button";
        sayWordBtn.className = "btn btn-ghost btn-sm";
        sayWordBtn.textContent = `🔊 Say "${word}"`;
        sayWordBtn.addEventListener("click", () => {
          this.speak(word, { isDictation: true, rate: 0.84 });
        });
        this.visualEl.appendChild(sayWordBtn);
      }
      return;
    }

    this.visualEl.innerHTML = `<span class="badge-pill badge-passed">🪡 Ready for Level 1!</span>`;
  }
}