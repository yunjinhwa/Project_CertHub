/*
    // js/api.js
     - Q-Net 공공데이터 API를 호출해 XML 데이터를 가져오고, 이를 JS DOM 형태로 변환하는 기능만 담당
     - 서버와 통신 / XML → JS DOM 변환
*/

const API_BASE = "/api";

// 자격 목록
export async function fetchCertificates(keyword = "") {
    const response = await fetch(`/api/cert?name=${encodeURIComponent(keyword)}`);

    const xmlText = await response.text();

    const parser = new DOMParser();
    return parser.parseFromString(xmlText, "text/xml");
}

export function getItemsFromXML(xmlDoc) {
    // 🔥 1) 파싱 에러 확인
    const parserError = xmlDoc.getElementsByTagName("parsererror");
    if (parserError.length > 0) {
        console.error("XML 파싱 오류 발생:", parserError[0].textContent);
        return [];
    }

    // 🔥 2) 기본 item 검색
    let items = xmlDoc.getElementsByTagName("item");

    if (items.length > 0) {
        return Array.from(items);
    }

    // 🔥 3) items 태그 아래에 list로 돼있는 경우
    items = xmlDoc.getElementsByTagName("list");
    if (items.length > 0) {
        return Array.from(items);
    }

    // 🔥 4) 최후 fallback: body -> items -> children
    const fallbackItems = xmlDoc.querySelectorAll("items > *");
    if (fallbackItems.length > 0) {
        return Array.from(fallbackItems);
    }

    console.warn("⚠ XML에서 item을 찾지 못했습니다.");
    return [];
}


// 시험 일정 
export async function fetchSchedule(jmcd, grade = "", year = "2025") {
    let url = `${API_BASE}/schedule?jmcd=${jmcd}&implYy=${year}`;

    // 🔥 grade가 존재할 때만 붙이기
    if (grade && grade !== "undefined") {
        url += `&grade=${encodeURIComponent(grade)}`;
    }

    console.log("📡 호출 URL:", url);

    const res = await fetch(url);
    const text = await res.text();
    return new window.DOMParser().parseFromString(text, "text/xml");
}

// 응시자격별 통계 데이터
export async function fetchExamStats(grdCd = '10', year = '2023') {
    const res = await fetch(`/api/exam/stats?grdCd=${grdCd}&baseYY=${year}`);
    const xmlText = await res.text();

    const parser = new DOMParser();
    return parser.parseFromString(xmlText, "text/xml");
}
