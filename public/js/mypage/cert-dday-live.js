// js/mypage/cert-dday-live.js
import { fetchSchedule, getItemsFromXML } from "../api.js";
import { getBookmarksOfCurrentUser } from "../firebase/firebase-bookmark.js";

// 1) 자격증 이름에서 등급(grade) 추론
function inferGradeFromName(certName) {
  if (!certName) return null;

  if (certName.includes("기술사"))   return "기술사";
  if (certName.includes("기능장"))   return "기능장";
  if (certName.includes("산업기사")) return "산업기사";
  if (certName.includes("기사"))     return "기사";
  if (certName.includes("기능사"))   return "기능사";

  return null;
}

// YYYYMMDD → Date
function toDate(yyyymmdd) {
  if (!yyyymmdd || yyyymmdd === "-" || yyyymmdd === "XXXXXXXX") return null;
  return new Date(
    Number(yyyymmdd.substring(0, 4)),
    Number(yyyymmdd.substring(4, 6)) - 1,
    Number(yyyymmdd.substring(6, 8))
  );
}

// Date → "YYYY.MM.DD"
function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
}

// D-DAY 문자열
function formatDday(today, examDate) {
  const diffMs = examDate.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "D-DAY";
  if (diffDays > 0) return `D-${diffDays}`;
  return `D+${Math.abs(diffDays)}`;
}

// 한 item에서 대표 시험일 하나 뽑기 (필기 > 실기 시작)
function pickExamDateStr(item) {
  const docExam = item.getElementsByTagName("docexamdt")[0]?.textContent || "";
  const pracExamStart = item.getElementsByTagName("pracexamstartdt")[0]?.textContent || "";
  return docExam || pracExamStart;
}

// 북마크 기반 D-DAY 로딩
async function loadBookmarkDday() {
  const container = document.getElementById("certDdayContent");
  if (!container) return;

  container.innerHTML = `
    <div class="cert-dday-empty">
      <p class="cert-empty-text">관심 자격증의 시험 일정을 불러오는 중입니다...</p>
    </div>
  `;

  try {
    const bookmarks = await getBookmarksOfCurrentUser(); 
    // [{ id, certId, certName }, ...] 구조라고 가정

    if (!bookmarks || bookmarks.length === 0) {
      container.innerHTML = `
        <div class="cert-dday-empty">
          <p class="cert-empty-text">아직 북마크한 자격증이 없습니다.</p>
        </div>
      `;
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1) 각 북마크 자격증별로 가장 가까운 시험일 하나씩 찾기
    const perCert = await Promise.all(
      bookmarks.map(async (bm) => {
        const grade = inferGradeFromName(bm.certName);
        if (!grade) return null;

        let xml;
        try {
          xml = await fetchSchedule(bm.certId, grade);  // certId = jmcd
        } catch (e) {
          console.error("fetchSchedule error:", e);
          return null;
        }

        const items = getItemsFromXML(xml);
        if (!items || !items.length) return null;

        let best = null;
        for (const item of items) {
          const examDateStr = pickExamDateStr(item);
          const examDate = toDate(examDateStr);
          if (!examDate || examDate < today) continue;

          if (!best || examDate < best.examDate) {
            best = { bookmark: bm, grade, examDate };
          }
        }
        return best;
      })
    );

    const upcomingList = perCert.filter((v) => v !== null);
    if (!upcomingList.length) {
      container.innerHTML = `
        <div class="cert-dday-empty">
          <p class="cert-empty-text">예정된 시험 일정이 없습니다.</p>
        </div>
      `;
      return;
    }

    // 2) 전체 중 가장 가까운 순으로 정렬
    upcomingList.sort((a, b) => a.examDate - b.examDate);

    const top = upcomingList[0];            // D-DAY 대표
    const others = upcomingList.slice(0, 3); // 하단 리스트용

    container.innerHTML = "";

    // 상단 대표 D-DAY
    const header = document.createElement("div");
    header.className = "grid gap-16";
    header.style.gridTemplateColumns = "1.5fr 1fr";

    const left = document.createElement("div");
    left.innerHTML = `
      <div class="cert-name">${top.bookmark.certName}</div>
      <p class="cert-exam-date">
        📅 다음 시험일 · ${formatDate(top.examDate)}
      </p>
    `;

    const right = document.createElement("div");
    right.className = "cert-dday-display";
    right.textContent = formatDday(today, top.examDate);

    header.appendChild(left);
    header.appendChild(right);
    container.appendChild(header);

    // 하단 리스트
    const list = document.createElement("ul");
    list.className = "cert-bookmark-list";

    others.forEach((info) => {
      const li = document.createElement("li");
      li.className = "cert-bookmark-item";

      li.innerHTML = `
        <div class="cert-name">${info.bookmark.certName}</div>
        <div class="cert-info-row">
          <span class="cert-exam-date">${formatDate(info.examDate)}</span>
          <span class="cert-dday">${formatDday(today, info.examDate)}</span>
        </div>
      `;

      list.appendChild(li);
    });

    container.appendChild(list);

    // 🔹 (선택) exam-schedule.js 검색 카드와 데이터 공유하고 싶으면:
    // window.certExamSchedules = upcomingList.map((info, idx) => ({
    //   id: idx + 1,
    //   name: info.bookmark.certName,
    //   examDate: formatDate(info.examDate),
    //   schedules: [] // 필요하면 세부 일정도 채울 수 있음
    // }));
    // if (typeof window.renderExamSchedule === "function") {
    //   window.renderExamSchedule("exam-schedule-2");
    // }
  } catch (e) {
    console.error(e);
    container.innerHTML = `
      <div class="cert-dday-empty">
        <p class="cert-empty-text">시험 일정을 불러오는 중 오류가 발생했습니다.</p>
      </div>
    `;
  }
}

// DOM 준비되면 실행
document.addEventListener("DOMContentLoaded", () => {
  loadBookmarkDday();
});
