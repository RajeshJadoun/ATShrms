import { CONFIG } from "./config.js";
import { State } from "./state.js";

export async function api(action, data = {}, opts = {}) {
  const payload = {
    action,
    token: opts.public ? "" : (State.sessionToken || ""),
    data
  };

  const res = await fetch(CONFIG.API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" }, // GAS friendly
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => null);
  if (!json) throw new Error("Invalid JSON response from server");

  if (!json.ok) {
    const msg = json.error?.message || "Unknown server error";
    throw new Error(msg);
  }
  return json.data;
}
