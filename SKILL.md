---
name: "xhs-crafter"
description: "将MD文章排版为3:4比例的精美图片+压缩文字稿，用于公众号/小红书贴图发布。核心能力是本地MD→HTML→PNG渲染，可选能力是飞书云盘同步（需用户明确同意）。Invoke when用户要排版文章为图片、生成公众号贴图、小红书图文、文章转图片卡片。Do NOT use for原创写作、纯文字排版、视频制作。"
slug: "xhs-crafter"
displayName: "XHS Crafter"
version: "7.4.0"
summary: "将MD文章排版为3:4比例精美图片+压缩文字稿，用于公众号/小红书贴图发布"
license: "MIT-0"
---

# XHS Crafter — 文章转图片卡片

## 任务
将用户提供的MD文章内容，排版为多张3:4比例(1080×1440)的精美HTML页面，截图为PNG，压缩为≤1000字文字稿，文件夹交付。不做原创写作，不做视频，不做纯文字排版。

## 隐私与数据流声明（用户须知）

**本技能的数据流边界**：
- **本地处理（默认）**：MD文本→HTML组装→PNG截图→本地文件夹交付。所有文章内容、图片素材、生成产物默认仅在本地处理，不上传任何外部服务
- **可选外部能力（需用户明确同意）**：
  - 图片搜索：调用Pexels/Pixabay API搜索免费图库照片（仅搜索词和图片下载，不上传文章内容）
  - 飞书云盘同步：将生成PNG+文字稿上传到用户飞书云盘（需用户明确同意，且文章内容可能包含未发布素材）
- **外部网络依赖**：HTML模板引用Google Fonts（字体加载），中国大陆可能无法访问，影响渲染效果但不影响功能

**用户警告**：
- ⚠️ 如果文章包含未发布/敏感/专有内容，请谨慎使用飞书云盘同步功能——上传即意味着内容离开本地
- ⚠️ 图片搜索会将搜索关键词发送到Pexels/Pixabay服务器，但不会发送文章原文
- ⚠️ 飞书云盘同步需要用户已登录lark-cli，且目标文件夹由用户飞书账号持有

**权限声明**：

| 能力类别 | 是否使用 | 说明 |
|---------|---------|------|
| 网络访问 | ✅ | Google Fonts 字体加载（默认）；Pexels/Pixabay API 图片搜索（可选，需用户同意）；飞书云盘上传（可选，需用户同意） |
| 文件读写 | ✅ | 读 MD 文章 + 模板；写 output/ 目录 PNG+txt；写 `$env:TEMP` 交付文件夹；写 `assets/image-registry.json` 去重注册表 |
| 环境变量 | ✅ | `PEXELS_API_KEY`、`PIXABAY_API_KEY`（图库搜索，可选）；`CHROME_PATH`（可选，浏览器路径） |
| subprocess | ✅ | `python -m http.server`（本地回环 127.0.0.1，截图用）；`node assets/screenshot.js`；`node assets/validate.js`；`explorer.exe`（打开交付文件夹） |
| 外部 API | ✅ | Pexels/Pixabay 图片搜索 API（可选）；飞书 lark-cli drive API（可选云盘同步）；trae-api-cn.mchost.guru AI 生图（仅限 TRAE 内部环境） |

## 输出格式

```
<桌面>/<slug>公众号素材/
├── p1-cover.png
├── p2-xxx.png
├── ...
├── pN-finale.png
└── <slug>-文字稿.txt   # ≤1000字压缩文字
```

## 工作流：5步（默认本地全自动，外部能力需用户同意）

**核心原则**：用户给MD，直接出本地文件夹。Step 1-2在脑内完成（不输出长文规划），Step 3-5连续执行不等待用户确认。

