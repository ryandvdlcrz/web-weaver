import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  getDocs,
  deleteDoc,
  collection,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "../firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const loginSection = document.getElementById("admin-login-section");
const loginForm = document.getElementById("admin-login-form");
const adminEmailInput = document.getElementById("admin-email");
const adminPasswordInput = document.getElementById("admin-password");
const adminLoginStatus = document.getElementById("admin-login-status");

const dashboardEl = document.getElementById("admin-dashboard");
const logoutBtn = document.getElementById("admin-logout-btn");

const createStudentForm = document.getElementById("create-student-form");
const usernameInput = document.getElementById("new-student-username");
const fullnameInput = document.getElementById("new-student-fullname");
const sectionInput = document.getElementById("new-student-section");
const actionStatus = document.getElementById("admin-action-status");

const filterSectionSelect = document.getElementById("filter-section-select");
const refreshBtn = document.getElementById("refresh-admin-btn");

const sumStudentsEl = document.getElementById("sum-students");
const sumPassRateEl = document.getElementById("sum-pass-rate");
const sumAvgAccEl = document.getElementById("sum-avg-acc");
const sumAvgTriesEl = document.getElementById("sum-avg-tries");

const itemAnalyticsBody = document.getElementById("item-analytics-tbody");
const rosterTableBody = document.getElementById("roster-table-body");

let rosterStudents = [];
let attemptsList = [];

// Admin Verification
async function checkIsAdmin(uid) {
  if (!uid) return false;
  const snap = await getDoc(doc(db, "admins", uid));
  return snap.exists();
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  adminLoginStatus.textContent = "Signing in...";
  try {
    await signInWithEmailAndPassword(
      auth,
      adminEmailInput.value.trim(),
      adminPasswordInput.value
    );
    adminLoginStatus.textContent = "";
  } catch (err) {
    console.error(err);
    adminLoginStatus.textContent = "Sign-in failed. Check credentials.";
  }
});

logoutBtn.addEventListener("click", () => signOut(auth));
refreshBtn.addEventListener("click", () => loadAllAdminData());
filterSectionSelect.addEventListener("change", () => renderDashboard());

createStudentForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = usernameInput.value.trim().toLowerCase();
  const fullName = fullnameInput.value.trim();
  const sectionName = sectionInput.value.trim();

  if (!username || !fullName || !sectionName) return;

  try {
    await setDoc(
      doc(db, "roster", username),
      {
        username,
        studentCode: username,
        name: fullName,
        sectionName,
        classCode: sectionName,
        active: true,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );

    usernameInput.value = "";
    fullnameInput.value = "";
    sectionInput.value = "";
    actionStatus.textContent = `Created account "${username}" (${fullName}).`;
    await loadAllAdminData();
  } catch (err) {
    console.error(err);
    actionStatus.textContent = "Error creating account. Verify permissions.";
  }
});

async function loadAllAdminData() {
  const [rosterSnap, attemptsSnap] = await Promise.all([
    getDocs(collection(db, "roster")),
    getDocs(collection(db, "attempts"))
  ]);

  rosterStudents = rosterSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  attemptsList = attemptsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  renderSectionFilter();
  renderDashboard();
}

function renderSectionFilter() {
  const prevSelection = filterSectionSelect.value || "ALL";
  const sections = Array.from(
    new Set(
      rosterStudents
        .map((s) => (s.sectionName || s.classCode || "").trim())
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));

  filterSectionSelect.innerHTML = `<option value="ALL">All Sections</option>`;
  sections.forEach((sec) => {
    const opt = document.createElement("option");
    opt.value = sec;
    opt.textContent = sec;
    filterSectionSelect.appendChild(opt);
  });

  if (sections.includes(prevSelection)) {
    filterSectionSelect.value = prevSelection;
  }
}

