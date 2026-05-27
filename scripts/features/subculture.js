import { autoResize } from "../shared/autoresize.js";
import { createResultCard } from "../shared/result-card.js";
import { JT, HX } from "./_martian-data.js";

const jt2hx = {};
const hx2jt = {};
for (let i = 0; i < JT.length; i++) {
    jt2hx[JT[i]] = HX[i];
    hx2jt[HX[i]] = JT[i];
}

const leetMap = {
    A: ["A", "a", "4", "@"], B: ["B", "b", "8"], C: ["C", "c"],
    D: ["D", "d"], E: ["E", "e", "3"], F: ["F", "f"],
    G: ["G", "g", "6", "9"], H: ["H", "h"], I: ["I", "i", "1"],
    J: ["J", "j"], K: ["K", "k"], L: ["L", "l", "1"],
    M: ["M", "m"], N: ["N", "n"], O: ["O", "o", "0"],
    P: ["P", "p"], Q: ["Q", "q"], R: ["R", "r"],
    S: ["S", "s", "5", "$"], T: ["T", "t", "7"], U: ["U", "u"],
    V: ["V", "v"], W: ["W", "w"], X: ["X", "x"],
    Y: ["Y", "y"], Z: ["Z", "z", "2"]
};

export function initSubculture() {
    initMartian();
    initLeet();
}

function initMartian() {
    const martianInput = document.getElementById("martian-input");
    const martianOutputContainer = document.getElementById("martian-output-container");
    const jtBtn = document.getElementById("jt2hx-btn");
    const hxBtn = document.getElementById("hx2jt-btn");
    if (!martianInput || !jtBtn || !hxBtn) return;

    let mode = "jt2hx";

    function run() {
        const text = martianInput.value;
        martianOutputContainer.innerHTML = "";
        if (!text) return;
        const map = mode === "jt2hx" ? jt2hx : hx2jt;
        const transformed = text.split("").map(ch => map[ch] || ch).join("");
        martianOutputContainer.appendChild(createResultCard(transformed));
    }

    function switchMode(newMode, activeBtn, inactiveBtn) {
        mode = newMode;
        activeBtn.classList.add("active");
        inactiveBtn.classList.remove("active");
        run();
    }

    jtBtn.addEventListener("click", () => switchMode("jt2hx", jtBtn, hxBtn));
    hxBtn.addEventListener("click", () => switchMode("hx2jt", hxBtn, jtBtn));
    martianInput.addEventListener("input", () => {
        autoResize(martianInput);
        run();
    });
}

function initLeet() {
    const leetInput = document.getElementById("leet-input");
    const leetOutputContainer = document.getElementById("leet-output-container");
    const leetBtn = document.getElementById("leet-btn");
    if (!leetInput || !leetBtn) return;

    function toLeet() {
        const text = leetInput.value;
        if (!text) return;
        const transformed = text.split("").map(ch => {
            const upper = ch.toUpperCase();
            if (leetMap[upper]) {
                const options = leetMap[upper];
                return options[Math.floor(Math.random() * options.length)];
            }
            return ch;
        }).join("");
        leetOutputContainer.innerHTML = "";
        leetOutputContainer.appendChild(createResultCard(transformed));
    }

    leetBtn.addEventListener("click", toLeet);
    leetInput.addEventListener("input", () => autoResize(leetInput));
}