**外部能力同意门控**（3道，仅在触发外部网络/云盘时询问，本地渲染不询问）：
1. **图片搜索门控**（Step 1，用户无图且需背景图时）：询问是否调用Pexels/Pixabay API搜索
2. **飞书同步门控**（Step 5，本地交付完成后）：询问是否上传到飞书云盘
3. **若用户明确说"按流程走一遍"或"全流程"**：视为同时授权图片搜索+飞书同步，不再逐项询问

### Step 1: Intake — 识别品类（脑内完成，不输出）
从MD内容自动推断：
- **内容品类**: 读 `references/category-cookbook.md` 路由。13个品类：商业/科技分析、职场/干货、旅行/生活方式、教程/工具、影视/读书、游戏、美食、彩妆、穿搭、家居、健身、情感、推荐。超出范围的品类（梦核/氛围感装饰风、Y2K/千禧辣妹、纯摄影展示）必须在设计前明确告知用户
- **目标平台**: 默认小红书3:4（除非用户指定公众号）
- **用户图片**: (a)用户指定截图文件夹路径；(b)解析MD中 `![描述](路径)` 和 `[🖼️配图建议：xxx]` 标记
- **图片三选一门控**（仅在用户无图时触发，一次性提问不反复追问）：
  ```
  这篇我需要 1-2 张图。三种走法：
  A. 你自己有照片/截图，传给我（推荐——最不"AI感"，完全本地处理）
  B. 我去 Pexels/Pixabay 帮你找（⚠️ 会将搜索词发送到外部API，但不上传文章原文）
  C. 用 AI 生成
  ```
  推荐 A，但接受用户任何选择（包括"都行你看着办"），不再追问
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

**字号速查表（必须严格遵循，不得自行调整）**：

| Role | Class | Size | Weight | Family | 用途 |
|------|-------|------|--------|--------|------|
| Display | `.h-display` | 136px | 500 | serif-zh | 封面/封底主标题 |
| Section title | `.h-xl` | 110px | 500 | serif-zh | 内容页主标题（必须统一） |
| Mid title | `.h-md` | 60px | 500 | serif-zh | 次级标题/数据页标题 |
| Subtitle | `.h-sub` | 46px | 400 italic | serif-en | 英文副标题 |
| Pull quote | `.pullquote` | 80px | 500 italic | serif-zh | 引言页大字引语 |
| Lead | `.lead` | 34px | 400 | serif-zh | 导语/段落首句 |
| Body | `.body` | 32px | 400 | serif-zh | 正文段落 |
| Kicker | `.kicker` | 26px | 500 | mono | 页面顶部标签 |
| Meta | `.meta` | 24px | 500 | mono | 页面底部注释 |
| Label | `.label` | 24px | 500 | mono | 数据标签 |
| Stat number | `.stat-nb` | 72px | 500 | serif-zh | 大数字 |
| Step title | `.step-title` | 34px | 500 | serif-zh | 流程步骤标题 |
| Step desc | `.step-desc` | 28px | 400 | serif-zh | 流程步骤描述 |
| Ledger title | `.ledger-title` | 30px | 500 | serif-zh | 表格行标题 |
| 辅助文字 | — | 22px | 500 | mono | stat-label/stat-unit/ledger-note/step-nb/callout-src/issue-strip |

**字号铁律**：
1. **内容页主标题必须统一用 `.h-xl` 110px**——不得混用 `.h-md`，标题太长拆行而非降级
2. **封面/封底主标题用 `.h-display` 136px**——比内容页大24%，形成"书挡"层级
3. **满铺图页标题颜色必须 `#ffffff` + `text-shadow`**——禁止 `#ece2cf`（与暖调背景太接近）
4. **字重"越大越轻"**：≥110px用500，60-80px用500，32-46px用400，24-26px用500
5. **任何文字不得低于18px**

**节奏速查表（必须严格遵循）**：

