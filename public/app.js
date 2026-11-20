// public/app.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  addDoc,
  getDocs,
  collection,
  query,
  where,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";
import { MISSIONS, RANKS, WORD_BANK } from "./data.js";
import { AteHabiLesson } from "./lesson.js";

const SESSION_KEY = "ww_student_session_v1";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const state = {
  uid: null,
  username: "",
  name: "",
  sectionName: "",
  classCode: "",
  selectedMissionId: 1,
  attemptsByKey: {},
  activeLevel: null,
  itemIndex: 0,
  score: 0,
  itemAnswered: false,
  levelStartMs: 0,
  itemStartMs: 0,
  responseTimesSec: [],
  attemptNumber: 1,
  pickedTiles: [],
  selectedCardId: null,
  sortedBins: {},
  selectedLeft: null,
  matchedPairs: {}
};

const loginView = document.getElementById("login-view");
const appView = document.getElementById("app-view");
const loginForm = document.getElementById("student-login-form");
const usernameInput = document.getElementById("username-input");
const sectionNameInput = document.getElementById("section-name-input");
const loginStatus = document.getElementById("login-status");
const switchStudentBtn = document.getElementById("btn-switch-student");

const greetingEl = document.getElementById("student-greeting");
const sectionDisplayEl = document.getElementById("student-section-display");
const rankLabelEl = document.getElementById("student-rank-label");
const keyPhrasesBar = document.getElementById("key-phrases-bar");

const missionTabsEl = document.getElementById("mission-tabs");
const levelGridEl = document.getElementById("level-grid");

const gameplayPanel = document.getElementById("gameplay-panel");
const playLevelPill = document.getElementById("play-level-pill");
const playLevelTitle = document.getElementById("play-level-title");
const hudItemEl = document.getElementById("hud-item");
const hudScoreEl = document.getElementById("hud-score");
const progressThreadsEl = document.getElementById("progress-threads");
const questionStageEl = document.getElementById("question-stage");
const itemFeedbackEl = document.getElementById("item-feedback");
const itemFeedbackMsg = document.getElementById("item-feedback-msg");
const nextItemBtn = document.getElementById("next-item-btn");

const resultPanel = document.getElementById("result-panel");
const resultStatusBadge = document.getElementById("result-status-badge");
const resultHeadline = document.getElementById("result-headline");
const resultMessage = document.getElementById("result-message");
const missionUnlockBanner = document.getElementById("mission-unlock-banner");
const statScoreEl = document.getElementById("stat-score");
const statAccuracyEl = document.getElementById("stat-accuracy");
const statAttemptEl = document.getElementById("stat-attempt");
const statTimeEl = document.getElementById("stat-time");
const saveStatusEl = document.getElementById("save-status");
const retryLevelBtn = document.getElementById("retry-level-btn");
const nextLevelBtn = document.getElementById("next-level-btn");
const backToMapBtn = document.getElementById("back-to-map-btn");

const wordBankPanel = document.getElementById("word-bank-panel");
const toggleBankBtn = document.getElementById("toggle-bank-btn");

const lessonController = new AteHabiLesson({
  onComplete: (missionId) => {
    startLevel(missionId || state.selectedMissionId, 1, 1);
  }
});

const voice = lessonController.voice;
let slowDictation = false;

function speakQuestionItem(item, { slow = slowDictation } = {}) {
  if (!voice) return;
  const textToSpeak = item.audioText || item.prompt;
  voice.speak(textToSpeak, {
    isDictation: true,
    rate: slow ? 0.74 : 0.86,
    audioUrl: item.audioUrl || null
  });
}

