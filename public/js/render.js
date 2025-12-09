/* ============================================================
   render.js — 완전한 최종본 (정리 완료 / 버그 제거 / 최신 구조 적용)
   역할: 자격증 목록, 시험일정, 통계 렌더링만 담당
============================================================ */

// 상세정보 로더
import { loadDetailInfo } from "./detail.js";

// 시험일정 렌더링 도우미
import { getItemsFromXML } from "./api.js";

// Firebase 로그
import { addSearchClick } from "./firebase/firebase-search-click.js";



/* ============================================================
   📌 1) 자격증 목록 렌더링 (검색 결과 / 초기 화면)
============================================================ */
export function renderListItem(item, container) {
    const jmfldnm = item.getElementsByTagName('jmfldnm')[0]?.textContent || '없음';
    const qualgbnm = item.getElementsByTagName('qualgbnm')[0]?.textContent || '없음';  // 등급
    const seriesnm = item.getElementsByTagName('seriesnm')[0]?.textContent || '없음';
    const obligfldnm = item.getElementsByTagName('obligfldnm')[0]?.textContent || '없음';
    const mdobligfldnm = item.getElementsByTagName('mdobligfldnm')[0]?.textContent || '없음';
    const jmcd = item.getElementsByTagName('jmcd')[0]?.textContent || '';

    const div = document.createElement("div");
    div.className = "list-item";

    div.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
                <div style="font-size:18px; font-weight:600;">${jmfldnm}</div>
                <div style="margin-top:4px; color:#555;">
                    <span>#${qualgbnm}</span>
                    <span>#${seriesnm}</span>
                    <span>#${obligfldnm}/${mdobligfldnm}</span>
                </div>
            </div>

            <div class="list-item-buttons">
                <button class="btn detail-btn" data-jmcd="${jmcd}">자세히</button>

                <!-- 🔥 불필요한 '>' 제거됨 -->
                <button 
                    class="btn schedule-btn" 
                    data-jmcd="${jmcd}"
                    data-name="${jmfldnm}"
                    data-grade="${seriesnm}">
                    시험일정
                </button>
            </div>
        </div>
        <hr>
    `;

    container.appendChild(div);

    /* 상세정보 버튼 */
    div.querySelector(".detail-btn").addEventListener("click", () => {
        addSearchClick({
            certId: jmcd || null,
            keyword: jmfldnm,
            context: "detail_click_home"
        }).catch(console.error);

        loadDetailInfo(jmcd, {
            name: jmfldnm,
            grade: qualgbnm,
            series: seriesnm,
            field1: obligfldnm,
            field2: mdobligfldnm
        });
    });

    /* 시험일정 버튼 */
    div.querySelector(".schedule-btn").addEventListener("click", (e) => {
        const btn = e.target;
        window.loadScheduleToCalendar(
            btn.dataset.jmcd,
            btn.dataset.name,
            btn.dataset.grade   // 기사/산업기사/기능사/기능장/기술사
        );
    });
}




/* ============================================================
   📌 2) 시험일정 렌더링 — renderScheduleList
   → 지나간 일정도 출력 + 카드 스타일 + 정렬 완료
============================================================ */
export function renderScheduleList(items, container) {
    container.innerHTML = "";

    // 날짜 변환 도우미
    const toDate = (yyyymmdd) => {
        if (!yyyymmdd || yyyymmdd === "-" || yyyymmdd === "XXXXXXXX") return null;
        return new Date(
            Number(yyyymmdd.substring(0, 4)),
            Number(yyyymmdd.substring(4, 6)) - 1,
            Number(yyyymmdd.substring(6, 8))
        );
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 🔥 전체 일정 정렬 (원서접수 마감일 기준)
    const sorted = [...items].sort((a, b) => {
        const aEnd = toDate(a.getElementsByTagName("docregenddt")[0]?.textContent);
        const bEnd = toDate(b.getElementsByTagName("docregenddt")[0]?.textContent);
        if (!aEnd || !bEnd) return 0;
        return aEnd - bEnd;
    });

    if (sorted.length === 0) {
        container.innerHTML = "<p>등록된 시험 일정이 없습니다.</p>";
        return;
    }

    // 카드 렌더링
    sorted.forEach((item) => {
        const description     = item.getElementsByTagName("description")[0]?.textContent || "";

        const docRegStartDt   = item.getElementsByTagName("docregstartdt")[0]?.textContent || "-";
        const docRegEndDt     = item.getElementsByTagName("docregenddt")[0]?.textContent || "-";
        const docExamDt       = item.getElementsByTagName("docexamdt")[0]?.textContent || "-";
        const docPassDt       = item.getElementsByTagName("docpassdt")[0]?.textContent || "-";

        const docSubmitStartDt = item.getElementsByTagName("docsubmitstartdt")[0]?.textContent || "-";
        const docSubmitEndDt   = item.getElementsByTagName("docsubmitentdt")[0]?.textContent || "-";

        const pracRegStartDt  = item.getElementsByTagName("pracregstartdt")[0]?.textContent || "-";
        const pracRegEndDt    = item.getElementsByTagName("pracregenddt")[0]?.textContent || "-";
        const pracExamStartDt = item.getElementsByTagName("pracexamstartdt")[0]?.textContent || "-";
        const pracExamEndDt   = item.getElementsByTagName("pracexamenddt")[0]?.textContent || "-";
        const pracPassDt      = item.getElementsByTagName("pracpassdt")[0]?.textContent || "-";

        const endDate = toDate(docRegEndDt);
        const isPast = endDate && endDate < today;

        const div = document.createElement("div");
        div.className = "schedule-card";

        if (isPast) div.style.opacity = "0.55";

        div.innerHTML = `
            <h3>${description} ${isPast ? "<span style='color:#b00'>(지난 일정)</span>" : ""}</h3>

            <p>📝 필기 원서접수: ${docRegStartDt} ~ ${docRegEndDt}</p>
            <p>✏️ 필기 시험일: ${docExamDt}</p>
            <p>📢 필기 합격 발표: ${docPassDt}</p>

            <p>📄 응시자격 서류제출: ${docSubmitStartDt} ~ ${docSubmitEndDt}</p>

            <p>🧾 면접 원서접수: ${pracRegStartDt} ~ ${pracRegEndDt}</p>
            <p>🎤 면접 시험: ${pracExamStartDt} ~ ${pracExamEndDt}</p>
            <p>🏆 최종 합격 발표: ${pracPassDt}</p>
        `;

        container.appendChild(div);
    });
}




/* ============================================================
   📌 3) TOP10 통계 렌더링
============================================================ */
export function renderExamStatsList(items, container) {
    container.innerHTML = "";

    if (!items || !items.length) {
        container.innerHTML = "<p>데이터가 없습니다.</p>";
        return;
    }

    const list = Array.from(items).map(item => ({
        name: item.getElementsByTagName("emqualDispNm")[0]?.textContent || "-",
        qualDisp: item.getElementsByTagName("grdNm")[0]?.textContent || "-",
        implYy: item.getElementsByTagName("implYy")[0]?.textContent || "-",
        implSeq: item.getElementsByTagName("implSeq")[0]?.textContent || "-",
        apply: Number(item.getElementsByTagName("recptCnt")[0]?.textContent || 0),
        pilPass: Number(item.getElementsByTagName("pilPassCnt")[0]?.textContent || 0),
        silPass: Number(item.getElementsByTagName("silPassCnt")[0]?.textContent || 0),
    }));

    list.sort((a, b) => b.apply - a.apply);

    list.slice(0, 10).forEach(item => {
        const card = document.createElement("div");
        card.className = "exam-stat-card";

        card.innerHTML = `
            <div class="stat-card-header">
                <h3 class="stat-card-title">${item.name}</h3>
            </div>
            <div class="stat-card-body">
                <div class="stat-row">
                    <span class="stat-label">📅 시행년도</span>
                    <span class="stat-value">${item.implYy}</span>
                </div>

                <div class="stat-row">
                    <span class="stat-label">🔢 회차</span>
                    <span class="stat-value">${item.implSeq}회</span>
                </div>

                <div class="stat-row highlight">
                    <span class="stat-label">📝 접수자</span>
                    <span class="stat-value-primary">${item.apply.toLocaleString()} 명</span>
                </div>

                <div class="stat-divider"></div>

                <div class="stat-row">
                    <span class="stat-label">✏️ 필기 합격</span>
                    <span class="stat-value">${item.pilPass.toLocaleString()} 명</span>
                </div>

                <div class="stat-row">
                    <span class="stat-label">🛠️ 실기 합격</span>
                    <span class="stat-value">${item.silPass.toLocaleString()} 명</span>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}

