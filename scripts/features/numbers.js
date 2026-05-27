import { copyToClipboard } from "../shared/clipboard.js";

const PRIORITY_ORDER = [
    "Digit",
    "Mathematical Bold Digit",
    "Mathematical Double-Struck Digit",
    "Mathematical Sans-Serif Digit",
    "Mathematical Sans-Serif Bold Digit",
    "Mathematical Monospace Digit",
    "Fullwidth Digit",
    "Superscript",
    "Subscript",
    "Fraction Numerator",
    "Vulgar Fraction",
    "Ideographic Number",
    "Ideographic Annotation Mark",
    "Parenthesized Ideograph",
    "Circled Ideograph",
    "Circled Number On Black Square",
    "Negative Circled Digit",
    "Dingbat Negative Circled Digit",
    "Dingbat Negative Circled Number",
    "Dingbat Negative Circled Sans-Serif Digit",
    "Dingbat Negative Circled Sans-Serif Number",
    "Negative Circled Number",
    "Dingbat Circled Sans-Serif Digit",
    "Dingbat Circled Sans-Serif Number",
    "Circled Digit",
    "Circled Number",
    "Double Circled Digit",
    "Double Circled Number",
    "Digit Comma",
    "Digit Full Stop",
    "Number Full Stop",
    "Parenthesized Digit",
    "Parenthesized Number",
    "Roman Numeral",
    "Small Roman Numeral"
];

export async function initNumbers() {
    const numbersClearBtn = document.getElementById("numbers-clear-btn");
    const numbersCopyBtn = document.getElementById("numbers-copy-btn");
    const numbersTextarea = document.getElementById("numbers-textarea");
    const container = document.getElementById("numbers-display");
    if (!numbersTextarea || !container) return;

    numbersClearBtn?.addEventListener("click", () => { numbersTextarea.value = ""; });
    numbersCopyBtn?.addEventListener("click", () => {
        const text = numbersTextarea.value;
        if (text) copyToClipboard(text);
    });

    function createNumberCard(text) {
        const card = document.createElement("div");
        card.className = "number-card";
        card.textContent = text;
        card.addEventListener("click", () => { numbersTextarea.value += text; });
        return card;
    }

    function render(jsonObj) {
        const categories = {};
        Object.keys(jsonObj)
            .sort((a, b) => Number(a) - Number(b))
            .forEach(key => {
                const item = jsonObj[key];
                const cat = item.Category || "Other";
                if (!categories[cat]) categories[cat] = [];
                categories[cat].push(item.Character);
            });

        const sortedCategoryNames = Object.keys(categories).sort((a, b) => {
            const aIndex = PRIORITY_ORDER.indexOf(a);
            const bIndex = PRIORITY_ORDER.indexOf(b);
            if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
            if (aIndex !== -1) return -1;
            if (bIndex !== -1) return 1;
            return 0;
        });

        sortedCategoryNames.forEach(categoryName => {
            const title = document.createElement("div");
            title.className = "category-title";
            title.textContent = categoryName;
            container.appendChild(title);

            const group = document.createElement("div");
            group.className = "category-group";
            categories[categoryName].forEach(ch => group.appendChild(createNumberCard(ch)));
            container.appendChild(group);
        });
    }

    try {
        const response = await fetch("./data/unicode_numbers.json");
        const data = await response.json();
        render(data);
    } catch (err) {
        console.error("加载 unicode_numbers.json 失败", err);
    }
}
