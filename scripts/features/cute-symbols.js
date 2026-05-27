import { copyToClipboard } from "../shared/clipboard.js";

export async function initCuteSymbols() {
    const container = document.getElementById("cute-symbols-container");
    if (!container) return;
    container.textContent = "加载中…";
    try {
        const response = await fetch("./data/cute_symbols.json");
        if (!response.ok) throw new Error(`无法加载符号库: ${response.status}`);
        const data = await response.json();
        container.innerHTML = "";
        for (const [category, symbols] of Object.entries(data)) {
            const h3 = document.createElement("h3");
            h3.textContent = category;
            container.appendChild(h3);
            const grid = document.createElement("div");
            grid.className = "symbol-grid";
            symbols.forEach(symbol => {
                const card = document.createElement("div");
                card.className = "symbol-card";
                card.textContent = symbol;
                card.addEventListener("click", () => copyToClipboard(symbol));
                grid.appendChild(card);
            });
            container.appendChild(grid);
        }
    } catch (err) {
        console.error("加载符号时出错", err);
        container.textContent = "符号加载失败，请检查 data/cute_symbols.json 文件是否存在。";
    }
}