function renderDashboard() {
  const selectedSection = filterSectionSelect.value || "ALL";

  // Filter roster and attempts by section
  const filteredStudents = rosterStudents.filter((s) => {
    const sec = (s.sectionName || s.classCode || "").trim();
    return selectedSection === "ALL" || sec === selectedSection;
  });

  const filteredAttempts = attemptsList.filter((a) => {
    const sec = (a.sectionName || a.classCode || "").trim();
    return selectedSection === "ALL" || sec === selectedSection;
  });

  // Calculate Overall Class KPIs
  const activeStudentCount = filteredStudents.length;
  let totalUniqueLevelsPlayed = 0;
  let totalUniqueLevelsPassed = 0;
  let totalAccuracySum = 0;

  filteredStudents.forEach((student) => {
    const username = (student.username || student.studentCode || student.id).toLowerCase();
    const fullName = student.name || "";
    const section = (student.sectionName || student.classCode || "").trim();

    const studentAttempts = filteredAttempts.filter(
      (a) =>
        (a.username && String(a.username).toLowerCase() === username) ||
        (a.studentCode && String(a.studentCode).toLowerCase() === username) ||
        (a.name && a.name === fullName && (a.sectionName === section || a.classCode === section))
    );

    // Group attempts by level key (e.g. "1-1", "1-2")
    const levelsMap = {};
    studentAttempts.forEach((a) => {
      const key = `${a.mission || 1}-${a.level || 1}`;
      if (!levelsMap[key]) levelsMap[key] = [];
      levelsMap[key].push(a);
    });

    const playedCount = Object.keys(levelsMap).length;
    totalUniqueLevelsPlayed += playedCount;

    // Count passed levels (highest score >= 3)
    Object.values(levelsMap).forEach((attempts) => {
      const maxScore = Math.max(...attempts.map((a) => a.score || 0));
      if (maxScore >= 3) totalUniqueLevelsPassed += 1;
    });

    if (studentAttempts.length) {
      const avgAcc = studentAttempts.reduce((sum, a) => sum + (Number(a.accuracy) || 0), 0) / studentAttempts.length;
      totalAccuracySum += avgAcc;
    }
  });

  const classPassRate = totalUniqueLevelsPlayed
    ? Math.round((totalUniqueLevelsPassed / totalUniqueLevelsPlayed) * 100)
    : 0;

  const classAvgAccuracy = activeStudentCount
    ? Math.round(totalAccuracySum / activeStudentCount)
    : 0;

  const avgTriesPerLevel = totalUniqueLevelsPlayed
    ? (filteredAttempts.length / totalUniqueLevelsPlayed).toFixed(1)
    : "1.0";

  sumStudentsEl.textContent = String(activeStudentCount);
  sumPassRateEl.textContent = `${classPassRate}%`;
  sumAvgAccEl.textContent = `${classAvgAccuracy}%`;
  sumAvgTriesEl.textContent = `${avgTriesPerLevel} tries`;

  renderItemAnalytics(filteredAttempts);
  renderRosterTable(filteredStudents, filteredAttempts);
}

