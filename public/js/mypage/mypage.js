// 마이페이지 초기화
document.addEventListener("DOMContentLoaded", async () => {
  console.log("=== 마이페이지 초기화 시작 ===");
  console.log("setupThemeToggle:", typeof setupThemeToggle);
  console.log("renderTodo:", typeof renderTodo);
  console.log("renderCertDday:", typeof renderCertDday);
  console.log("renderWeekProgress:", typeof renderWeekProgress);
  console.log("renderCertList:", typeof renderCertList);
  console.log("renderCommunityByKeywords:", typeof renderCommunityByKeywords);
  console.log("renderExamSchedule:", typeof renderExamSchedule);
  console.log("renderBookmarks:", typeof renderBookmarks);
  
  setupThemeToggle();
  renderTodo("todo-week");
  renderCertDday(); // 관심 자격증 D-day
  renderWeekProgress(); // 이번 주 할 일 진행률
  
  // 더미 데이터 기반 추천 시스템 사용
  const currentUserId = localStorage.getItem('currentUserId') || 'user001'; // 실제로는 로그인된 사용자 ID를 사용
  try {
    const recommendations = await loadDummyDataAndGenerateRecommendations(currentUserId);
    if (recommendations && recommendations.length > 0) {
      renderCertList("certlist-reco", "관심 기반 추천", recommendations);
    } else {
      renderCertList("certlist-reco", "관심 기반 추천", DATA.certsReco);
    }
  } catch (error) {
    console.error('추천 시스템 로드 실패:', error);
    renderCertList("certlist-reco", "관심 기반 추천", DATA.certsReco);
  }
  
  // mypage.js — replace the community render line
  const interestKeywords = (DATA.userKeywords || []).length ? DATA.userKeywords : ["it", "데이터", "회계"];
  renderCommunityByKeywords("community-latest-2", interestKeywords, "관심 키워드 커뮤니티");
  renderExamSchedule("exam-schedule-2");
  renderBookmarks("bookmark-2");
  
  // 프로필 편집 버튼 이벤트 리스너
  const editProfileBtn = document.getElementById("editProfileBtn");
  if (editProfileBtn) {
    editProfileBtn.addEventListener("click", showEditProfileModal);
  }

  // 로그아웃 버튼 이벤트 리스너
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      if (confirm("로그아웃 하시겠습니까?")) {
        // 로그인 상태 제거
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('loginTimestamp');
        
        // 로그인 페이지로 이동
        window.location.href = 'login.html';
      }
    });
  }

  // 할 일 관리 버튼 이벤트 리스너
  const manageTodoBtn = document.getElementById("manageTodoBtn");
  if (manageTodoBtn) {
    manageTodoBtn.addEventListener("click", showTodoManagerModal);
  }
  
  // 학습 시작 버튼 이벤트 리스너
  const startLearningBtn = document.getElementById("startLearningBtn");
  if (startLearningBtn) {
    startLearningBtn.addEventListener("click", () => showModal("알림", "학습 기능은 준비 중입니다."));
  }
});