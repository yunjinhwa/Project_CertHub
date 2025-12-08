/*
    // js/render.js
    - 화면 렌더링만 담당(XML 데이터를 받아 HTML 요소를 만들어 화면에 표시)
    - XML 데이터를 HTML UI로 렌더링
*/


// ⭐ detail.js에서 상세정보 가져오기 함수 가져옴
import { loadDetailInfo } from "./detail.js";

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
            <button class="detail-btn" data-jmcd="${jmcd}" 
                style="padding:6px 12px; border-radius:6px; cursor:pointer;">
                자세히
            </button>
        </div>
        <hr>
    `;

    container.appendChild(div);

    // // “자세히” 버튼 클릭 → loadDetailInfo(jmcd) - 자격증 상세조회 API로 이동해 모달을 띄움
    // const btn = div.querySelector(".detail-btn");
    // btn.addEventListener("click", () => loadDetailInfo(jmcd));
}

// ================================================================================================================================== //

// 시험 일정 렌더링(renderScheduleList) - 시험 일정 API(XML) 데이터를 화면에 보기 좋게 정리해서 보여주는 기능
export function renderScheduleList(items, container) {
    container.innerHTML = ""; // 기존 화면 초기화 --> '시험 일정 불러오는 중' 을 화면에서 제거

    // 오늘 날짜 (00:00 기준) - 날짜 비교
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // YYYYMMDD → Date 객체 변환 함수 - XML 데이터가 20250216 형식이므로 변환 필수
    function toDate(yyyymmdd) {
        if (!yyyymmdd || yyyymmdd === "-") return null;
        const y = Number(yyyymmdd.substring(0, 4));
        const m = Number(yyyymmdd.substring(4, 6)) - 1;
        const d = Number(yyyymmdd.substring(6, 8));
        return new Date(y, m, d);
    }

    // 원서접수 종료일(endDate)가 오늘 이전이면 제외 - 이미 끝난 일정 안 보여줌, 현재 또는 미래 일정만 표시
    const upcomingItems = items.filter(item => {
        const end = item.getElementsByTagName("docRegEndDt")[0]?.textContent || "-";
        const endDate = toDate(end);

        // 날짜가 없으면 표시하지 않음
        if (!endDate) return false;

        // 오늘 이전이면 제외
        return endDate >= today;
    });

    if (!upcomingItems.length) {
        container.innerHTML += "<p>등록된 시험 일정이 없습니다.</p>";
        return;
    }

    // 정렬 (원서접수시작일 빠른 순)
    upcomingItems.sort((a, b) => {
        const aStart = toDate(a.getElementsByTagName("docRegStartDt")[0]?.textContent);
        const bStart = toDate(b.getElementsByTagName("docRegStartDt")[0]?.textContent);
        return aStart - bStart;
    });

    // 필터 + 정렬된 일정 출력 - 시행년도(implYy), 회차(implSeq), 접수기간(docRegStartDt ~ docRegEndDt), 시험기간, 발표일
    upcomingItems.forEach(item => {
        const implYy = item.getElementsByTagName("implYy")[0]?.textContent || "";
        const implSeq = item.getElementsByTagName("implSeq")[0]?.textContent || "";
        const description = item.getElementsByTagName("description")[0]?.textContent || "설명 없음";

        const docRegStartDt = item.getElementsByTagName("docRegStartDt")[0]?.textContent || "-";
        const docRegEndDt = item.getElementsByTagName("docRegEndDt")[0]?.textContent || "-";
        const docExamStartDt = item.getElementsByTagName("docExamStartDt")[0]?.textContent || "-";
        const docExamEndDt = item.getElementsByTagName("docExamEndDt")[0]?.textContent || "-";
        const docPassDt = item.getElementsByTagName("docPassDt")[0]?.textContent || "-";

        const div = document.createElement("div");
        div.className = "schedule-card";
        div.style = `
            border:1px solid #eee; 
            padding:12px; 
            border-radius:8px; 
            margin-bottom:10px;
        `;

        div.innerHTML = `
            <h3 style="font-size:18px; margin-bottom:6px;">${description}</h3>
            <p>📌 회차: ${implYy}년 ${implSeq}회</p>
            <p>📝 원서접수: ${docRegStartDt} ~ ${docRegEndDt}</p>
            <p>✏️ 필기시험: ${docExamStartDt} ~ ${docExamEndDt}</p>
            <p>📢 발표일: ${docPassDt}</p>
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

    // Top10만 가져오기
    dataList.slice(0, 10).forEach(item => {
        const div = document.createElement("div");
        div.className = "exam-stat-card";

        div.innerHTML = `
            <h3>${item.name}</h3>

            <p>🧾 응시자격: ${item.qualDisp}</p>
            <p>📅 시행년도: ${item.implYy}</p>
            <p>🔢 회차: ${item.implSeq}</p>

            <p>📝 접수자 수: <strong>${item.apply.toLocaleString()}</strong> 명</p>
            <p>✏️ 필기 합격: ${item.pilPass.toLocaleString()} 명</p>
            <p>🛠 실기 합격: ${item.silPass.toLocaleString()} 명</p>
        `;

        container.appendChild(div);
    });
}

