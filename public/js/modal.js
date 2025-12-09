// js/modal.js

(function () {
  const overlay = document.getElementById("detailModal");
  const titleEl = document.getElementById("modalTitle");
  const bodyEl = document.getElementById("modalBody");
  const closeBtn = document.getElementById("modalCloseBtn");

  if (!overlay || !bodyEl) {
    console.error("모달 요소(detailModal / modalBody)를 찾을 수 없습니다.");
    return;
  }

  function closeModal() {
    overlay.classList.add("hidden");
    bodyEl.innerHTML = "";
  }

  // 전역에서 사용할 수 있게 window에 함수 등록
  window.showModal = function (title, content) {
    console.log("showModal 호출:", title);

    // 제목 세팅
    if (titleEl) {
      titleEl.textContent = title || "";
    }

    // 내용 비우고 다시 채우기
    bodyEl.innerHTML = "";

    if (content instanceof HTMLElement) {
      bodyEl.appendChild(content);
    } else if (typeof content === "string") {
      bodyEl.innerHTML = content;
    } else {
      bodyEl.textContent = "내용이 없습니다.";
    }

    overlay.classList.remove("hidden");
  };

  // 닫기 버튼
  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  // 바깥 클릭 시 닫기
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      closeModal();
    }
  });

  // 처음에는 항상 닫힌 상태
  closeModal();
})();
