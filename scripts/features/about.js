import { copyToClipboard } from "../shared/clipboard.js";

export function initAbout() {
    const url = document.getElementById("url-display");
    if (!url) return;
    url.addEventListener("click", () => copyToClipboard(url.textContent.trim()));
}
