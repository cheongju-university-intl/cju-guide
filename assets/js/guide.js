(() => {
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
  const guideSections = Array.from(
    document.querySelectorAll("main section[id]"),
  );
  const navLinks = Array.from(
    document.querySelectorAll("#desktop-nav a[href^='#']"),
  );
  let lastFocusedElement = null;
  let toastTimer = 0;

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const scrollBehavior = reduceMotion ? "auto" : "smooth";

  function setScrollLock(locked) {
    document.body.classList.toggle("is-locked", locked);
  }

  function openMenu() {
    if (!menu || !overlay) return;
    lastFocusedElement = document.activeElement;
    menu.classList.remove("hidden");
    overlay.classList.remove("hidden");
    menu.setAttribute("aria-hidden", "false");
    menuButton?.setAttribute("aria-expanded", "true");
    setScrollLock(true);
    requestAnimationFrame(() => {
      menu.classList.remove("translate-x-full");
      menu.querySelector("a, button")?.focus();
    });
  }

  function closeMenu({ restoreFocus = true } = {}) {
    if (!menu || !overlay || menu.classList.contains("hidden")) return;
    menu.classList.add("translate-x-full");
    menu.setAttribute("aria-hidden", "true");
    menuButton?.setAttribute("aria-expanded", "false");
    window.setTimeout(
      () => {
        menu.classList.add("hidden");
        overlay.classList.add("hidden");
        setScrollLock(modal?.classList.contains("is-open"));
        if (restoreFocus) lastFocusedElement?.focus();
      },
      reduceMotion ? 0 : 180,
    );
  }

  window.toggleMenu = () => {
    if (menu?.classList.contains("hidden")) openMenu();
    else closeMenu();
  };

  function openModal(image) {
    if (!modal || !modalImage || !modalCaption) return;
    lastFocusedElement = document.activeElement;
    modalImage.src = image.currentSrc || image.src;
    modalImage.alt = image.alt || "指南截图预览";
    modalCaption.textContent = image.alt || "查看图片";
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    if (modalClose) modalClose.tabIndex = 0;
    setScrollLock(true);
    modalClose?.focus();
  }

  function closeModal() {
    if (!modal?.classList.contains("is-open")) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    if (modalClose) modalClose.tabIndex = -1;
    setScrollLock(false);
    lastFocusedElement?.focus();
  }

  window.openModal = openModal;
  window.closeModal = closeModal;

  function showToast(message) {
    let toast = document.querySelector(".site-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "site-toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.append(toast);
    }
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 1800);
  }

  const searchableSections = guideSections.map((section) => {
    const title =
      section.querySelector("h3, h2")?.textContent?.trim() || section.id;
    return {
      id: section.id,
      title,
      text: `${title} ${section.id} ${section.textContent}`.toLocaleLowerCase(
        "zh-CN",
      ),
    };
  });

  function renderSearchResults(value) {
    if (!guideSearchResults) return;
    const keyword = value.trim().toLocaleLowerCase("zh-CN");
    if (!keyword) {
      guideSearchResults.replaceChildren();
      guideSearchResults.classList.remove("show");
      return;
    }

    const matches = searchableSections
      .filter((section) => section.text.includes(keyword))
      .sort(
        (a, b) =>
          Number(b.title.toLocaleLowerCase("zh-CN").includes(keyword)) -
          Number(a.title.toLocaleLowerCase("zh-CN").includes(keyword)),
      )
      .slice(0, 7);

    guideSearchResults.replaceChildren();
    if (!matches.length) {
      const empty = document.createElement("p");
      empty.textContent = "没有找到匹配内容，请尝试更短的关键词。";
      guideSearchResults.append(empty);
    } else {
      matches.forEach((section) => {
        const link = document.createElement("a");
        link.href = `#${section.id}`;
        link.innerHTML =
          '<i class="fas fa-arrow-right" aria-hidden="true"></i>';
        link.append(document.createTextNode(section.title));
        guideSearchResults.append(link);
      });
    }
    guideSearchResults.classList.add("show");
  }

  function activeSectionId() {
    const marker = window.scrollY + (window.innerWidth < 1024 ? 120 : 90);
    let current = guideSections[0]?.id || "";
    guideSections.forEach((section) => {
      if (section.offsetTop <= marker) current = section.id;
    });
    return current;
  }

  function updateActiveNavigation() {
    const current = activeSectionId();
    navLinks.forEach((link) => {
      const active = link.getAttribute("href") === `#${current}`;
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
    backToTopButton?.classList.toggle("show", window.scrollY > 500);
  }

  function scrollToHashTarget(behavior = scrollBehavior) {
    if (!window.location.hash) return;
    const id = decodeURIComponent(window.location.hash.slice(1));
    const target = document.getElementById(id);
    if (!target) return;
    const offset = window.innerWidth < 1024 ? 82 : 24;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: Math.max(0, top), behavior });
    updateActiveNavigation();
  }

  async function copySectionLink(section) {
    const url = new URL(window.location.href);
    url.hash = section.id;
    try {
      await navigator.clipboard.writeText(url.href);
      showToast("章节链接已复制");
    } catch {
      window.location.hash = section.id;
      showToast("已定位到当前章节，可复制浏览器地址");
    }
  }

  function addSectionTools() {
    guideSections.forEach((section) => {
      section.querySelectorAll("img.content-img").forEach((image) => {
        image.loading = "lazy";
        image.decoding = "async";
        image.tabIndex = 0;
        image.setAttribute("role", "button");
        image.setAttribute(
          "aria-label",
          `放大查看：${image.alt || "指南截图"}`,
        );
        image.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openModal(image);
          }
        });
      });

      let card = section.querySelector(":scope > .section-card");
      if (!card) {
        if (
          section.children.length === 1 &&
          section.firstElementChild?.tagName === "DIV"
        ) {
          card = section.firstElementChild;
        } else {
          card = document.createElement("div");
          while (section.firstChild) card.append(section.firstChild);
          section.append(card);
        }
        card.classList.add("section-card");
        card.classList.remove(
          "bg-gradient-to-r",
          "from-purple-600",
          "to-indigo-600",
          "text-white",
        );
      }
      if (card.querySelector(".section-tools")) return;
      const tools = document.createElement("div");
      tools.className = "section-tools";
      const button = document.createElement("button");
      button.type = "button";
      button.className = "copy-section-link";
      button.innerHTML =
        '<i class="fas fa-link" aria-hidden="true"></i><span>复制本节链接</span>';
      button.setAttribute(
        "aria-label",
        `复制“${section.querySelector("h3")?.textContent?.trim() || section.id}”章节链接`,
      );
      button.addEventListener("click", () => copySectionLink(section));
      tools.append(button);
      card.insertBefore(tools, card.children[1] || null);
    });
  }

  function addPager() {
    const main = document.querySelector(".guide-content-grid > main");
    if (!main || !guideSections.length || main.querySelector(".guide-pager"))
      return;
    const pager = document.createElement("nav");
    pager.className = "guide-pager";
    pager.setAttribute("aria-label", "章节辅助导航");
    pager.innerHTML = `
      <a href="#${guideSections[guideSections.length - 2]?.id || guideSections[0].id}"><i class="fas fa-arrow-left" aria-hidden="true"></i><span>上一章节</span></a>
      <a class="guide-home-link" href="index.html"><i class="fas fa-home" aria-hidden="true"></i><span>返回首页</span></a>
      <a href="#${guideSections[guideSections.length - 1].id}"><span>最后章节</span><i class="fas fa-arrow-right" aria-hidden="true"></i></a>`;
    main.append(pager);
  }

  function handleDocumentClick(event) {
    const anchor = event.target.closest("a[href^='#']");
    if (anchor) {
      const targetId = decodeURIComponent(anchor.getAttribute("href").slice(1));
      const target = document.getElementById(targetId);
      if (target) {
        event.preventDefault();
        history.pushState(null, "", `#${targetId}`);
        closeMenu({ restoreFocus: false });
        renderSearchResults("");
        if (guideSearch) guideSearch.value = "";
        requestAnimationFrame(() => scrollToHashTarget());
      }
    }
  }

  menuButton?.setAttribute("aria-expanded", "false");
  menuButton?.setAttribute("aria-controls", "mobile-menu");
  menu?.setAttribute("aria-hidden", "true");
  menuButton?.addEventListener("click", window.toggleMenu);
  overlay?.addEventListener("click", () => closeMenu());
  modalClose?.setAttribute("role", "button");
  modalClose?.setAttribute("tabindex", "0");
  modalClose?.setAttribute("aria-label", "关闭图片预览");
  modalClose?.addEventListener("click", (event) => {
    event.stopPropagation();
    closeModal();
  });
  modalClose?.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") closeModal();
  });
  modal?.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });
  modalImage?.addEventListener("click", (event) => event.stopPropagation());
  backToTopButton?.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: scrollBehavior }),
  );
  guideSearch?.addEventListener("input", () =>
    renderSearchResults(guideSearch.value),
  );
  document.addEventListener("click", handleDocumentClick);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (modal?.classList.contains("is-open")) closeModal();
      else closeMenu();
      renderSearchResults("");
    }
  });
  window.addEventListener("scroll", updateActiveNavigation, { passive: true });
  window.addEventListener("hashchange", () =>
    requestAnimationFrame(() => scrollToHashTarget()),
  );
  window.addEventListener("load", () => {
    if (window.location.hash) {
      scrollToHashTarget("auto");
      window.setTimeout(() => scrollToHashTarget("auto"), 220);

      // Screenshots above a deep-linked section change document height as they load.
      // Keep the requested section anchored until the initial layout settles.
      if ("ResizeObserver" in window) {
        let preserveAnchor = true;
        const stopPreserving = () => {
          preserveAnchor = false;
        };
        const observer = new ResizeObserver(() => {
          if (preserveAnchor)
            requestAnimationFrame(() => scrollToHashTarget("auto"));
        });
        observer.observe(document.querySelector("main"));
        window.addEventListener("wheel", stopPreserving, {
          once: true,
          passive: true,
        });
        window.addEventListener("touchstart", stopPreserving, {
          once: true,
          passive: true,
        });
        window.setTimeout(() => {
          preserveAnchor = false;
          observer.disconnect();
        }, 3500);
      }
    }
  });

  addSectionTools();
  addPager();
  updateActiveNavigation();
})();
