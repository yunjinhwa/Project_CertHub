// main.js

import { fetchCertificates, fetchSchedule, fetchExamStats, getItemsFromXML } from "./api.js";
import { handleAutocomplete } from "./autocomplete.js";
import { searchCertificate } from "./search.js";
import { setAllItems, loadMoreItems, handleDivScroll } from "./pagination.js";
import { renderScheduleList, renderExamStatsList } from "./render.js";
import { loadDetailInfo, closeModal } from "./detail.js";

document.addEventListener("DOMContentLoaded", initPage);

document.getElementById("searchInput").addEventListener("input", handleAutocomplete);
document.getElementById("searchButton").addEventListener("click", searchCertificate);

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




// ===========================================
// 🔹 페이지 초기 실행
// ===========================================
async function initPage() {
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "전체 자격증 불러오는 중...";

    const resultsDiv_calendar = document.getElementById("results_calendar");
    resultsDiv_calendar.innerHTML = "시험 일정 불러오는 중...";

    // 1) 자격 목록은 한 번만 불러오고 cachedCertItems에 저장
    let items;
    if (cachedCertItems) {
        items = cachedCertItems;
    } else {
        const xmlDoc = await fetchCertificates("");
        items = getItemsFromXML(xmlDoc);
        cachedCertItems = items;
    }

    resultsDiv.innerHTML = "";
    resultsDiv_calendar.innerHTML = "";

    // 2) 랜덤 섞어서 10개 뽑기
    items = items
        .map((value) => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);

    const randomTen = items.slice(0, 10);

    setAllItems(randomTen);
    loadMoreItems();
    document.getElementById("scrollContainer").addEventListener("scroll", handleDivScroll);

    // 3) 나머지 API들은 병렬로 돌려도 되고, 순서 유지 필요 없으면 await 안 해도 됨
    loadScheduleToCalendar();
    loadTopApplyList();

    // 🔹 여기서 바로 위에서 가져온 items 재사용
    await loadFieldsBrowse(items);
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

// ===========================================
// 🔹 "자세히" 버튼 클릭 이벤트 처리
// ===========================================
function addDetailButtonClickListeners() {
    // 자격증 목록에서 "자세히" 버튼을 클릭했을 때 호출되는 부분
    document.querySelectorAll(".detail-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const jmcd = btn.getAttribute("data-jmcd");
            loadDetailInfo(jmcd);  // 상세 정보를 불러오는 함수 호출
        });
    });
}
