// 관심 자격증 D-day 모듈

// D-day 계산 함수
function calculateDday(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const examDate = new Date(dateStr);
  examDate.setHours(0, 0, 0, 0);
  const diff = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));
  return diff;
}

// 관심 자격증 D-day 렌더링
window.renderCertDday = function() {
  const container = document.getElementById("certDdayContent");
  if (!container) return;
  
  // 예시 데이터 (나중에 사용자 선택 자격증으로 교체)
  // null로 설정하면 빈 상태가 표시됩니다
  const selectedCert = {
    name: "정보처리기사",
    examDate: "2025-11-29",
    field: "IT/개발"
  };
  // 빈 상태 테스트하려면 위 객체를 주석처리하고 아래 주석을 해제하세요
  // const selectedCert = null;
  
  function renderContent() {
    // 선택된 자격증이 없을 때
    if (!selectedCert) {
      container.innerHTML = `
        <div class="cert-dday-empty">
          <p class="cert-empty-text">관심 자격증을 선택해주세요</p>
          <button class="btn-cert-select">자격증 선택하기</button>
        </div>
      `;
      
      const selectBtn = container.querySelector(".btn-cert-select");
      if (selectBtn) {
        selectBtn.addEventListener("click", () => {
          showModal("자격증 선택", "자격증 선택 기능은 준비 중입니다.");
        });
      }
      return;
    }
    
    const dday = calculateDday(selectedCert.examDate);
    const ddayText = dday === 0 ? "D-Day" : dday > 0 ? `D-${dday}` : `D+${Math.abs(dday)}`;
    const ddayClass = dday <= 7 ? "urgent" : dday <= 30 ? "warning" : "normal";
    
    container.innerHTML = `
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
      <div class="cert-dday-display ${ddayClass}">
        ${ddayText}
      </div>
      <button class="btn-cert-detail" id="certDetailBtn">
        <span>자세히 보기</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polyline points="9 18 15 12 9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    `;
    
    // 자세히 보기 버튼 이벤트
    const detailBtn = document.getElementById("certDetailBtn");
    if (detailBtn) {
      detailBtn.addEventListener("click", () => {
        showModal("자격증 정보", `${selectedCert.name}에 대한 상세 정보는 준비 중입니다.`);
      });
    }
  }
  
  renderContent();
};
