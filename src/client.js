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
    localStorage.setItem("about-theme", dark ? "dark" : "light");
  } catch {
    /* Storage is optional. */
  }
});
mode.addEventListener("change", ({ matches }) => {
  let preference;
  try {
    preference = localStorage.getItem("about-theme");
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

for (const link of document.querySelectorAll("[data-language]")) {
  link.addEventListener("click", () => {
    let saved = false;
    try {
      localStorage.setItem("about-language", link.dataset.language);
      saved = localStorage.getItem("about-language") === link.dataset.language;
    } catch {
      /* An explicit URL choice still works. */
    }
    const url = new URL(link.href);
    url.search = location.search;
    url.hash = location.hash;
    if (link.dataset.language === "ru" && !saved)
      url.searchParams.set("lang", "ru");
    else if (url.searchParams.get("lang") === "ru")
      url.searchParams.delete("lang");
    link.href = url.href;
  });
}
for (const menu of document.querySelectorAll(".language-menu")) {
  menu.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      menu.open = false;
      menu.querySelector("summary").focus();
    }
  });
  document.addEventListener("click", (event) => {
    if (!menu.contains(event.target)) menu.open = false;
  });
}
