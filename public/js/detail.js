import {
  addBookmark,
  getBookmarksOfCurrentUser,
  deleteBookmarkByCertId,
} from "./firebase/firebase-bookmark.js";

// HTML 엔티티(&lt; &gt;) 제거용 함수
function decodeHtmlEntities(str) {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = str;
    return textarea.value;
}

function buildDetailContent(html, jmcd, certName = "") {
    // 원래 상세 HTML을 감쌀 컨테이너
    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;

    // 액션 버튼 영역
    const actions = document.createElement("div");
    actions.style.marginTop = "16px";
    actions.style.display = "flex";
    actions.style.justifyContent = "flex-end";
    actions.style.gap = "8px";

        const bookmarkBtn = document.createElement("button");
    bookmarkBtn.type = "button";
    bookmarkBtn.className = "btn";

    // 처음에는 상태 확인 중으로 표시
    bookmarkBtn.textContent = "북마크 상태 확인 중...";
    bookmarkBtn.disabled = true;

    // 🔹 이미 북마크 되어 있는지 확인해서 버튼 초기 상태 설정
    (async () => {
        try {
            const bookmarks = await getBookmarksOfCurrentUser();
            const exists = bookmarks.some((b) => b.certId === jmcd);

            bookmarkBtn.dataset.bookmarked = exists ? "true" : "false";
            bookmarkBtn.textContent = exists ? "북마크 삭제" : "북마크 추가";
        } catch (err) {
            console.error("북마크 상태 조회 실패:", err);
            // 로그인 안 되어 있으면 여기서 에러 날 수 있으니 기본은 "추가"로 둡니다.
            bookmarkBtn.dataset.bookmarked = "false";
            bookmarkBtn.textContent = "북마크 추가";
        } finally {
            bookmarkBtn.disabled = false;
        }
    })();

    // 🔹 버튼 클릭 시 추가/삭제 토글
    bookmarkBtn.addEventListener("click", async () => {
        const name = certName || "이 자격";

        if (!jmcd) {
            alert("자격증 코드(jmcd)가 없어 북마크를 처리할 수 없습니다.");
            return;
        }

        const isBookmarked = bookmarkBtn.dataset.bookmarked === "true";
        const originalText = bookmarkBtn.textContent;

        try {
            bookmarkBtn.disabled = true;

            if (isBookmarked) {
                // ===== 이미 북마크 → 삭제 =====
                bookmarkBtn.textContent = "삭제 중...";

                await deleteBookmarkByCertId(jmcd);

                bookmarkBtn.dataset.bookmarked = "false";
                bookmarkBtn.textContent = "북마크 추가";
                alert(`'${name}' 북마크가 삭제되었습니다.`);
            } else {
                // ===== 아직 북마크 아님 → 추가 =====
                bookmarkBtn.textContent = "추가 중...";

                await addBookmark({
                    certId: jmcd,
                    certName: name,
                });

                bookmarkBtn.dataset.bookmarked = "true";
                bookmarkBtn.textContent = "북마크 삭제";
                alert(`'${name}' 북마크에 추가되었습니다.`);
            }
        } catch (err) {
            console.error("북마크 처리 실패:", err);

            // 실패 시 버튼 텍스트 원상 복구
            bookmarkBtn.textContent = originalText;

            // 로그인 안 된 상태에서 '추가' 시도했을 때
            if (!isBookmarked && err.message && err.message.includes("로그인한 사용자가 없습니다")) {
                if (confirm("북마크를 사용하려면 로그인이 필요합니다. 로그인 페이지로 이동할까요?")) {
                    window.location.href = "login.html";
                }
            } else {
                alert("북마크 처리에 실패했습니다. 잠시 후 다시 시도해 주세요.");
            }
        } finally {
            bookmarkBtn.disabled = false;
        }
    });

    actions.appendChild(bookmarkBtn);


    return wrapper;
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

// 모달 기반 상세 정보 로더 (공통 showModal 사용)
export async function loadDetailInfo(jmcd, certName = "") {
    // 1) 캐시가 있으면 바로 모달로 표시
    const cachedHtml = detailCache.get(jmcd);
    if (cachedHtml) {
        const contentEl = buildDetailContent(cachedHtml, jmcd, certName);

        if (typeof window.showModal === "function") {
            const title = certName ? `${certName} 상세 정보` : "자격 상세 정보";
            window.showModal(title, contentEl);
        } else {
            alert("자격 상세 정보\n\n" + contentEl.textContent);
        }
        return;
    }

    // 🔹 캐시가 없을 때는 우선 로딩 모달부터 띄우기
    if (typeof window.showModal === "function") {
        window.showModal(
            certName ? `${certName} 상세 정보` : "자격 상세 정보",
            "정보를 불러오는 중입니다..."
        );
    }

    // 여기서부터 실제 데이터 로딩/파싱
    let acquireInfo = "";        // 취득방법 본문
    let relatedCertsHTML = "";   // 관련 자격증 리스트 HTML

    try {
        // 상세 정보 + 관련 자격증 API 병렬 호출
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

        // =========================
        // 1) 상세 XML에서 취득방법 추출
        // =========================
        const detailXml = new DOMParser().parseFromString(detailXmlText, "text/xml");
        const detailItems = Array.from(detailXml.getElementsByTagName("item"));

        let firstContent = ""; // 아무 infogb 도 안맞을 때 대비

        if (detailItems.length > 0) {
            detailItems.forEach((item) => {
                const typeNode = item.getElementsByTagName("infogb")[0];
                const contentNode = item.getElementsByTagName("contents")[0];

                const type = typeNode?.textContent?.trim() || "";
                const rawContent = contentNode?.textContent?.trim() || "";
                if (!rawContent) return;

                const cleaned = cleanQnetContent(rawContent);

                // 첫 번째 내용은 백업용으로 저장
                if (!firstContent) {
                    firstContent = cleaned;
                }

                // infogb에 "취득", "응시", "검정", "시험" 등 키워드가 있으면 취득방법으로 우선 선택
                if (
                    !acquireInfo &&
                    /(취득|응시|검정|시험|응시자격|합격)/.test(type)
                ) {
                    acquireInfo = cleaned;
                }
            });
        }

        // 위 규칙으로도 못 찾았으면, 첫 번째 내용을 사용
        if (!acquireInfo) {
            acquireInfo = firstContent;
        }

        // ==============================
        // 2) 관련 자격증 XML 파싱
        // ==============================
        const relatedXml = new DOMParser().parseFromString(relatedXmlText, "text/xml");
        const relatedItems = Array.from(relatedXml.getElementsByTagName("item"));

        if (relatedItems.length > 0) {
            const liList = relatedItems
                .map((item) => {
                    const name =
                        item.getElementsByTagName("jmfldnm")[0]?.textContent?.trim() ||
                        "";
                    const series =
                        item.getElementsByTagName("seriesnm")[0]?.textContent?.trim() ||
                        "";
                    const qual =
                        item.getElementsByTagName("qualgbnm")[0]?.textContent?.trim() ||
                        "";
                    const rJmcd =
                        item.getElementsByTagName("jmcd")[0]?.textContent?.trim() || "";

                    if (!name && !series && !qual) return "";

                    const extra = [qual, series].filter(Boolean).join(" / ");
                    const label = extra ? `${name} (${extra})` : name;

                    // jmcd를 활용해 다시 상세 모달 여는 버튼 등으로 바꾸고 싶으면 여기서 a/button으로 만들어도 됨
                    return `<li>${label}</li>`;
                })
                .filter(Boolean);

            if (liList.length > 0) {
                relatedCertsHTML = liList.join("");
            } else {
                relatedCertsHTML = "<li>관련 자격증 정보가 없습니다.</li>";
            }
        } else {
            relatedCertsHTML = "<li>관련 자격증 정보가 없습니다.</li>";
        }

        // ==============================
        // 3) 최종 HTML 템플릿 구성
        // ==============================
        const html = `
            <h3>📘 취득방법</h3>
            ${acquireInfo || "<p>취득방법 정보가 없습니다.</p>"}

            <h3>📘 관련 자격증</h3>
            <ul>
                ${relatedCertsHTML}
            </ul>
        `;

        // 캐시에 저장 (본문 HTML만)
        detailCache.set(jmcd, html);

        // 모달 콘텐츠 + 북마크 버튼 DOM 생성
        const contentEl = buildDetailContent(html, jmcd, certName);

        if (typeof window.showModal === "function") {
            const title = certName ? `${certName} 상세 정보` : "자격 상세 정보";
            window.showModal(title, contentEl);
        } else {
            alert("자격 상세 정보\n\n" + contentEl.textContent);
        }
    } catch (error) {
        console.error("데이터 로드 중 오류 발생:", error);
        if (typeof window.showModal === "function") {
            window.showModal("자격 상세 정보", "정보를 불러오는 데 오류가 발생했습니다.");
        } else {
            alert("정보를 불러오는 데 오류가 발생했습니다.");
        }
    }
}