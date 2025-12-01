// ============ Signup Steps Management ============

// Signup data object
const signupData = {
  profileImage: null,
  nickname: '',
  email: '',
  password: '',
  passwordConfirm: '',
  terms: {
    service: false,
    privacy: false,
    age: false
  }
};

let currentStep = 1;
let emailVerified = false;

// ============ DOM Elements ============

const signupStepsContainer = document.getElementById('signupStepsContainer');
const stepTitle = document.getElementById('stepTitle');
const stepSubtitle = document.getElementById('stepSubtitle');

// Step 1 elements
const profilePreview = document.getElementById('profilePreview');
const profileImageInput = document.getElementById('profileImageInput');
const selectImageBtn = document.getElementById('selectImageBtn');
const resetImageBtn = document.getElementById('resetImageBtn');
const nicknameInput = document.getElementById('nickname');
const nicknameError = document.getElementById('nicknameError');
const nextStep1Btn = document.getElementById('nextStep1');

// Step 2 elements
const emailInput = document.getElementById('email');
const checkEmailBtn = document.getElementById('checkEmailBtn');
const emailError = document.getElementById('emailError');
const prevStep2Btn = document.getElementById('prevStep2');
const nextStep2Btn = document.getElementById('nextStep2');

// Step 3 elements
const passwordInput = document.getElementById('password');
const passwordConfirmInput = document.getElementById('passwordConfirm');
const togglePasswordBtn = document.getElementById('togglePassword');
const togglePasswordConfirmBtn = document.getElementById('togglePasswordConfirm');
const passwordError = document.getElementById('passwordError');
const passwordConfirmError = document.getElementById('passwordConfirmError');
const prevStep3Btn = document.getElementById('prevStep3');
const nextStep3Btn = document.getElementById('nextStep3');

// Step 4 elements
const termsAgreeInput = document.getElementById('termsAgree');
const privacyAgreeInput = document.getElementById('privacyAgree');
const ageAgreeInput = document.getElementById('ageAgree');
const prevStep4Btn = document.getElementById('prevStep4');
const submitSignupBtn = document.getElementById('submitSignup');

// ============ Update Step Display ============

function updateStepDisplay() {
  const steps = document.querySelectorAll('.signup-step');
  steps.forEach((step, index) => {
    if (index + 1 === currentStep) {
      step.classList.add('active');
    } else {
      step.classList.remove('active');
    }
  });

  const offset = -(currentStep - 1) * 100;
  signupStepsContainer.style.transform = `translateX(${offset}%)`;

  // Update header text
  if (currentStep === 1) {
    stepTitle.textContent = '환영합니다!';
    stepSubtitle.textContent = 'CertHub에서 자격증 취득의 여정을 시작하세요';
  } else if (currentStep === 2) {
    stepTitle.textContent = '이메일 인증';
    stepSubtitle.textContent = '사용하실 이메일 주소를 입력해주세요';
  } else if (currentStep === 3) {
    stepTitle.textContent = '비밀번호 설정';
    stepSubtitle.textContent = '안전한 비밀번호를 설정해주세요';
  } else if (currentStep === 4) {
    stepTitle.textContent = '약관 동의';
    stepSubtitle.textContent = '서비스 이용을 위한 약관에 동의해주세요';
  }
}

// ============ Profile Image Handlers ============

selectImageBtn.addEventListener('click', () => {
  profileImageInput.click();
});

profileImageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      signupData.profileImage = event.target.result;
      profilePreview.innerHTML = `<img src="${event.target.result}" alt="Profile" />`;
    };
    reader.readAsDataURL(file);
  }
});

resetImageBtn.addEventListener('click', () => {
  signupData.profileImage = null;
  profilePreview.innerHTML = '<span class="avatar-placeholder">👤</span>';
  profileImageInput.value = '';
});

// ============ Input Focus Handlers (오류 자동 제거) ============

// 닉네임 입력 필드 포커스 시 오류 제거
nicknameInput.addEventListener('focus', () => {
  nicknameError.textContent = '';
  nicknameInput.classList.remove('error');
});

