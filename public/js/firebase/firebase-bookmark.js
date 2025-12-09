// js/firebase/firebase-bookmarks.js

import { db, auth } from "./firebase-config.js";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

/**
 * auth.currentUser 준비될 때까지 기다리는 헬퍼
 *  - firebase-users.js 패턴 그대로 사용 :contentReference[oaicite:1]{index=1}
 */
let authUserPromise = null;

function waitForAuthUser() {
  if (auth.currentUser) {
    return Promise.resolve(auth.currentUser);
  }

  if (!authUserPromise) {
    authUserPromise = new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          unsubscribe();
          if (user) resolve(user);
          else reject(new Error("로그인한 사용자가 없습니다."));
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

/**
 * 🔹 CREATE: 북마크 추가
 *  - 컬렉션: bookmarks
 *  - 필드: uid, certId, certName, createdAt
 */
export async function addBookmark({ certId, certName }) {
  if (!certId) throw new Error("certId가 필요합니다.");

  const user = await waitForAuthUser();

  // 🔹 1) 같은 uid + certId가 이미 있는지 먼저 조회
  const q = query(
    collection(db, "bookmarks"),
    where("uid", "==", user.uid),
    where("certId", "==", certId)
  );

  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    // 이미 북마크가 있을 때 → 새로 만들지 않고 기존 문서 ID만 반환
    const existing = snapshot.docs[0];
    console.log(
      `이미 존재하는 북마크 (uid=${user.uid}, certId=${certId}) → ${existing.id}`
    );
    return existing.id;
  }

  // 🔹 2) 없을 때만 새 문서 생성
  const ref = await addDoc(collection(db, "bookmarks"), {
    uid: user.uid,
    certId,
    certName: certName || null,
    createdAt: serverTimestamp(),
  });

  console.log("bookmarks 문서 생성 완료:", ref.id);
  return ref.id;
}


/**
 * 🔹 READ: 현재 로그인한 사용자의 북마크 목록 조회
 */
export async function getBookmarksOfCurrentUser() {
  const user = await waitForAuthUser();

  const q = query(collection(db, "bookmarks"), where("uid", "==", user.uid));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      uid: data.uid,
      certId: data.certId,
      certName: data.certName || "",
      createdAt: data.createdAt?.toDate
        ? data.createdAt.toDate()
        : null,
    };
  });
}

/**
 * 🔹 DELETE: 문서 ID로 북마크 삭제
 */
export async function deleteBookmarkById(bookmarkId) {
  if (!bookmarkId) throw new Error("삭제할 북마크 ID가 없습니다.");

  await deleteDoc(doc(db, "bookmarks", bookmarkId));
  console.log("bookmarks 문서 삭제 완료:", bookmarkId);
}

/**
 * (옵션) 🔹 DELETE: 현재 사용자 + certId 기준으로 삭제
 */
export async function deleteBookmarkByCertId(certId) {
  if (!certId) throw new Error("certId가 없습니다.");

  const user = await waitForAuthUser();

  const q = query(
    collection(db, "bookmarks"),
    where("uid", "==", user.uid),
    where("certId", "==", certId)
  );

  const snapshot = await getDocs(q);
  const promises = snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref));

  await Promise.all(promises);
  console.log(`uid=${user.uid}, certId=${certId} 북마크 삭제 완료`);
}

/**
 * non-module 스크립트에서 쓰기 쉽게 전역으로 노출
 */
window.firebaseBookmarksApi = {
  addBookmark,
  getBookmarksOfCurrentUser,
  deleteBookmarkById,
  deleteBookmarkByCertId,
};
