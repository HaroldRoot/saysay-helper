import { ZWSP } from "../shared/constants.js";
import { splitGraphemes } from "../shared/grapheme.js";
import { autoResize } from "../shared/autoresize.js";
import { createResultCard } from "../shared/result-card.js";
import { PROCESSING_MODES } from "./marks-preset.js";

let updateAdvancedUI = () => {};

export function triggerAdvancedUpdate() {
    updateAdvancedUI();
}

export async function initMarksAdvanced() {
    const advInput = document.getElementById("marks-adv-input");
    const advSequencePreview = document.getElementById("adv-sequence-preview");
    const advMarksGrid = document.getElementById("adv-marks-grid");
    const advOutputContainer = document.getElementById("marks-adv-output-container");
    const advProcessButtonsContainer = document.getElementById("adv-process-buttons");
    const advUppercaseBtn = document.getElementById("adv-uppercase-btn");
    const advLowercaseBtn = document.getElementById("adv-lowercase-btn");
    if (!advInput || !advMarksGrid) return;

    let allCombiningMarks = {};
    let currentSequence = [];
    let advCaseMode = null;
    const advActiveProcess = new Set();

    PROCESSING_MODES.forEach(mode => {
        const btn = document.createElement("button");
        btn.className = "action-btn process-btn";
        btn.textContent = mode.label;
        btn.addEventListener("click", () => {
            if (advActiveProcess.has(mode.id)) {
                advActiveProcess.delete(mode.id);
                btn.classList.remove("active");
            } else {
                advActiveProcess.add(mode.id);
                btn.classList.add("active");
            }
            update();
        });
        advProcessButtonsContainer.appendChild(btn);
    });

    function toggleAdvCase(mode, btn) {
        if (advCaseMode === mode) {
            advCaseMode = null;
            btn.classList.remove("active");
        } else {
            advCaseMode = mode;
            advUppercaseBtn.classList.remove("active");
            advLowercaseBtn.classList.remove("active");
            btn.classList.add("active");
        }
        update();
    }
    advUppercaseBtn?.addEventListener("click", () => toggleAdvCase("upper", advUppercaseBtn));
    advLowercaseBtn?.addEventListener("click", () => toggleAdvCase("lower", advLowercaseBtn));

    document.getElementById("adv-reverse-seq")?.addEventListener("click", () => {
        currentSequence.reverse();
        update();
    });
    document.getElementById("adv-clear-input-btn")?.addEventListener("click", () => {
        advInput.value = "";
        autoResize(advInput);
        update();
    });
    document.getElementById("adv-clear-seq")?.addEventListener("click", () => {
        currentSequence = [];
        update();
    });
    document.getElementById("adv-pop-seq")?.addEventListener("click", () => {
        currentSequence.pop();
        update();
    });

    function renderGrid() {
        advMarksGrid.innerHTML = "";
        Object.values(allCombiningMarks).forEach(item => {
            const div = document.createElement("div");
            div.className = "adv-mark-item";
            div.title = item.Name;
            div.textContent = "A" + item.Character;
            div.addEventListener("click", () => {
                currentSequence.push(item.Character);
                update();
            });
            advMarksGrid.appendChild(div);
        });
    }

    function update() {
        const previewStr = currentSequence.map(c => "A" + c).join("");
        advSequencePreview.textContent = previewStr || "无序列";

        let text = advInput.value;
        advOutputContainer.innerHTML = "";
        if (!text) return;
        if (advActiveProcess.has("add-prefix-zwsp")) text = ZWSP + text;

        const sequenceStr = currentSequence.join("");
        const isSkippable = ch =>
            (advActiveProcess.has("skip-space") && /\s/.test(ch)) ||
            (advActiveProcess.has("skip-punct") && /\p{P}/u.test(ch));

        let finalText = splitGraphemes(text)
            .map(ch => isSkippable(ch) ? ch : ch + ZWSP + sequenceStr)
            .join("");
        if (advCaseMode === "upper") finalText = finalText.toUpperCase();
        else if (advCaseMode === "lower") finalText = finalText.toLowerCase();

        if (finalText) advOutputContainer.appendChild(createResultCard(finalText));
    }

    updateAdvancedUI = update;

    advInput.addEventListener("input", () => {
        autoResize(advInput);
        update();
    });

    try {
        const response = await fetch("./data/combining_diacritical_marks.json");
        allCombiningMarks = await response.json();
        renderGrid();
    } catch (err) {
        console.error("无法加载符号库", err);
        advMarksGrid.textContent = "加载符号库失败，请检查文件路径。";
    }
}