async function findRosterAccount(rawUsername, rawSectionName) {
  const normalizedUsername = rawUsername.trim().toLowerCase();
  const normalizedSection = rawSectionName.trim().toLowerCase();

  const directSnap = await getDoc(doc(db, "roster", normalizedUsername));
  if (directSnap.exists()) {
    const data = directSnap.data();
    const recordSection = String(data.sectionName || data.classCode || "").trim().toLowerCase();
    if (data.active !== false && recordSection === normalizedSection) {
      return {
        username: String(data.username || data.studentCode || directSnap.id).trim().toLowerCase(),
        name: String(data.name || "").trim(),
        sectionName: String(data.sectionName || data.classCode || rawSectionName).trim()
      };
    }
  }

  const q = query(collection(db, "roster"), where("username", "==", normalizedUsername));
  const snap = await getDocs(q);
  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    const recordSection = String(data.sectionName || data.classCode || "").trim().toLowerCase();
    if (data.active !== false && recordSection === normalizedSection) {
      return {
        username: String(data.username || data.studentCode || docSnap.id).trim().toLowerCase(),
        name: String(data.name || "").trim(),
        sectionName: String(data.sectionName || data.classCode || rawSectionName).trim()
      };
    }
  }

  return null;
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const enteredUsername = usernameInput.value.trim().toLowerCase();
  const enteredSection = sectionNameInput.value.trim();
  if (!enteredUsername || !enteredSection) return;

  loginStatus.textContent = "Checking your student account...";

  try {
    let credUser = auth.currentUser;
    if (!credUser) {
      const cred = await signInAnonymously(auth);
      credUser = cred.user;
    }

    const rosterAccount = await findRosterAccount(enteredUsername, enteredSection);

    if (!rosterAccount) {
      loginStatus.textContent =
        "Username or section name not found in the class roster. Please ask your teacher.";
      return;
    }

    state.uid = credUser.uid;
    state.username = rosterAccount.username;
    state.name = rosterAccount.name || rosterAccount.username;
    state.sectionName = rosterAccount.sectionName;
    state.classCode = rosterAccount.sectionName;

    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        username: state.username,
        name: state.name,
        sectionName: state.sectionName
      })
    );

    await setDoc(
      doc(db, "students", state.username.toLowerCase()),
      {
        uid: state.uid,
        username: state.username,
        name: state.name,
        sectionName: state.sectionName,
        classCode: state.classCode,
        lastActive: serverTimestamp()
      },
      { merge: true }
    );

    loginStatus.textContent = "";
    await showAppView();
  } catch (err) {
    console.error(err);
    loginStatus.textContent = "Could not sign in. Check your Firebase config and connection.";
  }
});

switchStudentBtn.addEventListener("click", async () => {
  if (voice) voice.stop();
  lessonController.hide();
  gameplayPanel.classList.add("hidden");
  resultPanel.classList.add("hidden");
  wordBankPanel.classList.add("hidden");

  sessionStorage.removeItem(SESSION_KEY);
  state.uid = null;
  state.username = "";
  state.name = "";
  state.sectionName = "";
  state.classCode = "";
  state.attemptsByKey = {};

  usernameInput.value = "";
  sectionNameInput.value = "";
  loginStatus.textContent = "";

  await signOut(auth).catch(() => {});

  appView.classList.add("hidden");
  switchStudentBtn.classList.add("hidden");
  loginView.classList.remove("hidden");
});

toggleBankBtn.addEventListener("click", () => {
  wordBankPanel.classList.toggle("hidden");
});

nextItemBtn.addEventListener("click", () => {
  if (voice) voice.stop();
  if (state.itemIndex < state.activeLevel.items.length - 1) {
    state.itemIndex += 1;
    renderQuestion();
  } else {
    finishLevel();
  }
});

retryLevelBtn.addEventListener("click", () => {
  if (voice) voice.stop();
  const nextAttempt = state.attemptNumber + 1;
  startLevel(state.selectedMissionId, state.activeLevel.level, nextAttempt);
});

nextLevelBtn.addEventListener("click", () => {
  if (voice) voice.stop();
  const mission = MISSIONS.find((m) => m.id === state.selectedMissionId);
  const hasNextLevel = mission.levels.some((l) => l.level === state.activeLevel.level + 1);
  if (hasNextLevel) {
    startLevel(state.selectedMissionId, state.activeLevel.level + 1, 1);
  } else {
    const nextMission = MISSIONS.find((m) => m.id === state.selectedMissionId + 1);
    if (nextMission) {
      state.selectedMissionId = nextMission.id;
      resultPanel.classList.add("hidden");
      renderMissionMap();
      lessonController.open(nextMission);
    }
  }
});

backToMapBtn.addEventListener("click", () => {
  if (voice) voice.stop();
  resultPanel.classList.add("hidden");
  renderMissionMap();
});

