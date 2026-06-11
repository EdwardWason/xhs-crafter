/**
 * xhs-crafter 自动验证脚本
 * 检查 9 项规则，FAIL 阻止交付，WARN 为建议
 *
 * 用法：node validate.js <项目目录>
 *   项目目录需包含 index.html 和 output/ 目录
 */

const fs = require('fs');
const path = require('path');

const PROJECT = process.argv[2] || '.';
const HTML_FILE = path.join(PROJECT, 'index.html');
const OUT_DIR = path.join(PROJECT, 'output');

let failCount = 0;
let warnCount = 0;

function fail(rule, msg) {
  console.log(`FAIL [${rule}]: ${msg}`);
  failCount++;
}

function warn(rule, msg) {
  console.log(`WARN [${rule}]: ${msg}`);
  warnCount++;
}

function pass(rule, msg) {
  console.log(`PASS [${rule}]: ${msg}`);
}

if (!fs.existsSync(HTML_FILE)) {
  console.error(`HTML not found: ${HTML_FILE}`);
  process.exit(1);
}

const html = fs.readFileSync(HTML_FILE, 'utf-8');

// ── R1: Overflow check — no element should extend beyond poster ──
// Check for suspiciously long text blocks without line-break
const longLines = html.match(/>[^<]{200,}</g);
if (longLines && longLines.length > 0) {
  warn('R1', `${longLines.length} text blocks >200 chars without HTML break — may overflow`);
} else {
  pass('R1', 'No suspiciously long text blocks');
}

// ── R2: Footer collision — issue-strip should not overlap content ──
const footers = (html.match(/class="foot"/g) || []).length;
const posters = (html.match(/class="poster/g) || []).length;
if (footers < posters) {
  warn('R2', `Only ${footers} footers for ${posters} posters — some pages may have footer collision`);
} else {
  pass('R2', `All ${posters} pages have footers`);
}

// ── R3: Swiss bold display — Swiss template should not use font-weight >300 for display ──
const isSwiss = html.includes('template-swiss') || html.includes('data-accent');
if (isSwiss) {
  const boldDisplay = html.match(/font-weight:\s*(600|700|800|900)/g);
  if (boldDisplay) {
    fail('R3', `Swiss template uses bold display (${boldDisplay.length} instances) — max 300 for large titles`);
  } else {
    pass('R3', 'Swiss display weights are ≤300');
  }
} else {
  pass('R3', 'Not Swiss template, skipped');
}

// ── R4: Minimum font size — no text below 18px ──
const smallFonts = html.match(/font-size:\s*(1[0-7]px)/g);
if (smallFonts) {
  fail('R4', `Font sizes below 18px found: ${smallFonts.join(', ')} — minimum is 18px`);
} else {
  pass('R4', 'All font sizes ≥18px');
}

// ── R5: 4-band density — each page should have content in all 4 vertical bands ──
// Simplified: check that no page has less than 3 content elements
const pageIds = [...html.matchAll(/id="(xhs-\d+)"/g)].map(m => m[1]);
const sparsePages = [];
for (const id of pageIds) {
  const pageMatch = html.match(new RegExp(`id="${id}"[\\s\\S]*?<\\/section>`));
  if (pageMatch) {
    const pageContent = pageMatch[0];
    // Count distinct content elements (h1, h2, p, div with classes)
    const elements = (pageContent.match(/<(h[1-6]|p|blockquote|div class="[^"]*stat|div class="[^"]*ledger|div class="[^"]*pipeline|div class="[^"]*layer)/g) || []).length;
    if (elements < 3) {
      sparsePages.push(`${id} (${elements} elements)`);
    }
  }
}
if (sparsePages.length > 0) {
  warn('R5', `Sparse pages (<3 content elements): ${sparsePages.join(', ')}`);
} else {
  pass('R5', 'All pages have ≥3 content elements');
}

// ── R6: h-xl line caps — h-xl titles should not exceed 2 lines ──
const hxlMatches = [...html.matchAll(/class="h-xl"[^>]*>([^<]*(?:<br[^>]*>[^<]*)*)/g)];
const longTitles = [];
for (const match of hxlMatches) {
  const lineBreaks = (match[1].match(/<br/g) || []).length;
  if (lineBreaks >= 2) {
    longTitles.push(match[1].substring(0, 40).replace(/<[^>]*>/g, ''));
  }
}
if (longTitles.length > 0) {
  warn('R6', `h-xl titles with ≥3 lines: ${longTitles.length} — max 2 line breaks recommended`);
} else {
  pass('R6', 'All h-xl titles ≤2 lines');
}

