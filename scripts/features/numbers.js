import { copyToClipboard } from "../shared/clipboard.js";

const THEMES = [
    {
        id: "basic",
        label: "基础数字",
        rows: [
            { cat: "Fullwidth Digit", label: "全角" },
            { cat: "Mathematical Bold Digit", label: "数学粗体" },
            { cat: "Mathematical Double-Struck Digit", label: "双线" },
            { cat: "Mathematical Sans-Serif Digit", label: "无衬线" },
            { cat: "Mathematical Sans-Serif Bold Digit", label: "无衬线粗体" },
            { cat: "Mathematical Monospace Digit", label: "等宽" }
        ]
    },
    {
        id: "script",
        label: "上下标",
        rows: [
            { cat: "Superscript", label: "上标" },
            { cat: "Subscript", label: "下标" }
        ]
    },
    {
        id: "circled",
        label: "圆圈数字",
        rows: [
            { cat: "Circled Digit", label: "圆圈" },
            { cat: "Circled Number", label: "圆圈（多位）" },
            { cat: "Negative Circled Digit", label: "反白圆圈" },
            { cat: "Negative Circled Number", label: "反白圆圈（多位）" },
            { cat: "Double Circled Digit", label: "双圆圈" },
            { cat: "Double Circled Number", label: "双圆圈（多位）" },
            { cat: "Dingbat Negative Circled Digit", label: "实心圆圈" },
            { cat: "Dingbat Negative Circled Number", label: "实心圆圈（多位）" },
            { cat: "Dingbat Circled Sans-Serif Digit", label: "无衬线圆圈" },
            { cat: "Dingbat Circled Sans-Serif Number", label: "无衬线圆圈（多位）" },
            { cat: "Dingbat Negative Circled Sans-Serif Digit", label: "无衬线实心圆圈" },
            { cat: "Dingbat Negative Circled Sans-Serif Number", label: "无衬线实心圆圈（多位）" },
            { cat: "Circled Number On Black Square", label: "黑方块数字" }
        ]
    },
    {
        id: "paren",
        label: "括号数字",
        rows: [
            { cat: "Parenthesized Digit", label: "括号" },
            { cat: "Parenthesized Number", label: "括号（多位）" },
            { cat: "Parenthesized Ideograph", label: "括号汉字" }
        ]
    },
    {
        id: "punct",
        label: "带点 / 带逗号",
        rows: [
            { cat: "Digit Full Stop", label: "数字加点" },
            { cat: "Number Full Stop", label: "数字加点（多位）" },
            { cat: "Digit Comma", label: "数字加逗号" }
        ]
    },
    {
        id: "roman",
        label: "罗马数字",
        rows: [
            { cat: "Roman Numeral", label: "大写" },
            { cat: "Small Roman Numeral", label: "小写" }
        ]
    },
    {
        id: "fraction",
        label: "分数",
        rows: [
            { cat: "Vulgar Fraction", label: "常见分数" },
            { cat: "Fraction Numerator", label: "分子前缀" }
        ]
    },
    {
        id: "ideograph",
        label: "汉字数字",
        rows: [
            { cat: "Ideographic Number", label: "〇" },
            { cat: "Ideographic Annotation Mark", label: "注解" },
            { cat: "Circled Ideograph", label: "圆圈汉字" }
        ]
    }
];