async function loadMyAttempts() {
  state.attemptsByKey = {};
  const curUsername = (state.username || "").trim().toLowerCase();
  const curName = (state.name || "").trim().toLowerCase();

  if (!curUsername && !curName && !state.uid) return;

  try {
    let docsList = [];

    if (curUsername) {
      const qUser = query(collection(db, "attempts"), where("username", "==", curUsername));
      const snapUser = await getDocs(qUser);
      snapUser.forEach((d) => docsList.push(d.data()));
    }

    const curSection = state.sectionName || state.classCode;
    if (curSection && docsList.length === 0) {
      const qClass = query(collection(db, "attempts"), where("classCode", "==", curSection));
      const snapClass = await getDocs(qClass);
      snapClass.forEach((d) => docsList.push(d.data()));
    }

    const seenDocKeys = new Set();

    docsList.forEach((data) => {
      const recUsername = String(data.username || data.studentCode || "").trim().toLowerCase();
      const recName = String(data.name || "").trim().toLowerCase();

      const isMatch =
        (curUsername && recUsername === curUsername) ||
        (curName && recName === curName) ||
        (state.uid && data.uid === state.uid);

      if (isMatch) {
        const docIdKey = `${data.mission}-${data.level}-${data.attempt}-${data.score}`;
        if (seenDocKeys.has(docIdKey)) return;
        seenDocKeys.add(docIdKey);

        const key = `${data.mission}-${data.level}`;
        if (!state.attemptsByKey[key]) state.attemptsByKey[key] = [];
        state.attemptsByKey[key].push(data);
      }
    });
  } catch (err) {
    console.error("Error loading attempts:", err);
  }
}

function getBestScore(missionId, level) {
  const list = state.attemptsByKey[`${missionId}-${level}`] || [];
  if (!list.length) return null;
  return Math.max(...list.map((a) => a.score));
}

function isLevelPassed(missionId, level) {
  const best = getBestScore(missionId, level);
  return best !== null && best >= 3;
}

function isLevelUnlocked(missionId, level) {
  if (missionId > 1) {
    const prevMission = MISSIONS.find((m) => m.id === missionId - 1);
    if (prevMission && !isMissionCompleted(prevMission)) return false;
  }
  if (level === 1) return true;
  return isLevelPassed(missionId, level - 1);
}

function isMissionCompleted(mission) {
  return mission.levels.every((lvl) => isLevelPassed(mission.id, lvl.level));
}

function getStatusLabel(score) {
  if (score === 5) return "Mastered";
  if (score >= 3) return "Passed";
  return "Needs review";
}

function renderWordBank() {
  const fillList = (id, words) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = "";
    words.forEach((w) => {
      const li = document.createElement("li");
      li.textContent = w;
      el.appendChild(li);
    });
  };
  fillList("bank-r1", WORD_BANK.round1);
  fillList("bank-r2", WORD_BANK.round2);
  fillList("bank-r3", WORD_BANK.round3);
}

async function showAppView() {
  loginView.classList.add("hidden");
  appView.classList.remove("hidden");
  switchStudentBtn.classList.remove("hidden");

  greetingEl.textContent = `Hello, ${state.name || state.username}!`;
  sectionDisplayEl.textContent = state.sectionName || state.classCode;

  await loadMyAttempts();
  renderWordBank();
  renderRankAndBadges();
  renderMissionMap();
}

function renderRankAndBadges() {
  const completedCount = MISSIONS.filter(isMissionCompleted).length;
  let currentRank = RANKS[0].title;
  for (const r of RANKS) {
    if (completedCount >= r.minMissions) currentRank = r.title;
  }
  rankLabelEl.textContent = currentRank;

  keyPhrasesBar.innerHTML = "";
  MISSIONS.forEach((m) => {
    const done = isMissionCompleted(m);
    const chip = document.createElement("span");
    chip.className = `phrase-chip ${done ? "unlocked" : "locked"}`;
    chip.textContent = done ? `🔑 ${m.keyPhrase}` : `🔒 ${m.badge}`;
    keyPhrasesBar.appendChild(chip);
  });
}

