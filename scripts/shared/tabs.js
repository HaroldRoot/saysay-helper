export function initTabs() {
    const tabNav = document.querySelector(".tab-nav");
    const tabLinks = document.querySelectorAll(".tab-link");
    const tabContents = document.querySelectorAll(".tab-content");
    if (!tabNav) return;

    const validTabIds = new Set(Array.from(tabLinks).map(link => link.dataset.tab));
    const defaultTab = document.querySelector(".tab-link.active")?.dataset.tab;

    function activateTab(tabId) {
        if (!validTabIds.has(tabId)) {
            tabId = defaultTab;
        }
        if (!tabId) return;
        tabLinks.forEach(link => {
            const active = link.dataset.tab === tabId;
            link.classList.toggle("active", active);
            link.setAttribute("aria-selected", active ? "true" : "false");
        });
        tabContents.forEach(content => {
            content.classList.toggle("active", content.id === tabId);
        });
    }

    const urlHash = window.location.hash.replace("#", "");
    const savedTabId = localStorage.getItem("activeTabId");
    activateTab(urlHash || savedTabId || defaultTab);

    tabNav.addEventListener("click", (e) => {
        const clicked = e.target.closest(".tab-link");
        if (!clicked) return;
        const tabId = clicked.dataset.tab;
        activateTab(tabId);
        localStorage.setItem("activeTabId", tabId);
        history.replaceState(null, "", `#${tabId}`);
    });

    window.addEventListener("hashchange", () => {
        const newHash = window.location.hash.replace("#", "");
        if (newHash) activateTab(newHash);
    });
}

export function initSubTabs(onActivate) {
    document.querySelectorAll(".sub-tab-nav").forEach(nav => {
        nav.addEventListener("click", (e) => {
            const clicked = e.target.closest(".sub-tab-link");
            if (!clicked) return;
            const subTabId = clicked.dataset.subtab;
            const parentSection = nav.closest(".tab-content");
            parentSection.querySelectorAll(".sub-tab-link").forEach(btn => {
                const active = btn === clicked;
                btn.classList.toggle("active", active);
                btn.setAttribute("aria-selected", active ? "true" : "false");
            });
            parentSection.querySelectorAll(".sub-tab-content").forEach(content => {
                content.classList.toggle("active", content.id === subTabId);
            });
            if (typeof onActivate === "function") onActivate(subTabId);
        });
    });
}
