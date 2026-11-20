// public/lesson.js

import { ateHabiVoice } from "./voice.js";

/**
 * Ate Habi Animated Lesson Guide Controller
 * Manages typewriter animation, speech sync, and visual aid rendering.
 * Speech is handled by voice.js (MP3 first, female browser TTS as fallback).
 */

export class AteHabiLesson {
  constructor(options = {}) {
    // Handle both parameter patterns: options object or elements object
    if (typeof options === "function") {
      this.onComplete = options;
      this.elements = {};
    } else {
      this.onComplete = options.onComplete || null;
      this.elements = options.elements || options;
    }

    // Default DOM elements binding if not explicitly passed
    this.elements = {
      panel: this.elements.panel || document.getElementById("lesson-panel"),
      missionPill: this.elements.missionPill || document.getElementById("lesson-mission-pill"),
      title: this.elements.title || document.getElementById("lesson-title"),
      sceneLabel: this.elements.sceneLabel || document.getElementById("lesson-scene-label"),
      stepCounter: this.elements.stepCounter || document.getElementById("lesson-step-counter"),
      speechText: this.elements.speechText || document.getElementById("speech-text"),
      visualAid: this.elements.visualAid || document.getElementById("lesson-visual-aid"),
      characterBtn: this.elements.characterBtn || document.getElementById("character-stage-btn"),
      backBtn: this.elements.backBtn || document.getElementById("lesson-back-btn"),
      nextBtn: this.elements.nextBtn || document.getElementById("lesson-next-btn"),
      skipBtn: this.elements.skipBtn || document.getElementById("skip-lesson-btn"),
      closeBtn: this.elements.closeBtn || document.getElementById("lesson-close-btn"),
      skipTypingBtn: this.elements.skipTypingBtn || document.getElementById("skip-typing-btn"),
      voiceToggleBtn: this.elements.voiceToggleBtn || document.getElementById("voice-toggle-btn"),
      svg: this.elements.svg || document.getElementById("ate-habi-svg")
    };

    this.currentMission = null;
    this.screens = [];
    this.currentIndex = 0;
    this.typewriterTimer = null;
    this.isVoiceEnabled = true;
    this.isSpeaking = false;

    // Voice interface used by app.js
    this.voice = {
      speak: (text, opts = {}) => this.speakText(text, opts),
      stop: () => this.stopSpeech(),
      setEnabled: (enabled) => {
        this.isVoiceEnabled = enabled;
        if (!enabled) this.stopSpeech();
      }
    };

    this.initEventListeners();
  }

  initEventListeners() {
    if (this.elements.characterBtn) {
      this.elements.characterBtn.addEventListener("click", () => this.replayCurrentLine());
    }
    if (this.elements.backBtn) {
      this.elements.backBtn.addEventListener("click", () => this.prevScreen());
    }
    if (this.elements.nextBtn) {
      this.elements.nextBtn.addEventListener("click", () => this.nextScreen());
    }
    if (this.elements.skipBtn) {
      this.elements.skipBtn.addEventListener("click", () => this.finishLesson());
    }
    // Close only hides the lesson and returns to the mission map (it does not start the level)
    if (this.elements.closeBtn) {
      this.elements.closeBtn.addEventListener("click", () => this.hide());
    }
    if (this.elements.skipTypingBtn) {
      this.elements.skipTypingBtn.addEventListener("click", () => this.skipTypewriter());
    }
    if (this.elements.voiceToggleBtn) {
      this.elements.voiceToggleBtn.addEventListener("click", () => this.toggleVoice());
    }
  }

  // Alias methods to satisfy app.js calls
  open(mission) {
    if (this.elements.panel) {
      this.elements.panel.classList.remove("hidden");
    }
    this.start(mission);
  }

  hide() {
    this.stopSpeech();
    this.clearTypewriter();
    if (this.elements.panel) {
      this.elements.panel.classList.add("hidden");
    }
  }

  start(mission) {
    this.currentMission = mission;
    this.screens = mission?.lesson?.screens || [];
    this.currentIndex = 0;

    if (this.elements.missionPill) {
      this.elements.missionPill.textContent = `MISSION ${mission.id}`;
    }
    if (this.elements.title) {
      this.elements.title.textContent = mission?.lesson?.title || "Animated Lesson";
    }

    this.renderScreen();
  }

  renderScreen() {
    this.stopSpeech();
    this.clearTypewriter();

    const screen = this.screens[this.currentIndex];
    if (!screen) return;

    if (this.elements.sceneLabel) {
      this.elements.sceneLabel.textContent = screen.label || `Scene ${this.currentIndex + 1}`;
    }
    if (this.elements.stepCounter) {
      this.elements.stepCounter.textContent = `${this.currentIndex + 1} / ${this.screens.length}`;
    }

    if (this.elements.backBtn) {
      this.elements.backBtn.disabled = this.currentIndex === 0;
    }
    if (this.elements.nextBtn) {
      this.elements.nextBtn.textContent =
        this.currentIndex === this.screens.length - 1 ? "Start Level" : "Next";
    }

    this.renderVisualAid(screen);

    // Start the voice right away. The mouth only moves when audio really starts
    // (see onStart in speakText), so it never opens before there is sound.
    this.speakText(screen.dictationText || screen.speech, { audioUrl: screen.audioUrl || null });
    this.startTypewriter(screen.speech);
  }

