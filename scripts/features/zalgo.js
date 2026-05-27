import { ZWSP } from "../shared/constants.js";
import { splitGraphemes } from "../shared/grapheme.js";
import { autoResize } from "../shared/autoresize.js";
import { createResultCard } from "../shared/result-card.js";

const zalgoChars = {
    up: [
        "̍", "̎", "̄", "̅", "̿", "̑", "̆", "̐",
        "͒", "͗", "͑", "̇", "̈", "̊", "͂", "̓",
        "̈́", "͊", "͋", "͌", "̃", "̂", "̌", "͐",
        "̀", "́", "̋", "̏", "̒", "̓", "̔", "̽",
        "̉", "̾", "͛", "͆", "̚"
    ],
    mid: [
        "̕", "̛", "̀", "́", "͘", "̡", "̢", "̴",
        "̵", "̶", "̷", "̸", "͠", "͡", "͢"
    ],
    down: [
        "̖", "̗", "̘", "̙", "̜", "̝", "̞", "̟",
        "̠", "̤", "̥", "̦", "̧", "̨", "̩", "̪",
        "̫", "̬", "̭", "̮", "̯", "̰", "̱", "̲",
        "̳", "̹", "̺", "̻", "̼", "ͅ", "͇", "͈",
        "͉", "͍", "͎", "͓", "͔", "͕", "͖", "͙",
        "͚", "̣"
    ],
    letters: [
        "ͣ", "ͤ", "ͥ", "ͦ", "ͧ", "ͨ", "ͩ", "ͪ",
        "ͫ", "ͬ", "ͭ", "ͮ", "ͯ"
    ],
    bars: ["̄", "̅", "̠", "̱", "̲", "̳", "̿", "͞", "͟"],
    upleft: ["๎"],
    upright: ["้"]
};

function getRandomChar(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

export function initZalgo() {
    const zalgoInput = document.getElementById("zalgo-input");
    const zalgoShape = document.getElementById("zalgo-shape");
    const zalgoFrequency = document.getElementById("zalgo-frequency");
    const zalgoAmplitude = document.getElementById("zalgo-amplitude");
    const zalgoOutputContainer = document.getElementById("zalgo-output-container");
    const zalgoUp = document.getElementById("zalgo-up");
    const zalgoMid = document.getElementById("zalgo-mid");
    const zalgoDown = document.getElementById("zalgo-down");
    const zalgoLetters = document.getElementById("zalgo-letters");
    const zalgoBars = document.getElementById("zalgo-bars");
    const zalgoUpleft = document.getElementById("zalgo-upleft");
    const zalgoUpright = document.getElementById("zalgo-upright");
    if (!zalgoInput || !zalgoOutputContainer) return;

    function generateZalgo(text) {
        const activeCharSets = [];
        if (zalgoUp.classList.contains("active")) activeCharSets.push(zalgoChars.up);
        if (zalgoMid.classList.contains("active")) activeCharSets.push(zalgoChars.mid);
        if (zalgoDown.classList.contains("active")) activeCharSets.push(zalgoChars.down);
        if (zalgoLetters.classList.contains("active")) activeCharSets.push(zalgoChars.letters);
        if (zalgoBars.classList.contains("active")) activeCharSets.push(zalgoChars.bars);
        if (zalgoUpleft.classList.contains("active")) activeCharSets.push(zalgoChars.upleft);
        if (zalgoUpright.classList.contains("active")) activeCharSets.push(zalgoChars.upright);

        if (activeCharSets.length === 0) return ZWSP + text;

        const shape = zalgoShape.value;
        const amplitude = parseInt(zalgoAmplitude.value, 10);
        const frequency = parseInt(zalgoFrequency.value, 10);
        const chars = splitGraphemes(ZWSP + text);
        const totalChars = chars.length;
        const amplitudeFactor = 3.0;

        return chars.map((char, index) => {
            if (char === "\n" || char === "\r") return char;
            let newChar = char + ZWSP;
            let numMarks = 0;

            if (shape === "sine-wave") {
                const period = Math.max(1, (100 - frequency) / 2);
                const sineVal = (Math.sin(index / period) + 1) / 2;
                numMarks = Math.floor(sineVal * amplitude * amplitudeFactor);
            } else if (shape === "slope-up") {
                numMarks = Math.floor((index / totalChars) * amplitude * amplitudeFactor);
            } else if (shape === "slope-down") {
                numMarks = Math.floor(((totalChars - index) / totalChars) * amplitude * amplitudeFactor);
            } else {
                numMarks = Math.floor(Math.random() * amplitude * amplitudeFactor);
            }

            for (let i = 0; i < numMarks; i++) {
                const randomSet = activeCharSets[Math.floor(Math.random() * activeCharSets.length)];
                newChar += getRandomChar(randomSet);
            }
            return newChar;
        }).join("");
    }

    function update() {
        const text = zalgoInput.value;
        zalgoOutputContainer.innerHTML = "";
        if (!text) return;
        zalgoOutputContainer.appendChild(createResultCard(generateZalgo(text)));
    }

    [zalgoInput, zalgoShape, zalgoFrequency, zalgoAmplitude].forEach(el => {
        el.addEventListener("input", update);
    });
    zalgoInput.addEventListener("input", () => autoResize(zalgoInput));

    [zalgoUp, zalgoMid, zalgoDown, zalgoLetters, zalgoBars, zalgoUpleft, zalgoUpright].forEach(btn => {
        btn.addEventListener("click", () => {
            btn.classList.toggle("active");
            update();
        });
    });

    update();
}
