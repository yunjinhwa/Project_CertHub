// --- shared utilities & data ---
window.DATA = {
  tags: ["국가기술", "IT", "회계", "어학", "보건", "디자인", "건설", "데이터", "보안", "사무", "유통/물류"],
  certsTrending: [
    { name: "정보처리기사", rate: 4.7, next: "2025-11-23", field: "IT/개발" },
    { name: "전산세무 2급", rate: 4.4, next: "2025-12-07", field: "회계/재무" },
    { name: "물류관리사", rate: 4.2, next: "2026-01-18", field: "유통/물류" },
    { name: "리눅스마스터 2급", rate: 4.3, next: "2026-02-08", field: "IT/인프라" },
    { name: "정보보안기사", rate: 4.6, next: "2026-03-15", field: "보안" }
  ],
  certsReco: [
    { name: "SQLD", rate: 4.6, next: "2025-12-14", field: "데이터" },
    { name: "빅데이터분석기사", rate: 4.8, next: "2026-01-10", field: "데이터/AI" },
    { name: "컴퓨터활용능력 1급", rate: 4.3, next: "2025-12-21", field: "사무/IT" },
    { name: "ADsP", rate: 4.2, next: "2026-02-01", field: "데이터" },
    { name: "네트워크관리사 2급", rate: 4.1, next: "2026-02-22", field: "IT/인프라" }
  ],
  community: [
    { title: "정보처리기사 필기 합격 후기", tag: "후기", replies: 12 },
    { title: "전산세무 준비 로드맵 공유", tag: "로드맵", replies: 8 },
    { title: "물류관리사 실무에서 어떻게 써먹나요?", tag: "활용", replies: 5 },
    { title: "SQLD 공부법(비전공자)", tag: "공부법", replies: 14 },
    { title: "보안기사 실무 난이도 궁금", tag: "진로", replies: 6 }
  ],
  bookmarks: ["빅데이터분석기사", "컴퓨터활용능력 1급", "SQLD", "ADsP"],
  events: [
    { date: "11/12", name: "정보처리 실기 원서접수" },
    { date: "11/23", name: "정보처리 필기 시험" },
    { date: "12/07", name: "전산세무 2급 시험" },
    { date: "12/21", name: "컴활 1급 실기 시험" },
    { date: "01/10", name: "빅데이터분석기사 필기" }
  ],
  paths: ["IT → 정보처리기사 → SQLD", "회계 → 전산세무 2급 → FAT 1급", "보안 → 정보보안기사 → 리눅스마스터"],
  todos: ["✔ 교재 1장 복습", "✔ 기출 10문제", "□ 모의고사 1회", "□ 오답노트 업데이트"],
  fields: ["데이터/AI", "회계/재무", "디자인", "건설/안전", "보안", "IT/인프라"]
};

// utils
window.$ = (sel, el = document) => el.querySelector(sel);
window.$$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
window.createEl = function(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === "class") el.className = v;
    else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === "html") el.innerHTML = v;
    else el.setAttribute(k, v);
  });
  children.forEach((c) => el.appendChild(typeof c === "string" ? document.createTextNode(c) : c));
  return el;
};

