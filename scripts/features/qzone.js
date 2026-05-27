const TAB_ORDER = ["罗小黑", "暴走漫画", "古早1", "古早2"];
const BATCH_SIZE = 60;

export function initQzone() {
    const inputEl = document.getElementById("qzone-input");
    const previewEl = document.getElementById("preview");
    const tabsEl = document.getElementById("tabs");
    const galleryEl = document.getElementById("gallery");
    if (!inputEl || !tabsEl || !galleryEl) return;

    let allData = {};
    let groups = {};
    let currentGroup = null;
    let loaded = 0;

    function normalizeJson(json) {
        if (json && typeof json === "object" && Array.isArray(json.emojis)) {
            const out = {};
            for (const item of json.emojis) {
                const m = item && item.file && item.file.match(/^e(\d+)\.gif$/i);
                if (!m) continue;
                const key = `[em]e${m[1]}[/em]`;
                out[key] = { file: item.file, group: item.group || "默认" };
            }
            return out;
        }
        const out = {};
        for (const [k, v] of Object.entries(json || {})) {
            if (!/^\[em]e\d+\[\/em]$/i.test(k)) continue;
            if (typeof v === "string") out[k] = { file: v, group: "默认" };
            else if (v && v.file) out[k] = { file: v.file, group: v.group || "默认" };
        }
        return out;
    }

    function buildGroups() {
        groups = {};
        for (const [code, info] of Object.entries(allData)) {
            const g = info.group || "默认";
            if (!groups[g]) groups[g] = [];
            groups[g].push({ code, file: info.file });
        }
        const num = s => {
            const m = s.file.match(/^e(\d+)\.gif$/i);
            return m ? parseInt(m[1], 10) : 0;
        };
        for (const g of Object.keys(groups)) {
            groups[g].sort((a, b) => num(a) - num(b));
        }
    }

    function getSortedGroupKeys() {
        return Object.keys(groups).sort((a, b) => {
            let ia = TAB_ORDER.indexOf(a);
            let ib = TAB_ORDER.indexOf(b);
            if (ia === -1) ia = 999;
            if (ib === -1) ib = 999;
            return ia - ib || a.localeCompare(b);
        });
    }

    function renderTabs() {
        tabsEl.innerHTML = "";
        getSortedGroupKeys().forEach(g => {
            const t = document.createElement("div");
            t.className = "tab";
            t.dataset.group = g;
            t.textContent = `${g} (${groups[g].length})`;
            t.addEventListener("click", () => switchGroup(g));
            tabsEl.appendChild(t);
        });
    }

    async function loadMore() {
        const arr = groups[currentGroup] || [];
        if (loaded >= arr.length) return;
        const end = Math.min(loaded + BATCH_SIZE, arr.length);
        const slice = arr.slice(loaded, end);
        loaded = end;
        const frag = document.createDocumentFragment();
        for (const it of slice) {
            const card = document.createElement("div");
            card.className = "emoji-card";
            card.dataset.code = it.code;
            const img = document.createElement("img");
            img.loading = "lazy";
            img.decoding = "async";
            img.src = "img/" + it.file;
            img.alt = it.code;
            card.appendChild(img);
            card.addEventListener("click", onSelectCard);
            frag.appendChild(card);
        }
        galleryEl.appendChild(frag);
    }

    async function ensureFill() {
        let safety = 0;
        while (
            document.documentElement.scrollHeight <= window.innerHeight + 1 &&
            loaded < (groups[currentGroup] || []).length &&
            safety < 20
        ) {
            await loadMore();
            await new Promise(r => setTimeout(r, 20));
            safety++;
        }
    }

    function switchGroup(g) {
        currentGroup = g;
        loaded = 0;
        tabsEl.querySelectorAll(".tab").forEach(t => {
            t.classList.toggle("active", t.dataset.group === g);
        });
        galleryEl.innerHTML = "";
        loadMore().then(ensureFill);
    }

    function onSelectCard() {
        const code = this.dataset.code;
        inputEl.focus();
        inputEl.setRangeText(code, inputEl.selectionStart, inputEl.selectionEnd, "end");
        inputEl.dispatchEvent(new Event("input"));
    }

    function renderPreview() {
        const raw = inputEl.value || "";
        const html = raw.replace(
            /\[em](e\d+)\[\/em]/g,
            (m, c) => `<img class="emoji" src="img/${c}.gif" alt="${c}">`
        );
        previewEl.innerHTML = html;
    }
    inputEl.addEventListener("input", renderPreview);

    let scrollTimer = null;
    window.addEventListener("scroll", () => {
        if (scrollTimer) clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
            const qzoneTab = document.getElementById("qzone-emoji");
            if (!qzoneTab || !qzoneTab.classList.contains("active")) return;
            if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 300) {
                loadMore();
            }
        }, 80);
    });

    (async function start() {
        try {
            const resp = await fetch("./data/qzone_emojis.json", { cache: "no-cache" });
            if (!resp.ok) throw new Error("非 2xx 响应");
            const json = await resp.json();
            allData = normalizeJson(json);
        } catch (err) {
            console.warn("加载 qzone_emojis.json 失败", err);
        }
        buildGroups();
        renderTabs();
        const first = getSortedGroupKeys()[0] || null;
        if (first) switchGroup(first);
    })();
}
