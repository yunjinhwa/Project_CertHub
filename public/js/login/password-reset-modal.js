// 비밀번호 찾기 모달 관리
(function() {
  // 모달 HTML 생성
  const modalHTML = `
    <div class="password-reset-modal" id="passwordResetModal">
      <div class="password-reset-overlay" id="passwordResetOverlay"></div>
      <div class="password-reset-content">
        <div class="password-reset-header">
          <h2>비밀번호 찾기</h2>
          <button class="password-reset-close" id="passwordResetClose">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        
        <div class="password-reset-body">
          <!-- Step 1: 이메일 입력 -->
          <div class="reset-step active" id="resetStep1">
            <h3 class="reset-step-title">이메일 인증</h3>
            <p class="reset-step-desc">가입하신 이메일 주소를 입력하시면 6자리 인증번호를 발송해드립니다.</p>
            
            <div class="reset-form-group">
              <label class="reset-form-label">이메일 주소</label>
              <div class="reset-input-wrapper">
                <input 
                  type="email" 
                  class="reset-form-input" 
                  id="resetEmail" 
                  placeholder="example@email.com"
                />
              </div>
              <span class="reset-error-message" id="resetEmailError"></span>
            </div>
          </div>

          <!-- Step 2: 인증번호 입력 -->
          <div class="reset-step" id="resetStep2">
            <h3 class="reset-step-title">인증번호 확인</h3>
            <p class="reset-step-desc">입력하신 이메일로 발송된 6자리 인증번호를 입력해주세요.</p>
            
            <div class="reset-success-message" id="codeSentMessage">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span id="sentEmailAddress"></span>로 인증번호가 발송되었습니다.
            </div>
            
            <div class="reset-form-group">
              <label class="reset-form-label">인증번호 입력</label>
              <div class="reset-code-inputs">
                <input type="text" maxlength="1" class="reset-code-input" id="code1" />
                <input type="text" maxlength="1" class="reset-code-input" id="code2" />
                <input type="text" maxlength="1" class="reset-code-input" id="code3" />
                <input type="text" maxlength="1" class="reset-code-input" id="code4" />
                <input type="text" maxlength="1" class="reset-code-input" id="code5" />
                <input type="text" maxlength="1" class="reset-code-input" id="code6" />
              </div>
              <span class="reset-error-message" id="resetCodeError"></span>
            </div>
            
            <div class="reset-resend-code">
              <button type="button" id="resendCodeBtn">인증번호 재발송</button>
              <span class="reset-timer" id="resetTimer"></span>
            </div>
          </div>

          <!-- Step 3: 비밀번호 발급 완료 -->
          <div class="reset-step" id="resetStep3">
            <h3 class="reset-step-title">비밀번호 발송 완료</h3>
            <p class="reset-step-desc">고객님의 비밀번호와 재설정 링크가 이메일로 발송되었습니다.</p>
            
            <div class="reset-success-message show">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>비밀번호 정보가 <strong id="finalEmailAddress"></strong>로 발송되었습니다.</span>
            </div>
            
            <p class="reset-step-desc" style="margin-top: 20px;">
              이메일을 확인하신 후 비밀번호로 로그인해주세요.<br>
              <strong>보안을 위해 이메일에 포함된 재설정 링크를 통해 비밀번호를 변경하시기 바랍니다.</strong><br>
              <small style="color: var(--muted);">※ 재설정 링크는 24시간 동안 유효합니다.</small>
            </p>
          </div>
        </div>
        
        <div class="password-reset-footer">
          <button class="btn-reset-cancel" id="btnResetCancel">취소</button>
          <button class="btn-reset-submit" id="btnResetSubmit">인증번호 발송</button>
        </div>
      </div>
    </div>
  `;

  // 모달을 body에 추가
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  const modal = document.getElementById('passwordResetModal');
  const overlay = document.getElementById('passwordResetOverlay');
  const closeBtn = document.getElementById('passwordResetClose');
  const cancelBtn = document.getElementById('btnResetCancel');
  const submitBtn = document.getElementById('btnResetSubmit');
  
  const step1 = document.getElementById('resetStep1');
  const step2 = document.getElementById('resetStep2');
  const step3 = document.getElementById('resetStep3');
  
  const resetEmail = document.getElementById('resetEmail');
  const resetEmailError = document.getElementById('resetEmailError');
  const codeSentMessage = document.getElementById('codeSentMessage');
  const sentEmailAddress = document.getElementById('sentEmailAddress');
  const finalEmailAddress = document.getElementById('finalEmailAddress');
  
  const codeInputs = [
    document.getElementById('code1'),
    document.getElementById('code2'),
    document.getElementById('code3'),
    document.getElementById('code4'),
    document.getElementById('code5'),
    document.getElementById('code6')
  ];
  const resetCodeError = document.getElementById('resetCodeError');
  const resendCodeBtn = document.getElementById('resendCodeBtn');
  const resetTimer = document.getElementById('resetTimer');
  
  let currentStep = 1;
  let timerInterval = null;
  let timeLeft = 180; // 3분

  // 이메일 유효성 검사
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // 에러 표시
  function showError(element, message) {
    element.textContent = message;
  }

  // 에러 제거
  function clearError(element) {
    element.textContent = '';
  }

  // 타이머 시작
  function startTimer() {
    timeLeft = 180;
    resendCodeBtn.disabled = true;
    
    timerInterval = setInterval(() => {
      timeLeft--;
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      resetTimer.textContent = `(${minutes}:${seconds.toString().padStart(2, '0')})`;
      
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        resendCodeBtn.disabled = false;
        resetTimer.textContent = '';
      }
    }, 1000);
  }

  // 타이머 정지
  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    resetTimer.textContent = '';
  }

  // Step 변경
  function goToStep(step) {
    currentStep = step;
    
    step1.classList.remove('active');
    step2.classList.remove('active');
    step3.classList.remove('active');
    
    if (step === 1) {
      step1.classList.add('active');
      submitBtn.textContent = '인증번호 발송';
      submitBtn.disabled = false;
      cancelBtn.style.display = 'block';
    } else if (step === 2) {
      step2.classList.add('active');
      submitBtn.textContent = '인증번호 확인';
      submitBtn.disabled = false;
      cancelBtn.style.display = 'block';
      codeSentMessage.classList.add('show');
      startTimer();
      codeInputs[0].focus();
    } else if (step === 3) {
      step3.classList.add('active');
      submitBtn.textContent = '로그인하기';
      submitBtn.disabled = false;
      cancelBtn.style.display = 'none';
      stopTimer();
    }
  }

  // 인증번호 입력 처리
  codeInputs.forEach((input, index) => {
    input.addEventListener('input', function(e) {
      const value = e.target.value;
      
      // 숫자만 입력 가능
      if (!/^\d*$/.test(value)) {
        e.target.value = '';
        return;
      }
      
      // 다음 입력칸으로 이동
      if (value && index < codeInputs.length - 1) {
        codeInputs[index + 1].focus();
      }
      
      clearError(resetCodeError);
    });
    
    input.addEventListener('keydown', function(e) {
      // Backspace: 이전 입력칸으로 이동
      if (e.key === 'Backspace' && !e.target.value && index > 0) {
        codeInputs[index - 1].focus();
      }
    });
    
    // 붙여넣기 처리
    input.addEventListener('paste', function(e) {
      e.preventDefault();
      const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
      
      pastedData.split('').forEach((char, i) => {
        if (i < codeInputs.length) {
          codeInputs[i].value = char;
        }
      });
      
      if (pastedData.length > 0) {
        const lastIndex = Math.min(pastedData.length - 1, codeInputs.length - 1);
        codeInputs[lastIndex].focus();
      }
    });
  });

  // 인증번호 재발송
  resendCodeBtn.addEventListener('click', function() {
    // 실제로는 서버에 재발송 요청
    console.log('인증번호 재발송:', resetEmail.value);
    
    // 입력칸 초기화
    codeInputs.forEach(input => {
      input.value = '';
      input.classList.remove('error');
    });
    clearError(resetCodeError);
    
    // 타이머 재시작
    stopTimer();
    startTimer();
    codeInputs[0].focus();
    
    alert('인증번호가 재발송되었습니다.');
  });

  // Submit 버튼 처리
  submitBtn.addEventListener('click', function() {
    if (currentStep === 1) {
      // Step 1: 이메일 입력
      const email = resetEmail.value.trim();
      
      if (!email) {
        showError(resetEmailError, '이메일을 입력해주세요.');
        resetEmail.classList.add('error');
        return;
      }
      
      if (!validateEmail(email)) {
        showError(resetEmailError, '올바른 이메일 형식이 아닙니다.');
        resetEmail.classList.add('error');
        return;
      }
      
      // TODO: 실제 DB 연결 시 아래 로직으로 교체
      // Mock 데이터베이스 (테스트용) - login.js와 동일한 사용자
      const mockUsers = [
        { email: 'test@example.com', password: 'test1234' },
        { email: 'user@certhub.com', password: 'certhub123' }
      ];
      
      // 이메일이 등록되어 있는지 확인
      const userExists = mockUsers.find(user => user.email === email);
      
      if (!userExists) {
        showError(resetEmailError, '등록되지 않은 이메일입니다. 이메일을 다시 확인해주세요.');
        resetEmail.classList.add('error');
        return;
      }
      
      // 실제로는 서버에 이메일 확인 및 인증번호 발송 요청
      console.log('인증번호 발송:', email);
      
      sentEmailAddress.textContent = email;
      goToStep(2);
      
    } else if (currentStep === 2) {
      // Step 2: 인증번호 확인
      const code = codeInputs.map(input => input.value).join('');
      
      if (code.length !== 6) {
        showError(resetCodeError, '6자리 인증번호를 모두 입력해주세요.');
        codeInputs.forEach(input => input.classList.add('error'));
        return;
      }
      
      // 실제로는 서버에 인증번호 확인 요청
      console.log('인증번호 확인:', code);
      
      // 임시: 랜덤으로 성공/실패 결정
      const isValid = Math.random() > 0.3;
      
      if (isValid) {
        finalEmailAddress.textContent = resetEmail.value;
        goToStep(3);
      } else {
        showError(resetCodeError, '인증번호가 일치하지 않습니다. 다시 확인해주세요.');
        codeInputs.forEach(input => input.classList.add('error'));
      }
      
    } else if (currentStep === 3) {
      // Step 3: 로그인 페이지로 이동
      closeModal();
      // 필요시 로그인 폼의 이메일에 자동 입력
      const loginEmailInput = document.getElementById('email');
      if (loginEmailInput) {
        loginEmailInput.value = resetEmail.value;
      }
    }
  });

  // 모달 열기
  function openModal() {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    goToStep(1);
    resetEmail.value = '';
    clearError(resetEmailError);
    resetEmail.classList.remove('error');
  }

  // 모달 닫기
  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    stopTimer();
    goToStep(1);
    
    // 입력값 초기화
    resetEmail.value = '';
    codeInputs.forEach(input => {
      input.value = '';
      input.classList.remove('error');
    });
    clearError(resetEmailError);
    clearError(resetCodeError);
    codeSentMessage.classList.remove('show');
  }

  // 이벤트 리스너
  overlay.addEventListener('click', closeModal);
  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);

  // ESC 키로 모달 닫기
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  // 비밀번호 찾기 링크 클릭
  const passwordFindLink = document.querySelector('.link-secondary');
  if (passwordFindLink) {
    passwordFindLink.addEventListener('click', function(e) {
      e.preventDefault();
      openModal();
    });
  }
})();
