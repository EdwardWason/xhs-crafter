# xhs-crafter

将 Markdown 文章排版为 3:4 比例的精美图片卡片 + 压缩文字稿，用于微信公众号/小红书贴图发布。

## 功能

- **MD → 精美图片卡片**：自动将 Markdown 文章拆分排版为多张 1080×1440 (3:4) HTML 页面，截图为 PNG
- **双风格系统**：Editorial Magazine（杂志风，衬线+暖纸底）和 Swiss International（瑞士网格风，无衬线+白底）
- **10 套主题色**：Ink Classic / Indigo Porcelain / Forest Ink / Kraft Paper / Dune / Midnight Ink / IKB Blue / Lemon Yellow / Lemon Green / Safety Orange
- **28 种布局模板**：M01-M16（Editorial）+ S01-S12（Swiss）
- **三层节奏系统**：明暗交替 + 氛围强弱 + 版式多样性
- **密度铁律**：活跃构图 ≥78% 画布高度，确保信息密度
- **文字压缩**：保留原话引言+场景描述，压缩至 ≤1000 字
- **双通道交付**：本地文件夹 + 飞书云盘同步（手机端直接访问）

## 5 步全自动工作流

```
MD 文章输入
  → Step 1: Intake（识别品类）
  → Step 2: Content Plan（内容规划）
  → Step 3: Compose（组装 HTML）
  → Step 4: Validate（自检）
  → Step 5: Screenshot & Deliver（截图交付）
```

用户只需提供 MD 文件，直接出文件夹，中间不停顿。

## 安装

```bash
npx skills install EdwardWason/xhs-crafter -g
```

## 使用

在 TRAE / Claude Code / OpenClaw 中，直接提供 MD 文件路径即可触发：

```
请用 xhs-crafter 对这篇文章排版：/path/to/article.md
```

## 项目结构

```
xhs-crafter/
├── SKILL.md                              # 技能主文件（入口）
├── assets/
│   ├── template-editorial-card.html      # Editorial 种子模板
│   ├── template-swiss-card.html          # Swiss 种子模板
│   └── screenshot.js                     # Puppeteer 截图脚本
└── references/
    ├── style-system.md                   # Editorial vs Swiss 身份测试+反模式
    ├── category-cookbook.md              # 7 品类路由表
    ├── content-planning.md               # 压缩阶梯+页面角色+钩子模式
    ├── portrait-fill.md                  # 3:4 密度规则+三层节奏系统
    ├── image-overlay.md                  # 文字压图规则
    ├── theme-presets.md                  # 10 套主题色 CSS 变量
    ├── components.md                     # 字体/字号/间距规范（权威来源）
    ├── layout-recipes.md                 # 28 种布局模板
    ├── screenshot-treatment.md           # 截图装裱规范
    ├── image-sources.md                  # 图库 API 接入
    └── workflow.md                       # 工作流详细参考
```

## 品类适配

| 品类 | 风格 | 主题 |
|------|------|------|
| 商业/科技分析 | Editorial | Indigo Porcelain |
| 职场/干货 | Swiss | IKB Blue |
| 旅行/生活方式 | Editorial | Kraft Paper |
| 教程/工具 | Swiss | IKB Blue |
| 影视/读书 | Editorial | Ink Classic |
| 游戏 | Editorial (dark) | Midnight Ink |
| 美食 | Editorial | Kraft Paper |

## License

MIT