| 规则 | 要求 | 违反后果 |
|------|------|---------|
| 暗色页数量 | 5页+至少1页Midnight Ink，7页+至少1-2页 | 全light=单调 |
| 暗色页位置 | 引言页或结尾页最佳 | 中间也行，但不可相邻 |
| 暗色页相邻 | 禁止！2个暗色页必须隔至少1个light页 | 相邻=对比抵消 |
| 氛围强度 | 封面/引言/封底=strong，数据/清单=subtle，正文=medium | 全同一强度=死板 |
| 版式重复 | 禁止连续2页用同一种版式骨架 | 密集ledger后接宽松essay |
| 首尾图框 | 5页+封面和封底都必须有图片背景 | 无图=缺"书挡" |
| 连续同色 | 连续3页相同主题色=P0错误 | 第3页必须插入暗色/氛围变化 |

**密度速查表（必须严格遵循）**：

| 规则 | 要求 |
|------|------|
| 活跃构图 | ≥78%画布高度（≈1123px of 1440px） |
| 4横带密度 | 1440px切4段(360px)，每段有内容或主动留白理由 |
| 纯空白带 | >216px必须有设计理由（如atmospheric hero页） |
| 最少元素 | 每页至少3种内容元素（标题+正文+数据/图/引言） |
| 表格行高 | 不足45%画布时加左侧大数字列或转M08 Tall Ledger |
| 重复模式 | 避免"标题+lead+3行"重复超过2次 |

**图片规则速查（必须严格遵循）**：

| 规则 | 要求 |
|------|------|
| 图片下载 | 必须下载到本地`assets/`，禁止引用外部URL |
| 唯一性验证 | 下载后用`buf1.equals(buf2)`验证，相同则换源 |
| 跨项目去重 | 用`image-search.js`自动MD5去重，registry在脚本同目录的`image-registry.json`（由`__dirname`解析，与`screenshot.js`同级） |
| 满铺图页 | 选图→无遮罩构图→局部色调遮罩→缩略图检查 |
| 满铺图标题色 | 必须`#ffffff`+`text-shadow`，禁止`#ece2cf` |
| 主体感知裁切 | 根据`object-position`确保主体完整可见 |
| 截图展示 | 用`.frame-shot`包壳，给45-65%页面高度 |
| 图源优先级 | 用户图>Pexels/Pixabay(API)>Unsplash>Wallhaven>AI生成 |
| accent面积 | Swiss≤30%，Lemon Green≤20% |

- **封面/封底图片搜索（优先使用 `image-search.js`）**：
  1. 环境变量：`PEXELS_API_KEY` + `PIXABAY_API_KEY`（已配置为User级环境变量）
  2. 用法：`node assets/image-search.js <项目目录> --cover "搜索词" --finale "搜索词"`
  3. 也可搜索候选图：`node assets/image-search.js <项目目录> --search "搜索词" --count 5`
  4. 脚本自动：Pexels+Pixabay双源搜索→下载→MD5去重→注册到脚本同目录的`image-registry.json`（由`__dirname`解析）
  5. 去重机制：跨项目MD5哈希比对，已用过的图片自动跳过，长期使用不会重复
  6. **API Key安全**：环境变量存储，不写入代码/配置文件，.gitignore排除.env和.xhs-crafter/
- **满铺图页必须遵循 `references/image-overlay.md`**：选图→无遮罩构图→局部色调遮罩→缩略图检查
- **密度保障**：每页活跃构图≥78%画布高度，读 `references/portrait-fill.md`
- **节奏保障**：暗色页插入、氛围强弱交替、版式不重复
- **背景系统**：Editorial 必须使用三层背景（paper→wash→grain），禁止纯平背景。读 `references/background-systems.md`。氛围强度按页面角色分级：封面/引言/封底用 strong，数据/清单用 subtle
- **图片必须下载到本地**（关键！Puppeteer headless无法可靠加载外部API图片）：
  1. 用`image-search.js`搜索并下载到项目`assets/`目录（自动去重）
  2. 或手动用curl下载：`curl.exe -L -o "assets/cover.jpg" "URL"`
  3. HTML中用本地相对路径引用：`src="assets/cover.jpg"`
  4. 禁止直接引用外部URL（trae-api-cn.mchost.guru 仅限TRAE内部环境可用 / unsplash / pexels等），一律先下载再引用
