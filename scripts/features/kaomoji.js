import { copyToClipboard } from "../shared/clipboard.js";

const KAOMOJI_ORDER = ["快乐", "猫", "特殊"];

export async function initKaomoji() {
    const tabsContainer = document.getElementById("kaomoji-tabs");
    const gallery = document.getElementById("kaomoji-gallery");
    if (!tabsContainer || !gallery) return;

    let kaomojiData = {};

    function getSortedCategories() {
        return Object.keys(kaomojiData).sort((a, b) => {
            let ia = KAOMOJI_ORDER.indexOf(a);
            let ib = KAOMOJI_ORDER.indexOf(b);
            if (ia === -1) ia = 999;
            if (ib === -1) ib = 999;
            return ia - ib || a.localeCompare(b);
        });
    }

    function renderTabs() {
        tabsContainer.innerHTML = "";
        getSortedCategories().forEach(cat => {
            const t = document.createElement("div");
            t.className = "tab";
            t.dataset.group = cat;
            t.textContent = `${cat} (${kaomojiData[cat].length})`;
            t.addEventListener("click", () => switchGroup(cat));
            tabsContainer.appendChild(t);
        });
    }

    function switchGroup(g) {
        tabsContainer.querySelectorAll(".tab").forEach(t => {
            t.classList.toggle("active", t.dataset.group === g);
        });
        gallery.innerHTML = "";
        (kaomojiData[g] || []).forEach(emoji => {
            const card = document.createElement("div");
            card.className = "kaomoji-card";
            card.textContent = emoji;
            card.addEventListener("click", () => copyToClipboard(emoji));
            gallery.appendChild(card);
        });
    }

    try {
        const resp = await fetch("./data/kaomoji_grouped.json");
        kaomojiData = await resp.json();
        renderTabs();
        const sorted = getSortedCategories();
        if (sorted.length > 0) switchGroup(sorted[0]);
    } catch (err) {
        console.error("加载 kaomoji_grouped.json 失败", err);
    }
}
