// 마이페이지 초기화
document.addEventListener("DOMContentLoaded", () => {
  setupThemeToggle();
  renderTodo("todo-week");
  renderCertDday(); // 관심 자격증 D-day
  renderWeekProgress(); // 이번 주 할 일 진행률
  renderCertList("certlist-reco", "관심 기반 추천", DATA.certsReco);
  // mypage.js — replace the community render line
  const interestKeywords = (DATA.userKeywords || []).length ? DATA.userKeywords : ["it", "데이터", "회계"];
  renderCommunityByKeywords("community-latest-2", interestKeywords, "관심 키워드 커뮤니티");
  renderCalendar("calendar-2");
  renderBookmarks("bookmark-2");
  
  // 프로필 편집 버튼 이벤트 리스너
  const editProfileBtn = document.getElementById("editProfileBtn");
  if (editProfileBtn) {
    editProfileBtn.addEventListener("click", showEditProfileModal);
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