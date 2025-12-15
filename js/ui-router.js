export function showModule(id) {
  document.querySelectorAll("[data-module]").forEach(el => el.classList.add("hidden"));
  document.querySelector(`[data-module="${id}"]`)?.classList.remove("hidden");
}
