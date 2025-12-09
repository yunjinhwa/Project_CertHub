// js/mypage/bookmarks.js
// 마이페이지 "내 북마크" 카드 렌더링 (Firestore 연동)

window.renderBookmarks = async function (containerId) {
  const host = document.getElementById(containerId);
  if (!host) return;
  host.innerHTML = "";

  // 카드 뼈대 만들기
  const listEl = createEl("div", { class: "bookmark-list" });
  const card = createEl("div", { class: "card p-24 bookmark-card" }, [
    createEl("h3", { class: "h3" }, ["내 북마크"]),
    listEl,
  ]);

  host.appendChild(card);

  // 🔹 로딩 상태 표시
  listEl.appendChild(
    createEl("div", { class: "bookmark-loading" }, ["불러오는 중..."])
  );

  try {
    if (
      !window.firebaseBookmarksApi ||
      typeof window.firebaseBookmarksApi.getBookmarksOfCurrentUser !== "function"
    ) {
      throw new Error("firebaseBookmarksApi.getBookmarksOfCurrentUser 를 찾을 수 없습니다.");
    }

    // 🔹 Firestore에서 현재 사용자 북마크 가져오기
    const bookmarks =
      await window.firebaseBookmarksApi.getBookmarksOfCurrentUser();

    listEl.innerHTML = "";

    // 아무 북마크도 없을 때
    if (!bookmarks.length) {
      listEl.appendChild(
        createEl("div", { class: "bookmark-empty" }, [
          "아직 북마크한 자격증이 없어요.",
        ])
      );
      return;
    }

    // 이름 기준 ㄱㄴㄷ 정렬
    bookmarks
      .slice()
      .sort((a, b) =>
        (a.certName || "").localeCompare(b.certName || "", "ko")
      )
      .forEach((bm) => {
        const row = createEl("div", { class: "bookmark-item" }, [
          createEl("div", { class: "bookmark-content" }, [
            createEl("div", { class: "bookmark-name" }, [
              bm.certName || bm.certId || "이름 없는 자격증",
            ]),
          ]),
          createEl("div", { class: "bookmark-footer" }, [
            // TODO: index.html로 이동해서 상세 보기 연동하고 싶으면 여기 구현
            createEl(
              "button",
              {
                class: "btn-bookmark-action",
                onclick: () => {
                  // 추후 구현: 예) location.href = `index.html?jmcd=${bm.certId}`;
                  showModal("알림", "상세 페이지 이동 기능은 추후 지원 예정입니다.");
                },
              },
              ["바로가기"]
            ),
            createEl(
              "button",
              {
                class: "btn-bookmark-delete",
                onclick: async () => {
                  if (!confirm("이 북마크를 삭제할까요?")) return;

                  try {
                    await window.firebaseBookmarksApi.deleteBookmarkById(bm.id);
                    // 삭제 후 다시 렌더링
                    await window.renderBookmarks(containerId);
                  } catch (err) {
                    console.error("북마크 삭제 중 오류:", err);
                    alert("삭제 중 오류가 발생했습니다.");
                  }
                },
              },
              ["삭제"]
            ),
          ]),
        ]);

        listEl.appendChild(row);
      });
  } catch (err) {
    console.error("북마크 로딩 오류:", err);
    listEl.innerHTML = "";
    listEl.appendChild(
      createEl("div", { class: "bookmark-error" }, [
        "북마크를 불러오는 중 오류가 발생했습니다.",
      ])
    );
  }
};