// shared components
window.renderSearchBar = function (containerId, placeholder = "자격증을 검색해보세요 (예: 정보처리기사)") {
  const resultsId = containerId + "-results";

  const onSearch = (q) => {
    const host = $("#" + resultsId);
    host.innerHTML = "";

    const query = (q || "").trim().toLowerCase();
    // 데모용: 보유 풀에서 검색 (필요 시 certsAll로 확장)
    const pool = [...(DATA.certsAll || []), ...DATA.certsTrending, ...DATA.certsReco];
    const seen = new Set();
    const items = pool.filter(c => {
      const key = (c.name + "|" + c.field).toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return !query || key.includes(query);
    });

    if (!items.length) {
      host.appendChild(createEl("div", { class: "search-empty" }, ["검색 결과가 없습니다."]));
      return;
    }

    const list = createEl("div", { class: "card-list" });
    items.forEach(c => {
      const row = createEl("div", { class: "item" }, [
        createEl("div", {}, [
          createEl("div", { class: "item-title" }, [c.name]),
          createEl("div", { class: "item-sub" }, [`${c.field} · 다음 시험 ${c.next}`]),
        ]),
        createEl("button", { class: "btn ghost", onClick: () => alert(`${c.name} 상세 보기`) }, ["자세히"])
      ]);
      list.appendChild(row);
    });
    host.appendChild(list);
  };

  const inputEl = createEl("input", { class: "input", type: "search", placeholder, onInput: (e) => onSearch(e.target.value) });
  const wrap = createEl("div", { class: "search-wrap" }, [
    createEl("div", { class: "row" }, [
      createEl("div", { class: "input-wrap", style: "flex:1" }, [
        createEl("span", { class: "input-icon", ariaHidden: "true" }, ["🔎"]),
        inputEl
      ]),
      createEl("button", { class: "btn", onClick: () => onSearch(inputEl.value) }, ["검색"])
    ]),
    createEl("div", { id: resultsId, class: "search-results mt-12" })
  ]);

  // 초기 상태에서 트렌딩을 보여주고, 타이핑하면 필터
  $("#" + containerId).replaceWith(Object.assign(wrap, { id: containerId }));
  onSearch(""); 
};
window.renderTrendTags = function(containerId) {
  const wrap = $("#" + containerId); wrap.innerHTML = "";
  DATA.tags.forEach(t => wrap.appendChild(createEl("span", { class: "tag secondary" }, ["#" + t])));
};
window.renderCertList = function(containerId, title, items) {
  const host = $("#" + containerId); host.innerHTML = "";
  const card = createEl("div", { class: "card p-24" });
  card.appendChild(createEl("h3", { class: "h3" }, [title]));
  const list = createEl("div", { class: "card-list mt-12" });
  items.forEach(c => {
    const detailBtn = createEl("button", { class: "btn ghost", style: "padding: 8px 20px; font-size: 13px; min-width: 90px;" }, ["자세히 보기"]);
    
    const row = createEl("div", { class: "item" }, [
      createEl("div", {}, [
        createEl("div", { class: "item-title" }, [c.name]),
        createEl("div", { class: "item-sub" }, [`${c.field} · 다음 시험 ${c.next}`])
      ]),
      detailBtn
    ]);
    
    detailBtn.addEventListener("click", () => {
      const detailContent = createEl("div", { style: "line-height: 1.8;" }, [
        createEl("p", {}, [`분야: ${c.field}`]),
        createEl("p", {}, [`다음 시험일: ${c.next}`]),
        createEl("p", { class: "mt-12" }, ["이곳에 해당 자격증의 시험 과목, 응시 자격, 합격률 등 더 자세한 정보가 표시될 예정입니다."]),
        createEl("div", { class: "mt-12 row", style: "gap: 8px;" }, [
          createEl("button", { class: "btn", onClick: () => showModal("알림", `'${c.name}' 시험 접수 페이지로 이동합니다.`) }, ["시험 접수하기"]),
          createEl("button", { class: "btn ghost", onClick: () => showModal("알림", `'${c.name}' 북마크에 추가되었습니다.`) }, ["북마크 추가"])
        ])
      ]);
      showModal(`${c.name} 상세 정보`, detailContent);
    });
    
    list.appendChild(row);
  });
  card.appendChild(list);
  host.appendChild(card);
};
window.renderCommunityPanel = function(containerId, title = "커뮤니티 최신") {
  const host = $("#" + containerId); host.innerHTML = "";
  const card = createEl("div", { class: "card p-24" });
  card.appendChild(createEl("h3", { class: "h3" }, [title]));
  const list = createEl("div", { class: "card-list mt-12" });
  DATA.community.forEach(p => {
    const row = createEl("div", { class: "item", style: "cursor: pointer;" }, [
      createEl("div", {}, [
        createEl("div", { class: "item-title" }, [p.title]),
        createEl("div", { class: "item-sub" }, [`#${p.tag}`])
      ]),
      createEl("span", { class: "badge outline" }, [`댓글 ${p.replies}`])
    ]);
    row.addEventListener("click", () => {
      // 임시 상세 내용
      const detailContent = `이곳에 "${p.title}" 게시글의 상세 내용이 표시됩니다. 현재는 MVP 버전으로, 실제 내용은 백엔드 연동 후 제공될 예정입니다. 이 글의 태그는 #${p.tag}이며, ${p.replies}개의 댓글이 있습니다.`;
      showModal(p.title, detailContent);
    });
    list.appendChild(row);
  });
  card.appendChild(list);
  host.appendChild(card);
};
window.renderBookmarks = function(containerId) {
  const host = document.getElementById(containerId);
  if (!host) return;
  host.innerHTML = "";

  const list = createEl("div", { class: "card-list mt-12" });

  const rerender = () => {
    list.innerHTML = "";
    DATA.bookmarks.forEach((it, index) => {
      const row = createEl("div", { class: "item" }, [
        createEl("span", { class: "item-title" }, [it]),
        createEl("div", { class: "row", style: "gap: 8px;" }, [
          createEl("button", { class: "btn ghost", style: "padding: 2px 8px; font-size: 12px;", onClick: () => alert(`${it} 상세로 이동`) }, ["바로가기"]),
          createEl("button", { 
            class: "btn ghost", 
            style: "padding: 2px 8px; font-size: 12px;",
            onClick: () => {
              DATA.bookmarks.splice(index, 1);
              rerender();
            }
          }, ["삭제"])
        ])
      ]);
      list.appendChild(row);
    });
  };

  const card = createEl("div", { class: "card p-24" }, [
    createEl("h3", { class: "h3" }, ["내 북마크"]),
    list
  ]);
  card.appendChild(list);
  host.appendChild(card);
  rerender();
};
window.renderCalendar = function(containerId) {
  const host = $("#" + containerId);
  if (!host) return;
  host.innerHTML = "";

  const listEl = createEl("div", { class: "card-list mt-12" });

  const onSearch = (query) => {
    listEl.innerHTML = "";
    const q = (query || "").trim().toLowerCase();
    let filteredEvents = DATA.events.filter(e => e.name.toLowerCase().includes(q));

    if (!q) filteredEvents = filteredEvents.slice(0, 5); // 검색어가 없으면 5개만 표시

    if (!filteredEvents.length) {
      listEl.appendChild(createEl("div", { class: "search-empty" }, ["검색 결과가 없습니다."]));
      return;
    }

    filteredEvents.forEach(e => {
      const row = createEl("div", { class: "item" }, [
        createEl("div", { class: "row" }, ["📅", createEl("span", { class: "item-title" }, [e.name])]),
        createEl("span", { class: "item-sub" }, [e.date])
      ]);
      listEl.appendChild(row);
    });
  };

  const searchInput = createEl("input", { class: "input", type: "search", placeholder: "시험일정 검색", onInput: (e) => onSearch(e.target.value) });
  const card = createEl("div", { class: "card p-24 h-full" }, [
    createEl("h3", { class: "h3" }, ["시험 일정"]),
    searchInput,
    Object.assign(listEl, { className: listEl.className + " mt-12" })
  ]);

  host.appendChild(card);
  onSearch(""); // 초기 목록 렌더링
};
// 이번 주 할 일 카드 렌더링 + 체크 시 Firestore 반영
window.renderTodo = function (containerId) {
  const ul = $("#" + containerId);
  if (!ul) return;

  ul.innerHTML = "";

  // todoManager가 있으면 사용, 없으면 DATA.todos 사용
  const todos = window.todoManager ? window.todoManager.todos : DATA.todos;

  // 할 일이 없을 때
  if (!todos || todos.length === 0) {
    const emptyState = createEl("div", { class: "empty-state" }, [
      createEl("div", { class: "empty-state-content" }, [
        createEl("div", { class: "empty-state-text" }, ["이번 주 할 일이 없습니다"]),
        createEl("div", { class: "empty-state-subtext" }, [
          "관리 버튼을 눌러 할 일을 추가해보세요",
        ]),
      ]),
    ]);
    ul.appendChild(emptyState);
    return;
  }

  // 모든 할 일 표시
  todos.forEach((t, index) => {
    const todo = typeof t === "string" ? { text: t, completed: false } : t;

    const checkbox = todo.completed
      ? createEl("span", { class: "todo-checkbox-icon" }, ["✔️"])
      : createEl("span", { class: "todo-checkbox-icon empty" }, ["□"]);

    const todoItem = createEl(
      "li",
      {
        class: todo.completed ? "completed" : "",
        style:
          "cursor: pointer; display: flex; align-items: center; gap: 8px;",
        onClick: async () => {
          if (!window.todoManager) return;

          const todoObj = window.todoManager.todos[index];
          if (!todoObj) return;

          // 1) UI & 로컬 상태 먼저 토글
          const newCompleted = !todoObj.completed;
          todoObj.completed = newCompleted;

          renderTodo(containerId);
          if (typeof updateWeekProgress === "function") {
            updateWeekProgress();
          }

          // 2) Firestore에도 반영
          try {
            if (
              window.firebaseTodosWeekApi &&
              typeof window.firebaseTodosWeekApi.updateTodoWeek === "function" &&
              typeof todoObj.id === "string" &&
              todoObj.id.length > 0
            ) {
              await window.firebaseTodosWeekApi.updateTodoWeek(todoObj.id, {
                status: newCompleted,
              });
            } else {
              console.warn(
                "[renderTodo] updateTodoWeek를 호출할 수 없습니다.",
                todoObj
              );
            }
          } catch (err) {
            console.error(
              "[renderTodo] 체크 상태 Firestore 반영 중 오류:",
              err
            );
          }
        },
      },
      [
        checkbox,
        createEl(
          "span",
          {
            style: todo.completed
              ? "text-decoration: line-through; opacity: 0.6;"
              : "",
          },
          [todo.text]
        ),
      ]
    );

    ul.appendChild(todoItem);
  });
};


