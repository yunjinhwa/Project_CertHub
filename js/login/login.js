// Login Page JavaScript

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const rememberMeCheckbox = document.getElementById('rememberMe');
  const passwordToggle = document.getElementById('passwordToggle');
  const eyeClosed = passwordToggle.querySelector('.eye-closed');
  const eyeOpen = passwordToggle.querySelector('.eye-open');
  const emailError = document.getElementById('emailError');
  const passwordError = document.getElementById('passwordError');

  // Password visibility toggle
  let isPasswordVisible = false;

  passwordToggle.addEventListener('mousedown', (e) => {
    e.preventDefault();
    isPasswordVisible = true;
    passwordInput.type = 'text';
    eyeClosed.style.display = 'none';
    eyeOpen.style.display = 'block';
  });

  passwordToggle.addEventListener('mouseup', () => {
    isPasswordVisible = false;
    passwordInput.type = 'password';
    eyeClosed.style.display = 'block';
    eyeOpen.style.display = 'none';
  });

  passwordToggle.addEventListener('mouseleave', () => {
    if (isPasswordVisible) {
      isPasswordVisible = false;
      passwordInput.type = 'password';
      eyeClosed.style.display = 'block';
      eyeOpen.style.display = 'none';
    }
  });

  // Touch support for mobile
  passwordToggle.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isPasswordVisible = true;
    passwordInput.type = 'text';
    eyeClosed.style.display = 'none';
    eyeOpen.style.display = 'block';
  });

  passwordToggle.addEventListener('touchend', (e) => {
    e.preventDefault();
    isPasswordVisible = false;
    passwordInput.type = 'password';
    eyeClosed.style.display = 'block';
    eyeOpen.style.display = 'none';
  });

  // Form submission handler
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const rememberMe = rememberMeCheckbox.checked;

    // Clear previous errors
    emailInput.classList.remove('error');
    passwordInput.classList.remove('error');
    emailError.textContent = '';
    passwordError.textContent = '';

    // Validation
    let hasError = false;

    if (email === '') {
      emailInput.classList.add('error');
      emailError.textContent = '이메일을 입력해주세요.';
      hasError = true;
    } else if (!validateEmail(email)) {
      emailInput.classList.add('error');
      emailError.textContent = '올바른 이메일 형식이 아닙니다.';
      hasError = true;
    }

    if (password === '') {
      passwordInput.classList.add('error');
      passwordError.textContent = '비밀번호를 입력해주세요.';
      hasError = true;
    } else if (password.length < 6) {
      passwordInput.classList.add('error');
      passwordError.textContent = '비밀번호는 최소 6자 이상이어야 합니다.';
      hasError = true;
    }

    if (hasError) {
      return;
    }

    // Show loading state
    const submitBtn = loginForm.querySelector('.btn-primary');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '로그인 중...';
    submitBtn.disabled = true;

    try {
      // TODO: Replace with actual API call
      await mockLogin(email, password, rememberMe);
      
      showNotification('로그인 성공! 페이지를 이동합니다.', 'success');
      
      // Redirect to main page after successful login
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);

    } catch (error) {
      showNotification(error.message || '로그인에 실패했습니다. 다시 시도해주세요.', 'error');
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });

  // Social login handlers
  const googleBtn = document.querySelector('.btn-google');
  const kakaoBtn = document.querySelector('.btn-kakao');

  googleBtn.addEventListener('click', () => {
    handleSocialLogin('google');
  });

  kakaoBtn.addEventListener('click', () => {
    handleSocialLogin('kakao');
  });



  // Remember me functionality
  if (localStorage.getItem('rememberMe') === 'true') {
    const savedEmail = localStorage.getItem('savedEmail');
    if (savedEmail) {
      emailInput.value = savedEmail;
      rememberMeCheckbox.checked = true;
    }
  }

  // Clear error on input
  emailInput.addEventListener('input', () => {
    if (emailInput.classList.contains('error')) {
      emailInput.classList.remove('error');
      emailError.textContent = '';
    }
  });

  passwordInput.addEventListener('input', () => {
    if (passwordInput.classList.contains('error')) {
      passwordInput.classList.remove('error');
      passwordError.textContent = '';
    }
  });
});

// Helper Functions

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

async function mockLogin(email, password, rememberMe) {
  // Mock API call - replace with actual authentication
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Demo: Accept any email/password for testing
      // In production, this would be an actual API call
      if (email && password) {
        // Save remember me preference
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
          localStorage.setItem('savedEmail', email);
        } else {
          localStorage.removeItem('rememberMe');
          localStorage.removeItem('savedEmail');
        }

        // Save login state (mock)
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('userEmail', email);
        
        resolve();
      } else {
        reject(new Error('이메일 또는 비밀번호가 올바르지 않습니다.'));
      }
    }, 1000);
  });
}

function handleSocialLogin(provider) {
  showNotification(`${provider === 'google' ? 'Google' : '카카오'} 로그인 기능은 준비 중입니다.`, 'info');
  
  // TODO: Implement actual social login
  // Example:
  // if (provider === 'google') {
  //   window.location.href = '/auth/google';
  // } else if (provider === 'kakao') {
  //   window.location.href = '/auth/kakao';
  // }
}

function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  // Add styles
  notification.style.cssText = `
    position: fixed;
    top: 24px;
    right: 24px;
    padding: 16px 24px;
    background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#5b8cff'};
    color: white;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    z-index: 9999;
    animation: slideInRight 0.3s ease-out;
    max-width: 400px;
  `;

  // Add animation keyframes
  if (!document.getElementById('notificationStyles')) {
    const style = document.createElement('style');
    style.id = 'notificationStyles';
    style.textContent = `
      @keyframes slideInRight {
        from {
          opacity: 0;
          transform: translateX(100px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      @keyframes slideOutRight {
        from {
          opacity: 1;
          transform: translateX(0);
        }
        to {
          opacity: 0;
          transform: translateX(100px);
        }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(notification);

  // Auto remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease-out';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Prevent form submission on enter in social buttons
document.querySelectorAll('.btn-social').forEach(btn => {
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      btn.click();
    }
  });
});
