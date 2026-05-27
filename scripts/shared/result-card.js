import { copyToClipboard } from "./clipboard.js";

export function createResultCard(text) {
    const card = document.createElement("div");
    card.className = "font-result-card";
    card.textContent = text;
    card.addEventListener("click", () => copyToClipboard(text));
    return card;
}
