(() => {
  const year = document.getElementById("current-year");
  if (year) year.textContent = String(new Date().getFullYear());

  const menuButton = document.querySelector(".portal-menu-button");
  const menu = document.getElementById("portal-mobile-nav");

  const setMenuOpen = (open) => {
    if (!menuButton || !menu) return;
    menu.hidden = !open;
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "关闭导航菜单" : "打开导航菜单");
    const use = menuButton.querySelector("use");
    if (use) {
      use.setAttribute(
        "href",
        open ? "assets/icons/lucide.svg#x" : "assets/icons/lucide.svg#menu",
      );
    }
  };

  menuButton?.addEventListener("click", () => {
    setMenuOpen(menuButton.getAttribute("aria-expanded") !== "true");
  });

  menu?.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenuOpen(false);
  });

  const modal = document.querySelector(".course-image-modal");
  const modalImage = modal?.querySelector("img");
  const modalCaption = modal?.querySelector("p");
  const closeButton = modal?.querySelector(".course-modal-close");
  let lastTrigger = null;

  const closeModal = () => {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
    lastTrigger?.focus();
  };

  document.querySelectorAll(".course-image-button").forEach((button) => {
    button.addEventListener("click", () => {
      const image = button.querySelector("img");
      if (!modal || !modalImage || !modalCaption || !image) return;
      lastTrigger = button;
      modalImage.src = image.currentSrc || image.src;
      modalImage.alt = image.alt;
      modalCaption.textContent = image.alt;
      modal.hidden = false;
      document.body.style.overflow = "hidden";
      closeButton?.focus();
    });
  });

  closeButton?.addEventListener("click", closeModal);
  modal?.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal && !modal.hidden) closeModal();
  });
})();
