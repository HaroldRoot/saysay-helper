# 说说文案编辑助手

> 一个面向 QQ 空间、微博、朋友圈等场景的文本变换玩具箱。在浏览器里把普通文字变成花式字体、故障文本、颜文字、点阵字符画、空间表情。

线上访问：<https://haroldroot.github.io/saysay-helper/>

## 功能

| 模块 | 说明 |
| --- | --- |
| 字体替换 | 把英文 / 数字一键替换为 Unicode 数学字母（粗体、斜体、花体、全角、带圈编号等 19 种风格）。支持数字专区按 Unicode 类别浏览。 |
| 故障文字（Zalgo） | 在每个字符上叠加组合变音符号，支持随机、正弦波、上坡、下坡四种形状，可调频率与幅度。 |
| 空间表情 | 浏览 Tencent QZone 经典表情，按分类切换；支持 `[em]eXXXX[/em]` 代码实时预览。 |
| 颜文字 | 按情绪分类的颜文字库，点击即复制。 |
| 组合符号 | 基础预设 + 高级序列编辑器，支持自定义任意组合符号链。 |
| 亚文化 | 简体 ↔ 火星文双向转换、Leet 1337 变体生成、可爱符号面板。 |
| 点阵文字 | 用 Canvas 把汉字渲染成 Braille / 盲文点阵字符画，支持四种字体与笔画粗细调节。 |

## 项目结构

```
saysay-helper/
├── index.html              入口
├── data/                   工具用到的 JSON 数据
│   ├── combining_diacritical_marks.json
│   ├── cute_symbols.json
│   ├── kaomoji_grouped.json
│   ├── qzone_emojis.json
│   └── unicode_numbers.json
├── img/                    QQ 空间表情 GIF 资源
├── styles/
│   ├── main.css            CSS 入口（@import 各分区）
│   ├── tokens.css          设计 token：颜色 / 字号 / 间距 / 圆角 / 阴影 / 缓动
│   ├── base.css            reset、字体、暗色模式
│   ├── layout.css          容器、导航、网格
│   ├── components.css      按钮、卡片、tooltip、toast、textarea、tab
│   └── features.css        各功能模块专属样式
└── scripts/
    ├── main.js             ESM 入口
    ├── shared/             共享工具（tab 切换、主题切换、剪贴板、字素分割等）
    └── features/           七个功能模块各一份
```

## 本地启动

项目是纯静态站，没有构建步骤。任选一种方式：

**VS Code Live Server**（推荐，已在 `.vscode/settings.json` 配置端口 5501）
```
右键 index.html → Open with Live Server
```

**Python 内置 HTTP 服务**
```bash
python -m http.server 5501
# 浏览器打开 http://localhost:5501
```

**Node 用户**
```bash
npx serve .
```

> 需要使用 HTTP 协议而不是直接 `file://` 打开 —— 因为模块化的 JS 用了 `type="module"`，浏览器对 file 协议下的 ESM 有 CORS 限制。

## 设计理念

界面遵循 **效率优先 · Editorial Luxury** 视觉档：

- **首屏即工具区**：去掉 hero / eyebrow / 长段说明文案，每个 tab 内**输入框、操作按钮、输出区**在 1080p 桌面与 iPhone 13 mini 上都能不滚动直接看到。每个工具的说明被合并到标题旁的问号 tooltip 里，hover / 点击展开。
- **极简品牌条**：顶部仅 44–48px 高的横条 —— 左侧 logo + 站名，右侧主题切换按钮。完整的产品介绍移至页脚上方的 about 区。
- **暖米色基底 + 赤陶红强调色**，保留品牌身份；`f16a6a` 系粉色仅用于 about 区的分享标题。
- **默认浅色 + 三态主题切换**：☀ 浅色（默认）→ 🌙 深色 → ⚙ 跟随系统。状态写入 `localStorage.theme`，配合 head 内联脚本避免 FOUC 闪烁。
- **可变衬线标题（Fraunces）+ 现代无衬线正文（Geist）**，中文回退到 PingFang / 思源系列。
- **Double-Bezel 卡片**：外壳承托内核，圆角嵌套让组件像被精心装裱的硬件。
- **物理化交互**：所有按钮采用 cubic-bezier 缓动 + 按下回弹（`scale(0.97–0.98)`）。
- **响应式**：移动端浮动玻璃岛 7 个 tab 自动换行，桌面端展开为单行胶囊；不再使用 480px 强制窄列。

## 浏览器兼容

依赖以下现代特性，建议使用近 2 年的浏览器：

- ES Modules（原生 `<script type="module">`）
- `Intl.Segmenter`（用于字素簇切分；旧浏览器有 regex 回退）
- CSS 自定义属性、`backdrop-filter`、`100dvh`
- Clipboard API

## 致谢

- 颜文字、火星文映射、组合符号数据由 @HaroldRoot 整理。
- 感谢 QQ 空间表情设计团队多年来的视觉素材。

## 许可

代码使用 MIT 协议。`img/` 下的表情资源版权归原作者所有。

## 相关项目

- [QQ 空间说说表情转换器](https://haroldroot.github.io/saysay-converter/) — 把 `[em]eXXXX[/em]` 代码转成 Unicode Emoji。