export async function initNumbers() {
    const numbersTextarea = document.getElementById("numbers-textarea");
    const container = document.getElementById("numbers-display");
    if (!numbersTextarea || !container) return;

    function insertAtCursor(text) {
        const el = numbersTextarea;
        const scrollY = window.scrollY;
        const hadFocus = document.activeElement === el;
        const start = (hadFocus ? el.selectionStart : el.__lastSel?.start) ?? el.value.length;
        const end = (hadFocus ? el.selectionEnd : el.__lastSel?.end) ?? el.value.length;
        if (typeof el.setRangeText === "function") {
            el.setRangeText(text, start, end, "end");
        } else {
            el.value = el.value.slice(0, start) + text + el.value.slice(end);
            const pos = start + text.length;
            el.setSelectionRange(pos, pos);
        }
        el.__lastSel = { start: start + text.length, end: start + text.length };
        el.dispatchEvent(new Event("input"));
        if (window.scrollY !== scrollY) window.scrollTo(window.scrollX, scrollY);
    }

    numbersTextarea.addEventListener("blur", () => {
        numbersTextarea.__lastSel = {
            start: numbersTextarea.selectionStart,
            end: numbersTextarea.selectionEnd,
        };
    });

    function buildCategoryMap(jsonObj) {
        const map = {};
        for (const key of Object.keys(jsonObj).sort((a, b) => Number(a) - Number(b))) {
            const item = jsonObj[key];
            const cat = item.Category || "Other";
            if (!map[cat]) map[cat] = [];
            map[cat].push(item);
        }
        return map;
    }

    const themesPresent = [];

    function render(jsonObj) {
        const catMap = buildCategoryMap(jsonObj);
        const used = new Set();

        THEMES.forEach(theme => {
            const present = theme.rows.filter(r => catMap[r.cat] && catMap[r.cat].length);
            if (!present.length) return;
            themesPresent.push({ id: theme.id, label: theme.label });

            const section = document.createElement("section");
            section.className = "numbers-theme";
            section.id = `numbers-theme-${theme.id}`;

            const title = document.createElement("h3");
            title.className = "numbers-theme-title";
            title.textContent = theme.label;
            section.appendChild(title);

            present.forEach(rowDef => {
                const items = catMap[rowDef.cat];
                used.add(rowDef.cat);
                section.appendChild(buildRow(rowDef.label, items));
            });

            container.appendChild(section);
        });

        const leftover = Object.keys(catMap).filter(c => !used.has(c));
        if (leftover.length) {
            themesPresent.push({ id: "other", label: "其他" });
            const section = document.createElement("section");
            section.className = "numbers-theme";
            section.id = "numbers-theme-other";

            const title = document.createElement("h3");
            title.className = "numbers-theme-title";
            title.textContent = "其他";
            section.appendChild(title);

            leftover.forEach(cat => section.appendChild(buildRow(cat, catMap[cat])));
            container.appendChild(section);
        }
    }

    function buildRow(label, items) {
        const row = document.createElement("div");
        row.className = "numbers-row";

        const head = document.createElement("div");
        head.className = "numbers-row-head";

        const labelEl = document.createElement("span");
        labelEl.className = "numbers-row-label";
        labelEl.textContent = label;
        head.appendChild(labelEl);

        if (items.length > 1) {
            const copyBtn = document.createElement("button");
            copyBtn.type = "button";
            copyBtn.className = "numbers-row-copy";
            copyBtn.textContent = "复制整行";
            copyBtn.title = "复制该风格的全部字符";
            copyBtn.addEventListener("click", () => {
                copyToClipboard(items.map(i => i.Character).join(""));
            });
            head.appendChild(copyBtn);
        }

        row.appendChild(head);

        const strip = document.createElement("div");
        strip.className = "numbers-row-strip";
        items.forEach(item => {
            const chipEl = document.createElement("button");
            chipEl.type = "button";
            chipEl.className = "number-card";
            chipEl.textContent = item.Character;
            chipEl.title = `${item.Name} · ${item.Codepoint}`;
            chipEl.setAttribute("aria-label", item.Name);
            chipEl.addEventListener("click", () => insertAtCursor(item.Character));
            strip.appendChild(chipEl);
        });
        row.appendChild(strip);

        return row;
    }

    try {
        const response = await fetch("./data/unicode_numbers.json");
        const data = await response.json();
        render(data);
        initStickyOffset();
        initFab();
    } catch (err) {
        console.error("加载 unicode_numbers.json 失败", err);
    }

    function initStickyOffset() {
        const tabNav = document.querySelector(".tab-nav");
        if (!tabNav) return;
        const update = () => {
            const navTopGap = parseFloat(getComputedStyle(tabNav).top) || 12;
            const offset = tabNav.offsetHeight + navTopGap + 4;
            document.documentElement.style.setProperty("--numbers-textarea-top", `${offset}px`);
        };
        update();
        window.addEventListener("resize", update);
    }

    function initFab() {
        const fab = document.getElementById("numbers-fab");
        const tocBtn = document.getElementById("numbers-fab-toc");
        const topBtn = document.getElementById("numbers-fab-top");
        const menu = document.getElementById("numbers-fab-menu");
        if (!fab || !tocBtn || !topBtn || !menu) return;

        function scrollToTheme(themeId) {
            const target = document.getElementById(`numbers-theme-${themeId}`);
            if (!target) return;
            const tabNav = document.querySelector(".tab-nav");
            const tabNavBottom = tabNav ? tabNav.getBoundingClientRect().bottom : 0;
            const taRect = numbersTextarea.getBoundingClientRect();
            // Textarea sits below the tab-nav while sticky; use whichever bottom is lower.
            const stickyBottom = Math.max(tabNavBottom, taRect.bottom);
            const targetTop = target.getBoundingClientRect().top;
            const delta = targetTop - stickyBottom - 8;
            window.scrollTo({ top: window.scrollY + delta, behavior: "smooth" });
        }

        menu.innerHTML = "";
        themesPresent.forEach(t => {
            const item = document.createElement("button");
            item.type = "button";
            item.className = "fab-menu-item";
            item.textContent = t.label;
            item.setAttribute("role", "menuitem");
            item.addEventListener("click", () => {
                scrollToTheme(t.id);
                closeMenu();
            });
            menu.appendChild(item);
        });

        function openMenu() {
            menu.hidden = false;
            tocBtn.setAttribute("aria-expanded", "true");
        }
        function closeMenu() {
            menu.hidden = true;
            tocBtn.setAttribute("aria-expanded", "false");
        }
        function toggleMenu() {
            if (menu.hidden) openMenu(); else closeMenu();
        }

        tocBtn.addEventListener("click", e => {
            e.stopPropagation();
            toggleMenu();
        });
        topBtn.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
            closeMenu();
        });
        document.addEventListener("click", e => {
            if (!fab.contains(e.target)) closeMenu();
        });

        function syncVisibility() {
            const numbersSub = document.getElementById("font-numbers");
            const fontReplaceTab = document.getElementById("font-replace");
            const visible =
                fontReplaceTab?.classList.contains("active") &&
                numbersSub?.classList.contains("active");
            fab.hidden = !visible;
            if (!visible) closeMenu();
        }

        syncVisibility();
        document.querySelectorAll(".tab-link").forEach(b =>
            b.addEventListener("click", () => setTimeout(syncVisibility, 0))
        );
        document.querySelectorAll(".sub-tab-link").forEach(b =>
            b.addEventListener("click", () => setTimeout(syncVisibility, 0))
        );
    }
}
