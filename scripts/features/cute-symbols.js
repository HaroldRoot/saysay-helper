import { copyToClipboard } from "../shared/clipboard.js";

function shortLabel(name) {
    const m = name.match(/[\p{Script=Han}]+/u);
    return m ? m[0] : name.split(/\s+/)[0] || name;
}

export async function initCuteSymbols() {
    const container = document.getElementById("cute-symbols-container");
    if (!container) return;
    container.textContent = "加载中…";
    try {
        const response = await fetch("./data/cute_symbols.json");
        if (!response.ok) throw new Error(`无法加载符号库: ${response.status}`);
        const data = await response.json();
        container.innerHTML = "";

        const categories = Object.keys(data);
        if (categories.length === 0) return;

        const nav = document.createElement("div");
        nav.id = "cute-symbols-nav";
        nav.className = "tabs-container";
        nav.setAttribute("role", "tablist");
        nav.setAttribute("aria-label", "可爱符号分组");
        container.appendChild(nav);

        const grid = document.createElement("div");
        grid.className = "symbol-grid";
        grid.id = "cute-symbols-grid";
        container.appendChild(grid);

        function renderCategory(name) {
            grid.innerHTML = "";
            (data[name] || []).forEach(symbol => {
                const card = document.createElement("div");
                card.className = "symbol-card";
                card.textContent = symbol;
                card.addEventListener("click", () => copyToClipboard(symbol));
                grid.appendChild(card);
            });
        }

        function switchCategory(name) {
            nav.querySelectorAll(".tab").forEach(c => {
                c.classList.toggle("active", c.dataset.group === name);
            });
            renderCategory(name);
        }

        categories.forEach(name => {
            const chip = document.createElement("button");
            chip.type = "button";
            chip.className = "tab";
            chip.dataset.group = name;
            chip.textContent = `${shortLabel(name)} (${data[name].length})`;
            chip.addEventListener("click", () => switchCategory(name));
            nav.appendChild(chip);
        });

        switchCategory(categories[0]);
    } catch (err) {
        console.error("加载符号时出错", err);
        container.textContent = "符号加载失败，请检查 data/cute_symbols.json 文件是否存在。";
    }
}
