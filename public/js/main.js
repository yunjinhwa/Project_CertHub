// js/main.js

import { fetchCertificates, getItemsFromXML } from "./api.js";
import { handleAutocomplete } from "./autocomplete.js";
import { searchCertificate } from "./search.js";
import { setAllItems,  loadMoreItems, handleDivScroll, } from "./pagination.js";
import { loadDetailInfo } from "./detail.js";

document.addEventListener("DOMContentLoaded", initPage);

document.getElementById("searchInput").addEventListener("input", handleAutocomplete);
document.getElementById("searchButton").addEventListener("click", searchCertificate);

// 자격증 목록을 출력
async function initPage() {
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "전체 자격증 불러오는 중...";

    const xmlDoc = await fetchCertificates("");
    let items = getItemsFromXML(xmlDoc);

    resultsDiv.innerHTML = "";

    // 🟦➜ 전체 목록을 랜덤으로 섞는다 (Fisher–Yates shuffle)
    items = items
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);

    // 🟦➜ 10개만 남긴다
    const randomTen = items.slice(0, 10);

    // 🟦➜ 기존 무한스크롤 로직이 읽을 데이터에 10개만 세팅
    setAllItems(randomTen);

    // 🟦➜ 그 중 처음 5개 표시
    loadMoreItems();

    document
        .getElementById("scrollContainer")
        .addEventListener("scroll", handleDivScroll);
}

// 자격 정보 출력
import { closeModal } from "./detail.js";

document.getElementById("modalCloseBtn").addEventListener("click", closeModal);

// 바깥 클릭 시 닫기
document.getElementById("detailModal").addEventListener("click", (e) => {
    if (e.target.id === "detailModal") closeModal();
});

