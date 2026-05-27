let toastTimer;

export function showToast(msg) {
    const toast = document.getElementById("copy-toast");
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 1500);
}

export function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        if (text.length < 30) showToast(`已复制：${text}`);
        else showToast("已复制");
    }).catch(err => console.error("无法复制", err));
}