function renderMissionMap() {
  missionTabsEl.innerHTML = "";
  MISSIONS.forEach((m) => {
    const tab = document.createElement("button");
    tab.type = "button";
    const isActive = m.id === state.selectedMissionId;
    const prevDone = m.id === 1 || isMissionCompleted(MISSIONS[m.id - 2]);
    tab.className = `mission-tab ${isActive ? "active" : ""} ${!prevDone ? "locked" : ""}`;
    tab.innerHTML = `<strong>${!prevDone ? "🔒 " : ""}${m.title}</strong><span class="m-sub">${m.subtitle}</span>`;
    tab.addEventListener("click", () => {
      if (voice) voice.stop();
      state.selectedMissionId = m.id;
      lessonController.hide();
      gameplayPanel.classList.add("hidden");
      resultPanel.classList.add("hidden");
      renderMissionMap();
    });
    missionTabsEl.appendChild(tab);
  });

  const mission = MISSIONS.find((m) => m.id === state.selectedMissionId) || MISSIONS[0];
  levelGridEl.innerHTML = "";

  mission.levels.forEach((lvl) => {
    const unlocked = isLevelUnlocked(mission.id, lvl.level);
    const best = getBestScore(mission.id, lvl.level);
    const passed = best !== null && best >= 3;

    const card = document.createElement("div");
    card.className = `level-card ${!unlocked ? "locked" : passed ? "passed" : ""}`;

    let badgeHtml = `<span class="badge-pill badge-locked">Locked</span>`;
    if (unlocked && best === null) {
      badgeHtml = `<span class="badge-pill badge-passed">Ready</span>`;
    } else if (best !== null) {
      const label = getStatusLabel(best);
      const cls = best === 5 ? "badge-mastered" : best >= 3 ? "badge-passed" : "badge-review";
      badgeHtml = `<span class="badge-pill ${cls}">${label} (${best}/5)</span>`;
    }

    const showLessonBtn = lvl.level === 1 && unlocked;

    card.innerHTML = `
      <div>
        <div class="level-card-top">
          <strong>Level ${lvl.level}</strong>
          ${badgeHtml}
        </div>
        <p class="muted" style="margin-top:6px;">${lvl.title}</p>
      </div>
      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        <button type="button" class="btn btn-primary btn-sm" ${!unlocked ? "disabled" : ""} data-play-level="${lvl.level}">
          ${best !== null ? "Play Again" : "Start Level"}
        </button>
        ${showLessonBtn ? `<button type="button" class="btn btn-ghost btn-sm" data-open-lesson="${mission.id}">Ate Habi Lesson</button>` : ""}
      </div>
    `;

    const playBtn = card.querySelector("[data-play-level]");
    if (playBtn && unlocked) {
      playBtn.addEventListener("click", () => {
        const existing = (state.attemptsByKey[`${mission.id}-${lvl.level}`] || []).length;
        startLevel(mission.id, lvl.level, existing + 1);
      });
    }

    const lessonBtn = card.querySelector("[data-open-lesson]");
    if (lessonBtn) {
      lessonBtn.addEventListener("click", () => {
        if (voice) voice.stop();
        gameplayPanel.classList.add("hidden");
        resultPanel.classList.add("hidden");
        lessonController.open(mission);
      });
    }

    levelGridEl.appendChild(card);
  });
}

function startLevel(missionId, levelNum, attemptNum = 1) {
  if (voice) voice.stop();
  const mission = MISSIONS.find((m) => m.id === missionId);
  const lvl = mission?.levels.find((l) => l.level === levelNum);
  if (!mission || !lvl) return;

  lessonController.hide();
  resultPanel.classList.add("hidden");
  gameplayPanel.classList.remove("hidden");

  state.selectedMissionId = mission.id;
  state.activeLevel = lvl;
  state.itemIndex = 0;
  state.score = 0;
  state.attemptNumber = attemptNum;
  state.responseTimesSec = [];
  state.levelStartMs = performance.now();

  playLevelPill.textContent = `MISSION ${mission.id} • LEVEL ${lvl.level}`;
  playLevelTitle.textContent = lvl.title;
  renderQuestion();
}

