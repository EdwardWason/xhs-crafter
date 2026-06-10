---
name: "xhs-crafter"
description: "将MD文章排版为3:4比例的精美图片+压缩文字稿，用于公众号/小红书贴图发布。Invoke when用户要排版文章为图片、生成公众号贴图、小红书图文、文章转图片卡片。Do NOT use for原创写作、纯文字排版、视频制作。"
---

# XHS Crafter — 文章转图片卡片

## 任务
将用户提供的MD文章内容，排版为多张3:4比例(1080×1440)的精美HTML页面，截图为PNG，压缩为≤1000字文字稿，文件夹交付。不做原创写作，不做视频，不做纯文字排版。

## 输出格式

```
<桌面>/<slug>公众号素材/
├── p1-cover.png
├── p2-xxx.png
├── ...
├── pN-finale.png
└── <slug>-文字稿.txt   # ≤1000字压缩文字
```

## 工作流：5步（全自动，中间不停顿）

**核心原则：用户给MD，直接出文件夹。** Step 1-2在脑内完成（不输出长文规划），Step 3-5连续执行不等待用户确认。

### Step 1: Intake — 识别品类（脑内完成，不输出）
从MD内容自动推断：
- **内容品类**: 读 `references/category-cookbook.md` 路由。商业/科技分析→Editorial×Indigo Porcelain；职场/干货→Swiss×IKB Blue；旅行→Editorial×Kraft Paper；教程/工具→Swiss×IKB Blue；影视/读书→Editorial×Ink Classic
- **目标平台**: 默认小红书3:4（除非用户指定公众号）
- **用户图片**: (a)用户指定截图文件夹路径；(b)解析MD中 `![描述](路径)` 和 `[🖼️配图建议：xxx]` 标记。无图时自动AI生图或网络取图
- **仅在品类无法推断时才问用户**，否则直接进入Step 2

### Step 2: Content Plan — 内容规划（脑内完成，不输出）
读 `references/content-planning.md`，完成：
- 压缩阶梯：核心论点1句 → 读者承诺 → 4-8个分论点 → 页面钩子 → 正文片段
- 页面角色分配：7页组图至少5种不同形态
- **页面节奏规划**：为每页标注明暗(Light/Dark)、氛围强弱(Strong/Subtle)、版式类型，读 `references/portrait-fill.md` 的"Three-Layer Rhythm System"
- 封面钩子：用具体承诺而非空洞口号
- 页数指导：600-1000字→5-7图，1000-1800字→7-9图
- **5页及以上：封面和封底都必须有图片背景**

### Step 3: Compose — 组装HTML（直接执行）
- 拷贝种子模板：Editorial→ `assets/template-editorial-card.html`；Swiss→ `assets/template-swiss-card.html`
- 设置 `data-theme` 或 `data-accent` 属性切换主题
- 在 `<!-- POSTERS_HERE -->` 处添加页面
- **满铺图页必须遵循 `references/image-overlay.md`**：选图→无遮罩构图→局部色调遮罩→缩略图检查
- **密度保障**：每页活跃构图≥78%画布高度，读 `references/portrait-fill.md`
- **节奏保障**：暗色页插入、氛围强弱交替、版式不重复
- **图片必须下载到本地**（关键！Puppeteer headless无法可靠加载外部API图片）：
  1. 用WebFetch获取API返回的CDN URL
  2. 用curl下载到项目`assets/`目录
  3. HTML中用本地相对路径引用：`src="assets/cover.jpg"`
  4. 禁止直接引用外部URL（trae-api-cn / unsplash / pexels等），一律先下载再引用
- 图源优先级: 用户图 > Unsplash > Pexels > Wallhaven > AI生成(trae-api-cn text_to_image)
- 截图用 `.frame-shot` 包壳

### Step 4: Validate — 自检（自动执行，不等待）
截图前自动检查，不通过则自动修复：

**密度检查**：每页活跃构图≥78% | 每页≥3种内容元素 | 纯空白带>216px需理由
**图片检查**：封面1秒说清主题 | 文字未压主体 | 无broken image
**节奏检查**：5页+至少1暗色页 | 暗色页不相邻 | 氛围强弱交替 | 版式不重复
**风格检查**（读 `references/style-system.md`）：
- [ ] 全套风格统一（同一主题色+同一风格）
- [ ] Editorial身份测试：有atmosphere层 + serif标题 + 至少一个magazine结构元素
- [ ] Swiss身份测试：大标题字重≤300 + 无serif + 单一accent + 无卡片阴影
- [ ] 无文字溢出/footer碰撞

