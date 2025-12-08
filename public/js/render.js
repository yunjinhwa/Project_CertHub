/*
    // js/render.js
    - 화면 렌더링만 담당(XML 데이터를 받아 HTML 요소를 만들어 화면에 표시)
    - XML 데이터를 HTML UI로 렌더링
*/

// ⭐ 상세정보 함수
import { loadDetailInfo } from "./detail.js";
// ⭐ 시험일정/자격 목록 공통 XML 도우미
import { fetchCertificates, fetchSchedule, getItemsFromXML } from "./api.js";


// 1) 자격증 목록 렌더링 기능 (renderListItem) --> 검색창에서 자격증을 검색했을 때, “자격증 정보 + 자세히 버튼” 형태의 리스트를 만드는 함수
export function renderListItem(item, container) {
    // XML에서 필요한 정보 추출 - 자격증 이름, 등급(기능사/기사), 산업분류 등 정보를 읽어옴
    const jmfldnm = item.getElementsByTagName('jmfldnm')[0]?.textContent || '없음';
    const qualgbnm = item.getElementsByTagName('qualgbnm')[0]?.textContent || '없음';
    const seriesnm = item.getElementsByTagName('seriesnm')[0]?.textContent || '없음';
    const obligfldnm = item.getElementsByTagName('obligfldnm')[0]?.textContent || '없음';
    const mdobligfldnm = item.getElementsByTagName('mdobligfldnm')[0]?.textContent || '없음';
    const jmcd = item.getElementsByTagName('jmcd')[0]?.textContent || ''; // 상세조회 API에 필요

    // 자격증 하나당 하나의 리스트 아이템 생성
    const div = document.createElement("div");
    div.className = "list-item";

    // UI 구성: 자격증 이름 + 태그 + 자세히 버튼
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
                <button class="btn schedule-btn" data-jmcd="${jmcd}">시험일정</button>
            </div>
        </div>
        <hr>
    `;

    container.appendChild(div);
    div.querySelector(".detail-btn").addEventListener("click", () => loadDetailInfo(jmcd));
    div.querySelector(".schedule-btn").addEventListener("click", () => {
    loadScheduleByName(jmfldnm); 
});


    // // “자세히” 버튼 클릭 → loadDetailInfo(jmcd) - 자격증 상세조회 API로 이동해 모달을 띄움
    // const btn = div.querySelector(".detail-btn");
    // btn.addEventListener("click", () => loadDetailInfo(jmcd));
}

// ================================================================================================================================== //

// 시험 일정 렌더링(renderScheduleList) - 시험 일정 API(XML) 데이터를 화면에 보기 좋게 정리해서 보여주는 기능
// ================================================================================================================================== //

// 시험 일정 렌더링(renderScheduleList) - getPEList 응답(전부 소문자 태그)에 맞게 렌더링
export function renderScheduleList(items, container) {
    container.innerHTML = "";

    // YYYYMMDD → Date 객체로 변환
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

    // 🔥 필기 원서접수 종료일(docregenddt)이 지난 일정은 제외
    const upcoming = items.filter((item) => {
        const end = item.getElementsByTagName("docregenddt")[0]?.textContent;
        const endDate = toDate(end);
        return endDate && endDate >= today;
    });

    if (!upcoming.length) {
        container.innerHTML = "<p>등록된 시험 일정이 없습니다.</p>";
        return;
    }

    // 접수 종료일 기준 오름차순 정렬
    upcoming.sort((a, b) => {
        const aEnd = toDate(a.getElementsByTagName("docregenddt")[0]?.textContent);
        const bEnd = toDate(b.getElementsByTagName("docregenddt")[0]?.textContent);
        return aEnd - bEnd;
    });

    // 일정 카드 렌더링
    upcoming.forEach((item) => {
        const description       = item.getElementsByTagName("description")[0]?.textContent || "";

        const docRegStartDt     = item.getElementsByTagName("docregstartdt")[0]?.textContent || "-";
        const docRegEndDt       = item.getElementsByTagName("docregenddt")[0]?.textContent || "-";
        const docExamDt         = item.getElementsByTagName("docexamdt")[0]?.textContent || "-";
        const docPassDt         = item.getElementsByTagName("docpassdt")[0]?.textContent || "-";

        const docSubmitStartDt  = item.getElementsByTagName("docsubmitstartdt")[0]?.textContent || "-";
        const docSubmitEndDt    = item.getElementsByTagName("docsubmitentdt")[0]?.textContent || "-";

        const pracRegStartDt    = item.getElementsByTagName("pracregstartdt")[0]?.textContent || "-";
        const pracRegEndDt      = item.getElementsByTagName("pracregenddt")[0]?.textContent || "-";
        const pracExamStartDt   = item.getElementsByTagName("pracexamstartdt")[0]?.textContent || "-";
        const pracExamEndDt     = item.getElementsByTagName("pracexamenddt")[0]?.textContent || "-";
        const pracPassDt        = item.getElementsByTagName("pracpassdt")[0]?.textContent || "-";

        const div = document.createElement("div");
        div.className = "schedule-card";
        div.innerHTML = `
            <h3>📘 ${description}</h3>

            <p>📝 필기 원서접수: ${docRegStartDt} ~ ${docRegEndDt}</p>
            <p>✏️ 필기 시험일: ${docExamDt}</p>
            <p>📢 필기 합격(예정) 발표: ${docPassDt}</p>

            <p>📄 응시자격 서류제출: ${docSubmitStartDt} ~ ${docSubmitEndDt}</p>

            <p>🧾 면접 원서접수: ${pracRegStartDt} ~ ${pracRegEndDt}</p>
            <p>🎤 면접 시험: ${pracExamStartDt} ~ ${pracExamEndDt}</p>
            <p>🏆 최종 합격 발표: ${pracPassDt}</p>
        `;

        container.appendChild(div);
    });
}


// ================================================================================================================================== //

// 자격별 통계 렌더링(renderExamStatsList) - 합격/접수 통계 XML을 Top10 형태로 보여주는 기능
export function renderExamStatsList(items, container) {
    container.innerHTML = "";

    // 아이템 없으면 “데이터 없음”
    if (!items || !items.length) {
        container.innerHTML = "<p>데이터가 없습니다.</p>";
        return;
    }

    // XML → JS 객체 변환 - 정렬/비교가 가능해짐
    const dataList = Array.from(items).map(item => ({
        name: item.getElementsByTagName("emqualDispNm")[0]?.textContent || "이름없음",
        qualDisp: item.getElementsByTagName("grdNm")[0]?.textContent || "-",
        implYy: item.getElementsByTagName("implYy")[0]?.textContent || "-",
        implSeq: item.getElementsByTagName("implSeq")[0]?.textContent || "-",
        apply: Number(item.getElementsByTagName("recptCnt")[0]?.textContent || 0),
        pilPass: Number(item.getElementsByTagName("pilPassCnt")[0]?.textContent || 0),
        silPass: Number(item.getElementsByTagName("silPassCnt")[0]?.textContent || 0),
    }));

    // 접수자 수 기준 정렬 - 가장 인기가 많은/응시자가 많은 자격증을 상위에 배치
    dataList.sort((a, b) => b.apply - a.apply);

    if (!dataList.length) {
        container.innerHTML = "<p>데이터가 없습니다.</p>";
        return;
    }

    // Top10만 가져오기 - 각 항목을 독립된 div로 생성
    dataList.slice(0, 10).forEach(item => {
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

// ===========================================
// 🔥 자격명으로 ‘직급 전체 일정’을 불러오는 함수
// ===========================================
export async function loadScheduleByName(certName) {
    console.log("🔥 loadScheduleByName 실행:", certName);

    const scheduleContainer = document.getElementById("results_calendar");
    let html = `<h2>📘 ${certName} 시험일정</h2>`;
    let hasSchedule = false;

    // 1) 전체 자격 목록 불러오기
    const xmlDoc = await fetchCertificates("");
    console.log("📌 XML:", xmlDoc);
    const items = getItemsFromXML(xmlDoc);
    console.log("📌 전체 자격 개수:", items.length);

    /*
    // 로그 창 확인을 위한 코드 ━━━━━━━━━━━━━━━━━━━━━━━
    items.forEach(item => {
        const name = item.getElementsByTagName("jmfldnm")[0]?.textContent;
        const grade = item.getElementsByTagName("qualgbnm")[0]?.textContent;

        console.log("🔍 자격:", name, "| 등급:", grade);
    });
    */
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    items.forEach(item => {
        const name = item.getElementsByTagName("jmfldnm")[0]?.textContent;
        console.log(`🔍 [원본 자격명]: "${name}"`);
    });
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    console.log("------ 자격명 원본 확인 ------");
    items.forEach(item => {
        const raw = item.getElementsByTagName("jmfldnm")[0]?.textContent;
        const cleaned = raw.trim();
        console.log(`원본: "${raw}" | trim: "${cleaned}" | endsWith(기술사):`, cleaned.endsWith("기술사"));
    });
    console.log("------------------------------");


    // 2) 직급 자동 분류
    let targetGrades = [];

    if (certName.endsWith("산업기사")) {
        targetGrades = ["산업기사"];
    } 
    else if (certName.endsWith("기사")) {
        targetGrades = ["기사"];
    }
    else if (certName.endsWith("기능사")) {
        targetGrades = ["기능사"];
    }
    else if (certName.endsWith("기능장")) {
        targetGrades = ["기능장"];
    }
    else if (certName.endsWith("기술사")) {
        targetGrades = ["기술사"];
    }

    // ⭐⭐⭐ 3) 등급 필터링 로직 (여기 교체!)
    const filtered = items.filter(item => {
        const name = item.getElementsByTagName("jmfldnm")[0]?.textContent.trim();

        if (targetGrades.includes("기술사") && name.endsWith("기술사")) return true;
        if (targetGrades.includes("기능장") && name.endsWith("기능장")) return true;
        if (targetGrades.includes("기능사") && name.endsWith("기능사")) return true;
        if (targetGrades.includes("산업기사") && name.endsWith("산업기사")) return true;
        if (targetGrades.includes("기사") && (name.endsWith("기사") && !name.endsWith("산업기사"))) return true;

        return false;
    });

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 필터링 후 로그 확인
    console.log("🎯 targetGrades:", targetGrades);
    console.log("🎯 필터링된 개수:", filtered.length);
    filtered.forEach(f => {
        console.log("👉 필터링 통과:", f.getElementsByTagName("jmfldnm")[0]?.textContent);
    });
    console.log("------------------------------");
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    // 4) 각 자격증 일정 조회
    for (const item of filtered) {
        const jmcd = item.getElementsByTagName("jmcd")[0]?.textContent;
        const name = item.getElementsByTagName("jmfldnm")[0]?.textContent;

        console.log(`📡 호출 URL: /api/schedule?jmcd=${jmcd}&implYy=2025`);

        const xml = await fetchSchedule(jmcd, 2025);
        const schedules = getItemsFromXML(xml);

        if (!schedules.length) continue;

        hasSchedule = true;

        html += `<h3>🔷 ${name}</h3>`;
        html += createScheduleHTML(schedules);
    }

    if (!hasSchedule) {
        html += "<p>등록된 시험 일정이 없습니다.</p>";
    }

    scheduleContainer.innerHTML = html;
}


// 🔥 schedule-card HTML 생성기
function createScheduleHTML(schedules) {
    let html = "";

    schedules.forEach(s => {
        const docRegStartDt = s.getElementsByTagName("docregstartdt")[0]?.textContent || "-";
        const docRegEndDt   = s.getElementsByTagName("docregenddt")[0]?.textContent || "-";
        const docExamDt     = s.getElementsByTagName("docexamdt")[0]?.textContent || "-";
        const docPassDt     = s.getElementsByTagName("docpassdt")[0]?.textContent || "-";

        html += `
            <div class="schedule-card">
                <p>📝 원서접수: ${docRegStartDt} ~ ${docRegEndDt}</p>
                <p>✏️ 필기시험: ${docExamDt}</p>
                <p>📢 합격발표: ${docPassDt}</p>
            </div>
        `;
    });

    return html;
}
