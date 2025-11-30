// 회원가입 폼 처리
(function() {
  const form = document.getElementById('signupForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const passwordConfirmInput = document.getElementById('passwordConfirm');
  const nicknameInput = document.getElementById('nickname');
  
  const emailError = document.getElementById('emailError');
  const passwordError = document.getElementById('passwordError');
  const passwordConfirmError = document.getElementById('passwordConfirmError');
  const nicknameError = document.getElementById('nicknameError');
  
  const checkEmailBtn = document.getElementById('checkEmailBtn');
  const togglePassword = document.getElementById('togglePassword');
  const togglePasswordConfirm = document.getElementById('togglePasswordConfirm');
  
  // 약관 동의 관련
  const termsAgreeCheckbox = document.getElementById('termsAgree');
  const privacyAgreeCheckbox = document.getElementById('privacyAgree');
  const ageAgreeCheckbox = document.getElementById('ageAgree');
  const viewTermsBtn = document.getElementById('viewTermsBtn');
  const viewPrivacyBtn = document.getElementById('viewPrivacyBtn');
  
  // 프로필 이미지 관련
  const profilePreview = document.getElementById('profilePreview');
  const selectImageBtn = document.getElementById('selectImageBtn');
  const resetImageBtn = document.getElementById('resetImageBtn');
  const profileImageInput = document.getElementById('profileImageInput');
  
  let isEmailChecked = false;
  let selectedProfileImage = null;
  
  // 비밀번호 표시/숨기기 토글 - 누르고 있을 때만 보임
  function setupPasswordToggle(toggleBtn, inputField) {
    if (!toggleBtn || !inputField) return;
    
    const eyeOpenSVG = `
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    `;
    
    const eyeClosedSVG = `
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    `;
    
    // mousedown: 누르는 순간 보이기
    toggleBtn.addEventListener('mousedown', function(e) {
      e.preventDefault();
      inputField.setAttribute('type', 'text');
      
      const iconEye = toggleBtn.querySelector('.icon-eye');
      iconEye.innerHTML = eyeOpenSVG;
    });
    
    // mouseup/mouseleave: 떼는 순간 숨기기
    function hidePassword() {
      inputField.setAttribute('type', 'password');
      
      const iconEye = toggleBtn.querySelector('.icon-eye');
      iconEye.innerHTML = eyeClosedSVG;
    }
    
    toggleBtn.addEventListener('mouseup', hidePassword);
    toggleBtn.addEventListener('mouseleave', hidePassword);
    
    // 터치 이벤트도 처리 (모바일)
    toggleBtn.addEventListener('touchstart', function(e) {
      e.preventDefault();
      inputField.setAttribute('type', 'text');
      
      const iconEye = toggleBtn.querySelector('.icon-eye');
      iconEye.innerHTML = eyeOpenSVG;
    });
    
    toggleBtn.addEventListener('touchend', hidePassword);
  }
  
  setupPasswordToggle(togglePassword, passwordInput);
  setupPasswordToggle(togglePasswordConfirm, passwordConfirmInput);
  
  // 프로필 이미지 선택
  selectImageBtn.addEventListener('click', function() {
    profileImageInput.click();
  });
  
  profileImageInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('파일 크기는 5MB 이하여야 합니다.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = function(e) {
        selectedProfileImage = e.target.result;
        profilePreview.innerHTML = `<img src="${e.target.result}" alt="프로필 이미지" />`;
      };
      reader.readAsDataURL(file);
    }
  });
  
  // 프로필 이미지 초기화
  resetImageBtn.addEventListener('click', function() {
    selectedProfileImage = null;
    profileImageInput.value = '';
    profilePreview.innerHTML = '<span class="avatar-placeholder">👤</span>';
  });
  
  // 이메일 유효성 검사
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
  
  // 비밀번호 유효성 검사 (8자 이상, 영문, 숫자, 특수문자 포함)
  function validatePassword(password) {
    if (password.length < 8) return false;
    
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return hasLetter && hasNumber && hasSpecial;
  }
  
  // 에러 메시지 표시
  function showError(inputElement, errorElement, message) {
    inputElement.classList.add('error');
    inputElement.classList.remove('success');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }
  
  // 에러 메시지 제거
  function clearError(inputElement, errorElement) {
    inputElement.classList.remove('error');
    errorElement.textContent = '';
    errorElement.style.display = 'none';
  }
  
  // 성공 상태 표시
  function showSuccess(inputElement, errorElement) {
    inputElement.classList.remove('error');
    inputElement.classList.add('success');
    errorElement.textContent = '';
    errorElement.style.display = 'none';
  }
  
  // 이메일 중복 확인
  checkEmailBtn.addEventListener('click', function() {
    const email = emailInput.value.trim();
    
    if (!email) {
      showError(emailInput, emailError, '이메일을 입력해주세요.');
      return;
    }
    
    if (!validateEmail(email)) {
      showError(emailInput, emailError, '올바른 이메일 형식이 아닙니다.');
      return;
    }
    
    // 실제로는 서버에 요청해야 하지만, 여기서는 시뮬레이션
    checkEmailBtn.disabled = true;
    checkEmailBtn.textContent = '확인 중...';
    
    setTimeout(() => {
      // 랜덤으로 사용 가능/불가능 결정 (실제로는 서버 응답)
      const isAvailable = Math.random() > 0.3; // 70% 확률로 사용 가능
      
      if (isAvailable) {
        isEmailChecked = true;
        showSuccess(emailInput, emailError);
        checkEmailBtn.classList.add('verified');
        checkEmailBtn.textContent = '확인완료';
        // 이메일 입력창은 disabled 하지 않음 (재입력 가능)
      } else {
        isEmailChecked = false;
        showError(emailInput, emailError, '이미 사용 중인 이메일입니다.');
        checkEmailBtn.classList.remove('verified');
        checkEmailBtn.textContent = '중복확인';
        checkEmailBtn.disabled = false;
      }
    }, 800);
  });
  
  // 이메일 입력 시 중복확인 초기화
  emailInput.addEventListener('input', function() {
    if (isEmailChecked) {
      isEmailChecked = false;
      checkEmailBtn.classList.remove('verified');
      checkEmailBtn.textContent = '중복확인';
      checkEmailBtn.disabled = false;
      emailInput.classList.remove('success');
    }
    clearError(emailInput, emailError);
  });
  
  // 비밀번호 실시간 검증
  passwordInput.addEventListener('input', function() {
    clearError(passwordInput, passwordError);
    
    // 비밀번호 확인란이 입력된 경우, 일치 여부도 체크
    if (passwordConfirmInput.value) {
      if (passwordInput.value !== passwordConfirmInput.value) {
        showError(passwordConfirmInput, passwordConfirmError, '비밀번호가 일치하지 않습니다.');
      } else {
        clearError(passwordConfirmInput, passwordConfirmError);
      }
    }
  });
  
  // 비밀번호 확인 실시간 검증
  passwordConfirmInput.addEventListener('input', function() {
    if (passwordInput.value !== passwordConfirmInput.value) {
      showError(passwordConfirmInput, passwordConfirmError, '비밀번호가 일치하지 않습니다.');
    } else {
      clearError(passwordConfirmInput, passwordConfirmError);
    }
  });
  
  // 폼 제출
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    let isValid = true;
    
    // 닉네임 검증
    const nickname = nicknameInput.value.trim();
    if (!nickname) {
      showError(nicknameInput, nicknameError, '닉네임을 입력해주세요.');
      isValid = false;
    } else {
      clearError(nicknameInput, nicknameError);
    }
    
    // 이메일 검증
    const email = emailInput.value.trim();
    if (!email) {
      showError(emailInput, emailError, '이메일을 입력해주세요.');
      isValid = false;
    } else if (!validateEmail(email)) {
      showError(emailInput, emailError, '올바른 이메일 형식이 아닙니다.');
      isValid = false;
    } else if (!isEmailChecked) {
      showError(emailInput, emailError, '이메일 중복 확인을 해주세요.');
      isValid = false;
    } else {
      clearError(emailInput, emailError);
    }
    
    // 비밀번호 검증
    const password = passwordInput.value;
    if (!password) {
      showError(passwordInput, passwordError, '비밀번호를 입력해주세요.');
      isValid = false;
    } else if (!validatePassword(password)) {
      showError(passwordInput, passwordError, '비밀번호는 8자 이상, 영문, 숫자, 특수문자를 포함해야 합니다.');
      isValid = false;
    } else {
      clearError(passwordInput, passwordError);
    }
    
    // 비밀번호 확인 검증
    const passwordConfirm = passwordConfirmInput.value;
    if (!passwordConfirm) {
      showError(passwordConfirmInput, passwordConfirmError, '비밀번호 확인을 입력해주세요.');
      isValid = false;
    } else if (password !== passwordConfirm) {
      showError(passwordConfirmInput, passwordConfirmError, '비밀번호가 일치하지 않습니다.');
      isValid = false;
    } else {
      clearError(passwordConfirmInput, passwordConfirmError);
    }
    
    // 약관 동의 검증
    const missingTerms = [];
    
    if (!termsAgreeCheckbox.checked) {
      missingTerms.push('서비스 이용약관');
    }
    
    if (!privacyAgreeCheckbox.checked) {
      missingTerms.push('개인정보 처리방침');
    }
    
    if (!ageAgreeCheckbox.checked) {
      missingTerms.push('만 14세 이상 확인');
    }
    
    if (missingTerms.length > 0) {
      alert('다음 항목에 동의해주세요:\n• ' + missingTerms.join('\n• '));
      isValid = false;
    }
    
    if (!isValid) {
      return;
    }
    
    // 회원가입 성공 처리
    
    // 실제로는 서버에 데이터 전송
    console.log('회원가입 정보:', {
      email,
      password,
      nickname,
      profileImage: selectedProfileImage
    });
    
    // 성공 메시지 표시 후 로그인 페이지로 이동
    alert('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.');
    window.location.href = 'login.html';
  });
  
  // 입력 필드 포커스 시 에러 제거
  [emailInput, passwordInput, passwordConfirmInput, nicknameInput].forEach(input => {
    input.addEventListener('focus', function() {
      this.classList.remove('error');
    });
  });
})();