  startTypewriter(text, onComplete) {
    if (!this.elements.speechText) return;
    this.elements.speechText.textContent = "";
    let index = 0;

    this.typewriterTimer = setInterval(() => {
      if (index < text.length) {
        this.elements.speechText.textContent += text.charAt(index);
        index++;
      } else {
        this.clearTypewriter();
        if (onComplete) onComplete();
      }
    }, 24);
  }

  skipTypewriter() {
    const screen = this.screens[this.currentIndex];
    if (!screen) return;

    this.clearTypewriter();
    if (this.elements.speechText) {
      this.elements.speechText.textContent = screen.speech;
    }
  }

  clearTypewriter() {
    if (this.typewriterTimer) {
      clearInterval(this.typewriterTimer);
      this.typewriterTimer = null;
    }
  }

  /**
   * Speak through voice.js.
   * options: { audioUrl, rate, pitch, audioRate, onStart, onEnd }
   */
  speakText(text, options = {}) {
    if (!this.isVoiceEnabled) return;

    this.stopSpeech();

    ateHabiVoice.speak(text, {
      audioUrl: options.audioUrl || null,
      rate: options.rate || 0.95,
      pitch: options.pitch,
      audioRate: options.audioRate,
      onStart: () => {
        this.isSpeaking = true;
        this.setMouthSpeaking(true);
        if (options.onStart) options.onStart();
      },
      onEnd: () => {
        this.isSpeaking = false;
        this.setMouthSpeaking(false);
        if (options.onEnd) options.onEnd();
      }
    });
  }

  stopSpeech() {
    ateHabiVoice.stop();
    this.isSpeaking = false;
    this.setMouthSpeaking(false);
  }

  setMouthSpeaking(speaking) {
    const svgEl = this.elements.svg || document.getElementById("ate-habi-svg");
    if (!svgEl) return;

    if (speaking) {
      svgEl.classList.add("speaking");
    } else {
      svgEl.classList.remove("speaking");
    }
  }

  replayCurrentLine() {
    const screen = this.screens[this.currentIndex];
    if (!screen) return;
    this.renderScreen();
  }

  toggleVoice() {
    this.isVoiceEnabled = !this.isVoiceEnabled;
    if (this.elements.voiceToggleBtn) {
      this.elements.voiceToggleBtn.textContent = this.isVoiceEnabled
        ? "🔊 Voice: On"
        : "🔇 Voice: Off";
    }
    if (!this.isVoiceEnabled) {
      this.stopSpeech();
    }
  }

  prevScreen() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.renderScreen();
    }
  }

  nextScreen() {
    if (this.currentIndex < this.screens.length - 1) {
      this.currentIndex++;
      this.renderScreen();
    } else {
      this.finishLesson();
    }
  }

  finishLesson() {
    this.hide();
    if (typeof this.onComplete === "function") {
      this.onComplete(this.currentMission?.id);
    }
  }

  renderVisualAid(screen) {
    const box = this.elements.visualAid;
    if (!box) return;
    box.innerHTML = "";

    if (!screen.visualType) return;

    switch (screen.visualType) {
      case "keyPhrase": {
        const chip = document.createElement("div");
        chip.className = "phrase-chip unlocked";
        chip.style.fontSize = "1.1rem";
        chip.style.padding = "10px 18px";
        chip.textContent = `🔑 Key Phrase: ${screen.keyPhrase || ""}`;
        box.appendChild(chip);
        break;
      }

      case "syllables": {
        if (Array.isArray(screen.parts)) {
          screen.parts.forEach((part, idx) => {
            const chip = document.createElement("span");
            chip.className = `syllable-chip ${idx === screen.highlightIndex ? "lit" : ""}`;
            chip.textContent = part;
            box.appendChild(chip);
          });
        }
        break;
      }

      case "context": {
        const wrapper = document.createElement("div");
        wrapper.className = "highlight-word";
        wrapper.innerHTML = `${screen.before || ""}<strong style="color:var(--purple); text-decoration:underline;">${screen.filled || screen.blank || ""}</strong>${screen.after || ""}`;
        box.appendChild(wrapper);
        break;
      }

      case "tricky": {
        if (Array.isArray(screen.samples)) {
          screen.samples.forEach((sample) => {
            const chip = document.createElement("div");
            chip.className = "syllable-chip";
            chip.innerHTML = `${sample.word} (<span class="tricky-letter">${sample.mark}</span>)`;
            box.appendChild(chip);
          });
        }
        break;
      }

      case "checkWord": {
        const chip = document.createElement("div");
        chip.className = "syllable-chip lit";
        chip.style.fontSize = "1.2rem";
        chip.textContent = `🔍 ${screen.word || ""}`;
        box.appendChild(chip);
        break;
      }

      case "ready": {
        const chip = document.createElement("div");
        chip.className = "phrase-chip unlocked";
        chip.style.fontSize = "1.1rem";
        chip.textContent = "🧵 Ready to Weave!";
        box.appendChild(chip);
        break;
      }

      default:
        break;
    }
  }
}