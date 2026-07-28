(() => {
  const form = document.querySelector(".portal-search");
  const input = document.getElementById("home-search");
  const links = Array.from(document.querySelectorAll("[data-keywords]"));
  const empty = document.getElementById("home-empty");
  const year = document.getElementById("current-year");

  if (year) year.textContent = String(new Date().getFullYear());
  if (!form || !input || !links.length) return;

  const normalize = (value) => value.trim().toLocaleLowerCase("zh-CN");

  function findMatches(value) {
    const keyword = normalize(value);
    return links.filter((link) =>
      normalize(`${link.textContent} ${link.dataset.keywords || ""}`).includes(keyword),
    );
  }

  input.addEventListener("input", () => {
    const keyword = normalize(input.value);
    const matches = keyword ? findMatches(keyword) : links;
    links.forEach((link) => link.classList.toggle("is-search-match", keyword && matches.includes(link)));
    if (empty) empty.hidden = matches.length > 0;
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const firstMatch = findMatches(input.value)[0];
    if (firstMatch) window.location.assign(firstMatch.href);
    else if (empty) empty.hidden = false;
  });
})();
