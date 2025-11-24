// 라이트모드, 다크모드

// 초기 테마 불러오기 (localStorage 저장 활용)
document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.body.classList.remove("light", "dark");
    document.body.classList.add(savedTheme);

    updateButtonText(savedTheme);
});

// 버튼 클릭 시 테마 전환
document.getElementById("toggleTheme").addEventListener("click", () => {
    const current = document.body.classList.contains("light") ? "light" : "dark";
    const next = current === "light" ? "dark" : "light";

    document.body.classList.remove("light", "dark");
    document.body.classList.add(next);

    // 사용자 저장
    localStorage.setItem("theme", next);

    updateButtonText(next);
});

function updateButtonText(theme) {
    const btn = document.getElementById("toggleTheme");
    btn.textContent = theme === "light" ? "🌙 Dark mode" : "☀️ Light mode";
}