function renderQuestion() {
  const items = state.activeLevel.items;
  const item = items[state.itemIndex];
  state.itemAnswered = false;
  state.itemStartMs = performance.now();

  state.pickedTiles = [];
  state.selectedCardId = null;
  state.sortedBins = {};
  state.selectedLeft = null;
  state.matchedPairs = {};

  hudItemEl.textContent = `${state.itemIndex + 1}/${items.length}`;
  hudScoreEl.textContent = `${state.score}/${items.length}`;
  itemFeedbackEl.classList.add("hidden");
  itemFeedbackEl.classList.remove("ok", "bad");

  progressThreadsEl.innerHTML = "";
  items.forEach((_, idx) => {
    const seg = document.createElement("div");
    seg.className = "thread-seg" + (idx === state.itemIndex ? " current" : "");
    progressThreadsEl.appendChild(seg);
  });

  questionStageEl.innerHTML = "";
  const promptEl = document.createElement("p");
  promptEl.className = "question-prompt";
  promptEl.textContent = item.prompt;
  questionStageEl.appendChild(promptEl);

  if (voice) {
    const audioBar = document.createElement("div");
    audioBar.style.display = "flex";
    audioBar.style.gap = "8px";
    audioBar.style.alignItems = "center";
    audioBar.style.flexWrap = "wrap";
    audioBar.style.marginBottom = "12px";

    const listenBtn = document.createElement("button");
    listenBtn.type = "button";
    listenBtn.className = "btn btn-ghost btn-sm";
    listenBtn.textContent = "🔊 Listen to Ate Habi";
    listenBtn.addEventListener("click", () => {
      speakQuestionItem(item, { slow: slowDictation });
    });

    const speedBtn = document.createElement("button");
    speedBtn.type = "button";
    speedBtn.className = "btn btn-ghost btn-sm";
    speedBtn.textContent = slowDictation ? "🐢 Speed: Slow" : "🐇 Speed: Normal";
    speedBtn.addEventListener("click", () => {
      slowDictation = !slowDictation;
      speedBtn.textContent = slowDictation ? "🐢 Speed: Slow" : "🐇 Speed: Normal";
      speakQuestionItem(item, { slow: slowDictation });
    });

    audioBar.appendChild(listenBtn);
    audioBar.appendChild(speedBtn);
    questionStageEl.appendChild(audioBar);
  }

  if (item.type === "mc" || item.type === "tf") {
    const list = document.createElement("div");
    list.className = "options-list";
    const opts = [...item.options];
    if (item.type === "mc" && state.activeLevel.shuffleOptions) {
      opts.sort(() => Math.random() - 0.5);
    }

    opts.forEach((opt) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "choice-btn";
      btn.textContent = opt;
      btn.addEventListener("click", () => {
        if (state.itemAnswered) return;
        const isRight = opt === item.answer;
        btn.classList.add(isRight ? "picked-correct" : "picked-wrong");
        list.querySelectorAll("button").forEach((b) => (b.disabled = true));
        submitItemResult(isRight, item);
      });
      list.appendChild(btn);
    });
    questionStageEl.appendChild(list);
    return;
  }

  if (item.type === "tiles") {
    const displayTiles = [...item.tiles].sort(() => Math.random() - 0.5);

    const dynamicSlots = document.createElement("div");
    dynamicSlots.className = "loom-build-row";
    const slotDivs = [];
    for (let i = 0; i < item.tiles.length; i += 1) {
      const d = document.createElement("div");
      d.className = "slot-box";
      dynamicSlots.appendChild(d);
      slotDivs.push(d);
    }

    const dynamicBank = document.createElement("div");
    dynamicBank.className = "loom-bank-row";
    const tileBtns = displayTiles.map((letter) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "tile-btn";
      b.textContent = letter;
      return b;
    });

    const syncLoom = () => {
      slotDivs.forEach((d, idx) => {
        d.textContent = state.pickedTiles[idx] ? state.pickedTiles[idx].letter : "";
      });
      tileBtns.forEach((b, idx) => {
        const used = state.pickedTiles.some((p) => p.tileIdx === idx);
        b.classList.toggle("used", used);
      });
    };

    tileBtns.forEach((b, idx) => {
      b.addEventListener("click", () => {
        if (state.itemAnswered) return;
        const pos = state.pickedTiles.findIndex((p) => p.tileIdx === idx);
        if (pos >= 0) {
          state.pickedTiles.splice(pos, 1);
          syncLoom();
          return;
        }
        if (state.pickedTiles.length < item.tiles.length) {
          state.pickedTiles.push({ letter: displayTiles[idx], tileIdx: idx });
          syncLoom();
        }
      });
    });

    const controls = document.createElement("div");
    controls.style.display = "flex";
    controls.style.gap = "10px";
    controls.style.justifyContent = "center";

    const clearBtn = document.createElement("button");
    clearBtn.type = "button";
    clearBtn.className = "btn btn-ghost btn-sm";
    clearBtn.textContent = "Clear";
    clearBtn.addEventListener("click", () => {
      if (state.itemAnswered) return;
      state.pickedTiles = [];
      syncLoom();
    });

    const checkBtn = document.createElement("button");
    checkBtn.type = "button";
    checkBtn.className = "btn btn-primary btn-sm";
    checkBtn.textContent = "Check Word";
    checkBtn.addEventListener("click", () => {
      if (state.itemAnswered) return;
      const built = state.pickedTiles.map((p) => p.letter).join("");
      const isRight = built.toUpperCase() === item.answer.toUpperCase();
      clearBtn.disabled = true;
      checkBtn.disabled = true;
      tileBtns.forEach((b) => (b.disabled = true));
      submitItemResult(isRight, item);
    });

    controls.appendChild(clearBtn);
    controls.appendChild(checkBtn);

    questionStageEl.appendChild(dynamicSlots);
    tileBtns.forEach((b) => dynamicBank.appendChild(b));
    questionStageEl.appendChild(dynamicBank);
    questionStageEl.appendChild(controls);
    return;
  }

  if (item.type === "sort") {
    const wordsRow = document.createElement("div");
    wordsRow.className = "sort-words-row";
    const binsRow = document.createElement("div");
    binsRow.className = "sort-bins";

    const checkSortBtn = document.createElement("button");
    checkSortBtn.type = "button";
    checkSortBtn.className = "btn btn-primary btn-sm";
    checkSortBtn.style.marginTop = "14px";
    checkSortBtn.textContent = "Check Sorting";

    const redrawSort = () => {
      wordsRow.innerHTML = "";
      item.cards.forEach((card) => {
        if (state.sortedBins[card.id]) return;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `word-chip-btn ${state.selectedCardId === card.id ? "selected" : ""}`;
        btn.textContent = card.label;
        btn.addEventListener("click", () => {
          if (state.itemAnswered) return;
          state.selectedCardId = state.selectedCardId === card.id ? null : card.id;
          redrawSort();
        });
        wordsRow.appendChild(btn);
      });

      binsRow.innerHTML = "";
      item.bins.forEach((bin) => {
        const box = document.createElement("div");
        box.className = "sort-bin";
        const h = document.createElement("h4");
        h.textContent = bin.label;
        box.appendChild(h);

        item.cards
          .filter((c) => state.sortedBins[c.id] === bin.id)
          .forEach((c) => {
            const chip = document.createElement("span");
            chip.className = "placed-chip";
            chip.textContent = c.label;
            if (!state.itemAnswered) {
              chip.style.cursor = "pointer";
              chip.title = "Tap to return";
              chip.addEventListener("click", () => {
                delete state.sortedBins[c.id];
                redrawSort();
              });
            }
            box.appendChild(chip);
          });

        box.addEventListener("click", () => {
          if (state.itemAnswered || !state.selectedCardId) return;
          state.sortedBins[state.selectedCardId] = bin.id;
          state.selectedCardId = null;
          redrawSort();
        });

        binsRow.appendChild(box);
      });
    };

    checkSortBtn.addEventListener("click", () => {
      if (state.itemAnswered) return;
      const allSorted = item.cards.every((c) => Boolean(state.sortedBins[c.id]));
      if (!allSorted) {
        itemFeedbackEl.classList.remove("hidden");
        itemFeedbackEl.classList.add("bad");
        itemFeedbackMsg.textContent = "Place every word card into a box first.";
        return;
      }
      const allRight = item.cards.every((c) => state.sortedBins[c.id] === c.bin);
      checkSortBtn.disabled = true;
      submitItemResult(allRight, item);
    });

    redrawSort();
    questionStageEl.appendChild(wordsRow);
    questionStageEl.appendChild(binsRow);
    questionStageEl.appendChild(checkSortBtn);
    return;
  }

  if (item.type === "match") {
    const grid = document.createElement("div");
    grid.className = "match-grid";
    const leftCol = document.createElement("div");
    leftCol.className = "match-col";
    const rightCol = document.createElement("div");
    rightCol.className = "match-col";

    const rightItems = [...item.pairs.map((p) => p.right)].sort(() => Math.random() - 0.5);

    const redrawMatch = () => {
      leftCol.innerHTML = "";
      rightCol.innerHTML = "";

      item.pairs.forEach((pair, idx) => {
        const lBtn = document.createElement("button");
        lBtn.type = "button";
        const isMatched = Object.prototype.hasOwnProperty.call(state.matchedPairs, idx);
        lBtn.className = `match-item-btn ${state.selectedLeft === idx ? "selected" : ""} ${isMatched ? "matched" : ""}`;
        lBtn.textContent = isMatched ? `${pair.left} → ${state.matchedPairs[idx]}` : pair.left;
        lBtn.disabled = isMatched || state.itemAnswered;
        lBtn.addEventListener("click", () => {
          state.selectedLeft = state.selectedLeft === idx ? null : idx;
          redrawMatch();
        });
        leftCol.appendChild(lBtn);
      });

      rightItems.forEach((rWord) => {
        const alreadyUsed = Object.values(state.matchedPairs).includes(rWord);
        const rBtn = document.createElement("button");
        rBtn.type = "button";
        rBtn.className = `match-item-btn ${alreadyUsed ? "matched" : ""}`;
        rBtn.textContent = rWord;
        rBtn.disabled = alreadyUsed || state.itemAnswered;
        rBtn.addEventListener("click", () => {
          if (state.selectedLeft === null) return;
          state.matchedPairs[state.selectedLeft] = rWord;
          state.selectedLeft = null;
          redrawMatch();

          if (Object.keys(state.matchedPairs).length === item.pairs.length) {
            const allRight = item.pairs.every((p, idx) => state.matchedPairs[idx] === p.right);
            submitItemResult(allRight, item);
          }
        });
        rightCol.appendChild(rBtn);
      });
    };

    redrawMatch();
    grid.appendChild(leftCol);
    grid.appendChild(rightCol);
    questionStageEl.appendChild(grid);
  }
}

