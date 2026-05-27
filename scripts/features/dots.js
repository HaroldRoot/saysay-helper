import { createResultCard } from "../shared/result-card.js";

const EMPTY_BRAILLE = String.fromCharCode(0x2800);
const BRAILLE_DOT_WEIGHTS = [0x01, 0x08, 0x02, 0x10, 0x04, 0x20, 0x40, 0x80];
const BRAILLE_OFFSET = 0x2800;
const PIXEL_MAP = [[0, 0], [0, 1], [1, 0], [1, 1], [2, 0], [2, 1], [3, 0], [3, 1]];

function getBrailleChar(dots) {
    let offset = 0;
    for (let i = 0; i < 8; i++) {
        if (dots[i]) offset += BRAILLE_DOT_WEIGHTS[i];
    }
    return String.fromCharCode(BRAILLE_OFFSET + offset);
}

function trimBrailleMatrix(rawMatrixStr) {
    let lines = rawMatrixStr.split("\n");
    const isEmpty = ch => ch === EMPTY_BRAILLE || ch === " " || ch === "\r";
    let top = 0;
    let bottom = lines.length - 1;
    while (top <= bottom && lines[top].split("").every(isEmpty)) top++;
    while (bottom >= top && lines[bottom].split("").every(isEmpty)) bottom--;
    if (top > bottom) return "";
    lines = lines.slice(top, bottom + 1);
    let left = lines[0].length;
    let right = 0;
    lines.forEach(line => {
        const chars = line.split("");
        const firstIdx = chars.findIndex(c => !isEmpty(c));
        let lastIdx = -1;
        for (let i = chars.length - 1; i >= 0; i--) {
            if (!isEmpty(chars[i])) { lastIdx = i; break; }
        }
        if (firstIdx !== -1) {
            left = Math.min(left, firstIdx);
            right = Math.max(right, lastIdx);
        }
    });
    return lines.map(line => line.substring(left, right + 1)).join("\n");
}

export function initDots() {
    const inputChar = document.getElementById("inputChar");
    const dotSizeInput = document.getElementById("dotSize");
    const fontSelect = document.getElementById("fontSelect");
    const dotThresholdInput = document.getElementById("dotThreshold");
    const canvas = document.getElementById("hiddenCanvas");
    const dotsOutputContainer = document.getElementById("dots-output-container");
    if (!inputChar || !canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    function generateBrailleForChar(char, size, font, threshold) {
        if (!char.trim()) return null;
        canvas.width = size;
        canvas.height = size;
        ctx.clearRect(0, 0, size, size);
        const fontSize = size * 0.9;
        ctx.font = `${fontSize}px ${font}`;
        ctx.fillStyle = "#000000";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(char, size / 2, size / 2 + size * 0.05);
        const imageData = ctx.getImageData(0, 0, size, size);
        const data = imageData.data;
        let rawOutput = "";
        const BW = 2;
        const BH = 4;
        for (let charY = 0; charY < size / BH; charY++) {
            let row = "";
            for (let charX = 0; charX < size / BW; charX++) {
                const dots = [];
                const startX = charX * BW;
                const startY = charY * BH;
                for (const [dy, dx] of PIXEL_MAP) {
                    const x = startX + dx;
                    const y = startY + dy;
                    if (x >= size || y >= size) { dots.push(false); continue; }
                    const idx = (y * size + x) * 4;
                    dots.push(data[idx + 3] > threshold);
                }
                row += getBrailleChar(dots);
            }
            rawOutput += row + "\n";
        }
        return trimBrailleMatrix(rawOutput);
    }

    function processText() {
        const text = inputChar.value;
        let size = parseInt(dotSizeInput.value, 10);
        const font = fontSelect.value;
        const threshold = 254 - parseInt(dotThresholdInput.value, 10);
        if (isNaN(size) || size < 16) size = 16;
        size = Math.round(size / 8) * 8;
        dotSizeInput.value = size;
        dotsOutputContainer.innerHTML = "";

        const chars = Array.from(text);
        let brailleArtString = "";
        chars.forEach(char => {
            const art = generateBrailleForChar(char, size, font, threshold);
            if (art) {
                brailleArtString = brailleArtString === "" ? art : brailleArtString + "\n" + art;
                dotsOutputContainer.innerHTML = "";
                const card = createResultCard(brailleArtString);
                card.className = "font-result-card dots-result-card";
                dotsOutputContainer.appendChild(card);
            }
        });
    }

    inputChar.addEventListener("input", processText);
    dotSizeInput.addEventListener("change", processText);
    fontSelect.addEventListener("change", processText);
    dotThresholdInput.addEventListener("change", processText);

    processText();
}
