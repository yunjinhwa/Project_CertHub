// 약관 모달 팝업 관리
(function() {
  // 모달 HTML 생성
  const modalHTML = `
    <div class="terms-modal" id="termsModal">
      <div class="terms-modal-overlay" id="termsModalOverlay"></div>
      <div class="terms-modal-content">
        <div class="terms-modal-header">
          <h2 id="termsModalTitle">서비스 이용약관</h2>
          <button class="terms-modal-close" id="termsModalClose">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <div class="terms-modal-body" id="termsModalBody">
          <!-- 약관 내용이 여기에 표시됩니다 -->
        </div>
        <div class="terms-modal-footer">
          <button class="btn-modal-close" id="btnModalClose">닫기</button>
        </div>
      </div>
    </div>
  `;

  // 모달을 body에 추가
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  const modal = document.getElementById('termsModal');
  const modalOverlay = document.getElementById('termsModalOverlay');
  const modalClose = document.getElementById('termsModalClose');
  const btnModalClose = document.getElementById('btnModalClose');
  const modalTitle = document.getElementById('termsModalTitle');
  const modalBody = document.getElementById('termsModalBody');

  // 약관 내용
  const termsContent = {
    service: {
      title: '서비스 이용약관',
      content: `
        <h3>제1조 (목적)</h3>
        <p>본 약관은 CertHub가 제공하는 자격증 정보 제공 및 관리 서비스의 이용과 관련하여 필요한 사항을 규정함을 목적으로 합니다.</p>

        <h3>제2조 (서비스의 내용)</h3>
        <p>본 서비스는 다음과 같은 기능을 제공합니다:</p>
        <ul>
          <li>자격증 정보 검색 및 열람</li>
          <li>시험 일정 정보 제공</li>
          <li>학습 진도 관리 및 D-day 카운트다운</li>
        </ul>

        <h3>제3조 (회원가입)</h3>
        <p>1. 이용자는 가입 양식에 따라 정보를 입력한 후 본 약관에 동의함으로써 회원가입을 신청합니다.</p>
        <p>2. 허위 정보로 가입한 경우 서비스 이용이 제한될 수 있습니다.</p>

        <h3>제4조 (회원정보의 관리)</h3>
        <p>1. 회원은 마이페이지를 통해 언제든지 본인의 정보를 열람하고 수정할 수 있습니다.</p>
        <p>2. 회원은 언제든지 탈퇴를 요청할 수 있습니다.</p>

        <h3>제5조 (서비스의 중단)</h3>
        <p>서버 점검, 장애 등의 사유로 서비스가 일시적으로 중단될 수 있습니다.</p>

        <h3>제6조 (금지 행위)</h3>
        <p>회원은 다음 행위를 하여서는 안됩니다:</p>
        <ul>
          <li>허위 정보 등록</li>
          <li>타인의 정보 도용</li>
          <li>서비스 운영 방해</li>
          <li>법령에 위배되는 행위</li>
        </ul>

        <h3>부칙</h3>
        <p>본 약관은 2024년 1월 1일부터 시행됩니다.</p>
      `
    },
    privacy: {
      title: '개인정보 처리방침',
      content: `
        <h3>1. 개인정보의 수집 및 이용목적</h3>
        <p>CertHub는 다음의 목적을 위하여 최소한의 개인정보를 수집합니다:</p>
        <ul>
          <li>회원 가입 및 본인 확인</li>
          <li>서비스 제공 (자격증 정보 제공, 학습 진도 관리)</li>
        </ul>

        <h3>2. 수집하는 개인정보의 항목</h3>
        
        <h4>필수 항목</h4>
        <ul>
          <li>이메일 주소</li>
          <li>비밀번호 (암호화 저장)</li>
          <li>닉네임</li>
        </ul>
        
        <h4>선택 항목</h4>
        <ul>
          <li>프로필 이미지</li>
          <li>관심 자격증 정보</li>
        </ul>
        
        <h4>자동 수집 항목</h4>
        <ul>
          <li>서비스 이용기록</li>
          <li>접속 로그</li>
        </ul>

        <h3>3. 개인정보의 보유 및 이용기간</h3>
        <p>회원 탈퇴 시까지 보유하며, 탈퇴 즉시 삭제됩니다.</p>

        <h3>4. 개인정보의 제3자 제공</h3>
        <p>수집된 개인정보는 원칙적으로 제3자에게 제공되지 않습니다. 다만, 법령에 따라 수사기관의 요청이 있는 경우 제공될 수 있습니다.</p>

        <h3>5. 개인정보 처리 위탁</h3>
        <p>서비스 운영을 위해 Firebase(Google)를 통해 데이터를 저장 및 관리합니다.</p>

        <h3>6. 정보주체의 권리</h3>
        <p>회원은 언제든지 마이페이지에서 개인정보를 열람, 수정, 삭제할 수 있으며, 회원 탈퇴를 통해 개인정보 삭제를 요청할 수 있습니다.</p>

        <h3>7. 개인정보의 파기</h3>
        <p>회원 탈퇴 시 개인정보는 즉시 파기됩니다.</p>

        <h3>8. 개인정보의 안전성 확보</h3>
        <p>비밀번호는 암호화되어 저장되며, Firebase의 보안 시스템을 통해 데이터가 보호됩니다.</p>

        <h3>부칙</h3>
        <p>본 방침은 2024년 1월 1일부터 시행됩니다.</p>
      `
    }
  };

  // 모달 열기 함수
  function openModal(type) {
    const content = termsContent[type];
    modalTitle.textContent = content.title;
    modalBody.innerHTML = content.content;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  // 모달 닫기 함수
  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  // 서비스 약관 버튼
  const viewTermsBtn = document.getElementById('viewTermsBtn');
  if (viewTermsBtn) {
    viewTermsBtn.addEventListener('click', function() {
      openModal('service');
    });
  }

  // 개인정보 처리방침 버튼
  const viewPrivacyBtn = document.getElementById('viewPrivacyBtn');
  if (viewPrivacyBtn) {
    viewPrivacyBtn.addEventListener('click', function() {
      openModal('privacy');
    });
  }

  // 모달 닫기 이벤트
  modalOverlay.addEventListener('click', closeModal);
  modalClose.addEventListener('click', closeModal);
  btnModalClose.addEventListener('click', closeModal);

  // ESC 키로 모달 닫기
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
})();
