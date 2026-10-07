const reader = document.querySelector("[data-talk-reader]");
if (reader) {
  const slides = [...reader.querySelectorAll("[data-slide]")];
  const controls = reader.querySelector("[data-reader-controls]");
  const previous = reader.querySelector("[data-reader-prev]");
  const next = reader.querySelector("[data-reader-next]");
  const select = reader.querySelector("[data-reader-select]");
  const status = reader.querySelector("[data-reader-status]");
  const layouts = [...reader.querySelectorAll('input[name="reader-layout"]')];
  try {
    const saved = localStorage.getItem("about-talk-layout");
    const choice = layouts.find((input) => input.value === saved);
    if (choice) choice.checked = true;
  } catch {}
  layouts.forEach((input) =>
    input.addEventListener("change", () => {
      if (!input.checked) return;
      try {
        localStorage.setItem("about-talk-layout", input.value);
      } catch {}
    }),
  );
  reader.querySelectorAll("[data-image-view]").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
        return;
      event.preventDefault();
      const wide = layouts.find((input) => input.value === "wide");
      wide.checked = true;
      wide.dispatchEvent(new Event("change", { bubbles: true }));
      link
        .closest("[data-slide]")
        .scrollIntoView({ block: "start", behavior: "instant" });
    });
  });
  let selected = 0;
  function indexFromHash() {
    const match = location.hash.match(/^#slide-(\d+)$/);
    if (!match) return null;
    const index = Number(match[1]) - 1;
    return index >= 0 && index < slides.length ? index : null;
  }
  function show(index, updateHash = false, announce = true) {
    selected = Math.max(0, Math.min(index, slides.length - 1));
    slides.forEach((slide, i) => {
      slide.hidden = i !== selected;
    });
    slides[selected].querySelector("img").loading = "eager";
    previous.disabled = selected === 0;
    next.disabled = selected === slides.length - 1;
    select.value = String(selected);
    if (updateHash) history.replaceState(null, "", "#slide-" + (selected + 1));
    if (announce)
      status.textContent = reader.dataset.slideStatus
        .replace("{current}", selected + 1)
        .replace("{total}", slides.length)
        .replace(
          "{title}",
          slides[selected]
            .querySelector("h2")
            .textContent.replace(/^\d+ \/ \d+/, ""),
        );
  }
  previous.addEventListener("click", () => show(selected - 1, true));
  next.addEventListener("click", () => show(selected + 1, true));
  select.addEventListener("change", () => show(Number(select.value), true));
  controls.addEventListener("keydown", (event) => {
    if (event.target.closest("select, input, textarea")) return;
    if (event.key === "ArrowLeft" && selected > 0) {
      event.preventDefault();
      show(selected - 1, true);
    }
    if (event.key === "ArrowRight" && selected < slides.length - 1) {
      event.preventDefault();
      show(selected + 1, true);
    }
  });
  window.addEventListener("hashchange", () => {
    const index = indexFromHash();
    if (index !== null) {
      show(index);
      slides[index].scrollIntoView({ block: "start", behavior: "instant" });
    }
  });
  controls.hidden = false;
  const initial = indexFromHash();
  show(initial ?? 0, false, false);
  if (initial !== null)
    slides[initial].scrollIntoView({ block: "start", behavior: "instant" });
}
