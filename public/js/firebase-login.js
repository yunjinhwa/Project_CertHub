// public/js/login/login.js
import { auth } from "./firebase-config.js";
import {
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  // 🔹 1) 로그인 폼 찾기 (data-login-form)
  const loginForm = document.querySelector("[data-login-form]");
  if (!loginForm) return; // 로그인 페이지가 아닐 수도 있으니까 그냥 종료

  const emailInput = loginForm.querySelector("[data-login-email]");
  const passwordInput = loginForm.querySelector("[data-login-password]");

  if (!emailInput || !passwordInput) {
    console.warn("로그인 폼에 data-login-email 또는 data-login-password가 없습니다.");
    return;
  }

  // 🔹 2) 폼 submit 이벤트 → Firebase Auth 로그인
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      alert("이메일과 비밀번호를 입력해 주세요.");
      return;
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      console.log("로그인 성공:", cred.user.uid);
      alert("로그인 성공!");

      // 로그인 후 이동할 페이지
      window.location.href = "/index.html";
    } catch (err) {
      console.error("로그인 에러:", err.code, err.message);

      // 에러 메시지 조금 예쁘게 매핑
      let msg = "로그인에 실패했습니다.";
      if (err.code === "auth/invalid-credential") {
        msg = "이메일 또는 비밀번호가 올바르지 않습니다.";
      } else if (err.code === "auth/too-many-requests") {
        msg = "시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.";
      }
      alert(msg);
    }
  });
});