// 비밀번호 입력 필드 포커스 시 오류 제거
passwordInput.addEventListener('focus', () => {
  passwordError.textContent = '';
  passwordInput.classList.remove('error');
});

// 비밀번호 확인 입력 필드 포커스 시 오류 제거
passwordConfirmInput.addEventListener('focus', () => {
  passwordConfirmError.textContent = '';
  passwordConfirmInput.classList.remove('error');
});

// ============ Email Duplicate Check ============

checkEmailBtn.addEventListener('click', async () => {
  const email = emailInput.value.trim();

  emailError.textContent = '';
  emailError.style.color = '';
  emailInput.classList.remove('error', 'success');

  if (!email) {
    emailError.textContent = '이메일을 입력하세요.';
    emailInput.classList.add('error');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    emailError.textContent = '올바른 이메일 형식이 아닙니다.';
    emailInput.classList.add('error');
    return;
  }

  checkEmailBtn.textContent = '확인중...';
  checkEmailBtn.disabled = true;

  setTimeout(() => {
    const existingEmails = ['test@example.com', 'user@certhub.com'];
    const isDuplicate = existingEmails.includes(email.toLowerCase());

    if (isDuplicate) {
      emailError.textContent = '이미 사용 중인 이메일입니다.';
      emailInput.classList.add('error');
      emailVerified = false;
    } else {
      // 성공 시 오류 표시 완전히 제거
      emailInput.classList.add('success');
      checkEmailBtn.classList.add('verified');
      checkEmailBtn.textContent = '확인완료';
      emailVerified = true;
    }

    checkEmailBtn.disabled = false;

    if (emailVerified) {
      setTimeout(() => {
        checkEmailBtn.classList.remove('verified');
        checkEmailBtn.textContent = '중복확인';
      }, 3000);
    } else {
      checkEmailBtn.textContent = '중복확인';
    }
  }, 800);
});

emailInput.addEventListener('input', () => {
  emailVerified = false;
  checkEmailBtn.classList.remove('verified');
  checkEmailBtn.textContent = '중복확인';
  emailError.textContent = '';
  emailError.style.color = '';
  emailInput.classList.remove('error', 'success');
});

// 이메일 입력 필드에 포커스 시 오류 제거
emailInput.addEventListener('focus', () => {
  emailError.textContent = '';
  emailError.style.color = '';
  emailInput.classList.remove('error');
});

// ============ Password Toggle ============

function setupPasswordToggle(toggleBtn, inputField) {
  if (!toggleBtn || !inputField) return;

  const eyeClosed = toggleBtn.querySelector('.eye-closed');
  const eyeOpen = toggleBtn.querySelector('.eye-open');

  function showPassword() {
    inputField.type = 'text';
    if (eyeClosed) eyeClosed.style.display = 'none';
    if (eyeOpen) eyeOpen.style.display = 'block';
  }

  function hidePassword() {
    inputField.type = 'password';
    if (eyeClosed) eyeClosed.style.display = 'block';
    if (eyeOpen) eyeOpen.style.display = 'none';
  }

  toggleBtn.addEventListener('mousedown', showPassword);
  toggleBtn.addEventListener('mouseup', hidePassword);
  toggleBtn.addEventListener('mouseleave', hidePassword);
  toggleBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    showPassword();
  });
  toggleBtn.addEventListener('touchend', hidePassword);
}

setupPasswordToggle(togglePasswordBtn, passwordInput);
setupPasswordToggle(togglePasswordConfirmBtn, passwordConfirmInput);


// ============ Validation Functions ============

function validateStep1() {
  let isValid = true;

  nicknameError.textContent = '';
  nicknameInput.classList.remove('error');

  const nickname = nicknameInput.value.trim();
  if (!nickname) {
    nicknameError.textContent = '닉네임을 입력하세요.';
    nicknameInput.classList.add('error');
    isValid = false;
  } else if (nickname.length < 2) {
    nicknameError.textContent = '닉네임은 2자 이상이어야 합니다.';
    nicknameInput.classList.add('error');
    isValid = false;
  }

  if (isValid) {
    signupData.nickname = nickname;
  }

  return isValid;
}