- **图片下载后必须验证唯一性**：
  1. `image-search.js`已内置MD5去重，自动跳过已用图片
  2. 手动下载时仍需`buf1.equals(buf2)`验证
  3. 如果两张图完全相同，换用其他图源
  4. 禁止假设URL不同=内容不同
- 图源优先级: 用户图 > Pexels/Pixabay(API搜索) > Unsplash(直链) > Wallhaven > AI生成(trae-api-cn.mchost.guru text_to_image，仅限TRAE内部环境)
- 截图用 `.frame-shot` 包壳

### Step 4: Validate — 自检（自动执行，不等待）
截图前自动检查，不通过则自动修复：

**密度检查**：每页活跃构图≥78% | 每页≥3种内容元素 | 纯空白带>216px需理由
**图片检查**：封面1秒说清主题 | 文字未压主体 | 无broken image | **多张背景图文件内容不同（buf1.equals(buf2)===false）**
**标题一致性检查**：所有内容页主标题使用同一字号class | 不得混用.h-xl和.h-md | 封面允许更大字号
**节奏检查**：5页+至少1暗色页 | 暗色页不相邻 | 氛围强弱交替 | 版式不重复
**风格检查**（读 `references/style-system.md`）：
- [ ] 全套风格统一（同一主题色+同一风格）
- [ ] Editorial身份测试：有atmosphere层 + serif标题 + 至少一个magazine结构元素
- [ ] Swiss身份测试：大标题字重≤300 + 无serif + 单一accent + 无卡片阴影
- [ ] 无文字溢出/footer碰撞

**自动验证**（读 `assets/validate.js`）：
- 运行 `node assets/validate.js <项目目录>` 执行 12 项自动检查
- R1 溢出检查 / R2 footer碰撞 / R3 Swiss粗体 / R4 最小字号 / R5 4横带密度 / R6 h-xl换行 / R7 figure margin / R8 标题一致性 / R9 满铺图页标题颜色 / R10 暗色页节奏 / R11 accent面积 / R12 封面封底图背景
- FAIL 项必须修复后才能交付，WARN 项为建议

### Step 5: Screenshot & Deliver — 截图交付（直接执行）
- 用`assets/screenshot.js`截图（自动检测页面ID，无需手动配置）
  - 用法：先启动`python -m http.server 8090 --bind 127.0.0.1`（绑定本地回环，不暴露局域网），然后`node assets/screenshot.js <项目目录>`
  - puppeteer-core + 系统Chrome，deviceScaleFactor:2
  - 等待networkidle0 + fonts.ready + 6秒（确保图片加载）
  - Chrome路径: 自动检测`$env:LOCALAPPDATA\ms-playwright\chromium-*\chrome.exe`
- **截图大小异常检测**（关键！文件过小说明图片未渲染）：
  - 带背景图的页面（封面/封底）PNG应 >1MB（2x分辨率下）
  - 纯文字页面 PNG 通常 800KB-1.5MB
  - 如果封面/封底截图 <500KB，大概率背景图未渲染，需检查图片文件是否有效
- 文字压缩：保留原话引言+场景描述+核心数据，≤1000字
  - **压缩模板**：标题(1句) → 场景开场(1-2句，含人物/时间/地点) → 核心论点(1-2句) → 关键原话(1-2条，用「」包裹) → 数据支撑(3-5个关键数字) → 结尾原话(1条)
  - **必须保留**：原文中的人物原话（用「」标记）、访谈/会议场景描述、关键数据
  - **可以删减**：过渡句、重复论述、次要细节、纯背景铺垫
