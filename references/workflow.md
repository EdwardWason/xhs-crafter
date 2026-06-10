# XHS Crafter 工作流详细参考

## 完整流程

```
MD文章输入
  ↓ 1. 内容分析 & 拆分
  ↓ 2. 调用 frontend-skill 设计排版
  ↓ 3. 生成多个3:4 HTML页面
  ↓ 4. 文字压缩(<=1000字)
  ↓ 5. Puppeteer截图为PNG
  ↓ 6. 打包zip交付
```

## Step 1: 内容分析 & 拆分

- 读取MD文章，识别章节结构
- 确定页面数量：封面1页 + 每个核心章节1页 + 终章1页
- 每页分配内容，确保信息密度与原文一致
- 封面页：标题 + 副标题 + 视觉背景 + 元信息
- 内容页：章节标题 + 核心论点 + 关键引言 + 数据网格
- 终章页：收束总结 + 点睛引言

## Step 2: frontend-skill 排版设计

调用 frontend-skill 时，遵循其设计原则：
- Visual thesis: 一句话描述风格
- Content plan: 每页一个核心任务
- Interaction thesis: 静态页面无需动效，但保持视觉层次

设计约束（3:4卡片模式，不同于长页面）：
- 固定尺寸 1080x1440px
- overflow:hidden，无滚动
- 字号放大：正文24px，标题48-56px，数据44-56px
- 内边距 72px
- 数据网格用 2列 或 2x2 布局

## Step 3: HTML页面生成

每个HTML文件独立完整，包含：
- 内联CSS（不依赖外部样式表）
- Google Fonts @import
- 图片使用 `<img>` 标签（非CSS background-image）
- 固定宽高：`html,body{width:1080px;height:1440px;overflow:hidden}`

文件命名：`p1-cover.html`, `p2-opening.html`, ..., `pN-finale.html`

## Step 4: 文字压缩

压缩规则：
- 保留每章1个核心论点 + 1个关键引言
- 删除过渡句、解释性文字、重复表述
- 数据由图片承载，文字中不重复
- 章节标题作为骨架
- 目标：<=1000字
- 输出为 UTF-8 编码的 txt 文件

## Step 5: Puppeteer截图

### 依赖
- puppeteer-core（不下载Chromium）
- 系统已安装的 Chrome 或 Chromium

### Chrome路径检测
1. 注册表：`HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe`
2. Fallback：`$env:LOCALAPPDATA\ms-playwright\chromium-*\chrome-win64\chrome.exe`
3. Fallback：`C:\Program Files\Google\Chrome\Application\chrome.exe`

### 截图参数
- viewport: 1080x1440
- deviceScaleFactor: 2（2倍清晰度）
- 等待策略：networkidle0 + document.fonts.ready + 额外3秒
- 输出格式：PNG
- clip: {x:0, y:0, width:1080, height:1440}

### 截图脚本模板
```javascript
const puppeteer = require('puppeteer-core');
const browser = await puppeteer.launch({
  headless: 'new',
  executablePath: '<detected-chrome-path>',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
});
const page = await browser.newPage();
await page.setViewport({ width: 1080, height: 1440, deviceScaleFactor: 2 });
await page.goto('file:///path/to/page.html', { waitUntil: 'networkidle0', timeout: 30000 });
await page.evaluate(() => document.fonts.ready);
await new Promise(r => setTimeout(r, 3000)); // 等待外部图片
await page.screenshot({ path: 'output.png', type: 'png', clip: {x:0,y:0,width:1080,height:1440} });
```

## Step 6: 打包交付

- 所有PNG + txt文字稿打包为zip
- zip命名：`<主题>公众号素材.zip`
- 存放位置：用户桌面
- PowerShell命令：`Compress-Archive -Path <files> -DestinationPath "$env:USERPROFILE\Desktop\<name>.zip" -Force`

## 封面背景图问题修复

**问题**：CSS background-image 在 Puppeteer headless 模式下可能不加载外部图片。

**解决方案**：
- 使用 `<img>` 标签替代 CSS background-image
- 用绝对定位 + object-fit:cover 实现全屏背景效果
- 截图前等待 networkidle0 + 3秒缓冲

```html
<!-- 正确做法 -->
<div style="position:relative;width:1080px;height:1440px;overflow:hidden">
  <img src="https://..." style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:brightness(0.3)" />
  <div style="position:absolute;inset:0;background:linear-gradient(...)"></div>
  <div style="position:relative;z-index:2">内容</div>
</div>

<!-- 错误做法（可能不加载） -->
<div style="background-image:url('https://...')">内容</div>
```
