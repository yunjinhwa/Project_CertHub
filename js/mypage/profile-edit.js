// 프로필 편집 모듈
// 프로필 데이터 (실제로는 API에서 가져올 데이터)
window.userProfile = {
  name: "홍길동",
  avatar: "👤", // 이모지 또는 이미지 URL
  avatarType: "emoji" // "emoji" 또는 "image"
};

const DEFAULT_AVATAR = "👤";

// 프로필 편집 모달 표시
window.showEditProfileModal = function() {
  const originalName = userProfile.name;
  const originalAvatar = userProfile.avatar;
  const originalAvatarType = userProfile.avatarType;
  
  let currentName = originalName;
  let currentAvatar = originalAvatar;
  let currentAvatarType = originalAvatarType;
  let errorMessage = "";

  const updateSaveButton = () => {
    const nameIsValid = currentName.trim().length > 0;
    const hasChanges = currentName !== originalName || currentAvatar !== originalAvatar;
    
    if (!nameIsValid) {
      errorMessage = "이름을 입력해야 합니다.";
      nameInput.classList.add("error");
      errorEl.textContent = errorMessage;
      errorEl.style.display = "block";
      saveBtn.disabled = true;
    } else {
      errorMessage = "";
      nameInput.classList.remove("error");
      errorEl.style.display = "none";
      saveBtn.disabled = !hasChanges;
    }
  };

  const closeModal = () => {
    const backdrop = document.querySelector(".modal-backdrop");
    const modal = document.querySelector(".modal");
    if (backdrop) document.body.removeChild(backdrop);
    if (modal) document.body.removeChild(modal);
    // 스크롤 복구
    document.body.classList.remove("modal-open");
    document.body.style.removeProperty("--scrollbar-width");
  };

  const saveProfile = () => {
    if (currentName.trim().length === 0) return;
    
    // API 호출 예정 지점
    userProfile.name = currentName;
    userProfile.avatar = currentAvatar;
    userProfile.avatarType = currentAvatarType;
    
    // UI 업데이트
    const nameElement = document.querySelector(".h3");
    const avatarElement = document.querySelector(".avatar");
    if (nameElement) nameElement.textContent = currentName + " 님";
    if (avatarElement) {
      avatarElement.innerHTML = "";
      if (currentAvatarType === "image") {
        const img = createEl("img", { src: currentAvatar, alt: "프로필 사진" });
        avatarElement.appendChild(img);
      } else {
        avatarElement.textContent = currentAvatar;
      }
    }
    
    closeModal();
    // 성공 메시지 (선택사항)
    setTimeout(() => showModal("알림", "프로필이 저장되었습니다."), 100);
  };

  // 아바타 업데이트 함수
  const updateAvatarDisplay = () => {
    avatarElement.innerHTML = "";
    if (currentAvatarType === "image") {
      const img = createEl("img", { src: currentAvatar, alt: "프로필 사진" });
      avatarElement.appendChild(img);
    } else {
      avatarElement.textContent = currentAvatar;
    }
    updateSaveButton();
  };

  // 파일 입력 생성
  const fileInput = createEl("input", {
    type: "file",
    id: "avatarFileInput",
    accept: "image/*",
    onChange: (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          currentAvatar = event.target.result;
          currentAvatarType = "image";
          updateAvatarDisplay();
        };
        reader.readAsDataURL(file);
      }
    }
  });
  
  const avatarElement = createEl("div", { 
    class: "profile-avatar-edit",
    onClick: () => {
      fileInput.click();
    }
  });
  
  // 초기 아바타 표시
  if (currentAvatarType === "image") {
    const img = createEl("img", { src: currentAvatar, alt: "프로필 사진" });
    avatarElement.appendChild(img);
  } else {
    avatarElement.textContent = currentAvatar;
  }

  // 아바타 액션 버튼들
  const uploadBtn = createEl("button", {
    class: "btn ghost",
    type: "button",
    onClick: () => fileInput.click()
  }, ["사진 업로드"]);

  const defaultBtn = createEl("button", {
    class: "btn ghost",
    type: "button",
    onClick: () => {
      currentAvatar = DEFAULT_AVATAR;
      currentAvatarType = "emoji";
      updateAvatarDisplay();
    }
  }, ["기본으로 설정"]);

  const errorEl = createEl("span", { 
    class: "form-error",
    style: "display: none;"
  }, [""]);

  const nameInput = createEl("input", { 
    class: "form-input",
    type: "text",
    value: currentName,
    placeholder: "닉네임을 입력하세요",
    onInput: (e) => {
      currentName = e.target.value;
      updateSaveButton();
    }
  });

  const cancelBtn = createEl("button", { 
    class: "btn ghost",
    onClick: closeModal
  }, ["취소"]);

  const saveBtn = createEl("button", { 
    class: "btn",
    disabled: true,
    onClick: saveProfile
  }, ["저장"]);

  const modalContent = createEl("div", { class: "profile-edit-container" }, [
    fileInput,
    avatarElement,
    createEl("div", { class: "avatar-actions" }, [
      defaultBtn,
      uploadBtn
    ]),
    createEl("div", { class: "profile-form" }, [
      createEl("div", { class: "form-group" }, [
        createEl("label", { class: "form-label" }, ["닉네임"]),
        nameInput,
        errorEl
      ])
    ])
  ]);

  // 스크롤바 너비 계산 및 배경 스크롤 막기
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  document.body.style.setProperty("--scrollbar-width", scrollbarWidth + "px");
  document.body.classList.add("modal-open");

  const backdrop = createEl("div", { class: "modal-backdrop" });
  backdrop.addEventListener("click", closeModal);

  const modal = createEl("div", { class: "modal" }, [
    createEl("div", { class: "modal-header" }, [
      createEl("h3", { class: "h3" }, ["프로필 편집"]),
      createEl("button", { 
        class: "btn ghost", 
        style: "padding: 4px 8px; font-size: 20px; line-height: 1;",
        onClick: closeModal 
      }, ["×"])
    ]),
    createEl("div", { class: "modal-body" }, [modalContent]),
    createEl("div", { class: "modal-footer" }, [cancelBtn, saveBtn])
  ]);

  document.body.appendChild(backdrop);
  document.body.appendChild(modal);
  
  // 포커스를 닉네임 입력창으로
  setTimeout(() => nameInput.focus(), 100);
};
