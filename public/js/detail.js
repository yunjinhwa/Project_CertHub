// HTML 엔티티(&lt; &gt;) 제거용 함수
function decodeHtmlEntities(str) {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = str;
    return textarea.value;
}

// QNet 콘텐츠 정리 함수
function cleanQnetContent(text) {
    if (!text) return "";

    text = decodeHtmlEntities(text);

    // CSS 제거
    text = text.replace(/BODY\s*\{[^}]*\}/gi, "");
    text = text.replace(/P\s*\{[^}]*\}/gi, "");
    text = text.replace(/LI\s*\{[^}]*\}/gi, "");

    text = text.trim();

    // 줄바꿈 유도
    text = text
        .replace(/□/g, "\n□ ")
        .replace(/○|●/g, "\n- ")
        .replace(/o\s/g, "\n- ")
        .replace(/※/g, "\n※ ")
        .replace(/[0-9]+\.\s/g, match => "\n" + match);

    const lines = text.split("\n").map(line => line.trim()).filter(Boolean);

    let html = "";
    let ulOpen = false;

    lines.forEach(line => {
        if (line.startsWith("- ")) {
            if (!ulOpen) {
                html += "<ul>";
                ulOpen = true;
            }
            html += `<li>${line.substring(2)}</li>`;
        } else {
            if (ulOpen) {
                html += "</ul>";
                ulOpen = false;
            }
            html += `<p>${line}</p>`;
        }
    });

    if (ulOpen) html += "</ul>";

    return html;
}

// 일정 횟수까지 재요청하는 fetch 함수 + 타임아웃
async function fetchTextWithRetry(
    url,
    { retries = 2, delay = 500, timeout = 10000 } = {} // 기본: 2번 시도, 요청당 7초 제한
) {
    let lastError;

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const controller = new AbortController();

            // timeoutms 후에 요청 강제 중단
            const id = setTimeout(() => controller.abort(), timeout);

            const res = await fetch(url, { signal: controller.signal });
            clearTimeout(id);

            if (!res.ok) {
                // 500, 504 같은 서버 에러
                throw new Error(`HTTP ${res.status}`);
            }

            // 성공
            return await res.text();
        } catch (err) {
            lastError = err;

            // 마지막 시도면 루프 종료
            if (attempt === retries) break;

            // 잠깐 쉬었다가 다시 시도
            await new Promise(r => setTimeout(r, delay));
        }
    }

    // 여기까지 오면 모든 시도 실패
    throw lastError;
}


// 같은 jmcd를 여러 번 눌렀을 때 재요청 안 하도록 캐시
const detailCache = new Map();


// 모달 닫기 함수
export function closeModal() {
    document.getElementById("detailModal").style.display = "none";
    document.body.style.overflow = "";
}

// 탭 전환 이벤트 리스너 함수 (재사용 가능)
function attachTabListeners(modalBody) {
    const tabs = modalBody.querySelectorAll(".modal-tab");
    const contents = modalBody.querySelectorAll(".modal-tab-content");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const targetTab = tab.getAttribute("data-tab");

            // 모든 탭과 콘텐츠 비활성화
            tabs.forEach(t => t.classList.remove("active"));
            contents.forEach(c => c.classList.remove("active"));

            // 클릭한 탭과 해당 콘텐츠 활성화
            tab.classList.add("active");
            modalBody.querySelector(`[data-content="${targetTab}"]`).classList.add("active");
        });
    });
}

