/*
    // js/autocomplete.js
    입력 → API 호출 → XML to items → 이름 추출 → normalize → 필터 → UI 생성

    사용자가 자격증 목록 검색창에 글자를 입력할 때마다:
        1. 입력값을 읽고, 공공데이터 API로 자격증 목록을 검색함
        2. API 결과에서 자격증 이름을 뽑아서 입력값과 비슷한 자격증만 필터링하고, 자동완성 박스에 목록으로 표시힘
        3. 항목을 클릭하면 자동으로 검색(SearchCertificate) 실행
*/

// fetchCertificates → 자격증 검색 API 호출
// getItemsFromXML → XML → item 배열 변환
// searchCertificate → 자동완성 항목 클릭 때 실제 검색 실행
import { fetchCertificates, getItemsFromXML } from "./api.js";
import { searchCertificate } from "./search.js";

// handleAutocomplete 함수 --> 검색창 입력 이벤트에서 호출됨
export async function handleAutocomplete() {
    // 현재 입력값 + 자동완성 박스 DOM 가져오기
    const input = document.getElementById("searchInput").value.trim();
    const box = document.getElementById("autocomplete");        

    // 입력이 너무 짧으면 자동완성 숨김
    if (input.length < 1) {
        box.style.display = "none";
        box.innerHTML = "";
        return;
    }

    // API 호출로 자격증 목록 가져오기
    const xmlDoc = await fetchCertificates(input);
    const items = getItemsFromXML(xmlDoc);

    // 자동완성 박스 초기화
    box.innerHTML = "";
    if (items.length === 0) {
        box.style.display = "none";
        return;
    }

    box.style.display = "block";

    // normalize 함수 --> 문자열 비교
    /*
        한글 자모 분리 문제 방지(NFC 조합형)
        공백 제거
        소문자 변환
        안전하게 비어 있는 값 처리
        ex ) "정보 처리 기사"  →  "정보처리기사"
                "정보처리기사"   →  동일 
    */ 
    const normalize = (str) =>
        str?.normalize("NFC").replace(/\s+/g, "").trim().toLowerCase() || "";

    const keyword = normalize(input);

    // API 응답에서 자격증 이름만 추출
    let names = items
        .map(item => item.getElementsByTagName("jmfldnm")[0]?.textContent || "")
        .filter(name => normalize(name).includes(keyword));     // 입력값과 부분 일치하는 이름만 필터링

    names = [...new Set(names)];    // 중복 제거

    // 자동완성 목록을 HTML div 요소로 생성
    names.forEach(name => {
        const div = document.createElement("div");
        div.className = "autocomplete-item";
        div.textContent = name;

        // 자동완성 항목 클릭 시 실행
        div.onclick = () => {
            document.getElementById("searchInput").value = name;
            box.style.display = "none";
            searchCertificate();
        };

        box.appendChild(div);
    });
}
