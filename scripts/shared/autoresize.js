export function autoResize(textarea) {
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
}

export function bindAutoResize(textarea) {
    if (!textarea) return;
    textarea.addEventListener("input", () => autoResize(textarea));
    autoResize(textarea);
}