export async function loadDetailInfo(jmcd, certInfo = null) {
    const modal = document.getElementById("detailModal");
    const modalBody = document.getElementById("modalBody");

    if (!modal || !modalBody) return;

    // 모달 띄우기 + body 스크롤 방지
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";

    // 1) 캐시에 이미 있으면 바로 출력 (API 호출 X) + 이벤트 리스너 재등록
    const cachedHtml = detailCache.get(jmcd);
    if (cachedHtml) {
        modalBody.innerHTML = cachedHtml;
        attachTabListeners(modalBody);
        return;
    }

    // 2) 처음 눌렀을 때만 로딩 텍스트 + API 호출
    modalBody.innerHTML = "불러오는 중...";

    try {
        // ---------------------------------------------
        // ✅ 상세조회 + 추천 자격증 API를 동시에 호출
        // ---------------------------------------------
        const [detailXmlText, relatedXmlText] = await Promise.all([
            fetchTextWithRetry(`/api/cert/detail?jmcd=${jmcd}`, {
                retries: 2,
                delay: 500,
                timeout: 10000,
            }),
            fetchTextWithRetry(`/api/attendqual?jmcd=${jmcd}`, {
                retries: 2,
                delay: 500,
                timeout: 10000,
            }),
        ]);

        // 🔍 디버깅: XML 응답 구조 확인
        console.log("=== 관련 자격증 API 응답 (처음 500자) ===");
        console.log(relatedXmlText.substring(0, 500));

        // ---------------------------------------------
        // 자격증 이름, 등급, 태그 정보 (전달받은 certInfo 사용)
        // ---------------------------------------------
        let certName = "자격 상세 정보";
        let certGrade = "";
        let certSeries = "";
        let certField1 = "";
        let certField2 = "";
        
        if (certInfo) {
            certName = certInfo.name || "자격 상세 정보";
            certGrade = certInfo.grade || "";
            certSeries = certInfo.series || "";
            certField1 = certInfo.field1 || "";
            certField2 = certInfo.field2 || "";
        }

        // ---------------------------------------------
        // 상세조회 XML 파싱 → 취득방법 추출
        // ---------------------------------------------
        const detailXml = new DOMParser().parseFromString(detailXmlText, "text/xml");
        const detailItems = Array.from(detailXml.getElementsByTagName("item"));

        let acquireInfo = "";
        let firstContent = "";

        // 상세 정보가 여러 개 올 수 있으니까 전부 한 번 돌면서 확인
        if (detailItems.length > 0) {
            detailItems.forEach(item => {
                const typeNode = item.getElementsByTagName("infogb")[0];
                const contentNode = item.getElementsByTagName("contents")[0];

                const type = typeNode?.textContent?.trim() || "";
                const rawContent = contentNode?.textContent?.trim() || "";

                if (!rawContent) return;

                const cleaned = cleanQnetContent(rawContent);

                // 제일 첫 번째 정보는 일단 fallback 용으로 저장
                if (!firstContent) {
                    firstContent = cleaned;
                }

                // "취득", "응시", "검정" 같은 키워드가 들어가면
                // 취득방법 쪽 내용으로 우선 사용
                if (!acquireInfo && /취득|응시|검정|취득 /.test(type)) {
                    acquireInfo = cleaned;
                }
            });
        }

        // 취득/응시/검정 관련 항목을 못 찾았으면 --> 첫 번째 정보라도 보여주기
        if (!acquireInfo) {
            acquireInfo = firstContent;
        }


        // ---------------------------------------------
        // 관련 자격증 XML 파싱
        // 🔹 API는 전체 목록을 반환하므로, attenJmCd === jmcd 인 항목을 찾아야 함
        // ---------------------------------------------
        const relatedXml = new DOMParser().parseFromString(relatedXmlText, "text/xml");
        const relatedItems = Array.from(relatedXml.getElementsByTagName("item"));

        console.log(`📊 전체 item 개수: ${relatedItems.length}`);
        console.log(`🔍 찾는 자격증 코드: ${jmcd}`);

        const relatedCerts = [];

        // 전체 item 중에서 attenJmCd가 현재 자격증 코드(jmcd)와 일치하는 것만 찾기
        const matchedItem = relatedItems.find(item => {
            const attenJmCd = item.getElementsByTagName("attenJmCd")[0]?.textContent?.trim();
            return attenJmCd === jmcd;
        });

        if (matchedItem) {
            console.log("✅ 일치하는 자격증 발견!");
            
            // 일치하는 항목에서 recomJmNm1, recomJmNm2 추출
            const recomJmNm1 = matchedItem.getElementsByTagName("recomJmNm1")[0]?.textContent?.trim();
            const recomJmNm2 = matchedItem.getElementsByTagName("recomJmNm2")[0]?.textContent?.trim();
            
            if (recomJmNm1) {
                relatedCerts.push(recomJmNm1);
                console.log(`  - 추천 1: ${recomJmNm1}`);
            }
            if (recomJmNm2) {
                relatedCerts.push(recomJmNm2);
                console.log(`  - 추천 2: ${recomJmNm2}`);
            }
        } else {
            console.log("❌ 일치하는 자격증을 찾지 못했습니다.");
        }

        let relatedCertsHTML = "";
        if (relatedCerts.length > 0) {
            relatedCertsHTML = relatedCerts
                .map(name => `<li>${name}</li>`)
                .join("");
        } else {
            relatedCertsHTML = "<li>관련 자격증 정보가 없습니다.</li>";
        }

        // ---------------------------------------------
        // 최종 HTML 구성
        // ---------------------------------------------
        const tagsHtml = [certGrade, certSeries, certField1, certField2]
            .filter(tag => tag)
            .map(tag => `<span class="cert-tag">#${tag}</span>`)
            .join("");

        const html = `
            <div class="modal-header-custom">
                <h1 class="modal-cert-title">${certName}</h1>
                <div class="modal-cert-tags">
                    ${tagsHtml}
                </div>
            </div>

            <div class="modal-tabs">
                <button class="modal-tab active" data-tab="acquire">취득방법</button>
                <button class="modal-tab" data-tab="related">관련 자격증</button>
            </div>

            <div class="modal-tab-content active" data-content="acquire">
                <div class="modal-section-content">
                    ${acquireInfo || "<p>취득방법 정보가 없습니다.</p>"}
                </div>
            </div>

            <div class="modal-tab-content" data-content="related">
                <ul class="modal-related-list">
                    ${relatedCertsHTML}
                </ul>
            </div>
        `;

        modalBody.innerHTML = html;

        // 탭 전환 이벤트 리스너 추가 (innerHTML 설정 후에 실행)
        attachTabListeners(modalBody);

        // ✅ 같은 자격증을 다시 눌렀을 때는 바로 이걸 사용
        detailCache.set(jmcd, html);

    } catch (error) {
        console.error("데이터 로드 중 오류 발생:", error);
        modalBody.innerHTML = "<p>정보를 불러오는 데 오류가 발생했습니다.</p>";
    }
}
