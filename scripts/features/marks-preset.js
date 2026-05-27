import { ZWSP } from "../shared/constants.js";
import { splitGraphemes } from "../shared/grapheme.js";
import { autoResize } from "../shared/autoresize.js";
import { createResultCard } from "../shared/result-card.js";

const COMBINING_MARKS = [
    { name: "Combining Cyrillic Millions Sign", char: "҉" },
    { name: "Combining Overline", char: "̅" },
    { name: "Combining Double Macron Below", char: "͟" },
    { name: "Combining Low Line", char: "̲" },
    { name: "Combining Double Low Line", char: "̳" },
    { name: "Combining Equals Sign Below", char: "͇" },
    { name: "Combining Long Stroke Overlay", char: "̶" },
    { name: "Combining Short Solidus Overlay", char: "̷" },
    { name: "Combining Tilde", char: "̃" },
    { name: "Combining Tilde Below", char: "̰" },
    { name: "Combining Dot Above", char: "̇" },
    { name: "Combining Dot Below", char: "̣" },
    { name: "Combining Diaeresis Below", char: "̤" },
    { name: "Combining Upwards Arrow Below", char: "͎" },
    { name: "Combining X Above", char: "̽" }
];

export const PROCESSING_MODES = [
    { id: "add-prefix-zwsp", label: "开头加个零宽空格" },
    { id: "skip-space", label: "跳过所有普通空格" },
    { id: "skip-punct", label: "跳过标点符号" }
];

export function initMarksPreset() {
    const marksInput = document.getElementById("marks-input");
    const marksButtonsContainer = document.getElementById("marks-buttons");
    const processButtonsContainer = document.getElementById("process-buttons");
    const marksOutputContainer = document.getElementById("marks-output-container");
    const marksClearBtn = document.getElementById("marks-clear-btn");
    const marksUppercaseBtn = document.getElementById("marks-uppercase-btn");
    const marksLowercaseBtn = document.getElementById("marks-lowercase-btn");
    if (!marksInput || !marksButtonsContainer) return;

    const selectedMarks = new Set();
    const activeProcess = new Set();
    let caseMode = null;

    COMBINING_MARKS.forEach(mark => {
        const btn = document.createElement("button");
        btn.className = "mark-btn action-btn";
        btn.textContent = `A${ZWSP}${mark.char}`;
        btn.dataset.char = mark.char;
        btn.style.fontSize = "1.5rem";
        btn.addEventListener("click", () => {
            if (selectedMarks.has(mark.char)) {
                selectedMarks.delete(mark.char);
                btn.classList.remove("active");
            } else {
                selectedMarks.add(mark.char);
                btn.classList.add("active");
            }
            update();
        });
        marksButtonsContainer.appendChild(btn);
    });

    const clearMarksBtn = document.createElement("button");
    clearMarksBtn.className = "action-btn";
    clearMarksBtn.textContent = "清空所有选择";
    clearMarksBtn.addEventListener("click", () => {
        selectedMarks.clear();
        marksButtonsContainer.querySelectorAll(".mark-btn").forEach(btn => btn.classList.remove("active"));
        update();
    });
    marksButtonsContainer.appendChild(clearMarksBtn);

    PROCESSING_MODES.forEach(mode => {
        const btn = document.createElement("button");
        btn.className = "action-btn process-btn";
        btn.textContent = mode.label;
        btn.dataset.id = mode.id;
        btn.addEventListener("click", () => {
            if (activeProcess.has(mode.id)) {
                activeProcess.delete(mode.id);
                btn.classList.remove("active");
            } else {
                activeProcess.add(mode.id);
                btn.classList.add("active");
            }
            update();
        });
        processButtonsContainer.appendChild(btn);
    });

    marksClearBtn?.addEventListener("click", () => {
        marksInput.value = "";
        update();
    });

    function toggleCase(mode, btn) {
        if (caseMode === mode) {
            caseMode = null;
            btn.classList.remove("active");
        } else {
            caseMode = mode;
            marksUppercaseBtn.classList.remove("active");
            marksLowercaseBtn.classList.remove("active");
            btn.classList.add("active");
        }
        update();
    }
    marksUppercaseBtn?.addEventListener("click", () => toggleCase("upper", marksUppercaseBtn));
    marksLowercaseBtn?.addEventListener("click", () => toggleCase("lower", marksLowercaseBtn));

    function update() {
        let text = marksInput.value;
        marksOutputContainer.innerHTML = "";
        if (!text) return;
        if (activeProcess.has("add-prefix-zwsp")) text = ZWSP + text;
        const markString = Array.from(selectedMarks).join("");
        const isSkippable = ch =>
            (activeProcess.has("skip-space") && /\s/.test(ch)) ||
            (activeProcess.has("skip-punct") && /\p{P}/u.test(ch));
        const transformed = splitGraphemes(text)
            .map(ch => isSkippable(ch) ? ch : ch + ZWSP + markString)
            .join("");
        let finalText = transformed;
        if (caseMode === "upper") finalText = finalText.toUpperCase();
        else if (caseMode === "lower") finalText = finalText.toLowerCase();
        const card = createResultCard(finalText);
        card.style.fontSize = "1.5rem";
        marksOutputContainer.appendChild(card);
    }

    marksInput.addEventListener("input", () => {
        update();
        autoResize(marksInput);
    });

    update();
}
