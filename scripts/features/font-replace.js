import { autoResize } from "../shared/autoresize.js";
import { createResultCard } from "../shared/result-card.js";

function createCharMap(base, target) {
    const map = {};
    const targetArr = [...target];
    for (let i = 0; i < base.length; i++) {
        map[base[i]] = targetArr[i] || "";
    }
    return map;
}

function transformText(text, map) {
    return text.split("").map(char => map[char] || char).join("");
}

const fontMaps = {
    sansBold: {
        title: "无衬线体粗体 Mathematical Sans-Serif Bold Capital",
        map: createCharMap(
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
            "𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵"
        )
    },
    sansItalic: {
        title: "无衬线体斜体 Mathematical Sans-Serif Italic Capital",
        map: createCharMap(
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
            "𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻𝟢𝟣𝟤𝟥𝟦𝟧𝟨𝟩𝟪𝟫"
        )
    },
    sansBoldItalic: {
        title: "无衬线体粗斜体 Mathematical Sans-Serif Bold Italic Capital",
        map: createCharMap(
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
            "𝘼𝘽𝘾𝘿𝙀𝙁𝙂𝙃𝙄𝙅𝙆𝙇𝙈𝙉𝙊𝙋𝙌𝙍𝙎𝙏𝙐𝙑𝙒𝙓𝙔𝙕𝙖𝙗𝙘𝙙𝙚𝙛𝙜𝙝𝙞𝙟𝙠𝙡𝙢𝙣𝙤𝙥𝙦𝙧𝙨𝙩𝙪𝙫𝙬𝙭𝙮𝙯𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵"
        )
    },
    serifBold: {
        title: "衬线体粗体 Mathematical Bold Capital",
        map: createCharMap(
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
            "𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗"
        )
    },
    serifItalic: {
        title: "衬线体斜体 Mathematical Italic Capital",
        map: createCharMap(
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
            "𝐴𝐵𝐶𝐷𝐸𝐹𝐺𝐻𝐼𝐽𝐾𝐿𝑀𝑁𝑂𝑃𝑄𝑅𝑆𝑇𝑈𝑉𝑊𝑋𝑌𝑍𝑎𝑏𝑐𝑑𝑒𝑓𝑔ℎ𝑖𝑗𝑘𝑙𝑚𝑛𝑜𝑝𝑞𝑟𝑠𝑡𝑢𝑣𝑤𝑥𝑦𝑧𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿"
        )
    },
    serifBoldItalic: {
        title: "衬线体粗斜体 Mathematical Bold Italic Capital",
        map: createCharMap(
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
            "𝑨𝑩𝑪𝑫𝑬𝑭𝑮𝑯𝑰𝑱𝑲𝑳𝑴𝑵𝑶𝑷𝑸𝑹𝑺𝑻𝑼𝑽𝑾𝑿𝒀𝒁𝒂𝒃𝒄𝒅𝒆𝒇𝒈𝒉𝒊𝒋𝒌𝒍𝒎𝒏𝒐𝒑𝒒𝒓𝒔𝒕𝒖𝒗𝒘𝒙𝒚𝒛𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗"
        )
    },
    fraktur: {
        title: "古英文体 Mathematical Fraktur Capital",
        map: createCharMap(
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
            "𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜ℨ𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿"
        )
    },
    frakturBold: {
        title: "古英文粗体 Mathematical Bold Fraktur Capital",
        map: createCharMap(
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
            "𝕬𝕭𝕮𝕯𝕰𝕱𝕲𝕳𝕴𝕵𝕶𝕷𝕸𝕹𝕺𝕻𝕼𝕽𝕾𝕿𝖀𝖁𝖂𝖃𝖄𝖅𝖆𝖇𝖈𝖉𝖊𝖋𝖌𝖍𝖎𝖏𝖐𝖑𝖒𝖓𝖔𝖕𝖖𝖗𝖘𝖙𝖚𝖛𝖜𝖝𝖞𝖟𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗"
        )
    },
    script: {
        title: "花体 Mathematical Script Capital",
        map: createCharMap(
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
            "𝒜ℬ𝒞𝒟ℰℱ𝒢ℋℐ𝒥𝒦ℒℳ𝒩𝒪𝒫𝒬ℛ𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵𝒶𝒷𝒸𝒹𝑒𝒻𝑔𝒽𝒾𝒿𝓀𝓁𝓂𝓃𝑜𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿"
        )
    },
    scriptBold: {
        title: "花体粗体 Mathematical Bold Script Capital",
        map: createCharMap(
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
            "𝓐𝓑𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓞𝓟𝓠𝓡𝓢𝓣𝓤𝓥𝓦𝓧𝓨𝓩𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶𝓷𝓸𝓹𝓺𝓻𝓼𝓽𝓾𝓿𝔀𝔁𝔂𝔃𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗"
        )
    },
    doubleStruck: {
        title: "双线空心体 Mathematical Double-Struck Capital",
        map: createCharMap(
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
            "𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡"
        )
    },
    monospace: {
        title: "等宽体 Mathematical Monospace Capital",
        map: createCharMap(
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
            "𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿"
        )
    },
    fullwidth: {
        title: "全角字符 Fullwidth Latin Capital Letter",
        map: createCharMap(
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~",
            "ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ０１２３４５６７８９！＂＃＄％＆＇（）＊＋，－．／：；＜＝＞？＠［＼］＾＿｀｛｜｝～"
        )
    },
    blackCircle: {
        title: "黑色圆圈 Negative Circled Latin Capital Letter",
        map: createCharMap(
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
            "🅐🅑🅒🅓🅔🅕🅖🅗🅘🅙🅚🅛🅜🅝🅞🅟🅠🅡🅢🅣🅤🅥🅦🅧🅨🅩🅐🅑🅒🅓🅔🅕🅖🅗🅘🅙🅚🅛🅜🅝🅞🅟🅠🅡🅢🅣🅤🅥🅦🅧🅨🅩🄌➊➋➌➍➎➏➐➑➒"
        )
    },
    whiteCircle: {
        title: "白色圆圈 Circled Latin Capital Letter",
        map: createCharMap(
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~",
            "ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ⓪①②③④⑤⑥⑦⑧⑨!\"#$%&'()⊛⊕,⊖⨀⊘:;⧀⊜⧁?@[⦸]^_`{⦶}~"
        )
    },
    blackSquare: {
        title: "黑色方块 Negative Squared Latin Capital Letter",
        map: createCharMap(
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
            "🅰🅱🅲🅳🅴🅵🅶🅷🅸🅹🅺🅻🅼🅽🅾🅿🆀🆁🆂🆃🆄🆅🆆🆇🆈🆉🅰🅱🅲🅳🅴🅵🅶🅷🅸🅹🅺🅻🅼🅽🅾🅿🆀🆁🆂🆃🆄🆅🆆🆇🆈🆉"
        )
    },
    whiteSquare: {
        title: "白色方块 Squared Latin Capital Letter",
        map: createCharMap(
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+-×.☓∧∨⟋/⟍*○□一二三",
            "🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉⊞⊟⊠⊡⛝⟎⟏⧄⧄⧅⧆⧇⧈🈩🈔🈪"
        )
    },
    parenthesized: {
        title: "括号字 Parenthesized Latin Capital Letter",
        map: createCharMap(
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
            "🄐🄑🄒🄓🄔🄕🄖🄗🄘🄙🄚🄛🄜🄝🄞🄟🄠🄡🄢🄣🄤🄥🄦🄧🄨🄩⒜⒝⒞⒟⒠⒡⒢⒣⒤⒥⒦⒧⒨⒩⒪⒫⒬⒭⒮⒯⒰⒱⒲⒳⒴⒵㈇⑴⑵⑶⑷⑸⑹⑺⑻⑼"
        )
    },
    latinLetterSmallCapitals: {
        title: "小型大写字母 Latin Letter Small Capitals",
        map: createCharMap(
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
            "ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ₀₁₂₃₄₅₆₇₈₉"
        )
    },
    turned: {
        title: "倒置 Latin Capital Letter Turned",
        map: createCharMap(
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
            "ɐqɔpǝɟƃɥıɾʞlɯuodbɹsʇnʌʍxʎzɐqɔpǝɟƃɥıɾʞlɯuodbɹsʇnʌʍxʎz"
        )
    },
    yiSyllables: {
        title: "彝文字母 Yi Syllables",
        map: createCharMap(
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
            "ꍏꌃꉓꀸꍟꎇꁅꃅꀤꀭꀘ꒒ꂵꈤꂦꉣꆰꋪꌗ꓄ꀎꃴꅏꊼꌩꁴꍏꌃꉓꀸꍟꎇꁅꃅꀤꀭꀘ꒒ꂵꈤꂦꉣꆰꋪꌗ꓄ꀎꃴꅏꊼꌩꁴ"
        )
    },
    canadianSyllabics: {
        title: "加拿大音节文字 Unified Canadian Aboriginal Syllabics",
        map: createCharMap(
            "ABCDEFGHIJLMNOPQRSTUVWXYZabcdefghijlmnopqrstuvwxyz",
            "ᗩᗷᑢᕲᘿᖴᘜᕼᓰᒚᒪᘻᘉᓍᕵᕴᖇSᖶᑘᐺᘺ᙭ᖻᗱᗩᗷᑢᕲᘿᖴᘜᕼᓰᒚᒪᘻᘉᓍᕵᕴᖇSᖶᑘᐺᘺ᙭ᖻᗱ"
        )
    },
    ethiopicSyllables: {
        title: "埃塞俄比亚音节文字 Ethiopic Syllables",
        map: createCharMap(
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
            "ልጌርዕቿቻኗዘጎጋጕረጠክዐየዒዪነፕሁሀሠሸሃጊልጌርዕቿቻኗዘጎጋጕረጠክዐየዒዪነፕሁሀሠሸሃጊ"
        )
    },
    currency: {
        title: "货币符号 Currency Symbols",
        map: createCharMap(
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
            "₳฿₵ĐɆ₣₲ⱧłJ₭Ⱡ₥₦Ø₱QⱤ₴₮ɄV₩ӾɎⱫ₳฿₵ĐɆ₣₲ⱧłJ₭Ⱡ₥₦Ø₱QⱤ₴₮ɄV₩ӾɎⱫ"
        )
    },
    latinExtended: {
        title: "拉丁扩展字母 Latin Extended Letters",
        map: createCharMap(
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
            "ąҍçժҽƒցհìʝҟӀʍղօքզɾʂէմѵա×վՀąҍçժҽƒցհìʝҟӀʍղօքզɾʂէմѵա×վՀ"
        )
    },
    fancy01: {
        title: "花里胡哨01",
        map: createCharMap(
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
            "αႦƈԃҽϝɠԋιʝƙʅɱɳσρϙɾʂƚυʋɯxყȥαႦƈԃҽϝɠԋιʝƙʅɱɳσρϙɾʂƚυʋɯxყȥ"
        )
    },
    fancy02: {
        title: "花里胡哨02",
        map: createCharMap(
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
            "ꪖ᥇ᥴᦔꫀᠻᧁꫝⅈ𝕛𝕜ꪶꪑꪀꪮρ𝕢𝕣ડ𝕥ꪊꪜ᭙᥊ꪗ𝕫ꪖ᥇ᥴᦔꫀᠻᧁꫝⅈ𝕛𝕜ꪶꪑꪀꪮρ𝕢𝕣ડ𝕥ꪊꪜ᭙᥊ꪗ𝕫"
        )
    },
    fancy03: {
        title: "花里胡哨03",
        map: createCharMap(
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
            "ᗩᗷᑕᗪEᖴGᕼIᒍKᒪᗰᑎOᑭᑫᖇᔕTᑌᐯᗯ᙭YᘔᗩᗷᑕᗪEᖴGᕼIᒍKᒪᗰᑎOᑭᑫᖇᔕTᑌᐯᗯ᙭Yᘔ"
        )
    },
    fancy04: {
        title: "花里胡哨04",
        map: createCharMap(
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
            "ₐᵦʗᴅₑғԍⲏᵢⱼₖₗₘₙₒₚǫᵣₛₜᵤᵥ𝑤ₓᵧ𝆎ₐ♭𝓬𝓭ₑᵳ𝑔ₕᵢⱼₖₗₘₙₒₚ𝓺ᵣₛₜᵤᵥ𝔀ₓᵧ𝆎₀₁₂₃₄₅₆₇₈₉"
        )
    },
    fancy05: {
        title: "花里胡哨05",
        map: createCharMap(
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
            "ⲀⲂⲤⲆⲈ𝓕𝓖ⲎⲒ𝓙Ⲕ𝓛ⲘⲚⲞⲢ𝓠ꞄϨⲦⴑ𝓥ⲰⲬⲨⲌⲁⲃⲥⲇⲉ𝓯𝓰ⲏⲓ𝓳ⲕ𝓵ⲙⲛⲟⲣ𝓺ꞅ𝛓ⲧ𐌵𝓿ⲱⲭⲩⲍ"
        )
    },
    fancy06: {
        title: "花里胡哨06",
        map: createCharMap(
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
            "𝓐ℬ𝓒𝓓𝓔ℱ𝓖ℋ𝓘ℐ𝓚ℒℳ𝓝𝓞𝓟𝑄ℛ𝓢𝑇𝓤𝓥𝓦𝓧ႸŹ𝓐ℬ𝓒𝓓𝓔ℱ𝓖ℋ𝓘ℐ𝓚ℒℳ𝓝𝓞𝓟𝑄ℛ𝓢𝑇𝓤𝓥𝓦𝓧ႸŹ"
        )
    },
    fancy07: {
        title: "花里胡哨07",
        map: createCharMap(
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
            "卂乃匚ᗪ乇千Ꮆ卄丨ﾌҜㄥ爪几ㄖ卩Ɋ尺丂ㄒㄩᐯ山乂ㄚ乙卂乃匚ᗪ乇千Ꮆ卄丨ﾌҜㄥ爪几ㄖ卩Ɋ尺丂ㄒㄩᐯ山乂ㄚ乙"
        )
    },
    fancy08: {
        title: "花里胡哨08",
        map: createCharMap(
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
            "ᏗᏰፈᎴᏋᎦᎶᏂᎥᏠᏦᏝᎷᏁᎧᎮᎤᏒᏕᏖᏬᏉᏇጀᎩፚᏗᏰፈᎴᏋᎦᎶᏂᎥᏠᏦᏝᎷᏁᎧᎮᎤᏒᏕᏖᏬᏉᏇጀᎩፚ"
        )
    },
    fancy09: {
        title: "花里胡哨09",
        map: createCharMap(
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
            "ﾑ乃ᄃり乇ｷムんﾉﾌズﾚﾶ刀のｱゐ尺丂ｲひ√Wﾒﾘ乙ﾑ乃ᄃり乇ｷムんﾉﾌズﾚﾶ刀のｱゐ尺丂ｲひ√Wﾒﾘ乙"
        )
    },
    fancy10: {
        title: "花里胡哨10",
        map: createCharMap(
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
            "ǟɮƈɖɛʄɢɦɨʝӄʟʍռօքզʀֆȶʊʋաӼʏʐǟɮƈɖɛʄɢɦɨʝӄʟʍռօքզʀֆȶʊʋաӼʏʐ"
        )
    },
    fancy11: {
        title: "花里胡哨11 Turned",
        map: createCharMap(
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
            "∀𐐒Ɔ◖ƎℲ⅁HIſ⋊˥MNOԀΌᴚS⊥∩ΛMX⅄Zɐbɔdǝɟƃɥıɾʞןɯnodbɹsʇnʌʍxʎz0ƖᄅƐㄣϛ6ㄥ86"
        )
    },
    fancy12: {
        title: "花里胡哨12",
        map: createCharMap(
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
            "ÄßÇÐÈ£GHÌJKLMñÖþQR§†ÚVW×¥Zåß¢Ðê£ghïjklmñðþqr§†µvwx¥z"
        )
    },
    fancy13: {
        title: "花里胡哨13",
        map: createCharMap(
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
            "ค๒ƈɗﻉिﻭɦٱﻝᛕɭ๓กѻρ۹ɼรՇપ۷ฝซץչค๒ƈɗﻉिﻭɦٱﻝᛕɭ๓กѻρ۹ɼรՇપ۷ฝซץչ0123456789"
        )
    },
    fancy14: {
        title: "花里胡哨14",
        map: createCharMap(
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
            "ΛBᄃDΣFGΉIJKᄂMПӨPQЯƧƬЦVЩXYZΛBᄃDΣFGΉIJKᄂMПӨPQЯƧƬЦVЩXYZ"
        )
    },
    fancy15: {
        title: "花里胡哨15",
        map: createCharMap(
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
            "ค๖¢໓ēfງhiวkl๓ຖ໐p๑rŞtนงຟxฯຊค๖¢໓ēfງhiวkl๓ຖ໐p๑rŞtนงຟxฯຊ"
        )
    },
    fancy16: {
        title: "花里胡哨16",
        map: createCharMap(
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
            "ค๖¢໓ēfງhiวkl๓ຖ໐p๑rŞtนงຟxฯຊค๖¢໓ēfງhiวkl๓ຖ໐p๑rŞtนงຟxฯຊ"
        )
    },
    fancy17: {
        title: "花里胡哨17",
        map: createCharMap(
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
            "Ⱥβ↻ᎠƐƑƓǶįلҠꝈⱮហටφҨའϚͲԱỼచჯӋɀąҍçժҽƒցհìʝҟӀʍղօքզɾʂէմѵա×վՀ⊘𝟙ϩӠ५ƼϬ7𝟠९"
        )
    },
    fancy18: {
        title: "花里胡哨18",
        map: createCharMap(
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
            "ДБҀↁЄFБНІЈЌLМИФРQЯЅГЦVЩЖЧZаъсↁэfБЂіјкlмиорqѓѕтцvшхЎz"
        )
    },
    fancy19: {
        title: "花里胡哨19",
        map: createCharMap(
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
            "ąცƈɖɛʄɠɧıʝƙƖɱŋơ℘զཞʂɬų۷ῳҳყʑąცƈɖɛʄɠɧıʝƙƖɱŋơ℘զཞʂɬų۷ῳҳყʑ"
        )
    }
};

