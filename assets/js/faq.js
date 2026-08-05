(() => {
  const config = window.studentFaqConfig || { studentFaqItems: [] };
  const itemById = new Map(
    (config.studentFaqItems || []).map((item) => [item.id, item]),
  );
  const year = document.getElementById("current-year");
  if (year) year.textContent = String(new Date().getFullYear());

  document.querySelectorAll("[data-faq-title]").forEach((heading) => {
    const item = itemById.get(heading.dataset.faqTitle);
    if (item) heading.textContent = item.title;
  });
  document
    .querySelectorAll("[data-config='dormMoveInDate']")
    .forEach((node) => {
      node.textContent = config.dormMoveInDate || "日期确定后公布";
    });
  document.querySelectorAll("[data-graduation-report-date]").forEach((node) => {
    node.textContent = config.graduationReportDate
      ? `本学期毕业申报日期：${config.graduationReportDate}`
      : "本学期毕业申报日期确定后公布。";
  });

  const button = document.querySelector(".portal-menu-button");
  const menu = document.getElementById("portal-mobile-nav");
  if (button && menu) {
    const close = () => {
      menu.hidden = true;
      button.setAttribute("aria-expanded", "false");
    };
    button.addEventListener("click", () => {
      const open = menu.hidden;
      menu.hidden = !open;
      button.setAttribute("aria-expanded", String(open));
    });
    menu.addEventListener("click", close);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") close();
    });
  }
})();
