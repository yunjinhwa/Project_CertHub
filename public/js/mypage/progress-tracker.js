// 나의 진행률 모듈

// 이번 주 할 일 진행률 렌더링
window.renderWeekProgress = function() {
  const container = document.getElementById("progressContent");
  if (!container) return;
  
  container.innerHTML = `
    <div class="progress-tracker">
      <div class="progress-header">
        <span class="progress-label">이번 주 할 일</span>
        <span class="progress-percentage" id="progressPercentage">0%</span>
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" id="progressBarFill"></div>
          <div class="progress-bar-glow" id="progressBarGlow"></div>
        </div>
      </div>
      <p class="progress-status" id="progressStatus">시작해볼까요?</p>
    </div>
  `;
  
  updateProgressDisplay();
};

// 진행률 업데이트
window.updateProgressDisplay = function() {
  if (!window.todoManager) return;
  
  const todos = todoManager.todos;
  const total = todos.length;
  const completed = todos.filter(t => t.completed).length;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  
  const percentageEl = document.getElementById("progressPercentage");
  const fillEl = document.getElementById("progressBarFill");
  const glowEl = document.getElementById("progressBarGlow");
  const statusEl = document.getElementById("progressStatus");
  
  if (percentageEl) {
    percentageEl.textContent = percentage + "%";
  }
  
  if (fillEl) {
    fillEl.style.width = percentage + "%";
  }
  
  if (glowEl) {
    glowEl.style.width = percentage + "%";
  }
  
  if (statusEl) {
    if (percentage === 0) {
      statusEl.textContent = "시작해볼까요?";
    } else if (percentage < 30) {
      statusEl.textContent = "좋은 시작이에요! 💪";
    } else if (percentage < 70) {
      statusEl.textContent = "절반 이상 완료! 화이팅! 🔥";
    } else if (percentage < 100) {
      statusEl.textContent = "거의 다 왔어요! 조금만 더! 🎯";
    } else {
      statusEl.textContent = "완료! 정말 멋져요! 🎉";
    }
  }
};

// 기존 updateWeekProgress를 새 함수로 대체
window.updateWeekProgress = function() {
  updateProgressDisplay();
};
