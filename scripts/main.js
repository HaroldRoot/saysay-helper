import { initThemeToggle } from "./shared/theme.js";
import { initTabs, initSubTabs } from "./shared/tabs.js";
import { initFontReplace } from "./features/font-replace.js";
import { initNumbers } from "./features/numbers.js";
import { initMarksPreset } from "./features/marks-preset.js";
import { initMarksAdvanced, triggerAdvancedUpdate } from "./features/marks-advanced.js";
import { initZalgo } from "./features/zalgo.js";
import { initSubculture } from "./features/subculture.js";
import { initCuteSymbols } from "./features/cute-symbols.js";
import { initDots } from "./features/dots.js";
import { initQzone } from "./features/qzone.js";
import { initKaomoji } from "./features/kaomoji.js";

document.addEventListener("DOMContentLoaded", () => {
    initThemeToggle();
    initTabs();
    initSubTabs((subTabId) => {
        if (subTabId === "marks-advanced") triggerAdvancedUpdate();
    });

    initFontReplace();
    initNumbers();
    initMarksPreset();
    initMarksAdvanced();
    initZalgo();
    initSubculture();
    initCuteSymbols();
    initDots();
    initQzone();
    initKaomoji();
});
