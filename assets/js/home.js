(() => {
  const homeSearch = document.getElementById("home-search");
  const globalSearch = document.getElementById("service-global-search");
  const searchForm = document.querySelector(".service-search");
  const cards = Array.from(document.querySelectorAll(".service-guide-card"));
  const emptyMessage = document.querySelector(".home-empty");
  const resultCount = document.getElementById("home-result-count");
  const showAll = document.getElementById("service-show-all");

  if (!homeSearch || !globalSearch || !cards.length) return;

  const normalize = (value) => value.trim().toLocaleLowerCase("zh-CN");

  function applySearch(value) {
    const keyword = normalize(value);
    let visibleCount = 0;
    document.body.classList.toggle("searching-guides", Boolean(keyword));

    cards.forEach((card) => {
      const searchableText = normalize(
        `${card.textContent} ${card.dataset.keywords || ""} ${card.getAttribute("href") || ""}`,
      );
      const visible = !keyword || searchableText.includes(keyword);
      card.hidden = visible === false;
      if (visible) visibleCount += 1;
    });

    emptyMessage.hidden = visibleCount > 0;
    resultCount.textContent = keyword
      ? `${visibleCount} 个结果`
      : `${cards.length} 个指南`;
  }

  [homeSearch, globalSearch].forEach((input) => {
    input.addEventListener("input", () => {
      const otherInput = input === homeSearch ? globalSearch : homeSearch;
      otherInput.value = input.value;
      applySearch(input.value);
    });
  });

  searchForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const firstVisible = cards.find((card) => !card.hidden);
    if (firstVisible) window.location.assign(firstVisible.href);
  });

  showAll?.addEventListener("click", () => {
    const expanded = document.body.classList.toggle("show-all-guides");
    showAll.setAttribute("aria-expanded", String(expanded));
    showAll.innerHTML = expanded
      ? '收起部分指南 <i class="fas fa-chevron-up" aria-hidden="true"></i>'
      : '查看全部 18 个指南分类 <i class="fas fa-chevron-down" aria-hidden="true"></i>';
  });
})();