function renderItemAnalytics(attempts) {
  itemAnalyticsBody.innerHTML = "";
  const itemStats = {};

  attempts.forEach((a) => {
    if (Array.isArray(a.itemResults)) {
      a.itemResults.forEach((res) => {
        const id = res.targetWord || res.itemId || "unknown";
        if (!itemStats[id]) {
          itemStats[id] = {
            targetWord: id,
            type: res.type || "mc",
            total: 0,
            wrong: 0
          };
        }
        itemStats[id].total += 1;
        if (!res.isCorrect) itemStats[id].wrong += 1;
      });
    }
  });

  const sortedItems = Object.values(itemStats).sort((a, b) => {
    const rateA = a.wrong / (a.total || 1);
    const rateB = b.wrong / (b.total || 1);
    return rateB - rateA;
  });

  if (!sortedItems.length) {
    itemAnalyticsBody.innerHTML = `<tr><td colspan="6" style="color:#888; text-align:center;">No item failure records available yet. Play a level to log item analytics!</td></tr>`;
    return;
  }

  sortedItems.forEach((stat) => {
    const errorRate = Math.round((stat.wrong / stat.total) * 100);
    let priorityBadge = `<span class="badge-good">Low</span>`;
    if (errorRate >= 50) priorityBadge = `<span class="badge-bad">High Priority</span>`;
    else if (errorRate >= 25) priorityBadge = `<span class="badge-warn">Medium</span>`;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><code>${stat.targetWord}</code></td>
      <td><strong>${stat.type.toUpperCase()}</strong></td>
      <td>${stat.total}</td>
      <td>${stat.wrong}</td>
      <td><strong>${errorRate}%</strong></td>
      <td>${priorityBadge}</td>
    `;
    itemAnalyticsBody.appendChild(tr);
  });
}

function renderRosterTable(students, attempts) {
  rosterTableBody.innerHTML = "";
  if (!students.length) {
    rosterTableBody.innerHTML = `<tr><td colspan="8" style="color:#888; text-align:center;">No student accounts found.</td></tr>`;
    return;
  }

  students.forEach((student) => {
    const username = (student.username || student.studentCode || student.id).toLowerCase();
    const fullName = student.name || "";
    const section = (student.sectionName || student.classCode || "").trim();

    // Find student level attempts
    const studentAttempts = attempts.filter(
      (a) =>
        (a.username && String(a.username).toLowerCase() === username) ||
        (a.studentCode && String(a.studentCode).toLowerCase() === username) ||
        (a.name && a.name === fullName && (a.sectionName === section || a.classCode === section))
    );

    // Group level attempts to compute levels passed vs tries per level
    const levelsMap = {};
    studentAttempts.forEach((a) => {
      const key = `${a.mission || 1}-${a.level || 1}`;
      if (!levelsMap[key]) levelsMap[key] = [];
      levelsMap[key].push(a);
    });

    const distinctLevelsCount = Object.keys(levelsMap).length;
    let levelsPassedCount = 0;

    Object.values(levelsMap).forEach((lvlAttempts) => {
      const bestScore = Math.max(...lvlAttempts.map((a) => a.score || 0));
      if (bestScore >= 3) levelsPassedCount += 1;
    });

    const totalSubmissions = studentAttempts.length;
    const avgTriesPerLevel = distinctLevelsCount
      ? (totalSubmissions / distinctLevelsCount).toFixed(1)
      : "—";

    const avgAcc = totalSubmissions
      ? `${Math.round(studentAttempts.reduce((sum, a) => sum + (Number(a.accuracy) || 0), 0) / totalSubmissions)}%`
      : "—";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${username}</strong></td>
      <td>${fullName || "-"}</td>
      <td>${section || "-"}</td>
      <td><span class="${student.active === false ? "badge-bad" : "badge-good"}">${student.active === false ? "Inactive" : "Active"}</span></td>
      <td><strong>${levelsPassedCount}/9</strong> <span style="font-size:0.8rem; color:#666;">(${distinctLevelsCount} played)</span></td>
      <td><strong>${avgAcc}</strong></td>
      <td>${avgTriesPerLevel}</td>
      <td>
        <button type="button" class="btn-sm-ghost" data-toggle-active="${username}">
          ${student.active === false ? "Enable" : "Disable"}
        </button>
        <button type="button" class="btn-sm-ghost" data-delete-student="${username}" style="color:#d9534f; border-color:#d9534f;">
          Delete
        </button>
      </td>
    `;

    tr.querySelector("[data-toggle-active]").addEventListener("click", async () => {
      await setDoc(
        doc(db, "roster", username),
        { active: student.active === false, updatedAt: serverTimestamp() },
        { merge: true }
      );
      await loadAllAdminData();
    });

    tr.querySelector("[data-delete-student]").addEventListener("click", async () => {
      if (confirm(`Are you sure you want to delete '${username}'?`)) {
        await deleteDoc(doc(db, "roster", username));
        await loadAllAdminData();
      }
    });

    rosterTableBody.appendChild(tr);
  });
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    dashboardEl.classList.add("hidden");
    logoutBtn.classList.add("hidden");
    loginSection.classList.remove("hidden");
    return;
  }

  const allowed = await checkIsAdmin(user.uid);
  if (!allowed) {
    adminLoginStatus.textContent = "Your login UID is not listed under Firestore admins/{uid}.";
    dashboardEl.classList.add("hidden");
    logoutBtn.classList.remove("hidden");
    loginSection.classList.remove("hidden");
    return;
  }

  loginSection.classList.add("hidden");
  logoutBtn.classList.remove("hidden");
  dashboardEl.classList.remove("hidden");
  await loadAllAdminData();
});