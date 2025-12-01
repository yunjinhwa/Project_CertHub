/*
    // js/pagination.js
    검색 결과를 5개씩 끊어서 점점 더 로드하는 모듈

    [ main.js 에서 검색이 끝난 후 호출됨 ]
    setAllItems(items);
    loadMoreItems();
    document.getElementById("scrollContainer")
        .addEventListener("scroll", handleDivScroll);
*/


import { renderListItem } from "./render.js";

let allItems = [];      // 검색 결과 전체 리스트
let currentIndex = 0;   // 지금까지 몇 개 렌더링했는지
const BATCH_SIZE = 5;   // 한 번에 표시할 개수 (5개)

// setAllItems 함수 --> 전체 결과를 저장
export function setAllItems(items) {
    allItems = items;
    currentIndex = 0;
}

// loadMoreItems 함수 --> 화면에 아이템을 5개씩 렌더링
export function loadMoreItems() {
    const resultsDiv = document.getElementById("results");

    const next = allItems.slice(currentIndex, currentIndex + BATCH_SIZE);
    next.forEach(item => renderListItem(item, resultsDiv));

    currentIndex += BATCH_SIZE;

    if (currentIndex >= allItems.length) {
        document.getElementById("scrollContainer")
            .removeEventListener("scroll", handleDivScroll);
    }
}

// 스크롤 이벤트 핸들러 - 스크롤이 바닥에 닿았는지 체크한 후 → 바닥에 닿으면 다음 5개를 로드(loadMoreItems)
export function handleDivScroll() {
    const box = document.getElementById("scrollContainer");

    // scrollTop + clientHeight = 현재까지 내려온 높이 | scrollHeight = 전체 높이
    if (box.scrollTop + box.clientHeight >= box.scrollHeight - 10) {
        loadMoreItems();
    }
}
