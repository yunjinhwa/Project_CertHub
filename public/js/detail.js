export async function loadDetailInfo(jmcd) {
    const modal = document.getElementById("detailModal");
    const modalBody = document.getElementById("modalBody");

    modal.style.display = "flex";
    modalBody.innerHTML = "불러오는 중...";

    const response = await fetch(`/api/cert/detail?jmcd=${jmcd}`)

    const xmlText = await response.text();

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");

    const items = Array.from(xmlDoc.getElementsByTagName("item"));

    if (items.length === 0) {
        modalBody.innerHTML = "<p>상세정보 없음</p>";
        return;
    }

    const detail = items[0];

    const summary = detail.getElementsByTagName("summary")[0]?.textContent || "정보 없음";
    const applyInfo = detail.getElementsByTagName("applyDoc")[0]?.textContent || "정보 없음";
    const jobInfo = detail.getElementsByTagName("job")[0]?.textContent || "정보 없음";
    const examInfo = detail.getElementsByTagName("imPnt")[0]?.textContent || "정보 없음";

    modalBody.innerHTML = `
        <h2 style="margin-bottom:10px;">📘 자격 정보</h2>
        <p><b>개요</b><br>${summary}</p>
        <hr>
        <p><b>응시 자격</b><br>${applyInfo}</p>
        <hr>
        <p><b>관련 직무</b><br>${jobInfo}</p>
        <hr>
        <p><b>시험 안내</b><br>${examInfo}</p>
    `;
}

export function closeModal() {
    document.getElementById("detailModal").style.display = "none";
}
