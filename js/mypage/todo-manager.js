// 할 일 관리 모듈
window.todoManager = {
  todos: [
    { id: 1, text: "교재 1장 복습", completed: true },
    { id: 2, text: "기출 10문제", completed: true },
    { id: 3, text: "모의고사 1회", completed: false },
    { id: 4, text: "오답노트 업데이트", completed: false }
  ],
  nextId: 5
};

// 할 일 관리 모달 표시
window.showTodoManagerModal = function() {
  let isEditMode = false;
  let currentTodos = JSON.parse(JSON.stringify(todoManager.todos)); // 깊은 복사
  let sortMode = "default"; // "default" | "incomplete-first" | "complete-first"

  const toggleEditMode = () => {
    isEditMode = !isEditMode;
    renderTodoList();
    editBtn.textContent = isEditMode ? "완료" : "수정";
    addBtn.style.display = isEditMode ? "inline-flex" : "none";
  };

  const changeSortMode = () => {
    const options = [
      { value: "default", label: "기본 순서 (ㄱㄴㄷ)" },
      { value: "incomplete-first", label: "안 한 일 먼저" },
      { value: "complete-first", label: "한 일 먼저" }
    ];
    
    const currentIndex = options.findIndex(opt => opt.value === sortMode);
    const nextIndex = (currentIndex + 1) % options.length;
    sortMode = options[nextIndex].value;
    
    sortBtn.textContent = `정렬: ${options[nextIndex].label}`;
    renderTodoList();
  };

  const closeModal = () => {
    const backdrop = document.querySelector(".modal-backdrop");
    const modal = document.querySelector(".modal");
    if (backdrop) document.body.removeChild(backdrop);
    if (modal) document.body.removeChild(modal);
    // 스크롤 복구
    document.body.style.overflow = "";
  };

  const saveTodos = () => {
    // API 호출 예정 지점
    todoManager.todos = JSON.parse(JSON.stringify(currentTodos));
    
    // 마이페이지의 할 일 목록 업데이트
    renderTodo("todo-week");
    
    // 진행률 업데이트
    updateWeekProgress();
    
    closeModal();
    setTimeout(() => showModal("알림", "할 일이 저장되었습니다."), 100);
  };

  const addTodo = () => {
    const text = prompt("새로운 할 일을 입력하세요:");
    if (text && text.trim()) {
      currentTodos.push({
        id: todoManager.nextId++,
        text: text.trim(),
        completed: false
      });
      renderTodoList();
    }
  };

  const toggleTodo = (id) => {
    const todo = currentTodos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      renderTodoList();
    }
  };

  const editTodo = (id) => {
    const todo = currentTodos.find(t => t.id === id);
    if (todo) {
      const newText = prompt("할 일 수정:", todo.text);
      if (newText && newText.trim()) {
        todo.text = newText.trim();
        renderTodoList();
      }
    }
  };

  const deleteTodo = (id) => {
    if (confirm("이 할 일을 삭제하시겠습니까?")) {
      currentTodos = currentTodos.filter(t => t.id !== id);
      renderTodoList();
    }
  };

  const todoListContainer = createEl("div", { class: "todo-manager-list" });

  const renderTodoList = () => {
    todoListContainer.innerHTML = "";
    
    if (currentTodos.length === 0) {
      todoListContainer.appendChild(
        createEl("div", { class: "todo-empty" }, ["할 일이 없습니다. 추가해보세요!"])
      );
      return;
    }

    // 정렬 적용
    let sortedTodos = [...currentTodos];
    if (sortMode === "incomplete-first") {
      sortedTodos.sort((a, b) => {
        if (a.completed === b.completed) return 0;
        return a.completed ? 1 : -1;
      });
    } else if (sortMode === "complete-first") {
      sortedTodos.sort((a, b) => {
        if (a.completed === b.completed) return 0;
        return a.completed ? -1 : 1;
      });
    }
    // sortMode === "default"일 때는 원래 순서 유지

    sortedTodos.forEach(todo => {
      const todoItem = createEl("div", { 
        class: `todo-manager-item ${todo.completed ? "completed" : ""}`,
        onClick: () => {
          if (!isEditMode) {
            toggleTodo(todo.id);
          }
        }
      });

      const checkbox = createEl("input", {
        type: "checkbox",
        class: "todo-checkbox",
        checked: todo.completed
      });

      const textEl = createEl("span", { 
        class: "todo-text"
      }, [todo.text]);

      const actions = createEl("div", { class: "todo-actions" });

      if (isEditMode) {
        const editBtnItem = createEl("button", {
          class: "btn-icon",
          type: "button",
          onClick: () => editTodo(todo.id)
        }, ["✏️"]);

        const deleteBtnItem = createEl("button", {
          class: "btn-icon delete",
          type: "button",
          onClick: () => deleteTodo(todo.id)
        }, ["🗑️"]);

        actions.appendChild(editBtnItem);
        actions.appendChild(deleteBtnItem);
        
        // 편집 모드일 때는 전체 클릭 이벤트 제거
        todoItem.onclick = null;
        todoItem.style.cursor = "default";
      } else {
        // 일반 모드에서도 공간 유지를 위해 빈 요소 추가
        actions.style.minWidth = "64px";
      }

      todoItem.appendChild(checkbox);
      todoItem.appendChild(textEl);
      todoItem.appendChild(actions);

      todoListContainer.appendChild(todoItem);
    });
  };

  const addBtn = createEl("button", {
    class: "btn",
    type: "button",
    onClick: addTodo,
    style: "display: none;"
  }, ["+ 할 일 추가"]);

  const sortBtn = createEl("button", {
    class: "btn ghost",
    type: "button",
    onClick: changeSortMode
  }, ["정렬: 기본 순서 (ㄱㄴㄷ)"]);

  const editBtn = createEl("button", {
    class: "btn ghost",
    type: "button",
    onClick: toggleEditMode
  }, ["수정"]);

  const closeBtn = createEl("button", {
    class: "btn ghost",
    onClick: closeModal
  }, ["닫기"]);

  const saveBtn = createEl("button", {
    class: "btn",
    onClick: saveTodos
  }, ["저장"]);

  const modalContent = createEl("div", { class: "todo-manager-container" }, [
    createEl("div", { class: "todo-manager-header" }, [
      createEl("p", { class: "muted" }, ["체크박스를 클릭하여 완료 표시를 할 수 있습니다."]),
      createEl("div", { class: "row", style: "gap: 8px; justify-content: flex-end;" }, [
        addBtn,
        sortBtn,
        editBtn
      ])
    ]),
    todoListContainer
  ]);

  renderTodoList();

  // 배경 스크롤 막기
  document.body.style.overflow = "hidden";

  const backdrop = createEl("div", { class: "modal-backdrop" });
  backdrop.addEventListener("click", closeModal);

  const modal = createEl("div", { class: "modal modal-large" }, [
    createEl("div", { class: "modal-header" }, [
      createEl("h3", { class: "h3" }, ["이번 주 할 일"]),
      createEl("button", {
        class: "btn ghost",
        style: "padding: 4px 8px; font-size: 20px; line-height: 1;",
        onClick: closeModal
      }, ["×"])
    ]),
    createEl("div", { class: "modal-body" }, [modalContent]),
    createEl("div", { class: "modal-footer" }, [closeBtn, saveBtn])
  ]);

  document.body.appendChild(backdrop);
  document.body.appendChild(modal);
};