function submitItemResult(isCorrect, item) {
  state.itemAnswered = true;
  const elapsedSec = Math.max(0.2, (performance.now() - state.itemStartMs) / 1000);
  state.responseTimesSec.push(elapsedSec);

  const seg = progressThreadsEl.children[state.itemIndex];
  if (seg) {
    seg.classList.remove("current");
    seg.classList.add(isCorrect ? "correct" : "wrong");
  }

  if (isCorrect) {
    state.score += 1;
    hudScoreEl.textContent = `${state.score}/${state.activeLevel.items.length}`;
  }

  itemFeedbackEl.classList.remove("hidden", "ok", "bad");
  itemFeedbackEl.classList.add(isCorrect ? "ok" : "bad");
  itemFeedbackMsg.textContent = isCorrect ? item.feedbackCorrect : item.feedbackIncorrect;
  nextItemBtn.textContent =
    state.itemIndex < state.activeLevel.items.length - 1 ? "Next Item" : "See Level Result";
}

async function finishLevel() {
  if (voice) voice.stop();
  gameplayPanel.classList.add("hidden");
  resultPanel.classList.remove("hidden");

  const mission = MISSIONS.find((m) => m.id === state.selectedMissionId);
  const total = state.activeLevel.items.length;
  const score = state.score;
  const accuracy = Math.round((score / total) * 100);
  const timeSec = Math.max(1, Math.round((performance.now() - state.levelStartMs) / 1000));
  const avgResponseSec = Number(
    (
      state.responseTimesSec.reduce((a, b) => a + b, 0) /
      Math.max(1, state.responseTimesSec.length)
    ).toFixed(2)
  );
  const status = getStatusLabel(score);

  statScoreEl.textContent = `${score}/${total}`;
  statAccuracyEl.textContent = `${accuracy}%`;
  statAttemptEl.textContent = String(state.attemptNumber);
  statTimeEl.textContent = `${timeSec}s`;

  resultStatusBadge.textContent = status;
  resultStatusBadge.className = `status-badge ${
    score === 5 ? "badge-mastered" : score >= 3 ? "badge-passed" : "badge-review"
  }`;

  if (score === 5) {
    resultHeadline.textContent = "🏆 Outstanding, Word Weaver!";
    resultMessage.textContent = "Your weaving foundation is complete. Level Complete!";
  } else if (score === 4) {
    resultHeadline.textContent = "⭐ Great job, Word Weaver!";
    resultMessage.textContent = "You are just a few steps away from getting them all.";
  } else if (score === 3) {
    resultHeadline.textContent = "👍 Good start!";
    resultMessage.textContent = "Review some threads before moving forward.";
  } else {
    resultHeadline.textContent = "💡 Don't give up, Word Weaver!";
    resultMessage.textContent = "Review the lesson and try again.";
  }

  const attemptRecord = {
    uid: state.uid,
    username: state.username,
    name: state.name,
    sectionName: state.sectionName,
    classCode: state.classCode,
    mission: mission.id,
    level: state.activeLevel.level,
    score,
    total,
    accuracy,
    attempt: state.attemptNumber,
    timeSec,
    avgResponseSec,
    status,
    createdAt: serverTimestamp()
  };

  const key = `${mission.id}-${state.activeLevel.level}`;
  if (!state.attemptsByKey[key]) state.attemptsByKey[key] = [];
  state.attemptsByKey[key].push(attemptRecord);

  saveStatusEl.textContent = "Saving result to Firestore...";
  try {
    await addDoc(collection(db, "attempts"), attemptRecord);
    if (state.username) {
      await setDoc(
        doc(db, "students", state.username.toLowerCase()),
        {
          uid: state.uid,
          username: state.username,
          name: state.name,
          sectionName: state.sectionName,
          classCode: state.classCode,
          lastActive: serverTimestamp()
        },
        { merge: true }
      );
    }
    saveStatusEl.textContent = "Saved to class records.";
  } catch (err) {
    console.error(err);
    saveStatusEl.textContent = "Could not save to Firestore (check rules or network).";
  }

  const hasNextLevel = mission.levels.some((l) => l.level === state.activeLevel.level + 1);
  const nextMission = MISSIONS.find((m) => m.id === mission.id + 1);

  if (score >= 3 && hasNextLevel) {
    nextLevelBtn.textContent = "Next Level";
    nextLevelBtn.classList.remove("hidden");
  } else if (score >= 3 && isMissionCompleted(mission) && nextMission) {
    nextLevelBtn.textContent = `Start ${nextMission.title}`;
    nextLevelBtn.classList.remove("hidden");
  } else {
    nextLevelBtn.classList.add("hidden");
  }

  if (isMissionCompleted(mission)) {
    const allDone = MISSIONS.every(isMissionCompleted);
    missionUnlockBanner.classList.remove("hidden");
    missionUnlockBanner.textContent = allDone
      ? "👑 MYTHIC WORD WEAVER! Completed all missions • Phrases: RIGHT THREAD • STRONG WEAVE • MASTERPIECE"
      : `🎉 Mission Complete! Key Phrase: "${mission.keyPhrase}" • Badge Earned: ${mission.badge}`;
  } else {
    missionUnlockBanner.classList.add("hidden");
  }

  renderRankAndBadges();
}

onAuthStateChanged(auth, async (user) => {
  if (user) {
    state.uid = user.uid;
    const savedSession = sessionStorage.getItem(SESSION_KEY);
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        if (parsed.username) {
          usernameInput.value = parsed.username;
          state.username = parsed.username;
        }
        if (parsed.name) state.name = parsed.name;
        if (parsed.sectionName) {
          sectionNameInput.value = parsed.sectionName;
          state.sectionName = parsed.sectionName;
          state.classCode = parsed.sectionName;
        }
        if (state.username || state.name) {
          await showAppView();
        }
      } catch (e) {
        console.error("Session parse error:", e);
      }
    }
  }
});