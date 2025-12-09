// js/firebase-users.js
import { db, auth } from "./firebase-config.js";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

/* ===========================
 *  🔹 auth.currentUser 준비 기다리는 헬퍼
 * =========================== */

let authUserPromise = null;

function waitForAuthUser() {
  // 이미 로그인 정보가 있으면 바로 리턴
  if (auth.currentUser) {
    return Promise.resolve(auth.currentUser);
  }

  // 아직 없으면 onAuthStateChanged 한 번만 걸고 기다리기
  if (!authUserPromise) {
    authUserPromise = new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          unsubscribe();
          if (user) {
            resolve(user);
          } else {
            reject(new Error("로그인한 사용자가 없습니다."));
          }
        },
        (err) => {
          unsubscribe();
          reject(err);
        }
      );
    });
  }

  return authUserPromise;
}

/* ===========================
 *  🔹 READ 함수들
 * =========================== */

export async function getCurrentUserDoc() {
  const user = await waitForAuthUser(); // ✅ 여기서 로그인 준비가 될 때까지 기다림

  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    throw new Error("users 컬렉션에 해당 사용자의 문서가 없습니다.");
  }

  return { id: snap.id, ...snap.data() };
}

export async function getUserDoc(uid) {
  if (!uid) throw new Error("uid가 없습니다.");

  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    throw new Error(`users 컬렉션에 uid=${uid} 문서가 없습니다.`);
  }

  return { id: snap.id, ...snap.data() };
}

/* ===========================
 *  🔹 UPDATE / DELETE
 * =========================== */

export async function updateCurrentUser(data) {
  const user = await waitForAuthUser(); // ✅ 마찬가지로 auth 준비 기다림

  if (!data || typeof data !== "object") {
    throw new Error("수정할 데이터가 없습니다.");
  }

  const ref = doc(db, "users", user.uid);
  const updateData = {
    ...data,
    updatedAt: serverTimestamp(),
  };

  await updateDoc(ref, updateData);
  console.log("users 문서 수정 완료 (currentUser):", user.uid, updateData);
}

export async function updateUser(uid, data) {
  if (!uid) throw new Error("uid가 없습니다.");
  if (!data || typeof data !== "object") {
    throw new Error("수정할 데이터가 없습니다.");
  }

  const ref = doc(db, "users", uid);
  const updateData = {
    ...data,
    updatedAt: serverTimestamp(),
  };

  await updateDoc(ref, updateData);
  console.log("users 문서 수정 완료:", uid, updateData);
}

export async function deleteCurrentUserDoc() {
  const user = await waitForAuthUser();

  const ref = doc(db, "users", user.uid);
  await deleteDoc(ref);
  console.log("users 문서 삭제 완료 (currentUser):", user.uid);
}

export async function deleteUserDoc(uid) {
  if (!uid) throw new Error("uid가 없습니다.");

  const ref = doc(db, "users", uid);
  await deleteDoc(ref);
  console.log("users 문서 삭제 완료:", uid);
}

/* 전역으로 노출 (non-module 스크립트용) */
window.firebaseUsersApi = {
  getCurrentUserDoc,
  getUserDoc,
  updateCurrentUser,
  updateUser,
  deleteCurrentUserDoc,
  deleteUserDoc,
};
