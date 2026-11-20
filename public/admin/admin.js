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

const loginSection = document.getElementById("admin-login-section");
const loginForm = document.getElementById("admin-login-form");
const adminEmailInput = document.getElementById("admin-email");
const adminPasswordInput = document.getElementById("admin-password");
const adminLoginStatus = document.getElementById("admin-login-status");

const dashboardEl = document.getElementById("admin-dashboard");
const logoutBtn = document.getElementById("admin-logout-btn");

const createStudentForm = document.getElementById("create-student-form");
const newStudentUsernameInput = document.getElementById("new-student-username");
const newStudentFullnameInput = document.getElementById("new-student-fullname");
const newStudentSectionInput = document.getElementById("new-student-section");
const adminActionStatus = document.getElementById("admin-action-status");

const filterSectionSelect = document.getElementById("filter-section-select");
const refreshBtn = document.getElementById("refresh-admin-btn");
const rosterTableBody = document.getElementById("roster-table-body");

let rosterStudents = [];
let attemptsList = [];

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
    adminLoginStatus.textContent = "Sign-in failed. Check email and password.";
  }
});

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
});

refreshBtn.addEventListener("click", () => {
  loadAllAdminData();
});

filterSectionSelect.addEventListener("change", () => {
  renderRosterTable();
});

createStudentForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = newStudentUsernameInput.value.trim().toLowerCase();
  const fullName = newStudentFullnameInput.value.trim();
  const sectionName = newStudentSectionInput.value.trim();
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
    newStudentUsernameInput.value = "";
    newStudentFullnameInput.value = "";
    newStudentSectionInput.value = "";
    adminActionStatus.textContent = `Created student account "${username}" (${fullName}) in section "${sectionName}".`;
    await loadAllAdminData();
  } catch (err) {
    console.error(err);
    adminActionStatus.textContent = "Could not create student account. Check admin permissions.";
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
  renderRosterTable();
}

function renderSectionFilter() {
  const previousFilter = filterSectionSelect.value || "ALL";
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

  if (sections.includes(previousFilter)) {
    filterSectionSelect.value = previousFilter;
  } else {
    filterSectionSelect.value = "ALL";
  }
}

function renderRosterTable() {
  const selectedSection = filterSectionSelect.value || "ALL";
  const filtered = rosterStudents.filter((s) => {
    const sec = (s.sectionName || s.classCode || "").trim();
    return selectedSection === "ALL" || sec === selectedSection;
  });

  rosterTableBody.innerHTML = "";
  if (!filtered.length) {
    rosterTableBody.innerHTML = `<tr><td colspan="7" style="color:#888;">No student accounts found.</td></tr>`;
    return;
  }

  filtered.forEach((student) => {
    const usernameVal = (student.username || student.studentCode || student.id).toLowerCase();
    const fullNameVal = student.name || "";
    const sectionVal = (student.sectionName || student.classCode || "").trim();

    const studentAttempts = attemptsList.filter(
      (a) =>
        (a.username && String(a.username).toLowerCase() === usernameVal) ||
        (a.studentCode && String(a.studentCode).toLowerCase() === usernameVal) ||
        (a.name && a.name === fullNameVal && (a.sectionName === sectionVal || a.classCode === sectionVal))
    );

    const attemptCount = studentAttempts.length;
    const avgAcc = attemptCount
      ? `${Math.round(studentAttempts.reduce((sum, a) => sum + (Number(a.accuracy) || 0), 0) / attemptCount)}%`
      : "—";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${usernameVal}</strong></td>
      <td>${fullNameVal}</td>
      <td>${sectionVal}</td>
      <td>${student.active === false ? "Inactive" : "Active"}</td>
      <td>${attemptCount}</td>
      <td>${avgAcc}</td>
      <td>
        <button type="button" class="btn-sm-ghost" data-toggle-active="${usernameVal}">
          ${student.active === false ? "Enable" : "Disable"}
        </button>
        <button type="button" class="btn-sm-ghost" data-delete-student="${usernameVal}" style="color:#d9534f; border-color:#d9534f;">
          Delete
        </button>
      </td>
    `;

    tr.querySelector("[data-toggle-active]").addEventListener("click", async () => {
      await setDoc(
        doc(db, "roster", usernameVal),
        { active: student.active === false, updatedAt: serverTimestamp() },
        { merge: true }
      );
      await loadAllAdminData();
    });

    tr.querySelector("[data-delete-student]").addEventListener("click", async () => {
      await deleteDoc(doc(db, "roster", usernameVal));
      await loadAllAdminData();
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
    adminLoginStatus.textContent = "This account is not listed in Firestore admins/{uid}.";
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