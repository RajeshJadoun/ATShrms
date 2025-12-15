import { state } from "./state.js";

export function buildNav() {
  const nav = document.getElementById("nav");
  nav.innerHTML = "";

  const items = [
    { id: "home", label: "Home", roles: ["ADMIN","HR","EA","OWNER"] },
    { id: "requirements", label: "Requirements", roles: ["ADMIN","HR","EA"] },
    { id: "candidates", label: "Candidates", roles: ["ADMIN","HR","OWNER"] },
    { id: "admin", label: "Admin", roles: ["ADMIN"] }
  ];

  items.forEach(it => {
    if (!state.user) return;
    if (!it.roles.includes(state.user.role)) return;

    const div = document.createElement("div");
    div.className = "nav-item";
    div.dataset.route = it.id;
    div.innerHTML = `<span>${it.label}</span><span class="badge">${state.user.role}</span>`;
    div.onclick = () => routeTo(it.id);
    nav.appendChild(div);
  });

  // default route
  const hash = location.hash.replace("#/", "");
  routeTo(hash || "home");
}

export function routeTo(route) {
  location.hash = "#/" + route;
  setActive(route);

  const header = document.getElementById("pageHeader");
  const body = document.getElementById("pageBody");

  header.textContent = route.toUpperCase();
  body.innerHTML = `<div class="card">Module <b>${route}</b> loaded. (Part-1 placeholder)</div>`;
}

function setActive(route) {
  document.querySelectorAll(".nav-item").forEach(el => {
    el.classList.toggle("active", el.dataset.route === route);
  });
}
