import { State, isLoggedIn, hasPerm } from "./state.js";
import { initGoogleLogin, logout, refreshSessionUser } from "./auth.js";
import { router, navigate } from "./ui-router.js";
import { api } from "./api.js";

export function toast(msg, isErr=false) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.remove("hidden");
  t.style.borderColor = isErr ? "rgba(239,68,68,.35)" : "rgba(34,197,94,.35)";
  setTimeout(() => t.classList.add("hidden"), 2800);
}

export function renderShell() {
  const loginCard = document.getElementById("loginCard");
  const nav = document.getElementById("nav");
  const brandSub = document.getElementById("brandSub");

  const logged = isLoggedIn();

  loginCard.classList.toggle("hidden", logged);
  nav.innerHTML = "";
  brandSub.textContent = logged
    ? `${State.user?.name || "User"} • ${State.user?.role || ""}`
    : "Not logged in";

  // Build nav from permissions (backend-driven principle)
  const links = [];

  if (logged) links.push({ href:"#/dashboard", label:"Dashboard" });

  if (logged && (hasPerm("REQUIREMENT_RAISE") || hasPerm("REQUIREMENT_APPROVE"))) {
    links.push({ href:"#/requirements", label:"Requirements" });
  }
  if (logged && (hasPerm("CANDIDATE_ADD") || hasPerm("SHORTLIST_DECISION"))) {
    links.push({ href:"#/candidates", label:"Candidates" });
  }
  if (logged && hasPerm("CALL_SCREENING")) {
    links.push({ href:"#/calls", label:"Call Screening" });
  }
  if (logged && hasPerm("INTERVIEW_SCHEDULE")) {
    links.push({ href:"#/interviews", label:"Interviews" });
  }
  if (logged && hasPerm("TEST_GENERATE")) {
    links.push({ href:"#/tests", label:"Tests" });
  }
  if (logged && (hasPerm("ONBOARDING") || hasPerm("ONBOARDING_VERIFY"))) {
    links.push({ href:"#/onboarding", label:"Onboarding" });
  }
  if (logged && hasPerm("SYSTEM_SETTINGS")) {
    links.push({ href:"#/admin", label:"Admin" });
  }

  links.forEach(l => {
    const a = document.createElement("a");
    a.href = l.href;
    a.textContent = l.label;
    nav.appendChild(a);
  });

  if (logged && !location.hash) navigate("#/dashboard");
  router();
}

export async function renderDashboard(view) {
  if (!isLoggedIn()) {
    view.innerHTML = `<div class="card"><div class="h1">Login required</div><div class="muted">Please sign in.</div></div>`;
    return;
  }

  const dash = await api("GET_DASHBOARD", {});
  const reqCount = Object.entries(dash.counts.requirements || {}).map(([k,v]) => `<span class="badge">${k}: ${v}</span>`).join(" ");
  const candCount = Object.entries(dash.counts.candidates || {}).map(([k,v]) => `<span class="badge">${k}: ${v}</span>`).join(" ");

  view.innerHTML = `
    <div class="h1">Dashboard</div>

    <div class="grid cols2">
      <div class="card">
        <div class="card-title">Requirement Status</div>
        <div>${reqCount || `<span class="muted">No data</span>`}</div>
      </div>
      <div class="card">
        <div class="card-title">Candidate Status</div>
        <div>${candCount || `<span class="muted">No data</span>`}</div>
      </div>
    </div>

    <div class="card" style="margin-top:12px;">
      <div class="card-title">Queues</div>
      <div class="muted small">Role-wise queues backend se aa rahi hain. Next step me hum yaha cards banayenge.</div>
      <pre class="muted small" style="white-space:pre-wrap;">${escapeHtml(JSON.stringify(dash.queues, null, 2))}</pre>
    </div>
  `;
}

export function escapeHtml(s){
  return String(s)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;");
}

// Boot
window.addEventListener("hashchange", router);

document.getElementById("btnLogout").addEventListener("click", logout);
document.getElementById("btnRefresh").addEventListener("click", async () => {
  try {
    await refreshSessionUser();
    toast("Refreshed");
    renderShell();
  } catch (e) {
    toast("Refresh failed: " + e.message, true);
  }
});

// Wait for GIS load
window.addEventListener("load", () => {
  initGoogleLogin();
  // try render shell even if sessionToken exists
  renderShell();
});
