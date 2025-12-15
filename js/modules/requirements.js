import { api } from "../api.js";
import { hasPerm, State } from "../state.js";
import { toast } from "../ui.js";

export async function renderRequirements(view) {
  if (!hasPerm("REQUIREMENT_RAISE") && !hasPerm("REQUIREMENT_APPROVE")) {
    view.innerHTML = `<div class="card"><div class="h1">No Access</div><div class="muted">Permission missing</div></div>`;
    return;
  }

  const res = await api("LIST_REQUIREMENTS", {});
  const items = res.items || [];

  view.innerHTML = `
    <div class="h1">Requirements</div>

    ${hasPerm("REQUIREMENT_RAISE") ? renderRaiseForm() : ""}

    <div class="card" style="margin-top:12px;">
      <div class="card-title">All Requirements</div>
      <table class="table">
        <thead>
          <tr>
            <th>ID</th><th>Role</th><th>Dept</th><th>Location</th><th>Status</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(r => rowHtml(r)).join("")}
        </tbody>
      </table>
    </div>
  `;

  bindActions(view);
}

function renderRaiseForm() {
  return `
  <div class="card">
    <div class="card-title">Raise Requirement (EA)</div>
    <div class="row">
      <input class="input" id="jobRole" placeholder="Job Role" />
      <input class="input" id="dept" placeholder="Dept" />
    </div>
    <div class="row" style="margin-top:10px;">
      <input class="input" id="location" placeholder="Location" />
      <input class="input" id="headcount" placeholder="Headcount" />
    </div>
    <div class="row" style="margin-top:10px;">
      <input class="input" id="ctcRange" placeholder="CTC Range" />
      <button class="btn" id="btnRaise">Raise</button>
    </div>
    <textarea class="textarea" id="notes" placeholder="Notes" style="margin-top:10px;"></textarea>
    <div class="muted small" style="margin-top:6px;">Status: PENDING_HR_REVIEW</div>
  </div>`;
}

function rowHtml(r) {
  const canApprove = hasPerm("REQUIREMENT_APPROVE") && ["PENDING_HR_REVIEW","NEED_CLARIFICATION"].includes(String(r.status));
  const canSendBack = hasPerm("REQUIREMENT_SEND_BACK") && ["PENDING_HR_REVIEW","NEED_CLARIFICATION"].includes(String(r.status));

  return `
  <tr>
    <td>${r.id}</td>
    <td>${r.jobRole || ""}</td>
    <td>${r.dept || ""}</td>
    <td>${r.location || ""}</td>
    <td><span class="badge">${r.status}</span></td>
    <td>
      ${canApprove ? `<button class="btn" data-act="approve" data-id="${r.id}">Approve</button>` : ""}
      ${canSendBack ? `<button class="btn ghost" data-act="sendback" data-id="${r.id}">Send Back</button>` : ""}
    </td>
  </tr>`;
}

function bindActions(root) {
  const btnRaise = root.querySelector("#btnRaise");
  if (btnRaise) {
    btnRaise.addEventListener("click", async () => {
      try {
        const payload = {
          jobRole: root.querySelector("#jobRole").value.trim(),
          dept: root.querySelector("#dept").value.trim(),
          location: root.querySelector("#location").value.trim(),
          headcount: root.querySelector("#headcount").value.trim(),
          ctcRange: root.querySelector("#ctcRange").value.trim(),
          notes: root.querySelector("#notes").value.trim()
        };
        const out = await api("RAISE_REQUIREMENT", payload);
        toast("Raised: " + out.requirementId);
        // refresh
        const { renderRequirements } = await import("./requirements.js");
        renderRequirements(document.getElementById("view"));
      } catch (e) { toast(e.message, true); }
    });
  }

  root.querySelectorAll("button[data-act]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const act = btn.dataset.act;

      try {
        if (act === "approve") {
          await api("APPROVE_REQUIREMENT", { requirementId: id, remark: "" });
          toast("Approved: " + id);
        }
        if (act === "sendback") {
          const remark = prompt("Send back remark (mandatory):");
          if (!remark) return;
          await api("SEND_BACK_REQUIREMENT", { requirementId: id, remark });
          toast("Sent back: " + id);
        }
        const { renderRequirements } = await import("./requirements.js");
        renderRequirements(document.getElementById("view"));
      } catch (e) { toast(e.message, true); }
    });
  });
}
