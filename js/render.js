// js/render.js

export function renderListItem(item, container) {
    const qualgbnm = item.getElementsByTagName('qualgbnm')[0]?.textContent || '없음';
    const seriesnm = item.getElementsByTagName('seriesnm')[0]?.textContent || '없음';
    const jmfldnm = item.getElementsByTagName('jmfldnm')[0]?.textContent || '없음';
    const obligfldnm = item.getElementsByTagName('obligfldnm')[0]?.textContent || '없음';
    const mdobligfldnm = item.getElementsByTagName('mdobligfldnm')[0]?.textContent || '없음';

    const div = document.createElement("div");
    div.className = "list-item";
    div.style.padding = "14px 0";

    div.innerHTML = `
        <div style="font-size:18px; font-weight:600;">${jmfldnm}</div>
        <div style="margin-top:4px; color:#555;">
            <span>#${qualgbnm}</span>
            <span>#${seriesnm}</span>
            <span>#${obligfldnm}/${mdobligfldnm}</span>
        </div>
        <hr>
    `;

    container.appendChild(div);
}