### Step 5: Screenshot & Deliver — 截图交付（直接执行）
- 用`assets/screenshot.js`截图（自动检测页面ID，无需手动配置）
  - 用法：先启动`python -m http.server 8090`，然后`node assets/screenshot.js <项目目录>`
  - puppeteer-core + 系统Chrome，deviceScaleFactor:2
  - 等待networkidle0 + fonts.ready + 6秒（确保图片加载）
  - Chrome路径: 自动检测`$env:LOCALAPPDATA\ms-playwright\chromium-*\chrome.exe`
- 文字压缩：保留原话引言+场景描述+核心数据，≤1000字
  - **压缩模板**：标题(1句) → 场景开场(1-2句，含人物/时间/地点) → 核心论点(1-2句) → 关键原话(1-2条，用「」包裹) → 数据支撑(3-5个关键数字) → 结尾原话(1条)
  - **必须保留**：原文中的人物原话（用「」标记）、访谈/会议场景描述、关键数据
  - **可以删减**：过渡句、重复论述、次要细节、纯背景铺垫
- **交付方式：本地文件夹 + 飞书云盘同步**（双通道交付）

  **A. 本地文件夹（首选）**
  1. 在`$env:TEMP`创建`<slug>公众号素材/`文件夹
  2. 将PNG+txt复制到该文件夹
  3. 用`explorer.exe`打开文件夹，用户可拖到桌面

  **B. 飞书云盘同步（手机端访问）**
  1. 用`lark-cli drive +create-folder`创建`<slug>公众号素材`文件夹
  2. cd到output目录，用`lark-cli drive +upload --file <filename> --folder-token <token>`逐个上传PNG+txt
  3. 返回飞书云盘文件夹URL，用户手机飞书App打开即可逐张保存到相册
  4. 注意：lark-cli要求用相对路径，必须先cd到output目录再上传

## 密度铁律（非协商）

1. **活跃构图 ≥78% 画布高度**（≈1123px of 1440px）
2. **4横带密度**：1440px切4段(360px)，每段有内容或主动留白理由
3. **纯空白带 >216px 必须有设计理由**（如atmospheric hero页）
4. **每页至少3种内容元素**（标题+正文+数据/图/引言）
5. **表格/ledger行高不足45%画布时**：加左侧大数字列、加pull quote列、或转M08 Tall Ledger
6. **避免"标题+lead+3行"重复超过2次**

## 节奏铁律（非协商）

1. **明暗节奏**：5页以上组图至少1页暗色页(Midnight Ink)，7页以上至少1-2页。暗色页不是换主题，是同一主题内的明暗对比
2. **暗色页位置**：最佳位置是引言页(Pull Quote)或结尾页(Closing)。2个暗色页不可相邻
3. **氛围节奏**：封面/引言/结尾用强氛围(strong grain+wash)，数据/截图/清单用弱氛围(subtle grain only)。不可所有页同一氛围强度
4. **版式节奏**：不可连续2页用同一种版式骨架。密集ledger后接宽松essay或pull quote
5. **首尾图框**：5页及以上组图，封面和封底都必须有图片背景（满铺图或大图区），形成"书挡"效果。图片必须与主题适配——封面图抓主题，封底图收情绪

## 必读参考文件

| 文件 | 用途 |
|------|------|
| `references/style-system.md` | **风格系统**：Editorial vs Swiss视觉锚点+身份测试+反模式 |
| `references/category-cookbook.md` | **品类路由表**：7个品类的风格/主题/版式/图源映射 |
| `references/content-planning.md` | **内容规划**：压缩阶梯+页面角色+钩子模式+页数指导 |
| `references/portrait-fill.md` | **3:4密度规则**：垂直分区+密度铁律+稀疏页修复 |
| `references/image-overlay.md` | **文字压图**：选图→无遮罩→局部色调→缩略图检查+主体避让 |
| `references/theme-presets.md` | 10套主题色CSS变量 |
| `references/components.md` | 字体/字号/间距/图片容器/卡片/截图容器规范 |
| `references/layout-recipes.md` | 28种布局模板(M01-M16+S01-S12) |
| `references/screenshot-treatment.md` | 截图美化：设备外壳+背景材质+风格默认 |
| `references/image-sources.md` | Pexels/Unsplash/Wallhaven图库接入 |

## 示例

**输入**: SpaceX上市分析MD → 自动推断：商业/科技分析 → Editorial × Indigo Porcelain

**输出**: 7张PNG + spacex-文字稿.txt → `SpaceX公众号素材/` 文件夹

**输入**: skill-forge教程MD+截图文件夹 → 自动推断：教程/工具 → Swiss × IKB Blue

**输出**: 6张PNG + skillforge-文字稿.txt → `skillforge公众号素材/` 文件夹
