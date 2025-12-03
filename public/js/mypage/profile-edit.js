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

    // 기존: const saveProfile = () => {
  const saveProfile = async () => {
    if (currentName.trim().length === 0) return;

    // 🔹 1) 전역 userProfile 업데이트
    userProfile.name = currentName;
    userProfile.avatar = currentAvatar;
    userProfile.avatarType = currentAvatarType;

    // 🔹 2) Firestore users 문서 업데이트 (가능한 경우에만)
    try {
      if (
        window.firebaseUsersApi &&
        typeof window.firebaseUsersApi.updateCurrentUser === "function"
      ) {
        await window.firebaseUsersApi.updateCurrentUser({
          name: currentName,
          // 이미지일 때만 image 필드에 저장, 이모지/기본이면 null
          image: currentAvatarType === "image" ? currentAvatar : null,
        });
        console.log("Firestore 프로필 업데이트 완료");
      } else {
        console.warn("firebaseUsersApi.updateCurrentUser 를 찾을 수 없습니다.");
      }
    } catch (err) {
      console.error("Firestore 프로필 업데이트 중 에러:", err);
      // 실패해도 화면 변경은 이미 되었으니, 안내만
      setTimeout(
        () => showModal("알림", "프로필 저장 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."),
        100
      );
    }

    // 🔹 3) 마이페이지 상단 카드 UI 업데이트
    const nameElement = document.querySelector(".card .h3");
    const avatarElement = document.querySelector(".card .avatar");
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

    // 🔹 4) 모달 닫기 + 성공 메시지
    closeModal();
    setTimeout(() => showModal("알림", "프로필이 저장되었습니다."), 100);
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
          //updateAvatarDisplay();
          //파이어베이스 스토리지는 유료이다.
          console.log("추후 지원 예정입니다");
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
  
    // 아바타 영역을 다시 그려주는 함수
  // const updateAvatarDisplay = () => {
  //   // 아바타 DOM 비우기
  //   avatarElement.innerHTML = "";

  //   // 타입에 따라 이미지 / 이모지 표시
  //   if (currentAvatarType === "image" && currentAvatar) {
  //     const img = createEl("img", {
  //       src: currentAvatar,
  //       alt: "프로필 사진",
  //     });
  //     avatarElement.appendChild(img);
  //   } else {
  //     // 이미지가 아니면 이모지(또는 기본값) 표시
  //     avatarElement.textContent = currentAvatar || DEFAULT_AVATAR;
  //   }

  //   // 아바타가 바뀌면 저장 버튼 상태도 다시 체크
  //   updateSaveButton();
  // };


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
