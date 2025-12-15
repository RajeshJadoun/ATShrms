export const State = {
  user: null,
  sessionToken: localStorage.getItem("sessionToken") || "",
  permissions: [],
};

export function setSession({ user, sessionToken }) {
  State.user = user;
  State.sessionToken = sessionToken || "";
  State.permissions = user?.permissions || [];
  localStorage.setItem("sessionToken", State.sessionToken);
}

export function clearSession() {
  State.user = null;
  State.permissions = [];
  State.sessionToken = "";
  localStorage.removeItem("sessionToken");
}

export function hasPerm(p) {
  return State.permissions.includes(p);
}

export function isLoggedIn() {
  return !!State.sessionToken;
}
