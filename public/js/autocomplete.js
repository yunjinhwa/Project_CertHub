// js/autocomplete.js
import { fetchCertificates, getItemsFromXML } from "./api.js";
import { searchCertificate } from "./search.js";

let debounceTimer = null; // 디바운스 타이머

export async function handleAutocomplete() {
    const rawInput = document.getElementById("searchInput").value;
    const box = document.getElementById("autocomplete");

    // normalize 함수
    const normalize = (str) =>
        str?.normalize("NFC").replace(/\s+/g, "").trim().toLowerCase() || "";

    const input = normalize(rawInput);

    // 입력이 너무 짧으면 자동완성 숨김
    if (input.length < 1) {
        box.style.display = "none";
        box.innerHTML = "";
        return;
    }

    // 디바운스 적용: 300ms 동안 추가 입력 없을 때만 실행
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
        const xmlDoc = await fetchCertificates(input);
        const items = getItemsFromXML(xmlDoc);

        // 최신 입력값 검증
        const currentInput = normalize(document.getElementById("searchInput").value);
        if (currentInput !== input) return;

        box.innerHTML = "";
        if (items.length === 0) {
            box.style.display = "none";
            return;
        }

        box.style.display = "block";

        // 자격증 이름 추출 및 필터링
        let names = items
            .map(item => item.getElementsByTagName("jmfldnm")[0]?.textContent || "")
            .filter(name => normalize(name).includes(input));

        names = [...new Set(names)];

        names.forEach(name => {
            const div = document.createElement("div");
            div.className = "autocomplete-item";
            div.textContent = name;

            // 클릭 시 검색 실행 (원본 이름 전달)
            div.onclick = () => {
                const selectedName = name.trim(); // 원본 그대로
                document.getElementById("searchInput").value = selectedName;
                box.style.display = "none";
                searchCertificate(selectedName);
            };

            box.appendChild(div);
        });
    }, 300);
}