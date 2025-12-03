// js/search.js
import { fetchCertificates, getItemsFromXML } from "./api.js";
import { renderListItem } from "./render.js";

export async function searchCertificate(keywordParam) {
    const input = keywordParam || document.getElementById("searchInput").value.trim();
    const resultsDiv = document.getElementById("results");

    // 검색 실행 시 자동완성 박스 닫기
    const box = document.getElementById("autocomplete");
    if (box) box.style.display = "none";

    // 🔹 검색어가 비어 있으면 → 랜덤 10개 다시 보여주기
    if (!input) {
        resultsDiv.innerHTML = "자격증 불러오는 중...";
        try {
            const xmlDoc = await fetchCertificates("");
            let items = getItemsFromXML(xmlDoc);

            items = items
                .map(value => ({ value, sort: Math.random() }))
                .sort((a, b) => a.sort - b.sort)
                .map(({ value }) => value);

            const randomTen = items.slice(0, 10);

            resultsDiv.innerHTML = "";
            randomTen.forEach(item => renderListItem(item, resultsDiv));
        } catch (err) {
            console.error("랜덤 자격증 불러오기 실패:", err);
            resultsDiv.innerHTML = "<p>자격증 목록을 불러오는 데 실패했습니다. 잠시 후 다시 시도해 주세요.</p>";
        }
        return;
    }

    resultsDiv.innerHTML = "검색 중...";

    const xmlDoc = await fetchCertificates(input); // 원본 그대로 API 호출
    const items = getItemsFromXML(xmlDoc);

    resultsDiv.innerHTML = "";

    const normalize = (str) =>
        str?.normalize("NFC").replace(/\s+/g, "").trim().toLowerCase() || "";

    const keywordNormalized = normalize(input);

    const matched = items.filter(item => {
        const name = item.getElementsByTagName("jmfldnm")[0]?.textContent || "";
        return normalize(name).includes(keywordNormalized);
    });

    if (matched.length === 0) {
        resultsDiv.innerHTML = `<p>"${input}"와 일치하는 자격증 없음</p>`;
        return;
    }

    matched.forEach(item => renderListItem(item, resultsDiv));
}