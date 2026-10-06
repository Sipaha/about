const themeButton = document.querySelector("[data-theme-toggle]");
const mode = window.matchMedia("(prefers-color-scheme: dark)");
function applyTheme(dark) {
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  themeButton.setAttribute("aria-pressed", String(dark));
}
applyTheme(document.documentElement.dataset.theme === "dark");
themeButton.addEventListener("click", () => {
  const dark = document.documentElement.dataset.theme !== "dark";
  applyTheme(dark);
  try {
    localStorage.setItem("donate-theme", dark ? "dark" : "light");
  } catch {
    /* Storage is optional. */
  }
});
mode.addEventListener("change", ({ matches }) => {
  let preference;
  try {
    preference = localStorage.getItem("donate-theme");
  } catch {
    /* Storage is optional. */
  }
  if (!preference) applyTheme(matches);
});
for (const button of document.querySelectorAll("[data-copy]")) {
  button.addEventListener("click", async () => {
    const panel = button.closest(".wallet");
    const address = panel.querySelector("textarea");
    const status = panel.querySelector('[role="status"]');
    button.disabled = true;
    try {
      await navigator.clipboard.writeText(address.value);
      status.textContent = button.dataset.success;
    } catch {
      address.focus();
      address.select();
      status.textContent = button.dataset.error;
    } finally {
      button.disabled = false;
    }
  });
}
