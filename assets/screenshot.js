const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

// ── Config ──
const PROJECT = process.argv[2] || '.';
const OUT = path.join(PROJECT, 'output');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

// Auto-detect page IDs from HTML
const HTML_FILE = path.join(PROJECT, 'index.html');
const html = fs.readFileSync(HTML_FILE, 'utf-8');
const pageIds = [...html.matchAll(/id="(xhs-\d+)"/g)].map(m => m[1]);
if (pageIds.length === 0) {
  console.error('No xhs-* IDs found in HTML');
  process.exit(1);
}

const TARGETS = pageIds.map((id, i) => {
  const num = String(i + 1).padStart(1, '0');
  return [`#${id}`, `p${num}.png`];
});

// Find Chrome
const CHROME_PATHS = [
  process.env.CHROME_PATH,
  'C:\\Users\\Administrator\\AppData\\Local\\ms-playwright\\chromium-1208\\chrome-win64\\chrome.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
].filter(Boolean);

const chromePath = CHROME_PATHS.find(p => {
  try { fs.accessSync(p); return true; } catch { return false; }
});

if (!chromePath) {
  console.error('Chrome not found. Set CHROME_PATH env var.');
  process.exit(1);
}

const PORT = process.env.PORT || 8090;

(async () => {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1440, deviceScaleFactor: 2 });

  console.log(`Loading http://localhost:${PORT}/index.html ...`);
  await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  console.log('Waiting 6s for images...');
  await new Promise(r => setTimeout(r, 6000));

  // Verify elements
  const found = await page.evaluate((ids) => {
    return ids.map(id => `${id}: ${!!document.getElementById(id)}`).join(', ');
  }, pageIds);
  console.log('Elements:', found);

  for (const [sel, fname] of TARGETS) {
    const el = await page.$(sel);
    if (!el) { console.error(`NOT FOUND: ${sel}`); continue; }
    const fp = path.join(OUT, fname);
    await el.screenshot({ path: fp, type: 'png' });
    const kb = Math.round(fs.statSync(fp).size / 1024);
    console.log(`OK: ${fname} (${kb}KB)`);
  }

  await browser.close();
  console.log(`Done! ${TARGETS.length} screenshots in ${OUT}`);
})();