- **交付方式：本地文件夹（默认）+ 飞书云盘同步（可选，需用户同意）**

  **A. 本地文件夹（默认，无需询问）**
  1. 在`$env:TEMP`创建`<slug>公众号素材/`文件夹
  2. 将PNG+txt复制到该文件夹
  3. 用`explorer.exe`打开文件夹，用户可拖到桌面
  4. 完成本地交付后，**询问是否上传到飞书云盘**（不主动执行）

  **B. 飞书云盘同步（可选，需用户明确同意——见下方门控）**
  > ⚠️ **数据外发提示**：上传会将文章相关PNG和文字稿传输到飞书云服务器，离开本地环境。如果文章包含未发布/敏感/专有内容，请勿启用。需要用户已登录lark-cli。

  **飞书同步同意门控**（仅在本地交付完成后触发一次）：
  ```
  本地文件夹已交付。是否需要同步到飞书云盘？
  - 是 → 执行下方上传步骤
  - 否 → 结束（本地文件夹已是完整交付物）
  ```

  **用户同意后执行**：
  1. 用`lark-cli drive +create-folder`创建`<slug>公众号素材`文件夹
  2. cd到output目录，用`lark-cli drive +upload --file <filename> --folder-token <token>`逐个上传PNG+txt
  3. 返回飞书云盘文件夹URL，用户手机飞书App打开即可逐张保存到相册
  4. 注意：lark-cli要求用相对路径，必须先cd到output目录再上传

## 标题一致性铁律（非协商）

1. **内容页主标题统一字号**：所有内容页（P02-P08）的主标题必须使用同一个 class（Editorial 用 `.h-xl` 110px，Swiss 用 `.h-xl` 128px）
2. **封面允许更大字号**：封面用 `.h-display`（Editorial 136px）或 `.h-hero`/`.h-statement`（Swiss）
3. **通过拆行适配而非降级字号**：标题太长时拆为两行，太短时加副标题增加视觉重量，不得降级到 `.h-md`
4. **不得混用不同级别标题 class**：同一套卡片中，内容页主标题不得混用 `.h-xl` 和 `.h-md`

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
6. **连续3页相同主题=P0错误**：连续3页以上使用相同主题色（全light或全dark）视为严重错误，必须在第3页插入暗色页或氛围变化页

## 必读参考文件

| 文件 | 用途 |
|------|------|
| `references/style-system.md` | **风格系统**：Editorial vs Swiss视觉锚点+身份测试+反模式 |
| `references/category-cookbook.md` | **品类路由表**：13个品类的风格/主题/版式/图源映射 |
| `references/content-planning.md` | **内容规划**：压缩阶梯+页面角色+钩子模式+页数指导 |
| `references/portrait-fill.md` | **3:4密度规则**：垂直分区+密度铁律+稀疏页修复 |
| `references/image-overlay.md` | **文字压图**：选图→无遮罩→局部色调→缩略图检查+主体避让 |
| `references/theme-presets.md` | 10套主题色CSS变量 |
| `references/components.md` | 字体/字号/间距/图片容器/卡片/截图容器规范 |
| `references/layout-recipes.md` | 28种布局模板(M01-M16+S01-S12) |
| `references/screenshot-treatment.md` | 截图美化：设备外壳+背景材质+风格默认 |
| `references/background-systems.md` | **背景系统**：三层架构（paper→wash→grain）+ 氛围强度分级 + 满铺图页 + Swiss极简 |
| `references/image-sources.md` | Pexels/Unsplash/Wallhaven图库接入 + AI生图验证规则 |

## 示例

**输入**: SpaceX上市分析MD → 自动推断：商业/科技分析 → Editorial × Indigo Porcelain

**输出**: 7张PNG + spacex-文字稿.txt → `SpaceX公众号素材/` 文件夹

**输入**: skill-forge教程MD+截图文件夹 → 自动推断：教程/工具 → Swiss × IKB Blue

**输出**: 6张PNG + skillforge-文字稿.txt → `skillforge公众号素材/` 文件夹
