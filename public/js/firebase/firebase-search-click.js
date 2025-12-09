// js/firebase/firebase-search-clicks.js
import { db, auth } from "./firebase-config.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

/**
 * 🔹 search_clicks에 1건 기록 남기기 (쓰기)
 *
 * @param {Object} params
 * @param {string} [params.certId]  - 자격증 코드/ID (예: jmcd)
 * @param {string} [params.keyword] - 사용자가 입력한 검색어
 * @param {string} [params.context] - 클릭 위치/맥락 (예: "detail_click", "list_click")
 */
export async function addSearchClick({ certId = null, keyword = "", context = "search" } = {}) {
  const user = auth.currentUser;
  const uid = user ? user.uid : null; // 비로그인도 허용하려면 null 저장

  if (!certId && !keyword) {
    throw new Error("certId 또는 keyword 중 하나는 있어야 합니다.");
  }

  const docRef = await addDoc(collection(db, "search_clicks"), {
    uid,                 // 로그인한 사용자의 uid (없으면 null)
    certId,              // 자격증 코드
    keyword,             // 검색어
    context,             // 클릭 맥락
    createdAt: serverTimestamp(), // 기록 시각
  });

  console.log("search_clicks 문서 생성:", docRef.id);
  return docRef.id;
}

/**
 * 🔹 현재 로그인한 사용자의 search_clicks 읽기
 *  - 추천 시스템 등에 쓸 수 있는 기본 read 함수
 */
export async function getSearchClicksOfCurrentUser() {
  const user = auth.currentUser;
  if (!user) throw new Error("로그인한 사용자가 없습니다.");

  const q = query(
    collection(db, "search_clicks"),
    where("uid", "==", user.uid)
  );

  const snapshot = await getDocs(q);

  const list = snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));

  console.log(`search_clicks 로드(uid=${user.uid}):`, list);
  return list;
}

/**
 * 🔹 특정 uid의 search_clicks 읽기 (관리/테스트용)
 */
export async function getSearchClicksByUid(uid) {
  if (!uid) throw new Error("uid가 없습니다.");

  const q = query(
    collection(db, "search_clicks"),
    where("uid", "==", uid)
  );

  const snapshot = await getDocs(q);

  const list = snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));

  console.log(`search_clicks 로드(uid=${uid}):`, list);
  return list;
}

/**
 * 🔹 전역으로 노출 (non-module 스크립트에서 사용 가능)
 */
window.firebaseSearchClicksApi = {
  addSearchClick,
  getSearchClicksOfCurrentUser,
  getSearchClicksByUid,
};
