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
  
  // 북마크 목록 표시
  if (!selectedCert) {
    container.innerHTML = `
      <div class="row-between mb-12">
        <h3 class="h3">디데이</h3>
      </div>
      <ul class="cert-bookmark-list" id="certBookmarkList"></ul>
    `;
    
    const listContainer = document.getElementById("certBookmarkList");
    if (listContainer) {
      mockBookmarks.forEach(cert => {
        const li = document.createElement("li");
        li.className = "cert-bookmark-item";
        li.textContent = cert.name;
        li.addEventListener("click", () => {
          selectedCert = cert;
          window.renderCertDday();
        });
        listContainer.appendChild(li);
      });
    }
    return;
  }
  
  // D-day 상세 화면
  const dday = calculateDday(selectedCert.examDate);
  const ddayText = dday === 0 ? "D-Day" : dday > 0 ? `D-${dday}` : `D+${Math.abs(dday)}`;
  
  container.innerHTML = `
    <div class="cert-detail-back">
      <button class="btn-back" id="btnBack">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polyline points="15 18 9 12 15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
    <h3 class="cert-name">${selectedCert.name}</h3>
    <div class="cert-exam-date">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>${selectedCert.examDate}</span>
    </div>
    <div class="cert-dday-display">
      ${ddayText}
    </div>
    <button class="btn-cert-detail" id="certDetailBtn">
      <span>자세히 보기</span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polyline points="9 18 15 12 9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  `;
  
  // 뒤로 버튼 이벤트
  const backBtn = document.getElementById("btnBack");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      selectedCert = null;
      window.renderCertDday();
    });
  }
  
  // 자세히 보기 버튼 이벤트
  const detailBtn = document.getElementById("certDetailBtn");
  if (detailBtn) {
    detailBtn.addEventListener("click", () => {
      showModal("자격증 정보", `${selectedCert.name}에 대한 상세 정보는 준비 중입니다.`);
    });
  }
};
