import { CONFIG } from "./config.js";

const LS_KEY = "HRMS_SESSION";

export function setSession(session) {
  localStorage.setItem(LS_KEY, JSON.stringify(session));
}

export function getSession() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "null"); } catch { return null; }
}

export function getSessionToken() {
  return getSession()?.sessionToken || "";
}

export function logout() {
  localStorage.removeItem(LS_KEY);
  location.href = "login.html";
}

// Google Identity callback (id_token)
export async function exchangeIdToken(idToken) {
  const res = await fetch(CONFIG.API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "LOGIN_EXCHANGE", token: "", data: { idToken } }),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error?.message || "Login failed");
  setSession({ ...json.data });
  return json.data;
}