// 이번 주 할 일 진행률 업데이트
window.updateWeekProgress = function() {
  if (!window.todoManager) return;
  
  const todos = todoManager.todos;
  if (todos.length === 0) {
    updateProgressUI(0);
    return;
  }
  
  const completedCount = todos.filter(t => t.completed).length;
  const percentage = Math.round((completedCount / todos.length) * 100);
  
  updateProgressUI(percentage);
};

function updateProgressUI(percentage) {
  const progressBar = document.getElementById("weekProgressBar");
  const progressText = document.getElementById("weekProgressText");
  
  if (progressBar) {
    progressBar.style.width = percentage + "%";
    progressBar.setAttribute("aria-label", `이번 주 할 일 진행률 ${percentage}%`);
  }
  
  if (progressText) {
    if (percentage === 100) {
      progressText.textContent = `${percentage}% (완료)`;
    } else {
      progressText.textContent = `${percentage}%`;
    }
  }
}
window.renderPaths = function(containerId) {
  const ul = $("#" + containerId); ul.innerHTML = ""; DATA.paths.forEach(p => ul.appendChild(createEl("li", {}, [p])));
};

// theme toggle
window.setupThemeToggle = function() {
  const btn = document.getElementById("toggleTheme");
  const storageKey = "theme-preference";
  
  const updateButton = () => {
    const isLight = document.body.classList.contains("light");
    btn.innerHTML = isLight ? "🌓 Dark mode" : "☀️ Light mode";
  };

  const applyTheme = (theme) => {
    document.body.classList.toggle("light", theme === "light");
    localStorage.setItem(storageKey, theme);
    updateButton();
  };

  btn.addEventListener("click", () => {
    const currentTheme = localStorage.getItem(storageKey) || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    const newTheme = currentTheme === "light" ? "dark" : "light";
    applyTheme(newTheme);
  });

  // 페이지 로드 시 저장된 테마 또는 시스템 설정 적용
  const savedTheme = localStorage.getItem(storageKey);
  const preferredTheme = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  applyTheme(savedTheme || preferredTheme);
};

