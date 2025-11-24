// js/search.js

import { fetchCertificates, getItemsFromXML } from "./api.js";
import { renderListItem } from "./render.js";

export async function searchCertificate() {
    const input = document.getElementById("searchInput").value.trim();
    const resultsDiv = document.getElementById("results");

    if (!input) {
        alert("자격증 이름을 입력하세요.");
        return;
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
