const STORAGE_KEY = "theme";
const ORDER = ["light", "dark", "auto"];
const ICONS = {
    light: "☀",
    dark: "🌙",
    auto: "⚙"
};
const LABELS = {
    light: "当前：浅色（点击切换为深色）",
    dark: "当前：深色（点击切换为跟随系统）",
    auto: "当前：跟随系统（点击切换为浅色）"
};

function readTheme() {
    try {
        const t = localStorage.getItem(STORAGE_KEY);
        return ORDER.includes(t) ? t : "light";
    } catch (e) {
        return "light";
    }
}

function writeTheme(theme) {
    try {
        localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {}
}

function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
}

function nextTheme(current) {
    const idx = ORDER.indexOf(current);
    return ORDER[(idx + 1) % ORDER.length];
}

function syncButton(button, theme) {
    const icon = button.querySelector(".theme-toggle__icon");
    if (icon) icon.textContent = ICONS[theme];
    button.setAttribute("aria-label", LABELS[theme]);
    button.setAttribute("title", LABELS[theme]);
    button.dataset.theme = theme;
}

export function initThemeToggle() {
    const button = document.getElementById("theme-toggle");
    if (!button) return;

    let current = readTheme();
    applyTheme(current);
    syncButton(button, current);

    button.addEventListener("click", () => {
        current = nextTheme(current);
        applyTheme(current);
        writeTheme(current);
        syncButton(button, current);
    });
}
