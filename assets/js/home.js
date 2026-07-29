(() => {
  const guides = [
    {
      title: "综合情报系统 (Portal)",
      description: "系统登录与基本操作",
      keywords: "portal 登录 账号 综合情报系统 初始密码",
      anchor: "portal",
      icon: "monitor-check",
    },
    {
      title: "找回密码",
      description: "账号密码恢复与重置",
      keywords: "密码 重置 找回 锁定 邮箱 电话",
      anchor: "password-recovery",
      icon: "key-round",
    },
    {
      title: "主要学事日程",
      description: "重要日期与学期安排",
      keywords: "学事 日程 日期 开学 考试 放假",
      anchor: "schedule",
      icon: "calendar-days",
    },
    {
      title: "个人信息查看及修改",
      description: "维护电话、邮箱与个人资料",
      keywords: "个人信息 电话 邮箱 修改 资料",
      anchor: "personal-info",
      icon: "user-round-pen",
    },
    {
      title: "课程表查询指南",
      description: "查看课程、教室与时间",
      keywords: "课程表 查询 时间表 教室 课时",
      anchor: "course-schedule",
      icon: "table-properties",
    },
    {
      title: "选课前的课程筛选",
      description: "筛选并确认适合的课程",
      keywords: "选课 筛选 excel 双语 课程",
      anchor: "course-screening",
      icon: "list-filter",
    },
    {
      title: "选课指南",
      description: "选课系统完整操作流程",
      keywords: "选课 sugang 课程 学分 重修",
      anchor: "sugang",
      icon: "book-open-check",
    },
    {
      title: "毕业剩余学分查询",
      description: "确认毕业要求与学分进度",
      keywords: "毕业 学分 剩余 要求 查询",
      anchor: "grad-credit",
      icon: "graduation-cap",
    },
    {
      title: "请假申请指南",
      description: "请假申请与材料提交",
      keywords: "请假 缺勤 申请 病假 公假",
      anchor: "leave-request",
      icon: "calendar-check",
    },
    {
      title: "打印各类证明",
      description: "在学、成绩等证明文件",
      keywords: "打印 证明 在学 成绩 证书",
      anchor: "cert-print",
      icon: "printer",
    },
    {
      title: "学校地图与校车",
      description: "校园建筑位置与校车信息",
      keywords: "学校 校园 地图 校车 建筑 交通",
      anchor: "campus-map",
      icon: "map",
    },
    {
      title: "网课系统 (HIVE)",
      description: "在线课程与直播课操作",
      keywords: "网课 hive 直播课 在线课程 登录",
      anchor: "online-class",
      icon: "video",
    },
    {
      title: "教授联系方式",
      description: "查询教师联系信息",
      keywords: "教授 老师 联系方式 电话 邮箱",
      anchor: "professor",
      icon: "presentation",
    },
    {
      title: "学科办公室位置查询",
      description: "查找所属学科办公室",
      keywords: "学科 办公室 位置 专业",
      anchor: "department-office",
      icon: "map-pin",
    },
    {
      title: "图书馆使用",
      description: "App、入馆与座位预约",
      keywords: "图书馆 app 入馆 借书 预约 座位",
      anchor: "library",
      icon: "book-open",
    },
    {
      title: "登陆证办理以及延长",
      description: "材料清单与 PDF 下载",
      keywords: "登陆证 外国人登录证 arc 签证 延长 材料",
      anchor: "arc",
      icon: "id-card",
    },
    {
      title: "留学生活动",
      description: "中韩交流与校园活动",
      keywords: "活动 mentoring 交流 巡逻 留学生",
      anchor: "activity",
      icon: "users",
    },
    {
      title: "联系方式与注意",
      description: "国际交流处与重要提醒",
      keywords: "联系 国际交流处 电话 qq 地址 注意",
      anchor: "contact",
      icon: "contact",
    },
  ];

  const form = document.querySelector(".portal-search");
  const input = document.getElementById("home-search");
  const results = document.getElementById("home-search-results");
  const year = document.getElementById("current-year");
  let guideIndex = guides.map((guide) => ({ ...guide, content: "" }));
  let contentIndexReady = false;
  let matches = [];
  let activeIndex = -1;

  if (year) year.textContent = String(new Date().getFullYear());
  if (!form || !input || !results) return;

  const normalize = (value) => value.trim().toLocaleLowerCase("zh-CN");
  const collapseWhitespace = (value) => value.replace(/\s+/g, " ").trim();

  function matchingExcerpt(guide, keyword) {
    const content = guide.content || "";
    const normalizedContent = normalize(content);
    const index = normalizedContent.indexOf(keyword);
    if (index < 0) return guide.description;

    const start = Math.max(0, index - 28);
    const end = Math.min(content.length, index + keyword.length + 52);
    const excerpt = content.slice(start, end).trim();
    return `${start > 0 ? "…" : ""}${excerpt}${end < content.length ? "…" : ""}`;
  }

  async function loadGuideContentIndex() {
    try {
      const response = await fetch("guide.html", { cache: "no-cache" });
      if (!response.ok)
        throw new Error(`Guide index request failed: ${response.status}`);
      const html = await response.text();
      const documentIndex = new DOMParser().parseFromString(html, "text/html");

      guideIndex = guides.map((guide) => {
        const section = documentIndex.getElementById(guide.anchor);
        if (!section) return { ...guide, content: "" };
        const searchableSection = section.cloneNode(true);
        searchableSection
          .querySelectorAll("script, style, .section-tools, button")
          .forEach((element) => element.remove());
        return {
          ...guide,
          content: collapseWhitespace(searchableSection.textContent || ""),
        };
      });
    } catch (error) {
      console.warn("Guide content search is using its fallback index.", error);
    } finally {
      contentIndexReady = true;
      if (normalize(input.value)) renderResults(input.value);
    }
  }

  function rankedMatches(value) {
    const keyword = normalize(value);
    if (!keyword) return [];
    return guideIndex
      .map((guide) => {
        const title = normalize(guide.title);
        const metadata = normalize(
          `${guide.title} ${guide.description} ${guide.keywords} ${guide.anchor}`,
        );
        const content = normalize(guide.content || "");
        let score = 0;
        if (title === keyword) score += 100;
        if (title.startsWith(keyword)) score += 60;
        if (title.includes(keyword)) score += 40;
        if (metadata.includes(keyword)) score += 20;
        if (content.includes(keyword)) score += 15;
        return {
          guide: {
            ...guide,
            matchDescription: content.includes(keyword)
              ? matchingExcerpt(guide, keyword)
              : guide.description,
          },
          score,
        };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.guide);
  }

  function createResultIcon(name, className = "") {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    if (className) svg.classList.add(className);
    svg.setAttribute("aria-hidden", "true");
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", `assets/icons/lucide.svg#${name}`);
    svg.append(use);
    return svg;
  }

  function setActive(index) {
    const options = Array.from(results.querySelectorAll("a"));
    activeIndex = options.length
      ? Math.max(0, Math.min(index, options.length - 1))
      : -1;
    options.forEach((option, optionIndex) => {
      const active = optionIndex === activeIndex;
      option.classList.toggle("active", active);
    });
  }

  function renderResults(value) {
    matches = rankedMatches(value);
    activeIndex = -1;
    results.replaceChildren();
    if (!normalize(value)) {
      results.classList.remove("show");
      input.setAttribute("aria-expanded", "false");
      return;
    }
    if (!matches.length) {
      const empty = document.createElement("p");
      empty.className = "portal-search-empty";
      empty.textContent = contentIndexReady
        ? "没有找到相关指南，请尝试更短的关键词。"
        : "正在搜索全部指南内容…";
      results.append(empty);
    } else {
      matches.forEach((guide, index) => {
        const link = document.createElement("a");
        link.href = `guide.html#${guide.anchor}`;
        const copy = document.createElement("span");
        const title = document.createElement("strong");
        const description = document.createElement("small");
        title.textContent = guide.title;
        description.textContent = guide.matchDescription || guide.description;
        copy.append(title, description);
        link.append(
          createResultIcon(guide.icon),
          copy,
          createResultIcon("arrow-right", "result-arrow"),
        );
        link.addEventListener("pointerenter", () => setActive(index));
        results.append(link);
      });
    }
    results.classList.add("show");
    input.setAttribute("aria-expanded", "true");
  }

  input.setAttribute("aria-expanded", "false");
  input.setAttribute("aria-controls", "home-search-results");
  input.addEventListener("input", () => renderResults(input.value));
  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" && matches.length) {
      event.preventDefault();
      setActive(activeIndex + 1);
    } else if (event.key === "ArrowUp" && matches.length) {
      event.preventDefault();
      setActive(activeIndex <= 0 ? matches.length - 1 : activeIndex - 1);
    } else if (event.key === "Escape") {
      results.classList.remove("show");
      input.setAttribute("aria-expanded", "false");
    } else if (event.key === "Enter") {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const keyword = normalize(input.value);
    if (!keyword) {
      results.classList.remove("show");
      input.setAttribute("aria-expanded", "false");
      input.focus();
      return;
    }
    if (!contentIndexReady) {
      await guideIndexPromise;
      matches = rankedMatches(input.value);
    }
    const target = matches[activeIndex >= 0 ? activeIndex : 0];
    if (target) window.location.assign(`guide.html#${target.anchor}`);
    else renderResults(input.value);
  });

  document.addEventListener("click", (event) => {
    if (!form.contains(event.target)) {
      results.classList.remove("show");
      input.setAttribute("aria-expanded", "false");
    }
  });

  const guideIndexPromise = loadGuideContentIndex();
})();
