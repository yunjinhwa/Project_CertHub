// main.js

import { fetchCertificates, fetchSchedule, fetchExamStats, getItemsFromXML } from "./api.js";
import { handleAutocomplete } from "./autocomplete.js";
import { searchCertificate } from "./search.js";
import { setAllItems, loadMoreItems, handleDivScroll } from "./pagination.js";
import { renderScheduleList, renderExamStatsList } from "./render.js";
import { TrendingCarousel } from "./trending-carousel.js";
import { loadDetailInfo, closeModal } from "./detail.js";

document.addEventListener("DOMContentLoaded", initPage);
document.getElementById("searchInput").addEventListener("input", handleAutocomplete);
document.getElementById("searchInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault(); // 기본 제출 방지
        const box = document.getElementById("autocomplete");
        if (box) {
            box.style.display = "none";   // 숨기기
            box.innerHTML = "";           // 내용 비우기
        }
        searchCertificate(); // 검색 실행
    }
});

document.getElementById("searchButton").addEventListener("click", () => {
    const box = document.getElementById("autocomplete");
    if (box) box.style.display = "none"; // 자동완성 박스 닫기
    searchCertificate(); // 검색 실행
});


let cachedCertItems = null;

// ===========================================
// 🔹 활용 분야 불러오기 (20개 추출)
// ===========================================
async function loadFieldsBrowse(sourceItems) {
    const container = document.getElementById("fields-browse");
    container.innerHTML = "<p>불러오는 중...</p>";

    // initPage에서 넘겨준 items가 있으면 그대로 사용
    let items = sourceItems;

    // 혹시 다른 데서 그냥 loadFieldsBrowse()만 호출했을 때는
    // 기존처럼 API를 한 번 더 호출하도록 fallback
    if (!items) {
        const xmlDoc = await fetchCertificates("");
        items = getItemsFromXML(xmlDoc);
    }

    const mapped = items
        .map(item => {
            const middle = item.getElementsByTagName("mdobligfldnm")[0]?.textContent.trim() || null;
            const top = item.getElementsByTagName("obligfldnm")[0]?.textContent.trim() || null;

            if (middle && top) {
                return {
                    name: item.getElementsByTagName("jmfldnm")[0]?.textContent || "이름 없음",
                    middle,
                    top
                };
            }
            return null;
        })
        .filter(item => item !== null);

    const random20 = mapped
        .map(v => ({ v, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .slice(0, 20)
        .map(o => o.v);

    container.innerHTML = random20
        .map(item => `
            <div class="field-card">
                <div class="field-card-title">${item.name}</div>
                <div class="field-card-tags">
                    <span>#${item.middle}</span>
                    <span>#${item.top}</span>
                </div>
            </div>
        `)
        .join("");
}

// 🔥 전역 캐시
let ALL_CERT_ITEMS = [];


// ================================
// 🔥 전체 자격 초기 1회 로딩 함수
// ================================
async function initCertificates() {
    console.log("🔄 전체 자격 목록 로딩 중...");

    // ⚠️ name="" 은 데이터 0개! → "a"로 우회해야 전체가 나옴
    const xmlDoc = await fetchCertificates("a");
    ALL_CERT_ITEMS = getItemsFromXML(xmlDoc);

    console.log("📌 전체 자격 개수:", ALL_CERT_ITEMS.length);
}


// ================================
// 🔥 페이지 초기 실행
// ================================
async function initPage() {
    const resultsDiv = document.getElementById("results");
    const resultsDiv_calendar = document.getElementById("results_calendar");

    resultsDiv.innerHTML = "전체 자격증 불러오는 중...";
    resultsDiv_calendar.innerHTML = "시험 일정 불러오는 중...";

    // 🔥 1) 전체 자격 목록 최초 로딩
    if (ALL_CERT_ITEMS.length === 0) {
        await initCertificates();
    }

    // 🔥 2) 캐싱된 전체 목록 가져오기
    let items = ALL_CERT_ITEMS;

    resultsDiv.innerHTML = "";
    resultsDiv_calendar.innerHTML = "";

    // 🔥 3) 랜덤 10개 선택
    const randomTen = items
        .map(v => ({ v, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .slice(0, 10)
        .map(o => o.v);

    setAllItems(randomTen);
    loadMoreItems();
    document.getElementById("scrollContainer")
        .addEventListener("scroll", handleDivScroll);


    // 🔥 4) 첫 번째 자격증 일정 바로 보여주기
    const firstItem = randomTen[0];
    if (!firstItem) {
        console.error("❗ firstItem이 undefined입니다.");
        return;
    }

    const firstJmcd = firstItem.getElementsByTagName("jmcd")[0]?.textContent;
    const firstName = firstItem.getElementsByTagName("jmfldnm")[0]?.textContent;
    const firstGrade = firstItem.getElementsByTagName("seriesnm")[0]?.textContent || "";

    loadScheduleToCalendar(firstJmcd, firstName, firstGrade);


    // 🔥 5) TOP 리스트 / 활용분야 / 기타 불러오기
    loadTopApplyList();
    await loadFieldsBrowse(items);
}

// 모달 바깥 클릭 시 닫기
document.getElementById("detailModal").addEventListener("click", (e) => {
    if (e.target.id === "detailModal") closeModal();
});

// ===========================================
// 🔹 시험 일정 불러오기 함수
// ===========================================
export async function loadScheduleToCalendar(jmcd, certName = "", grade = "") {
    const scheduleContainer = document.getElementById("results_calendar");

    if (!jmcd) {
        scheduleContainer.innerHTML = "<p>시험일정 정보가 없습니다.</p>";
        return;
    }

    const xmlDoc = await fetchSchedule(jmcd, grade, "2025");

    console.log("📡 받아온 XML Document:", xmlDoc);
    console.log("📡 XML raw text:", new XMLSerializer().serializeToString(xmlDoc));

    // 파싱 
    let schedules = getItemsFromXML(xmlDoc);

    console.log("📌 schedules 타입:", schedules);
    console.log("📌 schedules instanceof Array:", schedules instanceof Array);
    console.log("📌 schedules.length:", schedules.length);
    
    // 응답이 없을 때
    if (!schedules || schedules.length === 0) {
        scheduleContainer.innerHTML = `
            <h2>📘 ${certName} (${grade}) 시험일정</h2>
            <p>등록된 시험 일정이 없습니다.</p>
        `;
        return;
    }

    scheduleContainer.innerHTML = `
        <h2 style="margin-bottom:12px;">📘 ${certName} (${grade}) 시험일정</h2>
        <div id="schedule-list"></div>
    `;

    const listContainer = document.getElementById("schedule-list");
    renderScheduleList(schedules, listContainer);
}

// ----------------------------
// 📌 응시률이 높은 자격증 TOP 리스트
// ----------------------------
async function loadTopApplyList() {
    const container = document.getElementById("certlist-trending");
    container.innerHTML = "<p>데이터 불러오는 중...</p>";

    const xmlDoc = await fetchExamStats("10", "2023");
    const items = getItemsFromXML(xmlDoc);

    // 👇 데이터 파싱 + 정렬 + 렌더링 전부 renderExamStatsList에서 처리
    renderExamStatsList(items, container);
    
    // 캐러셀 초기화
    new TrendingCarousel("#certlist-trending");
}

// ===========================================
// 🔥 ES Module 환경에서도 window로 안전하게 노출
// ===========================================
window.loadScheduleToCalendar = (jmcd, certName, grade) => {
    loadScheduleToCalendar(jmcd, certName, grade);
};
