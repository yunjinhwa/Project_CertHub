// js/firebase/firebase-todo-week-sync.js
import { auth } from "../firebase-config.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

import {
  loadTodosWeekOfCurrentUser,
  createTodoWeek,
  updateTodoWeek,
  deleteTodoWeekById
} from "../firebase-todo-weeks.js";

/**
 * Firestore → todoManager 초기 로드
 */
async function initTodosFromFirestore(user) {
  if (!user) {
    // 로그아웃 상태면 로컬 todos 비우기
    if (window.todoManager) {
      window.todoManager.todos = [];
    }
    if (typeof renderTodo === "function") {
      renderTodo("todo-week");
    }
    if (typeof updateWeekProgress === "function") {
      updateWeekProgress();
    }
    return;
  }

  try {
    const todos = await loadTodosWeekOfCurrentUser(); // [{id,text,completed,createdAt}, ...]
    if (!window.todoManager) return;

    console.log("[sync] Firestore에서 todos_week 로드:", todos);

    window.todoManager.todos = todos;
    window.todoManager.nextId = todos.length + 1;

    if (typeof renderTodo === "function") {
      renderTodo("todo-week");
    }
    if (typeof updateWeekProgress === "function") {
      updateWeekProgress();
    }
  } catch (err) {
    console.error("todos_week 로드 중 오류:", err);
  }
}

/**
 * before / after diff 계산해서 Firestore에 반영
 */
async function syncTodosWithFirestore(before, after) {
  console.log("[sync] Firestore 동기화 시작");
  console.log("[sync] before:", before);
  console.log("[sync] after :", after);

  const beforeMap = new Map(before.map(t => [String(t.id), t]));
  const afterMap = new Map(after.map(t => [String(t.id), t]));

  const creations = [];
  const updates = [];
  const deletions = [];

  // 삭제된 항목: before에는 있는데 after에는 없는 것 (Firestore ID만)
  for (const [id, todo] of beforeMap.entries()) {
    if (!afterMap.has(id) && isFirestoreId(id)) {
      deletions.push(id);
    }
  }

  // 생성 / 수정된 항목
  for (const [id, todo] of afterMap.entries()) {
    const prev = beforeMap.get(id);

    if (!prev) {
      // 완전 새로 생긴 todo (로컬에서만 있던 것)
      creations.push(todo);
      continue;
    }

    // 내용/완료 여부 변경 체크
    if (prev.text !== todo.text || prev.completed !== todo.completed) {
      if (isFirestoreId(id)) {
        // Firestore 문서가 이미 있는 경우 → update
        updates.push(todo);
      } else {
        // 숫자 id 등 로컬 전용이면 새 문서로 취급
        creations.push(todo);
      }
    }
  }

  console.log("[sync] creations:", creations);
  console.log("[sync] updates  :", updates);
  console.log("[sync] deletions:", deletions);

  // 1) 생성
  for (const todo of creations) {
    const newId = await createTodoWeek({
      content: todo.text,
      status: !!todo.completed
    });
    console.log("[sync] createTodoWeek 완료 id =", newId);
    // 로컬에서도 Firestore ID로 교체
    todo.id = newId;
  }

  // 2) 수정
  for (const todo of updates) {
    await updateTodoWeek(todo.id, {
      content: todo.text,
      status: !!todo.completed
    });
    console.log("[sync] updateTodoWeek 완료 id =", todo.id);
  }

  // 3) 삭제
  for (const id of deletions) {
    await deleteTodoWeekById(id);
    console.log("[sync] deleteTodoWeekById 완료 id =", id);
  }

  console.log("[sync] todos_week Firestore 동기화 완료");

  // Firestore 문서 ID가 반영된 after 배열을 전역 todoManager에 다시 저장
  if (window.todoManager) {
    window.todoManager.todos = after.map(t => ({ ...t }));
  }
}

/**
 * Firestore 자동 ID인지 판단 (대충 20자 이상 문자열이면 Firestore ID라고 가정)
 */
function isFirestoreId(id) {
  return typeof id === "string" && id.length >= 20;
}

/**
 * "이번 주 할 일 관리" 버튼 클릭을 감싸서
 * - 모달 열기 전 상태(before)를 저장해 두고
 * - 모달에서 "저장"을 누르면 after 상태를 읽어서 Firestore에 동기화
 *
 * ⚠️ showTodoManagerModal 자체는 건드리지 않는다.
 */
function setupTodoModalSync() {
  const manageTodoBtn = document.getElementById("manageTodoBtn");

  if (!manageTodoBtn) {
    console.warn("[sync] manageTodoBtn을 찾지 못했습니다.");
    return;
  }
  if (!window.showTodoManagerModal) {
    console.warn("[sync] window.showTodoManagerModal이 없습니다.");
    return;
  }

  console.log("[sync] manageTodoBtn 클릭 훅 설정 완료");

  // 마이페이지에서 이미 manageTodoBtn에 리스너를 하나 달아두었기 때문에
  // 여기서 "추가"로 하나 더 단다.
  manageTodoBtn.addEventListener("click", () => {
    if (!window.todoManager) return;

    // 모달 열기 전 상태 저장
    const before = JSON.parse(
      JSON.stringify(window.todoManager.todos || [])
    );
    console.log("[sync] 모달 오픈, before 상태:", before);

    // mypage.js에서 등록한 click 리스너가 먼저 실행되면서
    // showTodoManagerModal이 호출되고 모달 DOM이 만들어진다.
    // 우리는 그 다음 tick에서 저장 버튼을 찾아서 후처리를 건다.
    setTimeout(() => {
      const modal = document.querySelector(".modal.modal-large");
      if (!modal) {
        console.warn("[sync] 모달 DOM을 찾지 못했습니다.");
        return;
      }

      const buttons = modal.querySelectorAll(".modal-footer .btn");
      const saveBtn = Array.from(buttons).find(
        (btn) => btn.textContent.trim() === "저장"
      );
      if (!saveBtn) {
        console.warn("[sync] 저장 버튼을 찾지 못했습니다.");
        return;
      }

      console.log("[sync] 저장 버튼 후처리 리스너 등록");

      // saveTodos(원래 핸들러)가 실행된 "이후"에 호출될 동기화 핸들러
      saveBtn.addEventListener(
        "click",
        async () => {
          try {
            const after = JSON.parse(
              JSON.stringify(window.todoManager.todos || [])
            );
            await syncTodosWithFirestore(before, after);
          } catch (err) {
            console.error("할 일 Firestore 저장 중 오류:", err);
            alert("할 일을 저장하는 중 오류가 발생했습니다. 다시 시도해주세요.");
          }
        },
        { once: true } // 모달 한 번 열 때 한 번만
      );
    }, 0);
  });
}

// 🔹 Firebase 인증 상태에 따라 초기 로드
onAuthStateChanged(auth, (user) => {
  console.log("[sync] onAuthStateChanged:", user?.uid);
  initTodosFromFirestore(user);
});

// 🔹 DOM이 준비된 후 버튼 훅 설정
window.addEventListener("DOMContentLoaded", () => {
  console.log("[sync] DOMContentLoaded → setupTodoModalSync 호출");
  setTimeout(setupTodoModalSync, 0);
});