// ── R7: Browser-default figure margin drift ──
const hasFigureReset = html.includes('figure { margin: 0') || html.includes('figure{margin:0');
if (!hasFigureReset) {
  fail('R7', 'Missing figure { margin: 0 } reset — browser defaults will add spacing');
} else {
  pass('R7', 'Figure margin reset present');
}

// ── R8: Title consistency — content pages must use same title class ──
// Find all poster divs and check their h-xl/h-md/h-display usage
const posterBlocks = [...html.matchAll(/class="poster[^"]*"[^>]*id="([^"]*)"[^>]*>([\s\S]*?)(?=<div class="poster|$)/g)];
const contentTitleClasses = [];
for (const match of posterBlocks) {
  const pageId = match[1];
  const pageContent = match[2];
  // Skip cover (p1/xhs-1) and finale (last page)
  const pageNum = parseInt(pageId.replace(/xhs-|p/g, ''));
  const totalPages = posterBlocks.length;
  if (pageNum === 1 || pageNum === totalPages) continue;
  // Find the first major heading class
  const hMatch = pageContent.match(/class="(h-xl|h-md|h-display|h-hero|h-statement)"/);
  if (hMatch) {
    contentTitleClasses.push({ page: pageId, cls: hMatch[1] });
  }
}
const uniqueClasses = [...new Set(contentTitleClasses.map(t => t.cls))];
if (uniqueClasses.length > 1) {
  const details = contentTitleClasses.map(t => `${t.page}=${t.cls}`).join(', ');
  fail('R8', `Content pages use mixed title classes: ${details} — all content pages must use the same class (h-xl for Editorial, h-xl for Swiss)`);
} else if (contentTitleClasses.length > 0) {
  pass('R8', `All ${contentTitleClasses.length} content pages use consistent title class: ${uniqueClasses[0]}`);
} else {
  pass('R8', 'No content page titles found (skipped)');
}

// ── R9: Hero title color — cover/finale must not use #ece2cf ──
const heroSections = [...html.matchAll(/class="hero-content"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g)];
let badHeroColor = false;
for (const hero of heroSections) {
  const heroHtml = hero[0];
  // Check for #ece2cf in color or inline styles within hero-content
  if (heroHtml.includes('#ece2cf') || heroHtml.includes('color: #ece2cf')) {
    badHeroColor = true;
    break;
  }
  // Also check if h-display/h-xl inside hero-content lacks #ffffff
  const heroHeadings = heroHtml.match(/class="h-(display|xl)"[^>]*style="[^"]*color:\s*([^;"]+)/g);
  if (heroHeadings) {
    for (const h of heroHeadings) {
      if (h.includes('#ece2cf') || h.includes('ece2cf')) {
        badHeroColor = true;
        break;
      }
    }
  }
}
if (badHeroColor) {
  fail('R9', 'Hero-content headings use #ece2cf — must use #ffffff + text-shadow for readability on background images');
} else {
  pass('R9', 'Hero-content heading colors are safe (no #ece2cf detected)');
}

// ── Screenshot size check ──
if (fs.existsSync(OUT_DIR)) {
  const pngs = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.png'));
  for (const png of pngs) {
    const size = fs.statSync(path.join(OUT_DIR, png)).size;
    const kb = Math.round(size / 1024);
    const isFirst = png.includes('p1') || png.includes('cover');
    const isLast = png.includes('p9') || png.includes('finale');
    if ((isFirst || isLast) && kb < 500) {
      warn('SIZE', `${png}: ${kb}KB — cover/finale should be >500KB (background image may not have rendered)`);
    }
  }
}

// ── Summary ──
console.log('\n' + '='.repeat(50));
console.log(`Results: ${failCount} FAIL, ${warnCount} WARN`);
if (failCount > 0) {
  console.log('❌ Fix FAIL items before delivery.');
  process.exit(1);
} else if (warnCount > 0) {
  console.log('⚠️  WARN items are advisory — review recommended.');
  process.exit(0);
} else {
  console.log('✅ All checks passed.');
  process.exit(0);
}
