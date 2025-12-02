// public/js/login/signup.js
import { auth, db } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  doc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  // 🔹 1) 회원가입 폼 찾기
  const signupForm = document.querySelector("[data-signup-form]");
  if (!signupForm) return; // 이 페이지에 회원가입 폼이 없으면 아무것도 안 함

  const nameInput = signupForm.querySelector("[data-signup-name]");
  const emailInput = signupForm.querySelector("[data-signup-email]");
  const passwordInput = signupForm.querySelector("[data-signup-password]");
  const passwordConfirmInput = signupForm.querySelector(
    "[data-signup-password-confirm]"
  );

  if (!nameInput || !emailInput || !passwordInput || !passwordConfirmInput) {
    console.warn("회원가입 폼에 필요한 data-* 속성이 부족합니다.");
    return;
  }

  // 🔹 2) submit 이벤트에서 회원가입 처리
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const passwordConfirm = passwordConfirmInput.value;

    if (!name || !email || !password || !passwordConfirm) {
      alert("모든 항목을 입력해 주세요.");
      return;
    }

    if (password !== passwordConfirm) {
      alert("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    try {
      // 1) Firebase Auth 계정 생성
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const user = cred.user;
      console.log("회원가입 성공:", user.uid);

      // 2) Firestore users 컬렉션에 프로필 문서 생성
      // users 컬렉션 구조:
      //  - 문서 ID: uid
      //  - 필드: name, email, image(null), createdAt, updatedAt
      await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: email,
        image: null, // 기본 프로필 이미지 없음
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      alert("회원가입이 완료되었습니다!\n이메일로 로그인해 주세요.");

      // 회원가입 후 이동 페이지 (원하면 /login.html로 바꿔도 됨)
      window.location.href = "/login.html";
    } catch (err) {
      console.error("회원가입 에러:", err.code, err.message);

      let msg = "회원가입에 실패했습니다.";
      if (err.code === "auth/email-already-in-use") {
        msg = "이미 사용 중인 이메일입니다.";
      } else if (err.code === "auth/weak-password") {
        msg = "비밀번호가 너무 약합니다. 6자 이상으로 입력해 주세요.";
      } else if (err.code === "auth/invalid-email") {
        msg = "이메일 형식이 올바르지 않습니다.";
      }

      alert(msg);
    }
  });
});
