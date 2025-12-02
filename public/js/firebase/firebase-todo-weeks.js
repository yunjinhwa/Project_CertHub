// js/firebase/firebase-todos-week.js

import { db, auth } from "./firebase-config.js";
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

/**
 * 현재 로그인한 사용자의 todos_week 컬렉션에 할 일 1개 생성
 * 컬렉션 이름: todos_week  (콘솔에 보이는 그대로 사용)
 */
export async function createTodoWeek({ content, status = false }) {
    console.log("저장 시작");
  const user = auth.currentUser;

  if (!user) {
    throw new Error("로그인한 사용자가 없습니다.");
  }

  const docRef = await addDoc(collection(db, "todos_week"), {
    content,               // 문자열: "데이터베이스 완성"
    status,                // boolean: true/false
    uid: user.uid,         // 인증 uid
    createdAt: serverTimestamp(), // 서버 기준 시간
  });

  console.log("todos_week 문서 생성 완료:", docRef.id);
  return docRef.id;
}

// todos_week 문서 내용/상태 수정
export async function updateTodoWeek(todoId, { content, status }) {
  if (!todoId) {
    throw new Error("수정할 문서 ID가 없습니다.");
  }

  const updateData = {};

  // 전달된 값만 선택적으로 수정
  if (content !== undefined) {
    updateData.content = content;
  }
  if (status !== undefined) {
    updateData.status = status;
  }

  if (Object.keys(updateData).length === 0) {
    console.warn("변경할 필드가 없습니다.");
    return;
  }

  await updateDoc(doc(db, "todos_week", todoId), updateData);
  console.log("todos_week 문서 수정 완료:", todoId, updateData);
}

/**
 * 문서 ID로 todos_week 문서 1개 삭제
 */
export async function deleteTodoWeekById(todoId) {
  if (!todoId) {
    throw new Error("삭제할 문서 ID가 없습니다.");
  }

  await deleteDoc(doc(db, "todos_week", todoId));
  console.log("todos_week 문서 삭제 완료:", todoId);
}

/**
 * 현재 로그인한 사용자의 todos_week 전체 삭제
 * (해당 uid의 문서를 모두 지워서 컬렉션을 '비우는' 용도)
 */
export async function deleteAllTodosWeekOfCurrentUser() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("로그인한 사용자가 없습니다.");
  }

  const q = query(
    collection(db, "todos_week"),
    where("uid", "==", user.uid)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    console.log("삭제할 할 일이 없습니다.");
    return;
  }

  const deletePromises = [];
  snapshot.forEach((docSnap) => {
    deletePromises.push(deleteDoc(doc(db, "todos_week", docSnap.id)));
  });

  await Promise.all(deletePromises);
  console.log(`uid=${user.uid} 의 todos_week 문서를 모두 삭제했습니다.`);
}

// 문서 읽어오기
export async function loadTodosWeekOfCurrentUser() {
  const user = auth.currentUser;
  if (!user) throw new Error("로그인한 사용자가 없습니다.");

  const q = query(
    collection(db, "todos_week"),
    where("uid", "==", user.uid)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => {
    console.log("문서 읽어오기 성공");
    const data = docSnap.data();
    return {
      id: docSnap.id,                               // 문서 ID
      text: data.content || "",
      completed: !!data.status,
      createdAt: data.createdAt
        ? data.createdAt.toDate().toISOString()
        : new Date().toISOString(),
    };
  });
}

window.firebaseTodosWeekApi = {
  createTodoWeek,
  updateTodoWeek,
  deleteTodoWeekById,
  deleteAllTodosWeekOfCurrentUser,
  loadTodosWeekOfCurrentUser,
};