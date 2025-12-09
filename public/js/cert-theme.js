// 자격증 상세 페이지 테마 동기화
document.addEventListener("DOMContentLoaded", () => {
    // localStorage에서 저장된 테마 불러오기
    const savedTheme = localStorage.getItem("theme") || "light";
    document.body.classList.remove("light", "dark");
    document.body.classList.add(savedTheme);
});
