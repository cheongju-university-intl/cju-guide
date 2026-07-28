(() => {
  const iconSprite = "assets/icons/lucide.svg";
  const iconMap = {
    "arrow-up": "arrow-up", bars: "menu", bell: "bell", book: "book-open", bullhorn: "megaphone",
    "bus-alt": "bus-front", "calendar-alt": "calendar-days", "calendar-check": "calendar-check",
    "chalkboard-teacher": "presentation", check: "check", "check-circle": "circle-check", clock: "clock-3",
    compass: "compass", desktop: "monitor", download: "download", exclamation: "circle-alert",
    "exclamation-circle": "circle-alert", "exclamation-triangle": "triangle-alert", "external-link-alt": "external-link",
    "file-excel": "sheet", filter: "list-filter", "graduation-cap": "graduation-cap", "hand-point-right": "move-right",
    home: "house", "hourglass-half": "hourglass", "id-card": "id-card", images: "images", "info-circle": "info",
    key: "key-round", language: "languages", "laptop-code": "monitor-cog", "layer-group": "layers-3",
    "map-marked-alt": "map", "map-marker-alt": "map-pin", "mouse-pointer": "mouse-pointer-click",
    "pen-fancy": "pen-line", phone: "phone", "phone-alt": "phone", print: "printer", qq: "message-circle",
    search: "search", "search-plus": "zoom-in", table: "table-properties", times: "x",
    "triangle-exclamation": "triangle-alert", university: "university", "user-edit": "user-round-pen",
    users: "users", video: "video", "window-restore": "panels-top-left"
  };

  const menuButton = document.getElementById("mobile-menu-btn");
  const menu = document.getElementById("mobile-menu");
  const overlay = document.getElementById("mobile-menu-overlay");
  const backToTopButton = document.getElementById("back-to-top");
  const modal = document.getElementById("image-modal");
  const modalImage = document.getElementById("modal-img");
  const modalCaption = document.getElementById("modal-caption");
  const modalClose = document.querySelector(".close-modal");
  const guideSearch = document.getElementById("guide-search");
  const guideSearchResults = document.getElementById("guide-search-results");
  const mobileCurrent = document.getElementById("mobile-current-chapter");
  const guideSections = Array.from(document.querySelectorAll("main section[id]"));
  const navLinks = Array.from(document.querySelectorAll("#desktop-nav a[href^='#']"));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scrollBehavior = reduceMotion ? "auto" : "smooth";
  let lastFocusedElement = null;
  let toastTimer = 0;
  let chapterNavigator = null;

  function makeIcon(name, className = "") {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.classList.add("lucide-icon");
    className.split(/\s+/).filter(Boolean).forEach((item) => svg.classList.add(item));
    svg.setAttribute("aria-hidden", "true");
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", `${iconSprite}#${name}`);
    svg.append(use);
    return svg;
  }

  function replaceLegacyIcons(root = document) {
    root.querySelectorAll("i[class*='fa-']").forEach((icon) => {
      const legacyName = Array.from(icon.classList).find((name) => name.startsWith("fa-") && !["fas", "far", "fab"].includes(name))?.slice(3);
      const utilityClasses = Array.from(icon.classList).filter((name) => !name.startsWith("fa") && name !== "fas" && name !== "far" && name !== "fab").join(" ");
      icon.replaceWith(makeIcon(iconMap[legacyName] || "circle", utilityClasses));
    });
  }

  function stripLegacyColorClasses(element) {
    const patterns = /^(bg-|text-(red|yellow|green|purple|indigo|blue|white)|border-(red|yellow|green|purple|indigo|blue)|from-|to-|hover:bg-|hover:text-|shadow-(lg|xl)|rounded-full|transform$|hover:-translate)/;
    Array.from(element.classList).forEach((name) => { if (patterns.test(name)) element.classList.remove(name); });
  }

  function normalizeInternalComponents() {
    guideSections.forEach((section) => {
      let card = section.querySelector(":scope > .section-card");
      if (!card && section.children.length === 1 && section.firstElementChild?.tagName === "DIV") card = section.firstElementChild;
      if (!card) {
        card = document.createElement("div");
        while (section.firstChild) card.append(section.firstChild);
        section.append(card);
      }
      card.classList.add("section-card");
      stripLegacyColorClasses(card);

      section.querySelectorAll("[class*='bg-red-'], [class*='border-red-']").forEach((item) => { stripLegacyColorClasses(item); item.classList.add("danger-callout"); });
      section.querySelectorAll("[class*='bg-yellow-'], [class*='border-yellow-']").forEach((item) => { stripLegacyColorClasses(item); item.classList.add("warning-callout"); });
      section.querySelectorAll("[class*='bg-blue-'], [class*='bg-indigo-'], [class*='border-blue-'], [class*='border-indigo-']").forEach((item) => {
        if (item.closest(".danger-callout, .warning-callout") || item.matches("a, button")) return;
        stripLegacyColorClasses(item); item.classList.add("information-callout");
      });
      section.querySelectorAll("ol").forEach((list) => list.classList.add("step-list"));
      section.querySelectorAll("table").forEach((table) => table.classList.add("data-table"));
      section.querySelectorAll("a[target='_blank']").forEach((link) => { stripLegacyColorClasses(link); link.classList.add("external-link-button"); });
      section.querySelectorAll("a[download]").forEach((link) => { stripLegacyColorClasses(link); link.classList.add("download-card"); });
      section.querySelectorAll("img.content-img").forEach((image) => {
        image.loading = "lazy"; image.decoding = "async"; image.tabIndex = 0; image.setAttribute("role", "button");
        image.setAttribute("aria-label", `放大查看：${image.alt || "指南截图"}`);
        const holder = image.parentElement;
        if (holder && holder !== card) holder.classList.add("screenshot-figure");
        image.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openModal(image); }
        });
      });
      if (section.id === "contact") section.querySelectorAll(".grid > div").forEach((item) => item.classList.add("contact-card"));
    });
  }

  function simplifyPageChrome() {
    document.querySelectorAll(".guide-rail, .guide-command-strip, .guide-shortcuts, .guide-context-panel").forEach((item) => item.remove());
    const year = document.getElementById("guide-current-year");
    if (year) year.textContent = String(new Date().getFullYear());
  }

  function setScrollLock(locked) { document.body.classList.toggle("is-locked", locked); }
  function openMenu() {
    if (!menu || !overlay) return;
    lastFocusedElement = document.activeElement;
    menu.classList.remove("hidden"); overlay.classList.remove("hidden"); menu.setAttribute("aria-hidden", "false");
    menuButton?.setAttribute("aria-expanded", "true"); setScrollLock(true);
    requestAnimationFrame(() => { menu.classList.remove("translate-x-full"); menu.querySelector("a, button")?.focus(); });
  }
  function closeMenu({ restoreFocus = true } = {}) {
    if (!menu || !overlay || menu.classList.contains("hidden")) return;
    menu.classList.add("translate-x-full"); menu.setAttribute("aria-hidden", "true"); menuButton?.setAttribute("aria-expanded", "false");
    window.setTimeout(() => { menu.classList.add("hidden"); overlay.classList.add("hidden"); setScrollLock(modal?.classList.contains("is-open")); if (restoreFocus) lastFocusedElement?.focus(); }, reduceMotion ? 0 : 180);
  }
  window.toggleMenu = () => menu?.classList.contains("hidden") ? openMenu() : closeMenu();

  function openModal(image) {
    if (!modal || !modalImage || !modalCaption) return;
    lastFocusedElement = document.activeElement; modalImage.src = image.currentSrc || image.src; modalImage.alt = image.alt || "指南截图预览";
    modalCaption.textContent = image.alt || "查看图片"; modal.classList.add("is-open"); modal.setAttribute("aria-hidden", "false");
    if (modalClose) modalClose.tabIndex = 0; setScrollLock(true); modalClose?.focus();
  }
  function closeModal() {
    if (!modal?.classList.contains("is-open")) return;
    modal.classList.remove("is-open"); modal.setAttribute("aria-hidden", "true"); if (modalClose) modalClose.tabIndex = -1;
    setScrollLock(false); lastFocusedElement?.focus();
  }
  window.openModal = openModal; window.closeModal = closeModal;

  function showToast(message) {
    let toast = document.querySelector(".site-toast");
    if (!toast) { toast = document.createElement("div"); toast.className = "site-toast"; toast.setAttribute("role", "status"); toast.setAttribute("aria-live", "polite"); document.body.append(toast); }
    toast.textContent = message; toast.classList.add("show"); window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 1800);
  }

  const searchableSections = guideSections.map((section) => {
    const title = section.querySelector("h3, h2")?.textContent?.trim() || section.id;
    return { id: section.id, title, text: `${title} ${section.id} ${section.textContent}`.toLocaleLowerCase("zh-CN") };
  });
  function renderSearchResults(value) {
    if (!guideSearchResults) return;
    const keyword = value.trim().toLocaleLowerCase("zh-CN");
    if (!keyword) { guideSearchResults.replaceChildren(); guideSearchResults.classList.remove("show"); return; }
    const matches = searchableSections.filter((section) => section.text.includes(keyword)).slice(0, 7);
    guideSearchResults.replaceChildren();
    if (!matches.length) { const empty = document.createElement("p"); empty.textContent = "没有找到匹配内容，请尝试更短的关键词。"; guideSearchResults.append(empty); }
    else matches.forEach((section) => { const link = document.createElement("a"); link.href = `#${section.id}`; link.append(makeIcon("arrow-right"), document.createTextNode(section.title)); guideSearchResults.append(link); });
    guideSearchResults.classList.add("show");
  }

  function activeSectionIndex() {
    const marker = window.scrollY + (window.innerWidth < 1024 ? 112 : 96);
    let index = 0; guideSections.forEach((section, itemIndex) => { if (section.offsetTop <= marker) index = itemIndex; }); return index;
  }
  function createChapterNavigator() {
    const intro = document.querySelector(".guide-intro"); if (!intro) return;
    chapterNavigator = document.createElement("nav"); chapterNavigator.className = "guide-chapter-nav"; chapterNavigator.setAttribute("aria-label", "上一章节和下一章节");
    chapterNavigator.innerHTML = '<a class="chapter-prev"><span>上一章节</span><strong></strong></a><span class="chapter-position"></span><a class="chapter-next"><span>下一章节</span><strong></strong></a>';
    intro.after(chapterNavigator);
  }
  function updateActiveNavigation() {
    const index = activeSectionIndex(); const current = guideSections[index]; if (!current) return;
    navLinks.forEach((link) => { const active = link.getAttribute("href") === `#${current.id}`; link.classList.toggle("active", active); active ? link.setAttribute("aria-current", "location") : link.removeAttribute("aria-current"); });
    const title = searchableSections[index]?.title || "指南目录"; if (mobileCurrent) mobileCurrent.textContent = title;
    if (chapterNavigator) {
      const prev = chapterNavigator.querySelector(".chapter-prev"); const next = chapterNavigator.querySelector(".chapter-next");
      const prevSection = searchableSections[index - 1]; const nextSection = searchableSections[index + 1];
      prev.hidden = !prevSection; next.hidden = !nextSection;
      if (prevSection) { prev.href = `#${prevSection.id}`; prev.querySelector("strong").textContent = prevSection.title; }
      if (nextSection) { next.href = `#${nextSection.id}`; next.querySelector("strong").textContent = nextSection.title; }
      chapterNavigator.querySelector(".chapter-position").textContent = `${index + 1} / ${guideSections.length}`;
    }
    backToTopButton?.classList.toggle("show", window.scrollY > 500);
  }
  function scrollToHashTarget(behavior = scrollBehavior) {
    if (!window.location.hash) return; const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1))); if (!target) return;
    const offset = window.innerWidth < 1024 ? 150 : 94; window.scrollTo({ top: Math.max(0, target.getBoundingClientRect().top + window.scrollY - offset), behavior }); updateActiveNavigation();
  }
  async function copySectionLink(section) {
    const url = new URL(window.location.href); url.hash = section.id;
    try { await navigator.clipboard.writeText(url.href); showToast("章节链接已复制"); }
    catch { window.location.hash = section.id; showToast("已定位到当前章节，可复制浏览器地址"); }
  }
  function addSectionTools() {
    guideSections.forEach((section) => {
      const card = section.querySelector(":scope > .section-card"); if (!card || card.querySelector(".section-tools")) return;
      const tools = document.createElement("div"); tools.className = "section-tools"; const button = document.createElement("button"); button.type = "button"; button.className = "copy-section-link";
      button.append(makeIcon("link")); const label = document.createElement("span"); label.textContent = "复制本节链接"; button.append(label);
      button.addEventListener("click", () => copySectionLink(section)); tools.append(button); card.insertBefore(tools, card.children[1] || null);
    });
  }
  function handleDocumentClick(event) {
    const anchor = event.target.closest("a[href^='#']"); if (!anchor) return; const targetId = decodeURIComponent(anchor.getAttribute("href").slice(1)); const target = document.getElementById(targetId); if (!target) return;
    event.preventDefault(); history.pushState(null, "", `#${targetId}`); closeMenu({ restoreFocus: false }); renderSearchResults(""); if (guideSearch) guideSearch.value = ""; requestAnimationFrame(() => scrollToHashTarget());
  }

  simplifyPageChrome(); normalizeInternalComponents(); replaceLegacyIcons(); createChapterNavigator(); addSectionTools();
  menuButton?.setAttribute("aria-expanded", "false"); menuButton?.setAttribute("aria-controls", "mobile-menu"); menu?.setAttribute("aria-hidden", "true");
  menuButton?.addEventListener("click", window.toggleMenu); overlay?.addEventListener("click", () => closeMenu());
  modalClose?.setAttribute("tabindex", "-1"); modalClose?.addEventListener("click", (event) => { event.stopPropagation(); closeModal(); });
  modal?.addEventListener("click", (event) => { if (event.target === modal) closeModal(); }); modalImage?.addEventListener("click", (event) => event.stopPropagation());
  backToTopButton?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: scrollBehavior }));
  guideSearch?.addEventListener("input", () => renderSearchResults(guideSearch.value)); document.addEventListener("click", handleDocumentClick);
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") { if (modal?.classList.contains("is-open")) closeModal(); else closeMenu(); renderSearchResults(""); } });
  window.addEventListener("scroll", updateActiveNavigation, { passive: true }); window.addEventListener("hashchange", () => requestAnimationFrame(() => scrollToHashTarget()));
  window.addEventListener("load", () => {
    if (!window.location.hash) return;
    scrollToHashTarget("auto");
    window.setTimeout(() => scrollToHashTarget("auto"), 220);
    if ("ResizeObserver" in window) {
      let preserveAnchor = true;
      const stopPreserving = () => { preserveAnchor = false; };
      const observer = new ResizeObserver(() => {
        if (preserveAnchor) requestAnimationFrame(() => scrollToHashTarget("auto"));
      });
      observer.observe(document.querySelector("main"));
      window.addEventListener("wheel", stopPreserving, { once: true, passive: true });
      window.addEventListener("touchstart", stopPreserving, { once: true, passive: true });
      window.setTimeout(() => { preserveAnchor = false; observer.disconnect(); }, 3500);
    }
  });
  updateActiveNavigation();
})();
