import { apiCall } from "../api.js";

export async function renderOwnerQueuePage({ headerEl, rootEl }) {
  headerEl.textContent = "OWNER QUEUE";

  rootEl.innerHTML = `
    <div class="card card-wide">
      <div class="row">
        <h3 style="margin:0">Owner Queue</h3>
        <button class="btn btn-sm right" id="ref">Refresh</button>
      </div>

      <div class="row" style="gap:10px; flex-wrap:wrap; margin-top:10px">
        <select class="input" id="mode">
          <option value="OWNER_REVIEW">OWNER_REVIEW</option>
          <option value="FINAL_INTERVIEW">FINAL_INTERVIEW</option>
        </select>
        <button class="btn btn-sm" id="load">Load</button>
      </div>

      <div class="hr"></div>
      <div id="list" class="muted">Loading...</div>
    </div>
  `;

  const list = rootEl.querySelector("#list");
  const mode = rootEl.querySelector("#mode");

  rootEl.querySelector("#ref").onclick = () => load();
  rootEl.querySelector("#load").onclick = () => load();

  await load();

  async function load() {
    list.innerHTML = `<div class="muted">Loading...</div>`;
    const res = await apiCall("LIST_OWNER_QUEUE", { mode: mode.value });
    const items = res?.data?.items || [];

    if (!items.length) {
      list.innerHTML = `<div class="muted">No candidates in this queue.</div>`;
      return;
    }

    list.innerHTML = items.map(c => `
      <div class="card card-wide" style="margin-bottom:12px">
        <div class="row">
          <span class="pill"><b>${esc(c.id)}</b></span>
          <span class="pill warn">${esc(c.status)}</span>
          <span class="right muted small">${esc(c.updatedAt || "")}</span>
        </div>

        <div style="margin-top:10px; font-weight:900">${esc(c.name || "")}</div>
        <div class="muted small" style="margin-top:6px">
          Mob: ${esc(c.mobile || "-")} • Source: ${esc(c.source || "-")} • Req: ${esc(c.requirementId || "-")}
        </div>

        <div class="row" style="margin-top:10px; gap:8px; flex-wrap:wrap">
          <a class="pill" href="#/timeline?candidateId=${encodeURIComponent(c.id)}">Open Timeline</a>
          ${c.cvUrl ? `<a class="pill ok" target="_blank" href="${esc(c.cvUrl)}">CV</a>` : `<span class="pill danger">CV Missing</span>`}
        </div>

        <div class="hr"></div>

        ${mode.value === "OWNER_REVIEW" ? `
          <div class="row" style="gap:8px; flex-wrap:wrap">
            <button class="btn btn-sm" data-act="APPROVE_WALKIN" data-id="${esc(c.id)}">Approve Walk-in</button>
            <button class="btn btn-sm" data-act="HOLD" data-id="${esc(c.id)}">Hold</button>
            <button class="btn btn-sm" data-act="REJECT" data-id="${esc(c.id)}">Reject</button>
          </div>
        ` : `
          <div class="row" style="gap:8px; flex-wrap:wrap">
            <button class="btn btn-sm" data-fin="SELECT" data-id="${esc(c.id)}">Select</button>
            <button class="btn btn-sm" data-fin="HOLD" data-id="${esc(c.id)}">Hold</button>
            <button class="btn btn-sm" data-fin="REJECT" data-id="${esc(c.id)}">Reject</button>
          </div>
        `}
      </div>
    `).join("");

    // owner review actions
    list.querySelectorAll("[data-act]").forEach(b => b.onclick = async () => {
      const candidateId = b.getAttribute("data-id");
      const decision = b.getAttribute("data-act");
      const remark = (decision === "REJECT") ? prompt("Reject reason (mandatory):", "") : (prompt("Remark (optional):", "") || "");
      if (decision === "REJECT" && !remark) return alert("Reason required");

      await apiCall("OWNER_DECISION", { candidateId, decision, remark });
      alert("Saved ✅");
      await load();
    });

    // final interview actions
    list.querySelectorAll("[data-fin]").forEach(b => b.onclick = async () => {
      const candidateId = b.getAttribute("data-id");
      const decision = b.getAttribute("data-fin");
      const remark = (decision === "REJECT") ? prompt("Reject reason (mandatory):", "") : (prompt("Remark (optional):", "") || "");
      if (decision === "REJECT" && !remark) return alert("Reason required");

      await apiCall("FINAL_INTERVIEW_DECISION", { candidateId, decision, remark });
      alert("Saved ✅");
      await load();
    });
  }
}

function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m]))}
