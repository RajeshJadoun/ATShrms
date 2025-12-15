import { initGoogleLogin } from "./auth.js";
import { renderShell } from "./ui.js";
import { router } from "./ui-router.js";

window.addEventListener("hashchange", router);

window.addEventListener("load", async () => {
  await initGoogleLogin();   // GIS ready wait inside auth.js
  renderShell();
  router();
});
