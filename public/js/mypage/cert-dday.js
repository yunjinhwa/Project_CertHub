// 관심 자격증 D-day 모듈

// 더미 데이터 기반 북마크 데이터
const mockBookmarks = [
  { id: 1, name: "정보처리기사", examDate: "2025-11-29" },
  { id: 2, name: "ADsP(데이터분석 준전문가)", examDate: "2025-12-15" },
  { id: 3, name: "SQLD(SQL 개발자)", examDate: "2026-01-10" },
  { id: 4, name: "정보보안기사", examDate: "2026-02-20" },
  { id: 5, name: "컴퓨터활용능력 1급", examDate: "2025-12-05" },
  { id: 6, name: "빅데이터분석기사", examDate: "2025-12-20" },
  { id: 7, name: "SQLP(SQL 전문가)", examDate: "2026-01-25" },
  { id: 8, name: "네트워크관리사 2급", examDate: "2025-12-10" },
  { id: 9, name: "정보처리산업기사", examDate: "2026-02-05" },
  { id: 10, name: "TOEIC Speaking", examDate: "2025-12-28" }
];

// D-day 계산 함수
function calculateDday(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const examDate = new Date(dateStr);
  examDate.setHours(0, 0, 0, 0);
  const diff = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));
  return diff;
}

// 현재 선택된 자격증 (null이면 목록 표시)
let selectedCert = null;

// 관심 자격증 D-day 렌더링
window.renderCertDday = function() {
  const container = document.getElementById("certDdayContent");
  if (!container) return;
  
  // 북마크 목록 표시 (클릭 불가능)
  container.innerHTML = `
    <div class="row-between mb-12">
      <h3 class="h3">디데이</h3>
    </div>
    <ul class="cert-bookmark-list" id="certBookmarkList"></ul>
  `;
  
  const listContainer = document.getElementById("certBookmarkList");
  if (listContainer) {
    // ㄱㄴㄷ 순으로 정렬
    const sortedBookmarks = [...mockBookmarks].sort((a, b) => a.name.localeCompare(b.name, 'ko'));
    
    sortedBookmarks.forEach(cert => {
      const dday = calculateDday(cert.examDate);
      const ddayText = dday === 0 ? "D-Day" : dday > 0 ? `D-${dday}` : `D+${Math.abs(dday)}`;
      
      const li = document.createElement("li");
      li.className = "cert-bookmark-item";
      li.innerHTML = `
        <span class="cert-name">${cert.name}</span>
        <div class="cert-info-row">
          <span class="cert-exam-date">${cert.examDate}</span>
          <span class="cert-dday">${ddayText}</span>
        </div>
      `;
      listContainer.appendChild(li);
    });
  }
};
