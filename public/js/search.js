// js/search.js

import { fetchCertificates, getItemsFromXML } from "./api.js";
import { renderListItem } from "./render.js";

export async function searchCertificate() {
    const input = document.getElementById("searchInput").value.trim();
    const resultsDiv = document.getElementById("results");

    // 🔹 검색어가 비어 있으면 → 랜덤 10개 다시 보여주기
    if (!input) {
        resultsDiv.innerHTML = "자격증 불러오는 중...";

        try {
            // 전체 자격증 목록 가져오기
            const xmlDoc = await fetchCertificates("");    // 이름 없이 호출
            let items = getItemsFromXML(xmlDoc);

            // 랜덤 섞기
            items = items
                .map(value => ({ value, sort: Math.random() }))
                .sort((a, b) => a.sort - b.sort)
                .map(({ value }) => value);

            const randomTen = items.slice(0, 10);

            // 결과 영역 비우고 10개 렌더링
            resultsDiv.innerHTML = "";
            randomTen.forEach(item => renderListItem(item, resultsDiv));
        } catch (err) {
            console.error("랜덤 자격증 불러오기 실패:", err);
            resultsDiv.innerHTML = "<p>자격증 목록을 불러오는 데 실패했습니다. 잠시 후 다시 시도해 주세요.</p>";
        }

        return; // 여기서 끝
    }

    resultsDiv.innerHTML = "검색 중...";

    const xmlDoc = await fetchCertificates(input);
    const items = getItemsFromXML(xmlDoc);

    resultsDiv.innerHTML = "";

    const normalize = (str) =>
        str?.normalize("NFC").replace(/\s+/g, "").trim().toLowerCase() || "";

    const keyword = normalize(input);

    const matched = items.filter(item => {
        const name = item.getElementsByTagName("jmfldnm")[0]?.textContent || "";
        return normalize(name).includes(keyword);
    });

    if (matched.length === 0) {
        resultsDiv.innerHTML = `<p>"${input}"와 일치하는 자격증 없음</p>`;
        return;
    }

    matched.forEach(item => renderListItem(item, resultsDiv));
}