// 관심 키워드 기반 커뮤니티 패널
window.renderCommunityByKeywords = function (containerId, keywords = [], title = "관심 키워드 커뮤니티") {
  const ks = (keywords && keywords.length ? keywords : (DATA.userKeywords || [])).map(s => String(s).toLowerCase());
  const host = $("#" + containerId); host.innerHTML = "";

  const card = createEl("div", { class: "card p-24" });
  card.appendChild(createEl("h3", { class: "h3" }, [title]));

  let posts = DATA.community;
  if (ks.length) {
    posts = DATA.community.filter(p => {
      const text = (p.title + " #" + p.tag).toLowerCase();
      return ks.some(k => text.includes(k));
    });
  }

  const list = createEl("div", { class: "card-list mt-12" });
  if (!posts.length) {
    list.appendChild(createEl("div", { class: "search-empty" }, ["일치하는 글이 없습니다. 최신 글을 확인해보세요."]));
  } else {
    posts.forEach(p => {
      const row = createEl("div", { class: "item", style: "cursor: pointer;" }, [
        createEl("div", {}, [
          createEl("div", { class: "item-title" }, [p.title]),
          createEl("div", { class: "item-sub" }, [`#${p.tag}`])
        ]),
        createEl("span", { class: "badge outline" }, [`댓글 ${p.replies}`])
      ]);
      row.addEventListener("click", () => {
        // 임시 상세 내용
        const detailContent = `이곳에 "${p.title}" 게시글의 상세 내용이 표시됩니다. 현재는 MVP 버전으로, 실제 내용은 백엔드 연동 후 제공될 예정입니다. 이 글의 태그는 #${p.tag}이며, ${p.replies}개의 댓글이 있습니다.`;
        showModal(p.title, detailContent);
      });
      list.appendChild(row);
    });
  }

  card.appendChild(list);
  host.appendChild(card);
};

// app_common.js — add this
window.renderFields = function (containerId, fields = DATA.tags) {
  const host = document.getElementById(containerId);
  if (!host) return;
  host.innerHTML = "";

  const frag = document.createDocumentFragment();

  (fields || []).forEach((f) => {
    const chip = createEl("button", { class: "chip", type: "button" }, [
      createEl("div", { class: "item-title" }, [f]),
      createEl("div", { class: "item-sub" }, ["분야 탐색"]),
    ]);

    // 클릭 시 검색창에 키워드를 넣고 필터링(기존/개선된 검색바 모두 대응)
    chip.addEventListener("click", () => {
      const input =
        document.querySelector('#searchbar-1 input[type="search"]') ||
        document.querySelector('#searchbar-1 input');

      if (input) {
        input.value = f;
        input.dispatchEvent(new Event("input", { bubbles: true }));
      } else {
        alert(`#${f} 관련 검색창이 보이지 않아요`);
      }
    });

    frag.appendChild(chip);
  });

  host.appendChild(frag);
};