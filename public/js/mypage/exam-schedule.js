// 시험 일정 검색 모듈 (북마크 기반)

// 북마크된 자격증의 시험 일정 데이터 (cert-dday.js와 동일한 데이터 사용)
const certExamSchedules = [
  { 
    id: 1, 
    name: "정보처리기사", 
    examDate: "2025-11-29",
    schedules: [
      { type: "필기 원서접수", date: "2025-11-12", description: "필기시험 원서접수 기간입니다." },
      { type: "필기 시험", date: "2025-11-23", description: "필기시험 응시일입니다." },
      { type: "필기 합격발표", date: "2025-12-10", description: "필기시험 합격자 발표일입니다." },
      { type: "실기 원서접수", date: "2025-12-15", description: "실기시험 원서접수 기간입니다." },
      { type: "실기 시험", date: "2026-01-20", description: "실기시험 응시일입니다." },
      { type: "최종 합격발표", date: "2026-02-28", description: "최종 합격자 발표일입니다." }
    ]
  },
  { 
    id: 2, 
    name: "ADsP(데이터분석 준전문가)", 
    examDate: "2025-12-15",
    schedules: [
      { type: "원서접수", date: "2025-11-20", description: "시험 원서접수 기간입니다." },
      { type: "시험", date: "2025-12-15", description: "시험 응시일입니다." },
      { type: "합격발표", date: "2026-01-05", description: "합격자 발표일입니다." }
    ]
  },
  { 
    id: 3, 
    name: "SQLD(SQL 개발자)", 
    examDate: "2026-01-10",
    schedules: [
      { type: "원서접수", date: "2025-12-01", description: "시험 원서접수 기간입니다." },
      { type: "시험", date: "2026-01-10", description: "시험 응시일입니다." },
      { type: "합격발표", date: "2026-02-01", description: "합격자 발표일입니다." }
    ]
  },
  { 
    id: 4, 
    name: "정보보안기사", 
    examDate: "2026-02-20",
    schedules: [
      { type: "필기 원서접수", date: "2026-01-05", description: "필기시험 원서접수 기간입니다." },
      { type: "필기 시험", date: "2026-02-20", description: "필기시험 응시일입니다." },
      { type: "필기 합격발표", date: "2026-03-10", description: "필기시험 합격자 발표일입니다." },
      { type: "실기 원서접수", date: "2026-03-15", description: "실기시험 원서접수 기간입니다." },
      { type: "실기 시험", date: "2026-04-25", description: "실기시험 응시일입니다." },
      { type: "최종 합격발표", date: "2026-06-01", description: "최종 합격자 발표일입니다." }
    ]
  },
  { 
    id: 5, 
    name: "컴퓨터활용능력 1급", 
    examDate: "2025-12-05",
    schedules: [
      { type: "필기 원서접수", date: "2025-11-18", description: "필기시험 원서접수 기간입니다." },
      { type: "필기 시험", date: "2025-12-05", description: "필기시험 응시일입니다." },
      { type: "필기 합격발표", date: "2025-12-18", description: "필기시험 합격자 발표일입니다." },
      { type: "실기 원서접수", date: "2025-12-23", description: "실기시험 원서접수 기간입니다." },
      { type: "실기 시험", date: "2026-01-30", description: "실기시험 응시일입니다." },
      { type: "최종 합격발표", date: "2026-02-20", description: "최종 합격자 발표일입니다." }
    ]
  },
  { 
    id: 6, 
    name: "빅데이터분석기사", 
    examDate: "2025-12-20",
    schedules: [
      { type: "필기 원서접수", date: "2025-11-25", description: "필기시험 원서접수 기간입니다." },
      { type: "필기 시험", date: "2025-12-20", description: "필기시험 응시일입니다." },
      { type: "필기 합격발표", date: "2026-01-10", description: "필기시험 합격자 발표일입니다." },
      { type: "실기 원서접수", date: "2026-01-15", description: "실기시험 원서접수 기간입니다." },
      { type: "실기 시험", date: "2026-02-28", description: "실기시험 응시일입니다." },
      { type: "최종 합격발표", date: "2026-04-10", description: "최종 합격자 발표일입니다." }
    ]
  },
  { 
    id: 7, 
    name: "SQLP(SQL 전문가)", 
    examDate: "2026-01-25",
    schedules: [
      { type: "원서접수", date: "2025-12-10", description: "시험 원서접수 기간입니다." },
      { type: "시험", date: "2026-01-25", description: "시험 응시일입니다." },
      { type: "합격발표", date: "2026-02-25", description: "합격자 발표일입니다." }
    ]
  },
  { 
    id: 8, 
    name: "네트워크관리사 2급", 
    examDate: "2025-12-10",
    schedules: [
      { type: "필기 원서접수", date: "2025-11-15", description: "필기시험 원서접수 기간입니다." },
      { type: "필기 시험", date: "2025-12-10", description: "필기시험 응시일입니다." },
      { type: "필기 합격발표", date: "2025-12-25", description: "필기시험 합격자 발표일입니다." },
      { type: "실기 원서접수", date: "2025-12-30", description: "실기시험 원서접수 기간입니다." },
      { type: "실기 시험", date: "2026-02-10", description: "실기시험 응시일입니다." },
      { type: "최종 합격발표", date: "2026-03-15", description: "최종 합격자 발표일입니다." }
    ]
  },
  { 
    id: 9, 
    name: "정보처리산업기사", 
    examDate: "2026-02-05",
    schedules: [
      { type: "필기 원서접수", date: "2026-01-10", description: "필기시험 원서접수 기간입니다." },
      { type: "필기 시험", date: "2026-02-05", description: "필기시험 응시일입니다." },
      { type: "필기 합격발표", date: "2026-02-25", description: "필기시험 합격자 발표일입니다." },
      { type: "실기 원서접수", date: "2026-03-05", description: "실기시험 원서접수 기간입니다." },
      { type: "실기 시험", date: "2026-04-15", description: "실기시험 응시일입니다." },
      { type: "최종 합격발표", date: "2026-05-20", description: "최종 합격자 발표일입니다." }
    ]
  },
  { 
    id: 10, 
    name: "TOEIC Speaking", 
    examDate: "2025-12-28",
    schedules: [
      { type: "원서접수", date: "2025-12-01", description: "시험 원서접수 기간입니다." },
      { type: "시험", date: "2025-12-28", description: "시험 응시일입니다." },
      { type: "성적발표", date: "2026-01-15", description: "성적 발표일입니다." }
    ]
  }
];

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
