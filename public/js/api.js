/*
    // js/api.js
     - Q-Net 공공데이터 API를 호출해 XML 데이터를 가져오고, 이를 JS DOM 형태로 변환하는 기능만 담당
     - 서버와 통신 / XML → JS DOM 변환
*/


// 자격 목록
export async function fetchCertificates(keyword = "") {
    const response = await fetch(`/api/cert?name=${encodeURIComponent(keyword)}`);

    const xmlText = await response.text();

    const parser = new DOMParser();
    return parser.parseFromString(xmlText, "text/xml");
}

export function getItemsFromXML(xmlDoc) {
    return Array.from(xmlDoc.getElementsByTagName("item"));
}

// 시험 일정 
export async function fetchSchedule(jmcd = "", year = new Date().getFullYear()) {
    const url =
        jmcd && jmcd !== ""
        ? `/api/schedule?jmcd=${jmcd}&implYy=${year}`
        : `/api/schedule`;   // 🔥 jmcd 없이 전체 일정 조회

    console.log("📡 호출 URL:", url);  // ← URL이 여기에 찍힘

    const response = await fetch(url);
    const xmlText = await response.text();

    return new window.DOMParser().parseFromString(xmlText, "text/xml");
}


// 응시자격별 통계 데이터
export async function fetchExamStats(grdCd = '10', year = '2023') {
    const res = await fetch(`/api/exam/stats?grdCd=${grdCd}&baseYY=${year}`);
    const xmlText = await res.text();

    const parser = new DOMParser();
    return parser.parseFromString(xmlText, "text/xml");
}
