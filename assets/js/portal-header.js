(() => {
  const header = document.querySelector(".portal-header[data-portal-page]");
  if (!header) return;

  const page = header.dataset.portalPage;
  const homeSection = (anchor) => (page === "home" ? anchor : `index.html${anchor}`);
  const current = (name) => (page === name ? ' aria-current="page"' : "");

  const links = [
    { name: "home", href: "index.html", label: "首页" },
    { name: "faq", href: "faq.html", label: "常见问题" },
    { name: "popular", href: homeSection("#popular"), label: "常用办事" },
    {
      name: "course",
      href: "course-registration.html",
      label: "选课教程",
      className: "portal-course-link",
      icon: "mouse-pointer-click",
    },
    { name: "guides", href: homeSection("#all-guides"), label: "全部指南" },
    { name: "notices", href: homeSection("#notices"), label: "重要通知" },
    { name: "contact", href: "guide.html#contact", label: "联系我们" },
  ];

  const renderLink = ({ name, href, label, className = "", icon = "" }) => `
    <a${className ? ` class="${className}"` : ""} href="${href}"${current(name)}>
      ${
        icon
          ? `<svg aria-hidden="true"><use href="assets/icons/lucide.svg#${icon}"></use></svg>`
          : ""
      }
      ${label}
    </a>`;

  const primaryLinks = links.map(renderLink).join("");
  const mobileLinks = `${primaryLinks}${renderLink({
    name: "complete",
    href: "guide.html",
    label: "完整指南",
  })}`;

  header.innerHTML = `
    <div class="portal-container portal-nav">
      <a class="portal-brand" href="index.html" aria-label="返回清州大学国际学生指南首页">
        <span class="portal-brand-mark" aria-hidden="true">
          <svg><use href="assets/icons/lucide.svg#university"></use></svg>
        </span>
        <span>
          <strong>清州大学国际学生指南</strong>
          <small>CJU International Student Guide</small>
        </span>
      </a>
      <nav class="portal-nav-links" aria-label="主导航">${primaryLinks}</nav>
      <a class="portal-nav-action" href="guide.html">
        完整指南
        <svg aria-hidden="true"><use href="assets/icons/lucide.svg#book-open"></use></svg>
      </a>
      <button
        class="portal-menu-button"
        type="button"
        aria-label="打开导航菜单"
        aria-expanded="false"
        aria-controls="portal-mobile-nav"
      >
        <svg aria-hidden="true"><use href="assets/icons/lucide.svg#menu"></use></svg>
      </button>
    </div>
    <nav
      id="portal-mobile-nav"
      class="portal-mobile-nav"
      aria-label="手机端主导航"
      hidden
    >${mobileLinks}</nav>`;
})();
