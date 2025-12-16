import { CONFIG } from "./config.js";
import { state } from "./state.js";

/**
 * IMPORTANT:
 * application/json header mat bhejo (Apps Script preflight avoid).
 * body string => browser auto text/plain;charset=UTF-8 bhejta hai.
 */
export async function apiCall(action, data = {}) {
  const payload = { action, token: state.sessionToken || "", data };

  const res = await fetch(CONFIG.API_URL, {
    method: "POST",
    body: JSON.stringify(payload)
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(
      "API returned non-JSON response (deploy/permissions/CORS issue). Preview: " +
      text.slice(0, 200)
    );
  }

  if (!json.ok) {
    throw new Error(json?.error?.message || json?.error || "API error");
  }

  return (json.data != null) ? json.data : json;
}

export async function pingApi() {
  const res = await fetch(CONFIG.API_URL);
  const text = await res.text();
  try { return JSON.parse(text); }
  catch { return { ok: res.ok, preview: text.slice(0, 120) }; }
}
