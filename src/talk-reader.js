const reader = document.querySelector("[data-talk-reader]");
if (reader) {
  const slides = [...reader.querySelectorAll("[data-slide]")];
  const controls = reader.querySelector("[data-reader-controls]");
  const previous = reader.querySelector("[data-reader-prev]");
  const next = reader.querySelector("[data-reader-next]");
  const select = reader.querySelector("[data-reader-select]");
  const status = reader.querySelector("[data-reader-status]");
  const layouts = [...reader.querySelectorAll('input[name="reader-layout"]')];
  const toolbar = reader.querySelector(".reader-toolbar");
  const presentation = document.querySelector(".presentation-view");
  const usePresentation =
    presentation && typeof presentation.showModal === "function";
  if (usePresentation) document.body.classList.add("presentation-enhanced");
  let selected = 0;
  let observedHeading;
  function fitSlide() {
    for (const [name, element] of [
      ["--reader-toolbar-height", toolbar],
      ["--reader-heading-height", slides[selected].querySelector("h2")],
    ]) {
      const value = Math.ceil(element.getBoundingClientRect().height) + "px";
      if (reader.style.getPropertyValue(name) !== value)
        reader.style.setProperty(name, value);
    }
  }
  const sizeObserver =
    typeof ResizeObserver === "function" ? new ResizeObserver(fitSlide) : null;
  sizeObserver?.observe(toolbar);
  window.addEventListener("resize", () => {
    fitSlide();
    if (layouts.find((input) => input.value === "wide").checked)
      slides[selected].scrollIntoView({ block: "start", behavior: "instant" });
  });
  try {
    const saved = localStorage.getItem("about-talk-layout");
    const choice = layouts.find((input) => input.value === saved);
    if (choice && !usePresentation) choice.checked = true;
  } catch {}
  layouts.forEach((input) =>
    input.addEventListener("change", () => {
      if (!input.checked) return;
      if (usePresentation && input.value === "wide") {
        renderPresentation();
        if (!presentation.open) presentation.showModal();
      } else {
        fitSlide();
        slides[selected].scrollIntoView({
          block: "start",
          behavior: "instant",
        });
      }
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
      if (!usePresentation)
        link
          .closest("[data-slide]")
          .scrollIntoView({ block: "start", behavior: "instant" });
    });
  });
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
    if (observedHeading) sizeObserver?.unobserve(observedHeading);
    observedHeading = slides[selected].querySelector("h2");
    sizeObserver?.observe(observedHeading);
    fitSlide();
    if (
      updateHash &&
      !presentation?.open &&
      layouts.find((input) => input.value === "wide").checked
    )
      slides[selected].scrollIntoView({ block: "start", behavior: "instant" });
    previous.disabled = selected === 0;
    next.disabled = selected === slides.length - 1;
    select.value = String(selected);
    if (presentation?.open) renderPresentation();
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
  function renderPresentation() {
    const slide = slides[selected];
    const image = slide.querySelector("img");
    const fullImage = presentation.querySelector("img");
    fullImage.src = image.src;
    fullImage.alt = image.alt;
    presentation.querySelector("[data-presentation-title]").textContent =
      `${selected + 1} / ${slides.length} · ${slide.querySelector("h2").lastChild.textContent}`;
    const text = presentation.querySelector("[data-presentation-text]");
    text.replaceChildren(
      ...[...slide.querySelector(".talk-text").children]
        .filter((node) => node.tagName !== "H3")
        .map((node) => node.cloneNode(true)),
    );
    presentation.querySelector(".presentation-text").scrollTop = 0;
    presentation.querySelector("[data-presentation-prev]").disabled =
      selected === 0;
    presentation.querySelector("[data-presentation-next]").disabled =
      selected === slides.length - 1;
    presentation.querySelector("[data-presentation-slide]").disabled =
      selected === slides.length - 1;
  }
  if (usePresentation) {
    presentation
      .querySelector("[data-presentation-prev]")
      .addEventListener("click", () => show(selected - 1, true));
    presentation
      .querySelector("[data-presentation-next]")
      .addEventListener("click", () => show(selected + 1, true));
    presentation
      .querySelector("[data-presentation-slide]")
      .addEventListener("click", () => show(selected + 1, true));
    document.addEventListener("keydown", (event) => {
      if (
        !presentation.open ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.target.closest("input, select, textarea")
      )
        return;
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        const target = selected + (event.key === "ArrowLeft" ? -1 : 1);
        if (target >= 0 && target < slides.length) show(target, true);
      }
    });
    presentation.addEventListener("close", () => {
      layouts.find((input) => input.value === "side").checked = true;
      try {
        localStorage.setItem("about-talk-layout", "side");
      } catch {}
      fitSlide();
      slides[selected].scrollIntoView({ block: "start", behavior: "instant" });
      slides[selected]
        .querySelector("[data-image-view]")
        .focus({ preventScroll: true });
    });
  }
  controls.hidden = false;
  const initial = indexFromHash();
  show(initial ?? 0, false, false);
  if (initial !== null)
    slides[initial].scrollIntoView({ block: "start", behavior: "instant" });
}

const gallery = document.querySelector(".talk-gallery");
const photoViewer = document.querySelector(".photo-view");
if (gallery && photoViewer && typeof photoViewer.showModal === "function") {
  const photos = [...gallery.querySelectorAll("a")];
  const image = photoViewer.querySelector("img");
  const caption = photoViewer.querySelector("[data-photo-caption]");
  const status = photoViewer.querySelector("[data-photo-status]");
  let selectedPhoto = 0;
  let opener;
  function showPhoto(index) {
    selectedPhoto = (index + photos.length) % photos.length;
    const link = photos[selectedPhoto];
    const thumbnail = link.querySelector("img");
    image.src = link.href;
    image.alt = thumbnail.alt;
    caption.textContent = thumbnail.alt;
    status.textContent = photoViewer.dataset.photoStatusLabel
      .replace("{current}", selectedPhoto + 1)
      .replace("{total}", photos.length);
    for (const button of photoViewer.querySelectorAll(
      "[data-photo-prev], [data-photo-next]",
    ))
      button.disabled = photos.length < 2;
  }
  photos.forEach((link, index) => {
    link.addEventListener("click", (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
        return;
      event.preventDefault();
      opener = link;
      showPhoto(index);
      photoViewer.showModal();
    });
  });
  photoViewer
    .querySelector("[data-photo-prev]")
    .addEventListener("click", () => showPhoto(selectedPhoto - 1));
  for (const button of photoViewer.querySelectorAll("[data-photo-next]"))
    button.addEventListener("click", () => showPhoto(selectedPhoto + 1));
  photoViewer.addEventListener("keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || photos.length < 2)
      return;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      showPhoto(selectedPhoto + (event.key === "ArrowLeft" ? -1 : 1));
    }
  });
  photoViewer.addEventListener("close", () =>
    opener?.focus({ preventScroll: true }),
  );
}
if (gallery) {
  if (location.hash === "#photos") gallery.open = true;
  document
    .querySelector('.talk-source-links a[href="#photos"]')
    ?.addEventListener("click", () => {
      gallery.open = true;
    });
}
