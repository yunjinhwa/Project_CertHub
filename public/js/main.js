// js/main.js
// 실행 시키는 명령어 firebase emulators:start --only hosting,functions
import { fetchCertificates, fetchSchedule,fetchExamStats, getItemsFromXML } from "./api.js";
import { handleAutocomplete } from "./autocomplete.js";
import { searchCertificate } from "./search.js";
import { setAllItems, loadMoreItems, handleDivScroll } from "./pagination.js";
import { renderScheduleList, renderExamStatsList } from "./render.js";
import { loadDetailInfo, closeModal } from "./detail.js";

document.addEventListener("DOMContentLoaded", initPage);

document.getElementById("searchInput").addEventListener("input", handleAutocomplete);
document.getElementById("searchButton").addEventListener("click", searchCertificate);

// ===========================================
// 🔹 페이지 초기 실행
// ===========================================
async function initPage() {
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "전체 자격증 불러오는 중...";

    const resultsDiv_calendar = document.getElementById("results_calendar");
    resultsDiv_calendar.innerHTML = "시험 일정 불러오는 중...";

    const xmlDoc = await fetchCertificates("");
    let items = getItemsFromXML(xmlDoc);

    resultsDiv.innerHTML = "";
    resultsDiv_calendar.innerHTML = "";
    
    // 전체 랜덤 섞기
    items = items
        .map((value) => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);

    // 10개 추출
    const randomTen = items.slice(0, 10);

    // 목록 세팅 + 5개 표시
    setAllItems(randomTen);
    loadMoreItems();

    // 스크롤 이벤트 등록
    document.getElementById("scrollContainer").addEventListener("scroll", handleDivScroll);

    // 🔹 시험 일정 출력 실행
    await loadScheduleToCalendar();
    await loadTopApplyList();
}

// ===========================================
// 🔹 모달 닫기
// ===========================================
document.getElementById("modalCloseBtn").addEventListener("click", closeModal);

// 바깥 클릭 시 닫기
document.getElementById("detailModal").addEventListener("click", (e) => {
    if (e.target.id === "detailModal") closeModal();
});

// ===========================================
// 🔹 시험 일정 불러오기 함수
// ===========================================
async function loadScheduleToCalendar() {
    const scheduleContainer = document.getElementById("results_calendar");

    // 기존 제목 유지한 채 내용만 출력하도록 목표 div 선택

    const defaultJmCd = "7910"; // 임시코드임
    const xmlDoc = await fetchSchedule(defaultJmCd, "2025");
    const items = getItemsFromXML(xmlDoc);

    document.getElementById("scrollContainer-calendar").addEventListener("scroll", handleDivScroll);
    renderScheduleList(items, scheduleContainer);
}

// ----------------------------
// 📌 응시률이 높은 자격증 TOP 리스트
// ----------------------------
async function loadTopApplyList() {
    const container = document.getElementById("certlist-trending");
    container.innerHTML = "<p>데이터 불러오는 중...</p>";

    const xmlDoc = await fetchExamStats("10", "2023");
    const items = getItemsFromXML(xmlDoc);

    document.getElementById("scrollContainer-trending").addEventListener("scroll", handleDivScroll);
    // 👇 데이터 파싱 + 정렬 + 렌더링 전부 renderExamStatsList에서 처리
    renderExamStatsList(items, container);
}
