// js/render.js

// ⭐ detail.js에서 상세정보 가져오기 함수 가져옴
import { loadDetailInfo } from "./detail.js";

// 자격증 목록 렌더링 + 자세히 버튼 포함
export function renderListItem(item, container) {
    const jmfldnm = item.getElementsByTagName('jmfldnm')[0]?.textContent || '없음';
    const qualgbnm = item.getElementsByTagName('qualgbnm')[0]?.textContent || '없음';
    const seriesnm = item.getElementsByTagName('seriesnm')[0]?.textContent || '없음';
    const obligfldnm = item.getElementsByTagName('obligfldnm')[0]?.textContent || '없음';
    const mdobligfldnm = item.getElementsByTagName('mdobligfldnm')[0]?.textContent || '없음';
    const jmcd = item.getElementsByTagName('jmcd')[0]?.textContent || ''; // ⭐ 상세조회 API에 필요

    const div = document.createElement("div");
    div.className = "list-item";
    div.style.padding = "14px 0";

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

    // ⭐ 버튼 이벤트 등록 → 모달 열림
    const btn = div.querySelector(".detail-btn");
    btn.addEventListener("click", () => loadDetailInfo(jmcd));
}
