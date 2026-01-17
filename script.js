// 当 DOM 加载完毕后执行
document.addEventListener("DOMContentLoaded", () => {

    // --- 标签页切换逻辑 ---
    const tabNav = document.querySelector(".tab-nav");
    const tabLinks = document.querySelectorAll(".tab-link");
    const tabContents = document.querySelectorAll(".tab-content");

    // ---- 初始化 ----
    // 优先级：URL hash > localStorage > 默认第一个
    const urlHash = window.location.hash.replace("#", "");
    const savedTabId = localStorage.getItem("activeTabId");
    const defaultTab = document.querySelector(".tab-link.active")?.dataset.tab;

    const initialTabId = urlHash || savedTabId || defaultTab;
    activateTab(initialTabId);

    // ---- 点击事件 ----
    tabNav.addEventListener("click", (e) => {
        const clicked = e.target.closest(".tab-link");
        if (!clicked) return;

        const tabId = clicked.dataset.tab;
        activateTab(tabId);

        // 保存状态
        localStorage.setItem("activeTabId", tabId);
        // 不触发页面滚动
        history.replaceState(null, "", `#${tabId}`);
    });

    // ---- hash 变化（比如用户点击浏览器前进/后退） ----
    window.addEventListener("hashchange", () => {
        const newHash = window.location.hash.replace("#", "");
        if (newHash) activateTab(newHash);
    });

    // ---- 激活标签函数 ----
    function activateTab(tabId) {
        if (!tabId) return;
        // 移除 active
        tabLinks.forEach(link => link.classList.remove("active"));
        tabContents.forEach(content => content.classList.remove("active"));

        // 添加 active 到当前标签和内容
        const activeLink = document.querySelector(`.tab-link[data-tab="${tabId}"]`);
        const activeContent = document.getElementById(tabId);
        if (activeLink && activeContent) {
            activeLink.classList.add("active");
            activeContent.classList.add("active");
        }
    }

    // --- 字体替换子分页（内部 tab） ---
    // 使用 querySelectorAll 获取所有子导航栏
    const allSubTabNavs = document.querySelectorAll(".sub-tab-nav");

    allSubTabNavs.forEach(nav => {
        nav.addEventListener("click", (e) => {
            const clicked = e.target.closest(".sub-tab-link");
            if (!clicked) return;

            const subTabId = clicked.dataset.subtab;
            // 获取当前主标签页容器（如 #font-replace 或 #combining-marks）
            const parentSection = nav.closest('.tab-content');

            // 1. 仅移除当前容器下的子标签激活状态（局部清理）
            parentSection.querySelectorAll(".sub-tab-link").forEach(btn => {
                btn.classList.remove("active");
            });
            parentSection.querySelectorAll(".sub-tab-content").forEach(content => {
                content.classList.remove("active");
            });

            // 2. 激活当前点击的标签和对应内容
            clicked.classList.add("active");
            const targetContent = document.getElementById(subTabId);
            if (targetContent) {
                targetContent.classList.add("active");
            }

            // 3. 特殊逻辑：如果是高级页面，触发更新
            if (subTabId === 'marks-advanced' && typeof updateAdvancedUI === 'function') {
                updateAdvancedUI();
            }
        });
    });

    // --- 分割字素簇的函数 ---
    function splitGraphemes(str) {
        // 优先使用 Intl.Segmenter（字素簇级别最准确）
        if (typeof Intl !== "undefined" && Intl.Segmenter) {
            const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
            return [...segmenter.segment(str)].map(s => s.segment);
        }

        // 兼容旧浏览器的 fallback
        const regex = /(\P{M}\p{M}*|\s)/gu;
        return str.match(regex) || [];
    }

    // --- 零宽空格 ---
    const ZWSP = '\u200B';

    // --- 自动调整文本域高度 ---
    const autoResize = textarea => {
        textarea.style.height = "auto";
        textarea.style.height = textarea.scrollHeight + "px";
    };

    // --- 字体替换界面按钮 ---
    const fontInputNew = document.getElementById('font-input');
    const clearBtn = document.getElementById('clear-btn');
    const uppercaseBtn = document.getElementById('uppercase-btn');
    const lowercaseBtn = document.getElementById('lowercase-btn');

    // --- 大小写状态（互斥） ---
    let fontCaseMode = null;
    // 可选值：null, "upper", "lower"

    // 清空按钮
    clearBtn.addEventListener('click', () => {
        fontInputNew.value = '';
        updateFontResults();
    });

    // 切换大写模式
    uppercaseBtn.addEventListener('click', () => {
        if (fontCaseMode === "upper") {
            fontCaseMode = null;
            uppercaseBtn.classList.remove("active");
        } else {
            fontCaseMode = "upper";
            uppercaseBtn.classList.add("active");
            lowercaseBtn.classList.remove("active");
        }
        updateFontResults();
    });

    // 切换小写模式
    lowercaseBtn.addEventListener('click', () => {
        if (fontCaseMode === "lower") {
            fontCaseMode = null;
            lowercaseBtn.classList.remove("active");
        } else {
            fontCaseMode = "lower";
            lowercaseBtn.classList.add("active");
            uppercaseBtn.classList.remove("active");
        }
        updateFontResults();
    });

    // --- 复制到剪贴板 ---
    const toast = document.getElementById("toast");
    let toastTimer;

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            // 显示 toast
            toast.classList.add("show");

            // 清除上一个计时器
            if (toastTimer) {
                clearTimeout(toastTimer);
            }

            // 2 秒后隐藏
            toastTimer = setTimeout(() => {
                toast.classList.remove("show");
            }, 2000);
        }).catch(err => {
            console.error("复制失败: ", err);
            alert("复制失败，请手动复制。");
        });
    }

    // --- 英文字体替换 ---
    const fontMaps = {
        sansBold: {
            title: "无衬线体粗体 Mathematical Sans-Serif Bold Capital",
            map: createCharMap(
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
                '𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵'
            )
        },
        sansItalic: {
            title: "无衬线体斜体 Mathematical Sans-Serif Italic Capital",
            map: createCharMap(
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
                '𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻𝟢𝟣𝟤𝟥𝟦𝟧𝟨𝟩𝟪𝟫'
            )
        },
        sansBoldItalic: {
            title: "无衬线体粗斜体 Mathematical Sans-Serif Bold Italic Capital",
            map: createCharMap(
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
                '𝘼𝘽𝘾𝘿𝙀𝙁𝙂𝙃𝙄𝙅𝙆𝙇𝙈𝙉𝙊𝙋𝙌𝙍𝙎𝙏𝙐𝙑𝙒𝙓𝙔𝙕𝙖𝙗𝙘𝙙𝙚𝙛𝙜𝙝𝙞𝙟𝙠𝙡𝙢𝙣𝙤𝙥𝙦𝙧𝙨𝙩𝙪𝙫𝙬𝙭𝙮𝙯𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵'
            )
        },
        serifBold: {
            title: "衬线体粗体 Mathematical Bold Capital",
            map: createCharMap(
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
                '𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗'
            )
        },
        serifItalic: {
            title: "衬线体斜体 Mathematical Italic Capital",
            map: createCharMap(
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
                '𝐴𝐵𝐶𝐷𝐸𝐹𝐺𝐻𝐼𝐽𝐾𝐿𝑀𝑁𝑂𝑃𝑄𝑅𝑆𝑇𝑈𝑉𝑊𝑋𝑌𝑍𝑎𝑏𝑐𝑑𝑒𝑓𝑔ℎ𝑖𝑗𝑘𝑙𝑚𝑛𝑜𝑝𝑞𝑟𝑠𝑡𝑢𝑣𝑤𝑥𝑦𝑧𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿'
            )
        },
        serifBoldItalic: {
            title: "衬线体粗斜体 Mathematical Bold Italic Capital",
            map: createCharMap(
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
                '𝑨𝑩𝑪𝑫𝑬𝑭𝑮𝑯𝑰𝑱𝑲𝑳𝑴𝑵𝑶𝑷𝑸𝑹𝑺𝑻𝑼𝑽𝑾𝑿𝒀𝒁𝒂𝒃𝒄𝒅𝒆𝒇𝒈𝒉𝒊𝒋𝒌𝒍𝒎𝒏𝒐𝒑𝒒𝒓𝒔𝒕𝒖𝒗𝒘𝒙𝒚𝒛𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗'
            )
        },
        fraktur: {
            title: "古英文体 Mathematical Fraktur Capital",
            map: createCharMap(
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
                '𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜ℨ𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿'
            )
        },
        frakturBold: {
            title: "古英文粗体 Mathematical Bold Fraktur Capital",
            map: createCharMap(
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
                '𝕬𝕭𝕮𝕯𝕰𝕱𝕲𝕳𝕴𝕵𝕶𝕷𝕸𝕹𝕺𝕻𝕼𝕽𝕾𝕿𝖀𝖁𝖂𝖃𝖄𝖅𝖆𝖇𝖈𝖉𝖊𝖋𝖌𝖍𝖎𝖏𝖐𝖑𝖒𝖓𝖔𝖕𝖖𝖗𝖘𝖙𝖚𝖛𝖜𝖝𝖞𝖟𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗'
            )
        },
        script: {
            title: "花体 Mathematical Script Capital",
            map: createCharMap(
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
                '𝒜ℬ𝒞𝒟ℰℱ𝒢ℋℐ𝒥𝒦ℒℳ𝒩𝒪𝒫𝒬ℛ𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵𝒶𝒷𝒸𝒹𝑒𝒻𝑔𝒽𝒾𝒿𝓀𝓁𝓂𝓃𝑜𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿'
            )
        },
        scriptBold: {
            title: "花体粗体 Mathematical Bold Script Capital",
            map: createCharMap(
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
                '𝓐𝓑𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓞𝓟𝓠𝓡𝓢𝓣𝓤𝓥𝓦𝓧𝓨𝓩𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶𝓷𝓸𝓹𝓺𝓻𝓼𝓽𝓾𝓿𝔀𝔁𝔂𝔃𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗'
            )
        },
        doubleStruck: {
            title: "双线空心体 Mathematical Double-Struck Capital",
            map: createCharMap(
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
                '𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡'
            )
        },
        monospace: {
            title: "等宽体 Mathematical Monospace Capital",
            map: createCharMap(
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
                '𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿'
            )
        },
        fullwidth: {
            title: "全角字符 Fullwidth Latin Capital Letter",
            map: createCharMap(
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~',
                'ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ０１２３４５６７８９！＂＃＄％＆＇（）＊＋，－．／：；＜＝＞？＠［＼］＾＿｀｛｜｝～'
            )
        },
        blackCircle: {
            title: "黑色圆圈 Negative Circled Latin Capital Letter",
            map: createCharMap(
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
                '🅐🅑🅒🅓🅔🅕🅖🅗🅘🅙🅚🅛🅜🅝🅞🅟🅠🅡🅢🅣🅤🅥🅦🅧🅨🅩🅐🅑🅒🅓🅔🅕🅖🅗🅘🅙🅚🅛🅜🅝🅞🅟🅠🅡🅢🅣🅤🅥🅦🅧🅨🅩🄌➊➋➌➍➎➏➐➑➒'
                // ⓿❶❷❸❹❺❻❼❽❾
            )
        },
        whiteCircle: {
            title: "白色圆圈 Circled Latin Capital Letter",
            map: createCharMap(
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~',
                'ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ⓪①②③④⑤⑥⑦⑧⑨!"#$%&\'()⊛⊕,⊖⨀⊘:;⧀⊜⧁?@[⦸]^_`{⦶}~'
            )
        },
        blackSquare: {
            title: "黑色方块 Negative Squared Latin Capital Letter",
            map: createCharMap(
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
                '🅰🅱🅲🅳🅴🅵🅶🅷🅸🅹🅺🅻🅼🅽🅾🅿🆀🆁🆂🆃🆄🆅🆆🆇🆈🆉🅰🅱🅲🅳🅴🅵🅶🅷🅸🅹🅺🅻🅼🅽🅾🅿🆀🆁🆂🆃🆄🆅🆆🆇🆈🆉'
            )
        },
        whiteSquare: {
            title: "白色方块 Squared Latin Capital Letter",
            map: createCharMap(
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+-×.☓∧∨⟋/⟍*○□一二三',
                '🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉⊞⊟⊠⊡⛝⟎⟏⧄⧄⧅⧆⧇⧈🈩🈔🈪'
            )
        },
        parenthesized: {
            title: "括号字 Parenthesized Latin Capital Letter",
            map: createCharMap(
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
                '🄐🄑🄒🄓🄔🄕🄖🄗🄘🄙🄚🄛🄜🄝🄞🄟🄠🄡🄢🄣🄤🄥🄦🄧🄨🄩⒜⒝⒞⒟⒠⒡⒢⒣⒤⒥⒦⒧⒨⒩⒪⒫⒬⒭⒮⒯⒰⒱⒲⒳⒴⒵㈇⑴⑵⑶⑷⑸⑹⑺⑻⑼'
            )
        },
        latinLetterSmallCapitals: {
            title: "小型大写字母 Latin Letter Small Capitals",
            map: createCharMap(
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
                'ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ₀₁₂₃₄₅₆₇₈₉'
            )
        },
        turned: {
            title: "倒置 Latin Capital Letter Turned",
            map: createCharMap(
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
                'ɐqɔpǝɟƃɥıɾʞlɯuodbɹsʇnʌʍxʎzɐqɔpǝɟƃɥıɾʞlɯuodbɹsʇnʌʍxʎz'
            )
        },
        yiSyllables: {
            title: "彝文字母 Yi Syllables",
            map: createCharMap(
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
                'ꍏꌃꉓꀸꍟꎇꁅꃅꀤꀭꀘ꒒ꂵꈤꂦꉣꆰꋪꌗ꓄ꀎꃴꅏꊼꌩꁴꍏꌃꉓꀸꍟꎇꁅꃅꀤꀭꀘ꒒ꂵꈤꂦꉣꆰꋪꌗ꓄ꀎꃴꅏꊼꌩꁴ'
            )
        },
        canadianSyllabics: {
            title: "加拿大音节文字 Unified Canadian Aboriginal Syllabics",
            map: createCharMap(
                'ABCDEFGHIJLMNOPQRSTUVWXYZabcdefghijlmnopqrstuvwxyz',
                'ᗩᗷᑢᕲᘿᖴᘜᕼᓰᒚᒪᘻᘉᓍᕵᕴᖇSᖶᑘᐺᘺ᙭ᖻᗱᗩᗷᑢᕲᘿᖴᘜᕼᓰᒚᒪᘻᘉᓍᕵᕴᖇSᖶᑘᐺᘺ᙭ᖻᗱ'
            )
        },
        ethiopicSyllables: {
            title: "埃塞俄比亚音节文字 Ethiopic Syllables",
            map: createCharMap(
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
                'ልጌርዕቿቻኗዘጎጋጕረጠክዐየዒዪነፕሁሀሠሸሃጊልጌርዕቿቻኗዘጎጋጕረጠክዐየዒዪነፕሁሀሠሸሃጊ'
            )
        },
        currency: {
            title: "货币符号 Currency Symbols",
            map: createCharMap(
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
                '₳฿₵ĐɆ₣₲ⱧłJ₭Ⱡ₥₦Ø₱QⱤ₴₮ɄV₩ӾɎⱫ₳฿₵ĐɆ₣₲ⱧłJ₭Ⱡ₥₦Ø₱QⱤ₴₮ɄV₩ӾɎⱫ'
            )
        },
        latinExtended: {
            title: "拉丁扩展字母 Latin Extended Letters",
            map: createCharMap(
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
                'ąҍçժҽƒցհìʝҟӀʍղօքզɾʂէմѵա×վՀąҍçժҽƒցհìʝҟӀʍղօքզɾʂէմѵա×վՀ'
            )
        },
        fancy01: {
            title: "花里胡哨01",
            map: createCharMap(
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
                'αႦƈԃҽϝɠԋιʝƙʅɱɳσρϙɾʂƚυʋɯxყȥαႦƈԃҽϝɠԋιʝƙʅɱɳσρϙɾʂƚυʋɯxყȥ'
            )
        },
        fancy02: {
            title: "花里胡哨02",
            map: createCharMap(
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
                'ꪖ᥇ᥴᦔꫀᠻᧁꫝⅈ𝕛𝕜ꪶꪑꪀꪮρ𝕢𝕣ડ𝕥ꪊꪜ᭙᥊ꪗ𝕫ꪖ᥇ᥴᦔꫀᠻᧁꫝⅈ𝕛𝕜ꪶꪑꪀꪮρ𝕢𝕣ડ𝕥ꪊꪜ᭙᥊ꪗ𝕫'
            )
        },
        fancy03: {
            title: "花里胡哨03",
            map: createCharMap(
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
                'ᗩᗷᑕᗪEᖴGᕼIᒍKᒪᗰᑎOᑭᑫᖇᔕTᑌᐯᗯ᙭YᘔᗩᗷᑕᗪEᖴGᕼIᒍKᒪᗰᑎOᑭᑫᖇᔕTᑌᐯᗯ᙭Yᘔ'
            )
        },
        fancy04: {
            title: "花里胡哨04",
            map: createCharMap(
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
                'ₐᵦʗᴅₑғԍⲏᵢⱼₖₗₘₙₒₚǫᵣₛₜᵤᵥ𝑤ₓᵧ𝆎ₐ♭𝓬𝓭ₑᵳ𝑔ₕᵢⱼₖₗₘₙₒₚ𝓺ᵣₛₜᵤᵥ𝔀ₓᵧ𝆎₀₁₂₃₄₅₆₇₈₉'
            )
        },
        fancy05: {
            title: "花里胡哨05",
            map: createCharMap(
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
                'ⲀⲂⲤⲆⲈ𝓕𝓖ⲎⲒ𝓙Ⲕ𝓛ⲘⲚⲞⲢ𝓠ꞄϨⲦⴑ𝓥ⲰⲬⲨⲌⲁⲃⲥⲇⲉ𝓯𝓰ⲏⲓ𝓳ⲕ𝓵ⲙⲛⲟⲣ𝓺ꞅ𝛓ⲧ𐌵𝓿ⲱⲭⲩⲍ'
            )
        },
        fancy06: {
            title: "花里胡哨06",
            map: createCharMap(
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
                '𝓐ℬ𝓒𝓓𝓔ℱ𝓖ℋ𝓘ℐ𝓚ℒℳ𝓝𝓞𝓟𝑄ℛ𝓢𝑇𝓤𝓥𝓦𝓧ႸŹ𝓐ℬ𝓒𝓓𝓔ℱ𝓖ℋ𝓘ℐ𝓚ℒℳ𝓝𝓞𝓟𝑄ℛ𝓢𝑇𝓤𝓥𝓦𝓧ႸŹ'
            )
        },
        fancy07: {
            title: "花里胡哨07",
            map: createCharMap(
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
                '卂乃匚ᗪ乇千Ꮆ卄丨ﾌҜㄥ爪几ㄖ卩Ɋ尺丂ㄒㄩᐯ山乂ㄚ乙卂乃匚ᗪ乇千Ꮆ卄丨ﾌҜㄥ爪几ㄖ卩Ɋ尺丂ㄒㄩᐯ山乂ㄚ乙'
            )
        },
        fancy08: {
            title: "花里胡哨08",
            map: createCharMap(
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
                'ᏗᏰፈᎴᏋᎦᎶᏂᎥᏠᏦᏝᎷᏁᎧᎮᎤᏒᏕᏖᏬᏉᏇጀᎩፚᏗᏰፈᎴᏋᎦᎶᏂᎥᏠᏦᏝᎷᏁᎧᎮᎤᏒᏕᏖᏬᏉᏇጀᎩፚ'
            )
        },
        fancy09: {
            title: "花里胡哨09",
            map: createCharMap(
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
                'ﾑ乃ᄃり乇ｷムんﾉﾌズﾚﾶ刀のｱゐ尺丂ｲひ√Wﾒﾘ乙ﾑ乃ᄃり乇ｷムんﾉﾌズﾚﾶ刀のｱゐ尺丂ｲひ√Wﾒﾘ乙'
            )
        },
        fancy10: {
            title: "花里胡哨10",
            map: createCharMap(
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
                'ǟɮƈɖɛʄɢɦɨʝӄʟʍռօքզʀֆȶʊʋաӼʏʐǟɮƈɖɛʄɢɦɨʝӄʟʍռօքզʀֆȶʊʋաӼʏʐ'
            )
        },
        fancy11: {
            title: "花里胡哨11 Turned",
            map: createCharMap(
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
                '∀𐐒Ɔ◖ƎℲ⅁HIſ⋊˥MNOԀΌᴚS⊥∩ΛMX⅄Zɐbɔdǝɟƃɥıɾʞןɯnodbɹsʇnʌʍxʎz0ƖᄅƐㄣϛ6ㄥ86'
            )
        },
        fancy12: {
            title: "花里胡哨12",
            map: createCharMap(
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
                'ÄßÇÐÈ£GHÌJKLMñÖþQR§†ÚVW×¥Zåß¢Ðê£ghïjklmñðþqr§†µvwx¥z'
            )
        },
        fancy13: {
            title: "花里胡哨13",
            map: createCharMap(
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
                'ค๒ƈɗﻉिﻭɦٱﻝᛕɭ๓กѻρ۹ɼรՇપ۷ฝซץչค๒ƈɗﻉिﻭɦٱﻝᛕɭ๓กѻρ۹ɼรՇપ۷ฝซץչ0123456789'
            )
        },
        fancy14: {
            title: "花里胡哨14",
            map: createCharMap(
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
                'ΛBᄃDΣFGΉIJKᄂMПӨPQЯƧƬЦVЩXYZΛBᄃDΣFGΉIJKᄂMПӨPQЯƧƬЦVЩXYZ'
            )
        },
        fancy15: {
            title: "花里胡哨15",
            map: createCharMap(
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
                'ค๖¢໓ēfງhiวkl๓ຖ໐p๑rŞtนงຟxฯຊค๖¢໓ēfງhiวkl๓ຖ໐p๑rŞtนงຟxฯຊ'
            )
        },
        fancy16: {
            title: "花里胡哨16",
            map: createCharMap(
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
                'ค๖¢໓ēfງhiวkl๓ຖ໐p๑rŞtนงຟxฯຊค๖¢໓ēfງhiวkl๓ຖ໐p๑rŞtนงຟxฯຊ'
            )
        },
        fancy17: {
            title: "花里胡哨17",
            map: createCharMap(
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
                'Ⱥβ↻ᎠƐƑƓǶįلҠꝈⱮហටφҨའϚͲԱỼచჯӋɀąҍçժҽƒցհìʝҟӀʍղօքզɾʂէմѵա×վՀ⊘𝟙ϩӠ५ƼϬ7𝟠९'
            )
        },
        fancy18: {
            title: "花里胡哨18",
            map: createCharMap(
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
                'ДБҀↁЄFБНІЈЌLМИФРQЯЅГЦVЩЖЧZаъсↁэfБЂіјкlмиорqѓѕтцvшхЎz'
            )
        },
        fancy19: {
            title: "花里胡哨19",
            map: createCharMap(
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
                'ąცƈɖɛʄɠɧıʝƙƖɱŋơ℘զཞʂɬų۷ῳҳყʑąცƈɖɛʄɠɧıʝƙƖɱŋơ℘զཞʂɬų۷ῳҳყʑ'
            )
        },


    };

    fontMaps.canadianSyllabics.map['k'] = 'ᖽᐸ';
    fontMaps.canadianSyllabics.map['K'] = 'ᖽᐸ';

    // 生成字符映射表的辅助函数
    function createCharMap(base, target) {
        const map = {};
        for (let i = 0; i < base.length; i++) {
            map[base[i]] = [...target][i] || '';
        }
        return map;
    }

    // 文本转换函数
    function transformText(text, map) {
        return text.split('').map(char => map[char] || char).join('');
    }

    // 创建结果卡片
    function createResultCard(text) {
        const card = document.createElement('div');
        card.className = 'font-result-card';
        card.textContent = text;

        card.addEventListener('click', () => {
            copyToClipboard(text);
        });

        return card;
    }

    const fontOutputContainer = document.getElementById('font-output-container');

    function updateFontResults() {
        let text = fontInputNew.value;

        // --- 根据选择的大小写模式处理文本（但不修改输入框） ---
        if (fontCaseMode === "upper") {
            text = text.toUpperCase();
        } else if (fontCaseMode === "lower") {
            text = text.toLowerCase();
        }

        fontOutputContainer.innerHTML = '';
        if (!text) return;

        for (const style in fontMaps) {
            const { map } = fontMaps[style];
            const transformedText = transformText(text, map);
            const card = createResultCard(transformedText);
            fontOutputContainer.appendChild(card);
            if (fontMaps[style].title === '倒置 Latin Capital Letter Turned'
                || fontMaps[style].title === '花里胡哨11 Turned'
            ) {
                const anotherCard = createResultCard(transformedText.split('').reverse().join(''));
                fontOutputContainer.appendChild(anotherCard);
            }
        }
    }

    // 绑定 "input" 事件，当用户输入时调用
    fontInputNew.addEventListener('input', updateFontResults);
    fontInputNew.addEventListener("input", () => autoResize(fontInputNew));

    // 在页面加载后，立即手动调用一次
    // 这会读取 <textarea> 中的 "Tap to copy" 并生成结果
    updateFontResults();

    // --- 数字专区 ---
    // 数字清空按钮和复制到剪贴板按钮
    const numbersClearBtn = document.getElementById('numbers-clear-btn');
    const numbersCopyBtn = document.getElementById('numbers-copy-btn');
    // 数字文本框
    const numbersTextarea = document.getElementById('numbers-textarea');

    numbersClearBtn.addEventListener('click', () => {
        numbersTextarea.value = '';
    });

    numbersCopyBtn.addEventListener('click', () => {
        const text = numbersTextarea.value;
        if (text) {
            copyToClipboard(text);
        }
    });

    function createNumberCard(text) {
        const card = document.createElement('div');
        card.className = 'number-card';
        card.textContent = text;

        card.addEventListener('click', () => {
            // 点击卡片自动把字符添加到 textarea
            numbersTextarea.value += text;
        });

        return card;
    }

    async function loadNumbers() {
        const response = await fetch('./unicode_numbers.json');
        const data = await response.json();

        renderNumberCategories(data);
    }

    function renderNumberCategories(jsonObj) {
        const container = document.getElementById('numbers-display');

        // 指定排序顺序
        const priorityOrder = [
            "Digit",
            "Mathematical Bold Digit",
            "Mathematical Double-Struck Digit",
            "Mathematical Sans-Serif Digit",
            "Mathematical Sans-Serif Bold Digit",
            "Mathematical Monospace Digit",
            "Fullwidth Digit",
            "Superscript",
            "Subscript",
            "Fraction Numerator",
            "Vulgar Fraction",
            "Ideographic Number",
            "Ideographic Annotation Mark",
            "Parenthesized Ideograph",
            "Circled Ideograph",
            "Circled Number On Black Square",
            "Negative Circled Digit",
            "Dingbat Negative Circled Digit",
            "Dingbat Negative Circled Number",
            "Dingbat Negative Circled Sans-Serif Digit",
            "Dingbat Negative Circled Sans-Serif Number",
            "Negative Circled Number",
            "Dingbat Circled Sans-Serif Digit",
            "Dingbat Circled Sans-Serif Number",
            "Circled Digit",
            "Circled Number",
            "Double Circled Digit",
            "Double Circled Number",
            "Digit Comma",
            "Digit Full Stop",
            "Number Full Stop",
            "Parenthesized Digit",
            "Parenthesized Number",
            "Roman Numeral",
            "Small Roman Numeral",
        ];

        // 1. 按 Category 分组
        const categories = {};
        Object.keys(jsonObj)
            .sort((a, b) => Number(a) - Number(b)) // 按 key 从小到大
            .forEach(key => {
                const item = jsonObj[key];
                const cat = item.Category || "Other";
                if (!categories[cat]) categories[cat] = [];
                categories[cat].push(item.Character);
            });

        // 2. 排序 categories key：优先顺序在前，其余保持原样
        const sortedCategoryNames = Object.keys(categories).sort((a, b) => {
            const aIndex = priorityOrder.indexOf(a);
            const bIndex = priorityOrder.indexOf(b);
            if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex; // 两个都在优先列表
            if (aIndex !== -1) return -1; // a 在优先列表，排前
            if (bIndex !== -1) return 1;  // b 在优先列表，排前
            return 0; // 都不在优先列表，保持原顺序（Object.keys 原序）
        });

        // 3. 渲染
        sortedCategoryNames.forEach(categoryName => {
            const chars = categories[categoryName];

            // 创建标题
            const title = document.createElement('div');
            title.className = 'category-title';
            title.textContent = `${categoryName}`;
            container.appendChild(title);

            // 创建分组容器
            const group = document.createElement('div');
            group.className = 'category-group';
            chars.forEach(ch => {
                const card = createNumberCard(ch);
                group.appendChild(card);
            });
            container.appendChild(group);
        });
    }

    loadNumbers();

    // 组合附加符号
    const combiningMarks = [
        { name: "Combining Overline", char: "\u0305" },
        { name: "Combining Low Line", char: "\u0332" },
        { name: "Combining Double Low Line", char: "\u0333" },
        { name: "Combining Tilde", char: "\u0303" },
        { name: "Combining Tilde Below", char: "\u0330" },
        { name: "Combining Dot Above", char: "\u0307" },
        { name: "Combining Dot Below", char: "\u0323" },
        { name: "Combining Short Solidus Overlay", char: "\u0337" },
        { name: "Combining X Above", char: "\u033D" },
        { name: "Combining Upwards Arrow Below", char: "\u034E" },
        { name: "Combining Cyrillic Millions Sign", char: "\u0489" },
        { name: "Combining Long Stroke Overlay", char: "\u0336" },
        { name: "Combining Double Macron Below", char: "\u035F" },
        { name: "Combining Equals Sign Below", char: "\u0347" },
        { name: "Combining Diaeresis Below", char: "\u0324" }
    ];

    // 处理方式选项
    const processingModes = [
        { id: "add-prefix-zwsp", label: "开头加个零宽空格" },
        { id: "skip-space", label: "跳过所有普通空格" },
        { id: "skip-punct", label: "跳过标点符号" }
    ];

    const marksInput = document.getElementById('marks-input');
    const marksButtonsContainer = document.getElementById('marks-buttons');
    const processButtonsContainer = document.getElementById('process-buttons');
    const marksOutputContainer = document.getElementById('marks-output-container');

    const marksClearBtn = document.getElementById('marks-clear-btn');
    const marksUppercaseBtn = document.getElementById('marks-uppercase-btn');
    const marksLowercaseBtn = document.getElementById('marks-lowercase-btn');

    // 状态
    let selectedMarks = new Set();
    let caseMode = null; // 'upper' | 'lower' | null
    let activeProcess = new Set();

    // 生成符号按钮
    combiningMarks.forEach(mark => {
        const btn = document.createElement('button');
        btn.className = 'mark-btn action-btn';
        btn.textContent = `A${ZWSP}${mark.char}`;
        btn.dataset.char = mark.char;

        btn.addEventListener('click', () => {
            if (selectedMarks.has(mark.char)) {
                selectedMarks.delete(mark.char);
                btn.classList.remove('active');
            } else {
                selectedMarks.add(mark.char);
                btn.classList.add('active');
            }
            updateMarksOutput();
        });

        marksButtonsContainer.appendChild(btn);
    });

    // 创建清空符号按钮
    const clearMarksBtn = document.createElement('button');
    clearMarksBtn.className = 'action-btn';
    clearMarksBtn.textContent = '清空所有选择';

    clearMarksBtn.addEventListener('click', () => {
        selectedMarks.clear(); // 清空 Set
        // 移除所有符号按钮的 active 样式
        const allMarkBtns = marksButtonsContainer.querySelectorAll('.mark-btn');
        allMarkBtns.forEach(btn => btn.classList.remove('active'));
        updateMarksOutput(); // 刷新输出
    });

    // 将按钮添加到符号按钮容器的末尾
    marksButtonsContainer.appendChild(clearMarksBtn);

    // 生成处理方式按钮
    processingModes.forEach(mode => {
        const btn = document.createElement('button');
        btn.className = 'action-btn process-btn';
        btn.textContent = mode.label;
        btn.dataset.id = mode.id;

        btn.addEventListener('click', () => {
            if (activeProcess.has(mode.id)) {
                activeProcess.delete(mode.id);
                btn.classList.remove('active');
            } else {
                activeProcess.add(mode.id);
                btn.classList.add('active');
            }
            updateMarksOutput();
        });

        processButtonsContainer.appendChild(btn);
    });

    // 清空按钮
    marksClearBtn.addEventListener('click', () => {
        marksInput.value = '';
        updateMarksOutput();
    });

    // 大小写切换按钮
    function toggleCaseMode(mode, btn) {
        if (caseMode === mode) {
            caseMode = null;
            btn.classList.remove('active');
        } else {
            caseMode = mode;
            marksUppercaseBtn.classList.remove('active');
            marksLowercaseBtn.classList.remove('active');
            btn.classList.add('active');
        }
        updateMarksOutput();
    }

    marksUppercaseBtn.addEventListener('click', () => toggleCaseMode('upper', marksUppercaseBtn));
    marksLowercaseBtn.addEventListener('click', () => toggleCaseMode('lower', marksLowercaseBtn));

    // 输出更新
    function updateMarksOutput() {
        let text = marksInput.value;
        marksOutputContainer.innerHTML = '';

        if (!text) return;

        // 处理方式：开头加空格
        if (activeProcess.has('add-prefix-zwsp')) {
            text = ZWSP + text;
        }

        // 生成附加符号组合
        const markString = Array.from(selectedMarks).join('');

        // 应用符号
        const isSkippable = ch =>
            (activeProcess.has('skip-space') && /\s/.test(ch)) ||
            (activeProcess.has('skip-punct') && /\p{P}/u.test(ch));

        const transformedText = splitGraphemes(text)
            .map(ch => isSkippable(ch) ? ch : ch + ZWSP + markString)
            .join('');

        // 大小写处理（仅影响输出，不改输入框）
        let finalText = transformedText;
        if (caseMode === 'upper') finalText = finalText.toUpperCase();
        else if (caseMode === 'lower') finalText = finalText.toLowerCase();

        // 显示结果
        const card = createResultCard(finalText);
        marksOutputContainer.appendChild(card);
    }

    marksInput.addEventListener('input', updateMarksOutput);
    marksInput.addEventListener("input", () => autoResize(marksInput));

    // 初始触发一次
    updateMarksOutput();

    // --- 高级组合符号逻辑 ---
    let allCombiningMarks = {};
    let currentSequence = [];

    const advInput = document.getElementById('marks-adv-input');
    const advSequencePreview = document.getElementById('adv-sequence-preview');
    const advMarksGrid = document.getElementById('adv-marks-grid');
    const advOutputContainer = document.getElementById('marks-adv-output-container');

    // --- 高级组合符号状态 ---
    let advCaseMode = null; // 'upper' | 'lower' | null
    let advActiveProcess = new Set();

    const advProcessButtonsContainer = document.getElementById('adv-process-buttons');
    const advUppercaseBtn = document.getElementById('adv-uppercase-btn');
    const advLowercaseBtn = document.getElementById('adv-lowercase-btn');

    // 初始化处理按钮 (与预设页面共用 processingModes 配置)
    processingModes.forEach(mode => {
        const btn = document.createElement('button');
        btn.className = 'action-btn process-btn';
        btn.textContent = mode.label;

        btn.addEventListener('click', () => {
            if (advActiveProcess.has(mode.id)) {
                advActiveProcess.delete(mode.id);
                btn.classList.remove('active');
            } else {
                advActiveProcess.add(mode.id);
                btn.classList.add('active');
            }
            updateAdvancedUI();
        });
        advProcessButtonsContainer.appendChild(btn);
    });

    // 大小写切换逻辑
    function toggleAdvCaseMode(mode, btn) {
        if (advCaseMode === mode) {
            advCaseMode = null;
            btn.classList.remove('active');
        } else {
            advCaseMode = mode;
            advUppercaseBtn.classList.remove('active');
            advLowercaseBtn.classList.remove('active');
            btn.classList.add('active');
        }
        updateAdvancedUI();
    }

    advUppercaseBtn.addEventListener('click', () => toggleAdvCaseMode('upper', advUppercaseBtn));
    advLowercaseBtn.addEventListener('click', () => toggleAdvCaseMode('lower', advLowercaseBtn));

    // 反转序列
    document.getElementById('adv-reverse-seq').addEventListener('click', () => {
        currentSequence.reverse();
        updateAdvancedUI();
    });

    // 清空输入
    document.getElementById('adv-clear-input-btn').addEventListener('click', () => {
        advInput.value = '';
        if (typeof autoResize === 'function') autoResize(advInput);
        updateAdvancedUI();
    });

    // 加载 JSON 数据
    async function loadCombiningMarks() {
        try {
            const response = await fetch('combining_diacritical_marks.json');
            allCombiningMarks = await response.json();
            renderAdvancedGrid(); // 初始化渲染，无需参数
        } catch (error) {
            console.error("无法加载符号库:", error);
            advMarksGrid.innerHTML = "加载符号库失败，请检查文件路径。";
        }
    }

    // 渲染高级符号选择网格
    function renderAdvancedGrid() {
        advMarksGrid.innerHTML = '';

        Object.values(allCombiningMarks).forEach(item => {
            const div = document.createElement('div');
            div.className = 'adv-mark-item';
            div.title = item.Name;
            // 这里的展示依然是 A + 单个符号
            div.textContent = 'A' + item.Character;

            div.addEventListener('click', () => {
                currentSequence.push(item.Character);
                updateAdvancedUI();
            });
            advMarksGrid.appendChild(div);
        });
    }

    // 更新 UI 与输出
    function updateAdvancedUI() {
        // 1. 更新预览区域 (模拟输入框的 autoResize 效果)
        const previewStr = currentSequence.map(char => 'A' + char).join('');
        advSequencePreview.textContent = previewStr || '无序列';

        // 2. 处理输出文本
        let text = advInput.value;
        advOutputContainer.innerHTML = '';

        if (!text) return;

        // 开头加个零宽空格
        if (advActiveProcess.has('add-prefix-zwsp')) {
            text = ZWSP + text;
        }

        const sequenceStr = currentSequence.join('');

        // 过滤规则
        const isSkippable = ch =>
            (advActiveProcess.has('skip-space') && /\s/.test(ch)) ||
            (advActiveProcess.has('skip-punct') && /\p{P}/u.test(ch));

        // 应用序列
        let finalText = splitGraphemes(text)
            .map(ch => isSkippable(ch) ? ch : ch + ZWSP + sequenceStr)
            .join('');

        // 处理大小写
        if (advCaseMode === 'upper') finalText = finalText.toUpperCase();
        else if (advCaseMode === 'lower') finalText = finalText.toLowerCase();

        // 显示结果
        if (finalText) {
            const card = createResultCard(finalText);
            advOutputContainer.appendChild(card);
        }
    }

    // 事件监听
    document.getElementById('adv-clear-seq').addEventListener('click', () => {
        currentSequence = [];
        updateAdvancedUI();
    });

    document.getElementById('adv-pop-seq').addEventListener('click', () => {
        currentSequence.pop();
        updateAdvancedUI();
    });

    advInput.addEventListener('input', () => {
        if (typeof autoResize === 'function') autoResize(advInput);
        updateAdvancedUI();
    });

    // 初始化加载
    loadCombiningMarks();

    // --- 故障文字 (Zalgo) ---
    // 获取 DOM 元素
    const zalgoInput = document.getElementById('zalgo-input');
    const zalgoShape = document.getElementById('zalgo-shape'); // 新增：形状选择
    const zalgoFrequency = document.getElementById('zalgo-frequency'); // 新增：频率
    const zalgoAmplitude = document.getElementById('zalgo-amplitude'); // 新增：振幅
    const zalgoOutputContainer = document.getElementById('zalgo-output-container');

    // 按钮组
    const zalgoUp = document.getElementById('zalgo-up');
    const zalgoMid = document.getElementById('zalgo-mid');
    const zalgoDown = document.getElementById('zalgo-down');
    const zalgoLetters = document.getElementById('zalgo-letters'); // 新增
    const zalgoBars = document.getElementById('zalgo-bars');       // 新增
    const zalgoUpleft = document.getElementById('zalgo-upleft');
    const zalgoUpright = document.getElementById('zalgo-upright');

    // Zalgo 字符集 
    const zalgoChars = {
        up: [
            '\u030d', '\u030e', '\u0304', '\u0305', '\u033f', '\u0311', '\u0306', '\u0310',
            '\u0352', '\u0357', '\u0351', '\u0307', '\u0308', '\u030a', '\u0342', '\u0343',
            '\u0344', '\u034a', '\u034b', '\u034c', '\u0303', '\u0302', '\u030c', '\u0350',
            '\u0300', '\u0301', '\u030b', '\u030f', '\u0312', '\u0313', '\u0314', '\u033d',
            '\u0309', '\u0363', '\u0364', '\u0365', '\u0366', '\u0367', '\u0368', '\u0369',
            '\u036a', '\u036b', '\u036c', '\u036d', '\u036e', '\u036f', '\u033e', '\u035b',
            '\u0346', '\u031a'
        ],
        mid: [
            '\u0315', '\u031b', '\u0340', '\u0341', '\u0358', '\u0321', '\u0322', '\u0334',
            '\u0335', '\u0336', '\u0337', '\u0338', '\u0360', '\u0361', '\u0362'
        ],
        down: [
            '\u0316', '\u0317', '\u0318', '\u0319', '\u031c', '\u031d', '\u031e', '\u031f',
            '\u0320', '\u0324', '\u0325', '\u0326', '\u0327', '\u0328', '\u0329', '\u032a',
            '\u032b', '\u032c', '\u032d', '\u032e', '\u032f', '\u0330', '\u0331', '\u0332',
            '\u0333', '\u0339', '\u033a', '\u033b', '\u033c', '\u0345', '\u0347', '\u0348',
            '\u0349', '\u034d', '\u034e', '\u0353', '\u0354', '\u0355', '\u0356', '\u0359',
            '\u035a', '\u0323'
        ],
        letters: [
            '\u0363', '\u0364', '\u0365', '\u0366', '\u0367', '\u0368', '\u0369', '\u036a',
            '\u036b', '\u036c', '\u036d', '\u036e', '\u036f',
        ],
        bars: [
            '\u0304', '\u0305', '\u0320', '\u0331', '\u0332', '\u0333', '\u033f', '\u035e',
            '\u035f'
        ],
        upleft: [
            '\u0e4e'
        ],
        upright: [
            '\u0e49'
        ]
    };

    // 辅助函数：从数组中随机获取一个元素
    function getRandomChar(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    // 核心生成逻辑
    function generateZalgo(text) {
        // 获取当前所有被激活的按钮对应的字符集
        const activeCharSets = [];
        if (zalgoUp.classList.contains('active')) activeCharSets.push(zalgoChars.up);
        if (zalgoMid.classList.contains('active')) activeCharSets.push(zalgoChars.mid);
        if (zalgoDown.classList.contains('active')) activeCharSets.push(zalgoChars.down);
        if (zalgoLetters.classList.contains('active')) activeCharSets.push(zalgoChars.letters);
        if (zalgoBars.classList.contains('active')) activeCharSets.push(zalgoChars.bars);
        if (zalgoUpleft.classList.contains('active')) activeCharSets.push(zalgoChars.upleft);
        if (zalgoUpright.classList.contains('active')) activeCharSets.push(zalgoChars.upright);

        // 如果没有任何选项被选中，直接返回原文本（带 ZWSP）
        if (activeCharSets.length === 0) return ZWSP + text;

        const shape = zalgoShape.value;
        const amplitude = parseInt(zalgoAmplitude.value, 10);
        const frequency = parseInt(zalgoFrequency.value, 10);

        // 预处理文本
        const chars = splitGraphemes(ZWSP + text);
        const totalChars = chars.length;

        return chars.map((char, index) => {
            // 跳过换行符
            if (char === '\n' || char === '\r') return char;

            let newChar = char + ZWSP;
            let numMarks = 0;

            // --- 形状逻辑 (Shape Logic) ---
            // 这里的逻辑决定了每个字符上要叠加多少个故障符号

            const amplitudeFactor = 3.0;

            if (shape === 'sine-wave') {
                // 正弦波：
                // 频率 (Frequency) 决定波的周期（密集程度）。
                // 我们将 0-100 的频率值映射到一个除数上。
                // 频率越高，除数越小，波形变化越快。
                const period = Math.max(1, (100 - frequency) / 2);
                // 计算正弦值 (-1 到 1) -> 归一化为 (0 到 1)
                const sineVal = (Math.sin(index / period) + 1) / 2;
                // 振幅 (Amplitude) 决定最大高度
                numMarks = Math.floor(sineVal * amplitude * amplitudeFactor);

            } else if (shape === 'slope-up') {
                // 上坡：随着文字向后，故障越来越多
                numMarks = Math.floor((index / totalChars) * amplitude * amplitudeFactor);

            } else if (shape === 'slope-down') {
                // 下坡：随着文字向后，故障越来越少
                numMarks = Math.floor(((totalChars - index) / totalChars) * amplitude * amplitudeFactor);

            } else {
                // 默认 (Classic/Random)：完全随机
                // 振幅直接作为最大随机数
                const randomFactor = Math.random();
                numMarks = Math.floor(randomFactor * amplitude * amplitudeFactor);
            }

            // --- 叠加字符 ---
            for (let i = 0; i < numMarks; i++) {
                // 1. 随机选择一个已激活的类别 (比如 activeCharSets 包含 [up, mid])
                const randomSet = activeCharSets[Math.floor(Math.random() * activeCharSets.length)];
                // 2. 从该类别中随机取一个字符
                newChar += getRandomChar(randomSet);
            }

            return newChar;
        }).join('');
    }

    // 更新输出
    function updateZalgoOutput() {
        const text = zalgoInput.value;
        zalgoOutputContainer.innerHTML = '';

        if (!text) return;

        // 生成变换后的文本
        const transformedText = generateZalgo(text);

        const card = createResultCard(transformedText);
        zalgoOutputContainer.appendChild(card);
    }

    // 事件监听绑定
    // 监听输入框、形状、频率、振幅的变化
    [zalgoInput, zalgoShape, zalgoFrequency, zalgoAmplitude].forEach(el => {
        el.addEventListener('input', updateZalgoOutput);
    });

    // 自动调整高度
    zalgoInput.addEventListener("input", () => {
        if (typeof autoResize === 'function') {
            autoResize(zalgoInput);
        }
    });

    // 监听所有 Toggle 按钮
    const toggleButtons = [zalgoUp, zalgoMid, zalgoDown, zalgoLetters, zalgoBars, zalgoUpleft, zalgoUpright];

    toggleButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            btn.classList.toggle("active");
            updateZalgoOutput();
        });
    });

    // 初始触发
    updateZalgoOutput();

    // --- 火星文 ---
    let martianMode = 'jt2hx'; // 初始模式
    const jt = '啊阿埃挨哎唉哀皑癌蔼矮艾碍爱隘鞍氨安俺按暗岸胺案肮昂盎凹敖熬翱袄傲奥懊澳芭捌扒叭吧笆八疤巴拔跋靶把耙坝霸罢爸白柏百摆佰败拜稗斑班搬扳般颁板版扮拌伴瓣半办绊邦帮梆榜膀绑棒磅蚌镑傍谤苞胞包褒剥薄雹保堡饱宝抱报暴豹鲍爆杯碑悲卑北辈背贝钡倍狈备惫焙被奔苯本笨崩绷甭泵蹦迸逼鼻比鄙笔彼碧蓖蔽毕毙毖币庇痹闭敝弊必辟壁臂避陛鞭边编贬扁便变卞辨辩辫遍标彪膘表鳖憋别瘪彬斌濒滨宾摈兵冰柄丙秉饼炳病并玻菠播拨钵波博勃搏铂箔伯帛舶脖膊渤泊驳捕卜哺补埠不布步簿部怖擦猜裁材才财睬踩采彩菜蔡餐参蚕残惭惨灿苍舱仓沧藏操糙槽曹草厕策侧册测层蹭插叉茬茶查碴搽察岔差诧拆柴豺搀掺蝉馋谗缠铲产阐颤昌猖场尝常长偿肠厂敞畅唱倡超抄钞朝嘲潮巢吵炒车扯撤掣彻澈郴臣辰尘晨忱沉陈趁衬撑称城橙成呈乘程惩澄诚承逞骋秤吃痴持匙池迟弛驰耻齿侈尺赤翅斥炽充冲虫崇宠抽酬畴踌稠愁筹仇绸瞅丑臭初出橱厨躇锄雏滁除楚础储矗搐触处揣川穿椽传船喘串疮窗幢床闯创吹炊捶锤垂春椿醇唇淳纯蠢戳绰疵茨磁雌辞慈瓷词此刺赐次聪葱囱匆从丛凑粗醋簇促蹿篡窜摧崔催脆瘁粹淬翠村存寸磋撮搓措挫错搭达答瘩打大呆歹傣戴带殆代贷袋待逮怠耽担丹单郸掸胆旦氮但惮淡诞弹蛋当挡党荡档刀捣蹈倒岛祷导到稻悼道盗德得的蹬灯登等瞪凳邓堤低滴迪敌笛狄涤翟嫡抵底地蒂第帝弟递缔颠掂滇碘点典靛垫电佃甸店惦奠淀殿碉叼雕凋刁掉吊钓调跌爹碟蝶迭谍叠丁盯叮钉顶鼎锭定订丢东冬董懂动栋侗恫冻洞兜抖斗陡豆逗痘都督毒犊独读堵睹赌杜镀肚度渡妒端短锻段断缎堆兑队对墩吨蹲敦顿囤钝盾遁掇哆多夺垛躲朵跺舵剁惰堕蛾峨鹅俄额讹娥恶厄扼遏鄂饿恩而儿耳尔饵洱二贰发罚筏伐乏阀法珐藩帆番翻樊矾钒繁凡烦反返范贩犯饭泛坊芳方肪房防妨仿访纺放菲非啡飞肥匪诽吠肺废沸费芬酚吩氛分纷坟焚汾粉奋份忿愤粪丰封枫蜂峰锋风疯烽逢冯缝讽奉凤佛否夫敷肤孵扶拂辐幅氟符伏俘服浮涪福袱弗甫抚辅俯釜斧脯腑府腐赴副覆赋复傅付阜父腹负富讣附妇缚咐噶嘎该改概钙盖溉干甘杆柑竿肝赶感秆敢赣冈刚钢缸肛纲岗港杠篙皋高膏羔糕搞镐稿告哥歌搁戈鸽胳疙割革葛格蛤阁隔铬个各给根跟耕更庚羹埂耿梗工攻功恭龚供躬公宫弓巩汞拱贡共钩勾沟苟狗垢构购够辜菇咕箍估沽孤姑鼓古蛊骨谷股故顾固雇刮瓜剐寡挂褂乖拐怪棺关官冠观管馆罐惯灌贯光广逛瑰规圭硅归龟闺轨鬼诡癸桂柜跪贵刽辊滚棍锅郭国果裹过哈骸孩海氦亥害骇酣憨邯韩含涵寒函喊罕翰撼捍旱憾悍焊汗汉夯杭航壕嚎豪毫郝好耗号浩呵喝荷菏核禾和何合盒貉阂河涸赫褐鹤贺嘿黑痕很狠恨哼亨横衡恒轰哄烘虹鸿洪宏弘红喉侯猴吼厚候后呼乎忽瑚壶葫胡蝴狐糊湖弧虎唬护互沪户花哗华猾滑画划化话槐徊怀淮坏欢环桓还缓换患唤痪豢焕涣宦幻荒慌黄磺蝗簧皇凰惶煌晃幌恍谎灰挥辉徽恢蛔回毁悔慧卉惠晦贿秽会烩汇讳诲绘荤昏婚魂浑混豁活伙火获或惑霍货祸击圾基机畸稽积箕肌饥迹激讥鸡姬绩缉吉极棘辑籍集及急疾汲即嫉级挤几脊己蓟技冀季伎祭剂悸济寄寂计记既忌际继纪嘉枷夹佳家加荚颊贾甲钾假稼价架驾嫁歼监坚尖笺间煎兼肩艰奸缄茧检柬碱硷拣捡简俭剪减荐槛鉴践贱见键箭件健舰剑饯渐溅涧建僵姜将浆江疆蒋桨奖讲匠酱降蕉椒礁焦胶交郊浇骄娇嚼搅铰矫侥脚狡角饺缴绞剿教酵轿较叫窖揭接皆秸街阶截劫节茎睛晶鲸京惊精粳经井警景颈静境敬镜径痉靖竟竞净炯窘揪究纠玖韭久灸九酒厩救旧臼舅咎就疚鞠拘狙疽居驹菊局咀矩举沮聚拒据巨具距踞锯俱句惧炬剧捐鹃娟倦眷卷绢撅攫抉掘倔爵桔杰捷睫竭洁结解姐戒藉芥界借介疥诫届巾筋斤金今津襟紧锦仅谨进靳晋禁近烬浸尽劲荆兢觉决诀绝均菌钧军君峻俊竣浚郡骏喀咖卡咯开揩楷凯慨刊堪勘坎砍看康慷糠扛抗亢炕考拷烤靠坷苛柯棵磕颗科壳咳可渴克刻客课肯啃垦恳坑吭空恐孔控抠口扣寇枯哭窟苦酷库裤夸垮挎跨胯块筷侩快宽款匡筐狂框矿眶旷况亏盔岿窥葵奎魁傀馈愧溃坤昆捆困括扩廓阔垃拉喇蜡腊辣啦莱来赖蓝婪栏拦篮阑兰澜谰揽览懒缆烂滥琅榔狼廊郎朗浪捞劳牢老佬姥酪烙涝勒乐雷镭蕾磊累儡垒擂肋类泪棱楞冷厘梨犁黎篱狸离漓理李里鲤礼莉荔吏栗丽厉励砾历利傈例俐痢立粒沥隶力璃哩俩联莲连镰廉怜涟帘敛脸链恋炼练粮凉梁粱良两辆量晾亮谅撩聊僚疗燎寥辽潦了撂镣廖料列裂烈劣猎琳林磷霖临邻鳞淋凛赁吝拎玲菱零龄铃伶羚凌灵陵岭领另令溜琉榴硫馏留刘瘤流柳六龙聋咙笼窿隆垄拢陇楼娄搂篓漏陋芦卢颅庐炉掳卤虏鲁麓碌露路赂鹿潞禄录陆戮驴吕铝侣旅履屡缕虑氯律率滤绿峦挛孪滦卵乱掠略抡轮伦仑沦纶论萝螺罗逻锣箩骡裸落洛骆络妈麻玛码蚂马骂嘛吗埋买麦卖迈脉瞒馒蛮满蔓曼慢漫谩芒茫盲氓忙莽猫茅锚毛矛铆卯茂冒帽貌贸么玫枚梅酶霉煤没眉媒镁每美昧寐妹媚门闷们萌蒙檬盟锰猛梦孟眯醚靡糜迷谜弥米秘觅泌蜜密幂棉眠绵冕免勉娩缅面苗描瞄藐秒渺庙妙蔑灭民抿皿敏悯闽明螟鸣铭名命谬摸摹蘑模膜磨摩魔抹末莫墨默沫漠寞陌谋牟某拇牡亩姆母墓暮幕募慕木目睦牧穆拿哪呐钠那娜纳氖乃奶耐奈南男难囊挠脑恼闹淖呢馁内嫩能妮霓倪泥尼拟你匿腻逆溺蔫拈年碾撵捻念娘酿鸟尿捏聂孽啮镊镍涅您柠狞凝宁拧泞牛扭钮纽脓浓农弄奴努怒女暖虐疟挪懦糯诺哦欧鸥殴藕呕偶沤啪趴爬帕怕琶拍排牌徘湃派攀潘盘磐盼畔判叛乓庞旁耪胖抛咆刨炮袍跑泡呸胚培裴赔陪配佩沛喷盆砰抨烹澎彭蓬棚硼篷膨朋鹏捧碰坯砒霹批披劈琵毗啤脾疲皮匹痞僻屁譬篇偏片骗飘漂瓢票撇瞥拼频贫品聘乒坪苹萍平凭瓶评屏坡泼颇婆破魄迫粕剖扑铺仆莆葡菩蒲埔朴圃普浦谱曝瀑期欺栖戚妻七凄漆柒沏其棋奇歧畦崎脐齐旗祈祁骑起岂乞企启契砌器气迄弃汽泣讫掐洽牵扦钎铅千迁签仟谦乾黔钱钳前潜遣浅谴堑嵌欠歉枪呛腔羌墙蔷强抢橇锹敲悄桥瞧乔侨巧鞘撬翘峭俏窍切茄且怯窃钦侵亲秦琴勤芹擒禽寝沁青轻氢倾卿清擎晴氰情顷请庆琼穷秋丘邱球求囚酋泅趋区蛆曲躯屈驱渠取娶龋趣去圈颧权醛泉全痊拳犬券劝缺炔瘸却鹊榷确雀裙群然燃冉染瓤壤攘嚷让饶扰绕惹热壬仁人忍韧任认刃妊纫扔仍日戎茸蓉荣融熔溶容绒冗揉柔肉茹蠕儒孺如辱乳汝入褥软阮蕊瑞锐闰润若弱撒洒萨腮鳃塞赛三叁伞散桑嗓丧搔骚扫嫂瑟色涩森僧莎砂杀刹沙纱傻啥煞筛晒珊苫杉山删煽衫闪陕擅赡膳善汕扇缮墒伤商赏晌上尚裳梢捎稍烧芍勺韶少哨邵绍奢赊蛇舌舍赦摄射慑涉社设砷申呻伸身深娠绅神沈审婶甚肾慎渗声生甥牲升绳省盛剩胜圣师失狮施湿诗尸虱十石拾时什食蚀实识史矢使屎驶始式示士世柿事拭誓逝势是嗜噬适仕侍释饰氏市恃室视试收手首守寿授售受瘦兽蔬枢梳殊抒输叔舒淑疏书赎孰熟薯暑曙署蜀黍鼠属术述树束戍竖墅庶数漱恕刷耍摔衰甩帅栓拴霜双爽谁水睡税吮瞬顺舜说硕朔烁斯撕嘶思私司丝死肆寺嗣四伺似饲巳松耸怂颂送宋讼诵搜艘擞嗽苏酥俗素速粟僳塑溯宿诉肃酸蒜算虽隋随绥髓碎岁穗遂隧祟孙损笋蓑梭唆缩琐索锁所塌他它她塔獭挞蹋踏胎苔抬台泰酞太态汰坍摊贪瘫滩坛檀痰潭谭谈坦毯袒碳探叹炭汤塘搪堂棠膛唐糖倘躺淌趟烫掏涛滔绦萄桃逃淘陶讨套特藤腾疼誊梯剔踢锑提题蹄啼体替嚏惕涕剃屉天添填田甜恬舔腆挑条迢眺跳贴铁帖厅听烃汀廷停亭庭挺艇通桐酮瞳同铜彤童桶捅筒统痛偷投头透凸秃突图徒途涂屠土吐兔湍团推颓腿蜕褪退吞屯臀拖托脱鸵陀驮驼椭妥拓唾挖哇蛙洼娃瓦袜歪外豌弯湾玩顽丸烷完碗挽晚皖惋宛婉万腕汪王亡枉网往旺望忘妄威巍微危韦违桅围唯惟为潍维苇萎委伟伪尾纬未蔚味畏胃喂魏位渭谓尉慰卫瘟温蚊文闻纹吻稳紊问嗡翁瓮挝蜗涡窝我斡卧握沃巫呜钨乌污诬屋无芜梧吾吴毋武五捂午舞伍侮坞戊雾晤物勿务悟误昔熙析西硒矽晰嘻吸锡牺稀息希悉膝夕惜熄烯溪汐犀檄袭席习媳喜铣洗系隙戏细瞎虾匣霞辖暇峡侠狭下厦夏吓掀锨先仙鲜纤咸贤衔舷闲涎弦嫌显险现献县腺馅羡宪陷限线相厢镶香箱襄湘乡翔祥详想响享项巷橡像向象萧硝霄削哮嚣销消宵淆晓小孝校肖啸笑效楔些歇蝎鞋协挟携邪斜胁谐写械卸蟹懈泄泻谢屑薪芯锌欣辛新忻心信衅星腥猩惺兴刑型形邢行醒幸杏性姓兄凶胸匈汹雄熊休修羞朽嗅锈秀袖绣墟戌需虚嘘须徐许蓄酗叙旭序畜恤絮婿绪续轩喧宣悬旋玄选癣眩绚靴薛学穴雪血勋熏循旬询寻驯巡殉汛训讯逊迅压押鸦鸭呀丫芽牙蚜崖衙涯雅哑亚讶焉咽阉烟淹盐严研蜒岩延言颜阎炎沿奄掩眼衍演艳堰燕厌砚雁唁彦焰宴谚验殃央鸯秧杨扬佯疡羊洋阳氧仰痒养样漾邀腰妖瑶摇尧遥窑谣姚咬舀药要耀椰噎耶爷野冶也页掖业叶曳腋夜液一壹医揖铱依伊衣颐夷遗移仪胰疑沂宜姨彝椅蚁倚已乙矣以艺抑易邑屹亿役臆逸肄疫亦裔意毅忆义益溢诣议谊译异翼翌绎茵荫因殷音阴姻吟银淫寅饮尹引隐印英樱婴鹰应缨莹萤营荧蝇迎赢盈影颖硬映哟拥佣臃痈庸雍踊蛹咏泳涌永恿勇用幽优悠忧尤由邮铀犹油游酉有友右佑釉诱又幼迂淤于盂榆虞愚舆余俞逾鱼愉渝渔隅予娱雨与屿禹宇语羽玉域芋郁吁遇喻峪御愈欲狱育誉浴寓裕预豫驭鸳渊冤元垣袁原援辕园员圆猿源缘远苑愿怨院曰约越跃钥岳粤月悦阅耘云郧匀陨允运蕴酝晕韵孕匝砸杂栽哉灾宰载再在咱攒暂赞赃脏葬遭糟凿藻枣早澡蚤躁噪造皂灶燥责择则泽贼怎增憎曾赠扎喳渣札轧铡闸眨栅榨咋乍炸诈摘斋宅窄债寨瞻毡詹粘沾盏斩辗崭展蘸栈占战站湛绽樟章彰漳张掌涨杖丈帐账仗胀瘴障招昭找沼赵照罩兆肇召遮折哲蛰辙者锗蔗这浙珍斟真甄砧臻贞针侦枕疹诊震振镇阵蒸挣睁征狰争怔整拯正政帧症郑证芝枝支吱蜘知肢脂汁之织职直植殖执值侄址指止趾只旨纸志挚掷至致置帜峙制智秩稚质炙痔滞治窒中盅忠钟衷终种肿重仲众舟周州洲诌粥轴肘帚咒皱宙昼骤珠株蛛朱猪诸诛逐竹烛煮拄瞩嘱主著柱助蛀贮铸筑住注祝驻抓爪拽专砖转撰赚篆桩庄装妆撞壮状椎锥追赘坠缀谆准捉拙卓桌琢茁酌啄着灼浊兹咨资姿滋淄孜紫仔籽滓子自渍字鬃棕踪宗综总纵邹走奏揍租足卒族祖诅阻组钻纂嘴醉最罪尊遵昨左佐柞做作坐座ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
    const hx = '娿婀埃挨餀呃哀皑癌蔼婑銰碍嬡隘鞍氨鮟唵洝暗岸胺案肮昻盎凹獓熬翱仸謸奧襖奧妑捌朳朳妑笆仈疤妑菝柭靶妑耙坝覇罢妑皛柏咟擺佰敗湃稗癍癍搬扳瘢頒闆蝂汾絆柈瓣柈刅绊綁幇梆徬嫎垹蜯嫎蚌镑徬谤苞菢笣褒剝薄雹湺堡怉寶砲蕔懪豹鲍嚗柸碑蕜萆苝輩揹赑钡俻狈備惫焙被渀苯夲苯镚绷甭泵嘣逬腷嬶仳啚毣彼碧蓖幣滭斃毖币庇痹閉獙弊怭澼壁臂鐴陛鞭笾揙貶碥楩變卞辧辮辮猵摽滮鏢錶鳖憋莂癟彬斌濒璸濱摈娦栤窉眪秉饼炳疒並箥菠譒妭钵菠博勃搏铂箔伯帛舶脖膊渤泊訤峬卜誧卟埠芣鈽荹簿蔀怖攃猜裁財財財棌棌采埰婇蔡爘傪蛬殘慙參灿芲舱仺獊蔵懆鐰槽蓸愺厠憡側冊恻層竲揷紁茬嗏楂楂搽镲岔槎诧拆枈豺搀傪蝉镵谗瀍铲浐闡顫誯猖畼甞瑺萇偿肠廠敞畅晿倡趫莏鈔謿謿謿漅訬炒車扯徹掣沏瞮郴烥宸尘曟忱冗陳趁衬撐稱峸橙荿珵塖珵懲僜諴承浧骋秤阣痴歭匙肔呎肔肔恥歯侈呎哧趐斥炽茺沖蟲漴寵菗絒帱帱婤僽薵仇皗瞅忸溴初炪廚廚躇鋤雛蒢篨椘绌储矗搐触處遄巛瑏椽伝船遄賗疮囱幢床闖創欥炊腄腄箠舂椿錞脣錞蒓蠢戥焯疵垐濨雌辭濨瓷詞泚剌賜佽聪茐囱茐苁苁凑粗齰簇娖蹿篡窜凗慛慛脆瘁濢濢濢籿洊籿磋撮髊措挫措溚垯荅瘩咑汏槑歹傣瀻帶殆笩贷袋待曃怠耽泹冄啴郸掸狚狚氮泹惮惔诞弹疍當澢黨蕩澢叨搗稲箌島祷导菿稲悼檤盜徳嘚哋簦燈憕等簦凳郰諟彽嘀廸敵廸狄涤翟嫡抵疧哋渧苐渧弚递缔颠掂滇碘點敟靛垫電佃甸扂惦奠淀殿淍汈鵰蜩刁鋽铞銱蜩瓞嗲渫渫迭媟疉玎饤汀町嵿鼎锭萣忊丟崬笗蓳慬憅崬侗恫岽狪兠鬦乧跿荳浢哣嘟督毐渎獨渎陼睹帾荰镀肚喥喥妒鍴短葮葮斷葮碓兌隊怼墩沌壿敦頓囤沌盾遁掇哆哆奪垛躱朶跺舵剁媠憜睋睋鹅皒额讹皒悪苊扼遏鄂皒慁洏ル洱尒聶洱②贰潑藅筏浌疺阀琺珐藩汎畨飜樊矾钒瀿汎煩反返笵贩氾粄疺汸淓汸肪房汸妨汸汸汸倣婔悱啡飛萉厞诽吠腓廢沸曊棼酚玢氛汾妢墳焚汾帉奮妢忿濆粪仹崶猦蜂峯峯颩瘋烽漨溤漨讽唪鳯仏娝玞敷膚孵荴拂辐諨氟苻茯俘棴捊涪湢袱弗甫抚辅椨釜釡脯腑椨腐赴諨覆賦復傅苻阜父腹萯冨讣胕妇缚咐噶嗄姟妀漑鈣葢漑迀苷杆柑芉肝迀憾秆噉赣罓碙鋼矼釭罁罓港釭禞皋滈膏餻溔鎬鎬鎬哠滒戨擱戈鸽胳疙剨愅噶咯蛤阁隔铬個茖给艮茛畊浭菮羹埂耿梗笁糼糼塨龚栱匑厷営弖巩汞珙貢珙溝芶芶苟豞垢媾媾夠辜菇咕箍诂钴箛菇鼔咕蛊嗗唂骰诂顧凅雇剮呱剮寡啩啩乖枴怪菅関菅蒄觀涫菅潅遦潅遦洸広迋瑰規圭硅歸亀閨匦媿詭癸蓕匱蛫貴刽辊蔉輥煱漷國淉裹過铪骸陔嗨氦亥嗐骇酣憨邯韓浛凾寒凾諴癷翰撼捍猂憾悍猂汙漢夯忼航壕嚎濠毫郝恏秏呺滘哬曷嗬菏劾秝啝哬匼盉貉阂菏涸赫褐鹤哿潶嫼痕佷哏悢涥悙橫蘅恆轟晎烘渱鴻葓宖宖葒糇糇糇犼厚糇後苸苸唿瑚壺煳箶箶狐煳煳弧唬唬戶沍戶戶埖蕐澕磆磆畵劃囮話槐佪懷准壞歡寰桓還緩換漶喚痪豢焕涣宦抝巟巟曂磺蝗簧瑝瑝瑝瑝愰縨恍巟洃媈媈幑恢蛔冋毇珻慧卉惠珻贿秽浍烩匯讳诲浍荤涽殙魂渾婫豁萿钬焱镬戓惑靃貨禍击圾樭僟畸稽積箕肌饥迹噭讥鶏姬绩缉咭极棘辑籍潗彶喼疾汲旣嫉级哜凢脊己蓟技冀悸伎祭剂悸哜寄寂計汜旣忌漈继汜嘉枷夾佳傢咖荚颊贾曱钾徦糘價泇駕糘姧盬堅尖笺簡煎凲肩艰奷缄茧撿柬碱硷拣撿彅倹彅諴薦槛鉴践濺見楗箭件揵舰劍饯渐溅涧踺壃葁將槳茳彊蔣桨奨講匠醬夅蕉椒礁潐烄茭郊浇嬌嬌嚼搅铰矫侥腳烄角饺儌烄剿嘋酵轿珓嘂窖揭帹湝秸街阶截劫兯莖聙瞐鯨倞驚棈粳經丼檠憬頸靜璄擏傹徑痉靖獍競凈泂僒啾究糾玖韭玖灸勼氿厩慦舊臼舅咎僦咎鞠佝狙疽劇驹匊挶咀怇舉沮藂岠琚姖倶岠踞涺倶呴惧岠涺涓鵑涓惓眷捲涓瘚攫決崛崛嚼桔傑啑睫竭洁結解姐悈藉芥鎅徣夰疥诫屆凧荕釿唫妗珒噤緊婂僅殣琎靳晉噤菦烬锓浕勁荊兢覺吷吷蕝汮箘呁軍焄浚浚浚浚郡浚喀咖鉲咯閞揩揩剀慨刋堪勘坎歃看嫝嵻嵻摃忼囥忼栲洘栲靠坷岢柯錁溘錁萪涜嗑妸渇尅尅愙錁肻肻恳垦妔妔涳恐芤啌摳囗釦簆喖哭崫楛酷厙褲洿垮挎跨胯赽筷侩赽寬窾匡筺誑框纩洭纩況扝盔岿窺葵喹魁傀潰隗潰堒崐涃涃葀拡霩闊柆菈喇臘臘辣菈莱唻攋藍漤孄拦藍阑蘭瀾谰灠灠攋灠灡嚂哴蓈哴蓢蓢蓢烺崂崂窂荖佬粩絡絡崂嘞泺檑檑檑藞蔂儡垒檑叻類汨棱楞唥厘悡犁黎篱狸蓠漓理李里鲤礼莉荔吏栗婯疠励砾呖悡傈唎俐痢竝粒沥隶劦璃哩唡聅嗹涟镰廉憐涟帘潋臉嗹戀煉煉悢涼樑粱悢倆唡糧涼煷涼嫽窷獠療獠寥辽潦孒撂镣漻料烮煭烮挘獵啉啉潾霖臨鄰潾啉凛賃悋柃玪夌蕶齡玪伶玪夌靈夌玪領叧泠媹琉媹硫馏畱嚠媹蓅栁陸瀧聾茏茏窿湰泷泷茏溇溇嵝溇屚陋廬盧颅廬爐掳卤虏噜麓碌蕗蕗赂蔍潞禄淥陸戮馿焒焒佀膂履屢缕慮氯侓卛慮淥欒孌孿滦卵亂稤畧囵囵囵仑囵纶囵囉螺囉羅囉儸骡裸落詻詻絡媽嫲犸犸犸骉罵嫲嬤埋荬麥賣邁霡慲獌蠻慲嫚嫚嫚嫚谩笀汒吂氓杧漭貓罞锚毝罞铆茆茂萺萺邈貿庅坆枚烸酶苺湈莈葿媒镁烸羙昧寐妺媚閄悶們萠懞檬擝锰掹夢掹侎醚靡糜洣洣弥洣秘觅泌滵滵幂婂眠婂冕凂勉娩缅媔媌媌媌邈仯緲庿仯篾搣姄抿皿勄悯閩眀螟嘄佲洺掵繆嗼摹嚤嗼嗼嚤嚤嚤沬沬嗼嚜默沬嗼寞帞湈哞湈拇牡畝姆毋募暮募募慕朩朩睦牧穆嗱哪妠妠哪哪妠氖釢艿恧柰遖莮難灢撓悩悩閙淖迡浽禸嫰能妮霓淣狔胒抳沵嫟膩屰溺蔫秥姩碾撵捻淰娘酿茑杘涅嗫糵啮嗫镍涅您柠狞凝苧拧泞犇沑妞狃哝哝哝挵伮怓伮囡煖疟疟挪穤穤喏呃瓯瓯瓯耦嘔耦沤啪汃瓟啪啪琶啪棑簰棑湃哌襻瀋盤磐昐溿叛判乓厐臱耪眫拋垉铇垉垉垉垉怌胚掊裴婄婄蓜姵沛濆湓泙抨烹澎憉莑堋硼篷膨萠鵬唪湴坯砒噼纰怶噼琵毗啤裨疲怶苉痞僻庇譬萹媥爿騙彯慓瓢嘌潎潎拚頻貧闆娉乒岼泙泙岼憑甁评屛岥秡櫇嘙岥魄廹粕剖圤舗圤莆匍箁蒲逋圤圃普浦鐠曝鑤剘剘栖嘁悽⑦凄漆柒沏娸諆渏忮畦崎脐斉旗祈祁騏起豈阣佱晵契砌噐氣迄棄汽淇讫拤洽撁扦钎鉛芉迁簽仟嗛墘黔錢钳湔濳遣淺谴堑嵌芡嗛熗濸腔羌嫱嫱強熗橇锹毃佾喬趭喬喬巧鞘毳趬峭佾竅苆苆苴愜苆钦埐儭蓁噖懄芹檎噙寑沁圊輕氢傾卿凊擎啨氰凊頃埥庆琼窮偢坵邱浗浗囚媨泅趋岖蛆浀軀屈駆渠掫婜龋趣厾圜颧權醛葲洤痊拳吠券勧蒛炔瘸卻鹊榷確雀峮羣嘫嘫姌媣瓤壤攘孃讓隢擾隢惹慹壬芢亾涊韧姙認刄妊纫扔仍ㄖ戎茸嫆荣瀜嫆嫆嫆絨冗渘渘禸筎蠕濡孺洳媷乳肗叺褥軟朊惢瑞銳潤潤婼弜潵灑蕯腮鳃噻噻彡叁傘潵鎟鎟喪搔騒掃溲瑟脃澀潹僧莏唦摋閷乷纱傻倽繺篩曬姍苫杉屾剼煽釤閁陝擅赡膳僐訕傓缮墒傷啇賞晌仩尙裳哨哨哨燒芍汋韶仯哨卲袑奢赊虵舙舎赦摂射慑渉涻蔎砷妽呻訷裑堔娠訷鉮瀋谉嬸卙腎慎椮殸泩甥狌圱繩渻墭乗夝聖溮妷浉湤濕詩迉虱拾坧湁溡什喰蚀實識史矢使屍馶始鉽沶仕迣枾倳拭誓迣勢湜嗜噬适仕侍释飾氏巿恃厔視鉽荍掱渞垨壽涭售辤痩獣蔬枢梳姝杼瀭埱忬蔋疏書赎孰孰薯濐曙署蜀黍癙屬朮沭樹娕戍竪墅庶薮漱恕唰耍摔缞甩帥拴拴灀叒摤誰渁腄挩吮橓順橓説碩朔爍凘凘凘偲俬呞噝屍肆峙嗣④伺姒饲巳菘聳怂頌鎹浨讼誦溲艘擞嗽蘇酥俗嫊趚粟僳愬溯蹜訴歗酸祘匴虽陏隨浽髓誶嵗穗嬘隧祟孫損笋蓑逡逡縮鎖鎍鎻葰禢彵咜咜嗒獭挞蹋沓胎苔孡珆溙酞忲忲呔坍摊貪瘫滩墵檀痰憛谭談钽毯袒湠探嘆湠饧溏搪漟橖膛瑭溏倘躺淌趟烫匋濤瑫绦匋洮洮匋匋討套特駦駦庝誊珶剔踢锑諟趧渧渧軆櫕嚏惕珶珶屟兲婖瑱甶甛恬婖睓狣條迢眺朓萜鉄萜廰厛烃汀侹渟渟侹侹艇嗵秱酮瞳哃恫浵僮硧硧茼統痌偸投頭透凸禿湥圖徙蒤凃廜汢汢兎湍團蓷颓蹆蜕蹆蹆昋屯臀柂仛脫袉拕駞袉椭鋖沰唾挖哇蛙哇哇咓襪歪迯豌塆塆琓顽汍烷唍涴梚脕皖惋宛啘萭腕忹迋匄忹蛧暀忹朢莣妄媙蘶嶶佹韦違桅圍惟惟潙潍惟苇崣逶偉沩屗纬沬墛菋嵔媦嵔蘶莅渭媦墛墛衞瘟溫螡妏聞鈫沕穏紊問滃暡瓮挝窩煱窉莪斡臥楃沃莁嗚钨烏汚莁偓嘸蕪梧圄呉毋娬伍圄吘橆⑤侮坞戊霚晤粅匢務圄誤厝凞唽覀硒矽晰嘻扱唶犠浠息唏悉膝汐厝熄烯渓汐犀檄袭席習媳禧铣冼係隙戱細磍虾匣葭轄叚浹浹浹芐厦嗄圷锨锨姺佡鮮汘咸賢銜舷娴涎妶溓显険哯獻縣腺陥羨宪陥限線楿厢镶萫葙襄湘芗翔祥詳想姠啍頙巷潒潒姠潒簘硝霄萷涍嚣销消宵淆哓尒涍校肖啸笑效楔些歇蝎嚡拹挾携峫斜脅喈冩悈啣蟹澥绁瀉塮屑蕲芯锌俽厗噺忻杺信衅暒睲睲瑆興鉶侀形郉垳瑆圉莕悻狌兇兇洶匈汹雄熋咻俢饈朽溴琇莠袖绣歔戌濡歔歔湏俆汻蓄酗溆旮垿畜恤絮胥緒續蓒媗媗悬嫙玆選癣妶絢靴薛敩泬膤洫勛熏揗洵咰浔紃廵咰卂訓卂遜卂壓呷鴉鴨吖吖厊厊蚜崖衙涯蕥啞亞冴漹咽阉煙殗鹽嚴妍蜒啱娫訁顔閻烾沿奄殗眼衍湮滟堰嬿厭砚雁唁彦熖匽谚験殃姎鴦秧昜婸佯疡咩樣陽氧卬癢養樣羕撽崾岆愮愮尧滛窰愮烑吆舀葯婹耀倻噎倻爺嘢冶竾頁掖鄴旪曳腋液液①壹悘揖铱畩吚扆颐夷遗簃儀胰寲沂宜侇彝掎蚁掎巳乁矣姒兿抑昜邑屹億役臆逸肄疫洂裔嬑藙忆義谥溢诣议谊譯異翼翌绎筃荫洇殷堷隂絪荶檭婬夤飮吚吲陻茚渶璎璎鹰應缨瑩萤營荧蝇迊赢盁影颕哽眏喲砽砽臃痈滽澭踊蛹怺怺悀怺恿湧鼡豳沋滺沋尤甴邮铀沋怞遊酉洧伖祐祐釉诱叒孧扜菸纡盂榆虞愚舆悇揄揄渔揄揄渔隅予娯雨玙屿禹荢娪羽砡域芋喐吁喁喻峪御匬慾獄唷謍浴寓裕預豫驭鴛棩寃沅垣媴厡瑗辕圎園園猿羱緣逺夗蒝葾阮曰箹樾跞钥捳粵仴哾閱秐囩郧枃殒狁運藴酝暈韻夃匝咂卆酨酨災宰酨侢茬洎瓒暫瓒賍賍髒蹧蹧凿藻栆皁璪蚤璪璪慥唣灶璪嫧萚荝澤賊怎熷璔嶒熷紥喳碴札轧铡閘喳栅搾咋咋怍怍擿斋宅搾債寨瞻毡詹秥跕盏斬辗崭蹍蘸棧颭戰跕偡綻樟嶂彰漳張礃涨粀扙賬账扙胀瘴障妱昭找沼趙燳罩狣肇佋嗻菥悊蛰辙鍺锗蔗適淅沴斟嫃甄砧臻浈針浈忱疹沴震桭鎮俥篜諍諍姃狰踭姃整拯囸炡帧症鄭姃芷汥伎汥倁倁汥脂汥と枳轵矗淔殖秇惪侄歮栺圵趾呮旨衹梽挚掷臸臸置帜峙淛潪秩雉質炙痔滞菭窒狆盅筗妕衷蔠種妕偅仲衆洀淍詶詶诌粥轴肘帚咒皺宙昼骤咮株咮咮蕏渚诛豩艸烛煑拄瞩瞩炷著炷莇蛀贮铸茿炷炷柷驻抓爪跩抟磚啭撰賺篆桩圧裝妝獞匨匨椎锥搥赘墜綴谆痽浞炪婥棹琢茁酌啄着灼浊兹恣粢恣稵淄孜橴仔籽滓ふ洎渍牸鬃琮琮崈琮縂枞邹趉楱楱蒩娖卒蔟袓蒩蒩蒩鑽纂觜酔朂嶵澊噂葃咗佐柞莋莋唑蓙ＡвсＤЁ℉ＧＨＩＪκＬＭЙＯＰＱＲＳＴ∪∨Ｗ×ＹＺāｂｃｄéｆɡｈīｊｋｌｍńōｐｑｒ$τūｖωｘｙｚ①②③④⑤⑥⑦⑧⑨O';

    const jt2hx = {};
    const hx2jt = {};
    for (let i = 0; i < jt.length; i++) {
        jt2hx[jt[i]] = hx[i];
        hx2jt[hx[i]] = jt[i];
    }

    const martianInput = document.getElementById('martian-input');
    const martianOutputContainer = document.getElementById('martian-output-container');
    const jtBtn = document.getElementById('jt2hx-btn');
    const hxBtn = document.getElementById('hx2jt-btn');

    // 执行转换并更新界面
    function performMartianConversion() {
        const text = martianInput.value;
        martianOutputContainer.innerHTML = '';
        if (!text) return;

        const map = (martianMode === 'jt2hx') ? jt2hx : hx2jt;
        const transformed = text.split('').map(ch => map[ch] || ch).join('');

        martianOutputContainer.appendChild(createResultCard(transformed));
    }

    // 按钮切换逻辑（互斥）
    function switchMode(newMode, activeBtn, inactiveBtn) {
        martianMode = newMode;
        activeBtn.classList.add('active');
        inactiveBtn.classList.remove('active');
        performMartianConversion(); // 切换模式后立即重算结果
    }

    jtBtn.addEventListener('click', () => switchMode('jt2hx', jtBtn, hxBtn));
    hxBtn.addEventListener('click', () => switchMode('hx2jt', hxBtn, jtBtn));

    // 实时监听输入
    martianInput.addEventListener('input', performMartianConversion);

    // --- Leet 逻辑 ---
    const leetMap = {
        'A': ['A', 'a', '4', '@'], 'B': ['B', 'b', '8'], 'C': ['C', 'c'],
        'D': ['D', 'd'], 'E': ['E', 'e', '3'], 'F': ['F', 'f'],
        'G': ['G', 'g', '6', '9'], 'H': ['H', 'h'], 'I': ['I', 'i', '1'],
        'J': ['J', 'j'], 'K': ['K', 'k'], 'L': ['L', 'l', '1'],
        'M': ['M', 'm'], 'N': ['N', 'n'], 'O': ['O', 'o', '0'],
        'P': ['P', 'p'], 'Q': ['Q', 'q'], 'R': ['R', 'r'],
        'S': ['S', 's', '5', '$'], 'T': ['T', 't', '7'], 'U': ['U', 'u'],
        'V': ['V', 'v'], 'W': ['W', 'w'], 'X': ['X', 'x'],
        'Y': ['Y', 'y'], 'Z': ['Z', 'z', '2']
    };

    const leetInput = document.getElementById('leet-input');
    const leetOutputContainer = document.getElementById('leet-output-container');

    function toLeet() {
        const text = leetInput.value;
        if (!text) return;

        const transformed = text.split('').map(ch => {
            const upperCh = ch.toUpperCase();
            if (leetMap[upperCh]) {
                const options = leetMap[upperCh];
                return options[Math.floor(Math.random() * options.length)];
            }
            return ch;
        }).join('');

        leetOutputContainer.innerHTML = '';
        leetOutputContainer.appendChild(createResultCard(transformed));
    }

    document.getElementById('leet-btn').addEventListener('click', toLeet);

    // --- 可爱符号渲染 ---
    async function renderCuteSymbols() {
        const container = document.getElementById('cute-symbols-container');
        if (!container) return;

        container.innerHTML = '加载中...'; // 加载状态提示

        try {
            // 从当前目录下的 json 文件获取数据
            const response = await fetch('./cute_symbols.json');
            if (!response.ok) {
                throw new Error(`无法加载符号库: ${response.status}`);
            }

            const cuteSymbolsData = await response.json();

            // 清空容器开始渲染
            container.innerHTML = '';

            for (const [category, symbols] of Object.entries(cuteSymbolsData)) {
                const h3 = document.createElement('h3');
                h3.textContent = category;
                container.appendChild(h3);

                const grid = document.createElement('div');
                grid.className = 'symbol-grid';

                symbols.forEach(symbol => {
                    const card = document.createElement('div');
                    card.className = 'symbol-card';
                    card.textContent = symbol;
                    card.addEventListener('click', () => {
                        copyToClipboard(symbol);
                    });
                    grid.appendChild(card);
                });

                container.appendChild(grid);
            }
        } catch (error) {
            console.error('加载符号时出错:', error);
            container.innerHTML = '符号加载失败，请检查 cute_symbols.json 文件是否存在。';
        }
    }

    // 初始化
    renderCuteSymbols();

    // 自动高度监听
    [martianInput, leetInput].forEach(el => {
        el.addEventListener("input", () => autoResize(el));
    });

    // --- 配置与 DOM ---
    const inputChar = document.getElementById('inputChar');
    const dotSizeInput = document.getElementById('dotSize');
    const fontSelect = document.getElementById('fontSelect');
    const dotThresholdInput = document.getElementById('dotThreshold');
    const canvas = document.getElementById('hiddenCanvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true }); // 优化读取性能
    const dotsOutputContainer = document.getElementById("dots-output-container");

    // --- 核心常量 ---
    // 盲文空字符 (用于判断是否为空格)
    const EMPTY_BRAILLE = String.fromCharCode(0x2800);

    const BRAILLE_DOT_WEIGHTS = [
        0x01, 0x08, // 1, 4
        0x02, 0x10, // 2, 5
        0x04, 0x20, // 3, 6
        0x40, 0x80  // 7, 8
    ];
    const BRAILLE_OFFSET = 0x2800;

    // --- 核心逻辑 ---

    /**
     * 将 8 点布尔数组转为字符
     */
    function getBrailleChar(dots) {
        let offset = 0;
        for (let i = 0; i < 8; i++) {
            if (dots[i]) offset += BRAILLE_DOT_WEIGHTS[i];
        }
        return String.fromCharCode(BRAILLE_OFFSET + offset);
    }

    /**
     * 智能裁剪算法：删除盲文矩阵四周的空白
     * @param {string} rawMatrixStr - 原始的包含大量空白的盲文字符串
     * @returns {string} 裁剪后的字符串
     */
    function trimBrailleMatrix(rawMatrixStr) {
        // 1. 转为二维数组
        let lines = rawMatrixStr.split('\n');

        // 移除空行（如果某行全是空盲文 U+2800 或 普通空格）
        // 注意：Canvas 映射出的空是 \u2800，但为了保险也正则匹配空白
        const isEmptyChar = (ch) => ch === EMPTY_BRAILLE || ch === ' ' || ch === '\r';

        // 2. 寻找上下边界
        let top = 0;
        let bottom = lines.length - 1;

        // 从上往下找非空行
        while (top <= bottom && lines[top].split('').every(isEmptyChar)) {
            top++;
        }
        // 从下往上找非空行
        while (bottom >= top && lines[bottom].split('').every(isEmptyChar)) {
            bottom--;
        }

        // 全是空的（比如输入了空格）
        if (top > bottom) return "";

        // 截取有效行
        lines = lines.slice(top, bottom + 1);

        // 3. 寻找左右边界 (在有效行范围内寻找)
        let left = lines[0].length; // 设为最大可能值
        let right = 0;

        lines.forEach(line => {
            const chars = line.split('');
            // 找该行第一个非空字符索引
            const firstIdx = chars.findIndex(c => !isEmptyChar(c));
            // 找该行最后一个非空字符索引
            let lastIdx = -1;
            for (let i = chars.length - 1; i >= 0; i--) {
                if (!isEmptyChar(chars[i])) {
                    lastIdx = i;
                    break;
                }
            }

            if (firstIdx !== -1) {
                left = Math.min(left, firstIdx);
                right = Math.max(right, lastIdx);
            }
        });

        // 4. 根据左右边界裁剪每一行
        const trimmedLines = lines.map(line => {
            // 截取并在右侧稍微保留一点 padding (可选，视视觉效果而定)
            // 既然要做字符画，通常贴边剪裁比较好
            return line.substring(left, right + 1);
        });

        return trimmedLines.join('\n');
    }

    /**
     * 处理单个字符的生成
     */
    function generateBrailleForChar(char, size, font, threshold) {
        // 跳过无意义的空白符
        if (!char.trim()) return null;

        // 1. 重置 Canvas
        canvas.width = size;
        canvas.height = size;
        ctx.clearRect(0, 0, size, size);

        // 2. 绘制
        const fontSize = size * 0.9; // 稍微留点余地，防止出界
        ctx.font = `${fontSize}px ${font}`;
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // 关键：为了垂直居中更准确，可以调整 y 坐标
        // 某些字体的 middle 对齐在 Canvas 中会有偏差，微调 + size * 0.05
        ctx.fillText(char, size / 2, size / 2 + size * 0.05);

        // 3. 提取数据
        const imageData = ctx.getImageData(0, 0, size, size);
        const data = imageData.data;

        let rawOutput = '';
        const BRAILLE_WIDTH = 2;
        const BRAILLE_HEIGHT = 4;

        // 遍历生成完整矩阵
        for (let charY = 0; charY < size / BRAILLE_HEIGHT; charY++) {
            let row = '';
            for (let charX = 0; charX < size / BRAILLE_WIDTH; charX++) {
                let dots = [];
                const startX = charX * BRAILLE_WIDTH;
                const startY = charY * BRAILLE_HEIGHT;

                const PIXEL_MAP = [
                    [0, 0], [0, 1],
                    [1, 0], [1, 1],
                    [2, 0], [2, 1],
                    [3, 0], [3, 1]
                ];

                for (const [dy, dx] of PIXEL_MAP) {
                    const x = startX + dx;
                    const y = startY + dy;
                    // 边界检查（防止 size 不是 8 倍数时越界，虽然下面代码已修正 size）
                    if (x >= size || y >= size) {
                        dots.push(false);
                        continue;
                    }
                    const index = (y * size + x) * 4;
                    const alpha = data[index + 3];
                    dots.push(alpha > threshold);
                }
                row += getBrailleChar(dots);
            }
            rawOutput += row + '\n';
        }

        // 4. 执行智能裁剪并返回
        return trimBrailleMatrix(rawOutput);
    }

    /**
     * 主入口：处理所有文本
     */
    function processText() {
        const text = inputChar.value; // 不做 trim，保留用户可能想要的中间空格逻辑，但在生成时会跳过
        let size = parseInt(dotSizeInput.value, 10);
        const font = fontSelect.value;
        const threshold = parseInt(dotThresholdInput.value, 10);

        // 修正 size
        if (isNaN(size) || size < 16) size = 16;
        size = Math.round(size / 8) * 8; // 强制对齐 8
        dotSizeInput.value = size; // 回填修正后的值

        dotsOutputContainer.innerHTML = ""; // 清空旧结果

        // 将字符串转为数组 (支持 Emoji 等双字节字符)
        const chars = Array.from(text);

        let brailleArtString = "";

        chars.forEach(char => {
            const brailleArt = generateBrailleForChar(char, size, font, threshold);

            if (brailleArt) {
                // 创建展示卡片
                if (brailleArtString == "") { brailleArtString = brailleArt; }
                else brailleArtString = brailleArtString + '\n' + brailleArt;
                dotsOutputContainer.innerHTML = "";
                const card = createResultCard(brailleArtString);
                dotsOutputContainer.appendChild(card);
            }
        });
    }

    // 绑定事件 (防抖可以优化性能，这里先直接绑定)
    inputChar.addEventListener('input', processText);
    dotSizeInput.addEventListener('change', processText); // change 比 input 更节省计算资源
    fontSelect.addEventListener('change', processText);
    dotThresholdInput.addEventListener('change', processText);

    // 初始化
    processText();

    // 空间表情
    const JSON_URL = "qzone_emojis.json";
    // 在这里指定你想要的 Tab 顺序，未定义的组会排在后面
    const TAB_ORDER = ["罗小黑", "暴走漫画", "古早1", "古早2"];

    let allData = {};
    let groups = {};
    let currentGroup = null;
    let loaded = 0;
    const batchSize = 60;

    async function qzoneInit() {
        try {
            const resp = await fetch(JSON_URL, { cache: "no-cache" });
            if (!resp.ok) throw new Error("非 2xx 响应");
            const json = await resp.json();
            allData = normalizeJson(json);
        } catch (err) {
            console.warn("加载 qqemojis.json 失败。错误：", err);
        }

        buildGroups();
        renderTabs();

        // 根据自定义顺序选择第一个存在的组
        const sortedKeys = getSortedGroupKeys();
        const first = sortedKeys[0] || null;
        if (first) switchGroup(first);
    }

    function normalizeJson(json) {
        if (json && typeof json === "object" && Array.isArray(json.emojis)) {
            const out = {};
            for (const item of json.emojis) {
                const m = item && item.file && item.file.match(/^e(\d+)\.gif$/i);
                if (!m) continue;
                const num = m[1];
                const key = `[em]e${num}[/em]`;
                out[key] = { file: item.file, group: item.group || "默认" };
            }
            return out;
        }

        const out = {};
        for (const [k, v] of Object.entries(json || {})) {
            if (!/^\[em]e\d+\[\/em]$/i.test(k)) continue;
            if (typeof v === "string") {
                out[k] = { file: v, group: "默认" };
            } else if (v && v.file) {
                out[k] = { file: v.file, group: v.group || "默认" };
            }
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

    // 辅助函数：获取排序后的组名数组
    function getSortedGroupKeys() {
        const keys = Object.keys(groups);
        return keys.sort((a, b) => {
            let indexA = TAB_ORDER.indexOf(a);
            let indexB = TAB_ORDER.indexOf(b);
            // 如果不在 TAB_ORDER 里，则排到后面
            if (indexA === -1) indexA = 999;
            if (indexB === -1) indexB = 999;
            return indexA - indexB || a.localeCompare(b);
        });
    }

    // 渲染 Tabs
    function renderTabs() {
        const tabs = document.getElementById("tabs");
        tabs.innerHTML = "";

        const sortedKeys = getSortedGroupKeys();

        for (const g of sortedKeys) {
            const t = document.createElement("div");
            t.className = "tab";
            t.dataset.group = g;
            t.textContent = `${g} (${groups[g].length})`;
            t.addEventListener("click", () => switchGroup(g));
            tabs.appendChild(t);
        }
    }

    // 切换组
    function switchGroup(g) {
        currentGroup = g;
        loaded = 0;
        const tabs = document.querySelectorAll(".tab");
        tabs.forEach(t => t.classList.toggle("active", t.dataset.group === g));
        const gallery = document.getElementById("gallery");
        gallery.innerHTML = "";
        loadMore().then(() => ensureFill());
    }

    // 加载下一批
    async function loadMore() {
        const arr = groups[currentGroup] || [];
        if (loaded >= arr.length) return; // 移除 end-hint 操作

        const gallery = document.getElementById("gallery");
        const end = Math.min(loaded + batchSize, arr.length);
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
        gallery.appendChild(frag);
    }

    // 确保内容填充
    async function ensureFill() {
        const gallery = document.getElementById("gallery");
        let safety = 0;
        while (document.documentElement.scrollHeight <= window.innerHeight + 1 && loaded < (groups[currentGroup] || []).length && safety < 20) {
            await loadMore();
            await new Promise(r => setTimeout(r, 20));
            safety++;
        }
    }

    // 滚动加载更多
    let scrollTimer = null;
    window.addEventListener("scroll", () => {
        if (scrollTimer) clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
            if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 300) {
                loadMore();
            }
        }, 80);
    });

    // 点击卡片插入到输入框
    function onSelectCard(e) {
        const code = this.dataset.code;
        const input = document.getElementById("qzone-input");

        input.focus();
        // selectStart/End 默认为当前光标位置，'end' 表示插入后光标移动到新插入字符的末尾
        input.setRangeText(code, input.selectionStart, input.selectionEnd, 'end');

        // setRangeText 不会自动触发 input 事件，需要手动分发以更新预览
        input.dispatchEvent(new Event('input'));
    }

    // 预览渲染
    function renderPreview() {
        const raw = document.getElementById("qzone-input").value || "";
        const html = raw.replace(/\[em](e\d+)\[\/em]/g, (m, c) => `<img class="emoji" src="img/${c}.gif" alt="${c}">`);
        document.getElementById("preview").innerHTML = html;
    }

    document.getElementById("qzone-input").addEventListener("input", renderPreview);

    qzoneInit();

    // --- 颜表情 ---

    // 1. 配置：定义分类的先后顺序
    const KAOMOJI_ORDER = ["快乐", "猫", "特殊"];

    let kaomojiData = {};

    async function initKaomoji() {
        try {
            const response = await fetch('kaomoji_grouped.json');
            kaomojiData = await response.json();

            renderKaomojiTabs();

            // 默认显示第一个分类
            const sortedCats = getSortedCategories();
            if (sortedCats.length > 0) switchKaomojiGroup(sortedCats[0]);
        } catch (err) {
            console.error("加载数据失败:", err);
        }
    }

    // 获取排序后的分类名
    function getSortedCategories() {
        const keys = Object.keys(kaomojiData);
        return keys.sort((a, b) => {
            let indexA = KAOMOJI_ORDER.indexOf(a);
            let indexB = KAOMOJI_ORDER.indexOf(b);
            if (indexA === -1) indexA = 999;
            if (indexB === -1) indexB = 999;
            return indexA - indexB || a.localeCompare(b);
        });
    }

    // 渲染分类 Tabs
    function renderKaomojiTabs() {
        const container = document.getElementById("kaomoji-tabs");
        container.innerHTML = "";

        getSortedCategories().forEach(cat => {
            const t = document.createElement("div");
            t.className = "tab";
            t.dataset.group = cat;
            // 显示翻译后的名字和数量
            t.textContent = `${cat} (${kaomojiData[cat].length})`;
            t.addEventListener("click", () => switchKaomojiGroup(cat));
            container.appendChild(t);
        });
    }

    // 切换显示内容
    function switchKaomojiGroup(g) {
        // 更新 Tab 高亮
        document.querySelectorAll("#kaomoji-tabs .tab").forEach(t => {
            t.classList.toggle("active", t.dataset.group === g);
        });

        const gallery = document.getElementById("kaomoji-gallery");
        gallery.innerHTML = "";

        // 渲染卡片
        (kaomojiData[g] || []).forEach(emoji => {
            const card = document.createElement("div");
            card.className = "kaomoji-card";
            card.textContent = emoji;
            card.onclick = () => {
                navigator.clipboard.writeText(emoji);
                showToast(`已复制: ${emoji}`);
            };
            gallery.appendChild(card);
        });
    }

    // 复制功能
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            showToast(`已复制: ${text}`);
        }).catch(err => {
            console.error('无法复制', err);
        });
    }

    // 弹窗提示
    function showToast(msg) {
        const toast = document.getElementById("copy-toast");
        toast.textContent = msg;
        toast.classList.add("show");
        setTimeout(() => {
            toast.classList.remove("show");
        }, 1500);
    }

    // 页面加载后执行
    initKaomoji();
});
