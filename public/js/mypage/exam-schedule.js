// 시험 일정 검색 모듈 (북마크 기반)

// 북마크된 자격증의 시험 일정 데이터 (cert-dday.js와 동일한 데이터 사용)
window.certExamSchedules = window.certExamSchedules || [];
const certExamSchedules = window.certExamSchedules;

// 시험 일정 검색 렌더링
window.renderExamSchedule = function(containerId) {
  const host = document.getElementById(containerId);
  if (!host) return;
  host.innerHTML = "";

  const listEl = createEl("div", { class: "exam-schedule-list" });

  const onSearch = (query) => {
    listEl.innerHTML = "";
    const q = (query || "").trim().toLowerCase();
    
    // 북마크된 자격증만 필터링
    let filteredCerts = certExamSchedules.filter(cert => 
      cert.name.toLowerCase().includes(q)
    );

    // 북마크가 없는 경우
    if (certExamSchedules.length === 0) {
      listEl.appendChild(createEl("div", { class: "exam-schedule-empty" }, [
        "아직 북마크한 자격증이 없어요."
      ]));
      return;
    }

    // 검색 결과가 없는 경우
    if (filteredCerts.length === 0) {
      listEl.appendChild(createEl("div", { class: "exam-schedule-empty" }, [
        "검색 결과가 없습니다."
      ]));
      return;
    }

    // ㄱㄴㄷ 순서로 정렬
    filteredCerts.sort((a, b) => a.name.localeCompare(b.name, 'ko'));

    // 자격증 목록 표시
    filteredCerts.forEach(cert => {
      const row = createEl("div", { class: "exam-schedule-item" }, [
        createEl("div", { class: "exam-schedule-content" }, [
          createEl("div", { class: "exam-schedule-name" }, [cert.name])
        ]),
        createEl("div", { class: "exam-schedule-footer" }, [
          createEl("button", { 
            class: "btn-exam-detail",
            onclick: () => showExamDetailModal(cert)
          }, ["일정보기"])
        ])
      ]);
      listEl.appendChild(row);
    });
  };

  // D-day 계산 함수
  function calculateDday(dateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const examDate = new Date(dateStr);
    examDate.setHours(0, 0, 0, 0);
    const diff = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));
    return diff;
  }

  const searchInput = createEl("input", { 
    class: "input exam-schedule-search-input", 
    type: "search", 
    placeholder: "시험일정 검색", 
    oninput: (e) => onSearch(e.target.value) 
  });

  const card = createEl("div", { class: "card p-24 h-full" }, [
    createEl("h3", { class: "h3" }, ["시험 일정 검색"]),
    searchInput,
    listEl
  ]);

  host.appendChild(card);
  onSearch(""); // 초기 목록 렌더링
};

// 시험 일정 상세 모달
function showExamDetailModal(cert) {
  const scheduleContent = createEl("div", { class: "exam-detail-container" });
  
  const scheduleList = createEl("div", { class: "exam-detail-list" });
  
  cert.schedules.forEach(schedule => {
    const item = createEl("div", { class: "exam-detail-item" }, [
      createEl("div", { class: "exam-detail-header" }, [
        createEl("span", { class: "exam-detail-type" }, [schedule.type]),
        createEl("span", { class: "exam-detail-date" }, [schedule.date])
      ]),
      createEl("div", { class: "exam-detail-desc" }, [schedule.description])
    ]);
    scheduleList.appendChild(item);
  });
  
  scheduleContent.appendChild(scheduleList);
  
  showModal(`${cert.name} 시험 일정`, scheduleContent);
}