function validateStep2() {
  let isValid = true;

  emailError.textContent = '';
  emailError.style.color = '';
  emailInput.classList.remove('error');

  const email = emailInput.value.trim();
  if (!email) {
    emailError.textContent = '이메일을 입력하세요.';
    emailInput.classList.add('error');
    isValid = false;
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      emailError.textContent = '올바른 이메일 형식이 아닙니다.';
      emailInput.classList.add('error');
      isValid = false;
    } else if (!emailVerified) {
      emailError.textContent = '이메일 중복 확인을 해주세요.';
      emailInput.classList.add('error');
      isValid = false;
    }
  }

  if (isValid) {
    signupData.email = email;
  }

  return isValid;
}

function validateStep3() {
  let isValid = true;

  passwordError.textContent = '';
  passwordConfirmError.textContent = '';
  passwordInput.classList.remove('error');
  passwordConfirmInput.classList.remove('error');

  const password = passwordInput.value;
  if (!password) {
    passwordError.textContent = '비밀번호를 입력하세요.';
    passwordInput.classList.add('error');
    isValid = false;
  } else if (password.length < 8) {
    passwordError.textContent = '비밀번호는 8자 이상이어야 합니다.';
    passwordInput.classList.add('error');
    isValid = false;
  } else {
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasLetter || !hasNumber || !hasSpecial) {
      passwordError.textContent = '영문, 숫자, 특수문자를 모두 포함해야 합니다.';
      passwordInput.classList.add('error');
      isValid = false;
    }
  }

  const passwordConfirm = passwordConfirmInput.value;
  if (!passwordConfirm) {
    passwordConfirmError.textContent = '비밀번호를 다시 입력하세요.';
    passwordConfirmInput.classList.add('error');
    isValid = false;
  } else if (password !== passwordConfirm) {
    passwordConfirmError.textContent = '비밀번호가 일치하지 않습니다.';
    passwordConfirmInput.classList.add('error');
    isValid = false;
  }

  if (isValid) {
    signupData.password = password;
    signupData.passwordConfirm = passwordConfirm;
  }

  return isValid;
}

function validateStep4() {
  signupData.terms.service = termsAgreeInput.checked;
  signupData.terms.privacy = privacyAgreeInput.checked;
  signupData.terms.age = ageAgreeInput.checked;

  if (!signupData.terms.service || !signupData.terms.privacy || !signupData.terms.age) {
    alert('모든 필수 약관에 동의해주세요.');
    return false;
  }

  return true;
}

// ============ Navigation Handlers ============

nextStep1Btn.addEventListener('click', () => {
  if (validateStep1()) {
    currentStep = 2;
    updateStepDisplay();
  }
});

prevStep2Btn.addEventListener('click', () => {
  currentStep = 1;
  updateStepDisplay();
});

nextStep2Btn.addEventListener('click', () => {
  if (validateStep2()) {
    currentStep = 3;
    updateStepDisplay();
  }
});

prevStep3Btn.addEventListener('click', () => {
  currentStep = 2;
  updateStepDisplay();
});

nextStep3Btn.addEventListener('click', () => {
  if (validateStep3()) {
    currentStep = 4;
    updateStepDisplay();
  }
});

prevStep4Btn.addEventListener('click', () => {
  currentStep = 3;
  updateStepDisplay();
});

// ============ Form Submission ============

document.getElementById('signupFormStep4').addEventListener('submit', (e) => {
  e.preventDefault();

  if (validateStep4()) {
    completeSignup();
  }
});

function completeSignup() {
  console.log('Signup Data:', signupData);
  alert('회원가입이 완료되었습니다.');
  window.location.href = 'login.html';
}

// Initialize
updateStepDisplay();
