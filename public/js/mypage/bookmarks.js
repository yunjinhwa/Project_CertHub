// 내 북마크 모듈

// 북마크된 자격증 데이터 (exam-schedule.js와 동일)
const bookmarkedCerts = [
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

// 내 북마크 렌더링
window.renderBookmarks = function(containerId) {
  const host = document.getElementById(containerId);
  if (!host) return;
  host.innerHTML = "";

  const listEl = createEl("div", { class: "bookmark-list" });

  const rerender = () => {
    listEl.innerHTML = "";
    
    // ㄱㄴㄷ 순서로 정렬
    const sortedCerts = [...bookmarkedCerts].sort((a, b) => a.name.localeCompare(b.name, 'ko'));

    // 북마크가 없는 경우
    if (sortedCerts.length === 0) {
      listEl.appendChild(createEl("div", { class: "bookmark-empty" }, [
        "아직 북마크한 자격증이 없어요."
      ]));
      return;
    }

    // 자격증 목록 표시
    sortedCerts.forEach((cert) => {
      const row = createEl("div", { class: "bookmark-item" }, [
        createEl("div", { class: "bookmark-content" }, [
          createEl("div", { class: "bookmark-name" }, [cert.name])
        ]),
        createEl("div", { class: "bookmark-footer" }, [
          createEl("button", { 
            class: "btn-bookmark-action",
            onclick: () => {} // 바로가기 기능은 추후 구현
          }, ["바로가기"]),
          createEl("button", { 
            class: "btn-bookmark-delete",
            onclick: () => {
              // ID로 원본 배열에서 찾아서 삭제
              const originalIndex = bookmarkedCerts.findIndex(c => c.id === cert.id);
              if (originalIndex !== -1) {
                bookmarkedCerts.splice(originalIndex, 1);
                rerender();
              }
            }
          }, ["삭제"])
        ])
      ]);
      listEl.appendChild(row);
    });
  };

  const card = createEl("div", { class: "card p-24 bookmark-card" }, [
    createEl("h3", { class: "h3" }, ["내 북마크"]),
    listEl
  ]);

  host.appendChild(card);
  rerender();
};