fontMaps.canadianSyllabics.map["k"] = "ᖽᐸ";
fontMaps.canadianSyllabics.map["K"] = "ᖽᐸ";

export function initFontReplace() {
    const fontInput = document.getElementById("font-input");
    const clearBtn = document.getElementById("clear-btn");
    const uppercaseBtn = document.getElementById("uppercase-btn");
    const lowercaseBtn = document.getElementById("lowercase-btn");
    const fontOutputContainer = document.getElementById("font-output-container");
    if (!fontInput || !fontOutputContainer) return;

    let fontCaseMode = null;

    function updateFontResults() {
        let text = fontInput.value;
        if (fontCaseMode === "upper") text = text.toUpperCase();
        else if (fontCaseMode === "lower") text = text.toLowerCase();

        fontOutputContainer.innerHTML = "";
        if (!text) return;

        for (const style in fontMaps) {
            const { map, title } = fontMaps[style];
            const transformed = transformText(text, map);
            const card = createResultCard(transformed);
            fontOutputContainer.appendChild(card);
            if (title === "倒置 Latin Capital Letter Turned" || title === "花里胡哨11 Turned") {
                const reversed = createResultCard(transformed.split("").reverse().join(""));
                fontOutputContainer.appendChild(reversed);
            }
        }
    }

    clearBtn.addEventListener("click", () => {
        fontInput.value = "";
        updateFontResults();
    });

    uppercaseBtn.addEventListener("click", () => {
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

    lowercaseBtn.addEventListener("click", () => {
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

    fontInput.addEventListener("input", () => {
        updateFontResults();
        autoResize(fontInput);
    });

    updateFontResults();
}
