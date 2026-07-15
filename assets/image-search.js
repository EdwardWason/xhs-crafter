#!/usr/bin/env node
// ──────────────────────────────────────────────────────────
// image-search.js — Pexels / Pixabay photo search + download
//   with cross-project dedup via MD5 hash registry
//
// Usage:
//   node assets/image-search.js <projectDir> --cover "AI conference" --finale "future technology" [--interior "data center" ...]
//   node assets/image-search.js <projectDir> --search "AI conference" --count 5
//
// Environment variables (set via User-level env vars):
//   PEXELS_API_KEY  — Pexels API key
//   PIXABAY_API_KEY — Pixabay API key
// ──────────────────────────────────────────────────────────

const https = require('https');
const http  = require('http');
const fs    = require('fs');
const path  = require('path');
const crypto = require('crypto');

// ── Config ──
const PEXELS_KEY  = process.env.PEXELS_API_KEY;
const PIXABAY_KEY = process.env.PIXABAY_API_KEY;

// Global hash registry location (shared across all projects)
// Use xhs-crafter/assets/ dir (sandbox-safe, gitignored)
const REGISTRY_DIR  = path.join(__dirname);
const REGISTRY_FILE = path.join(REGISTRY_DIR, 'image-registry.json');

// ── Hash Registry ──
function loadRegistry() {
  if (!fs.existsSync(REGISTRY_FILE)) return { usedHashes: {} };
  try {
    return JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf-8'));
  } catch {
    return { usedHashes: {} };
  }
}

function saveRegistry(registry) {
  if (!fs.existsSync(REGISTRY_DIR)) fs.mkdirSync(REGISTRY_DIR, { recursive: true });
  fs.writeFileSync(REGISTRY_FILE, JSON.stringify(registry, null, 2));
}

function md5File(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(buf).digest('hex');
}

function isDuplicate(filePath, registry) {
  const hash = md5File(filePath);
  return registry.usedHashes.hasOwnProperty(hash);
}

function registerFile(filePath, registry, meta) {
  const hash = md5File(filePath);
  registry.usedHashes[hash] = {
    file: path.basename(filePath),
    project: meta.project || 'unknown',
    query: meta.query || '',
    role: meta.role || '',
    date: new Date().toISOString().slice(0, 10),
  };
  return hash;
}

// ── HTTP GET (JSON) ──
function httpGet(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const follow = (u, redirects = 0) => {
      if (redirects > 10) return reject(new Error('Too many redirects'));
      mod.get(u, { headers: { 'User-Agent': 'xhs-crafter/1.0', ...headers } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return follow(res.headers.location, redirects + 1);
        }
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`HTTP ${res.statusCode} for ${u}`));
        }
        const chunks = [];
        res.on('data', c => chunks.push(c));
        res.on('end', () => resolve(Buffer.concat(chunks)));
      }).on('error', reject);
    };
    follow(url);
  });
}

async function httpGetJSON(url, headers = {}) {
  const buf = await httpGet(url, headers);
  return JSON.parse(buf.toString('utf-8'));
}

// ── Download file ──
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const follow = (u, redirects = 0) => {
      if (redirects > 10) return reject(new Error('Too many redirects'));
      mod.get(u, { headers: { 'User-Agent': 'xhs-crafter/1.0' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return follow(res.headers.location, redirects + 1);
        }
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`HTTP ${res.statusCode}`));
        }
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => { file.close(); resolve(fs.statSync(dest).size); });
      }).on('error', reject);
    };
    follow(url);
  });
}

// ── Pexels Search ──
async function searchPexels(query, perPage = 5) {
  if (!PEXELS_KEY) {
    console.log('  PEXELS_API_KEY not set, skipping Pexels');
    return [];
  }
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape`;
  try {
    const data = await httpGetJSON(url, { Authorization: PEXELS_KEY });
    return (data.photos || []).map(p => ({
      source: 'pexels',
      id: String(p.id),
      width: p.width,
      height: p.height,
      url: p.src.large2x || p.src.large || p.src.original,
      alt: p.alt || query,
      photographer: p.photographer || '',
    }));
  } catch (err) {
    console.log(`  Pexels search failed: ${err.message}`);
    return [];
  }
}

// ── Pixabay Search ──
async function searchPixabay(query, perPage = 5) {
  if (!PIXABAY_KEY) {
    console.log('  PIXABAY_API_KEY not set, skipping Pixabay');
    return [];
  }
  const url = `https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${encodeURIComponent(query)}&per_page=${perPage}&image_type=photo&orientation=horizontal&min_width=1600&safesearch=true`;
  try {
    const data = await httpGetJSON(url);
    return (data.hits || []).map(h => ({
      source: 'pixabay',
      id: String(h.id),
      width: h.imageWidth,
      height: h.imageHeight,
      url: h.largeImageURL || h.webformatURL,
      alt: h.tags || query,
      photographer: h.user || '',
    }));
  } catch (err) {
    console.log(`  Pixabay search failed: ${err.message}`);
    return [];
  }
}

// ── Combined search with dedup ──
async function searchAndDownload(query, destPath, role, projectDir, maxAttempts = 10) {
  const registry = loadRegistry();
  const assetsDir = path.dirname(destPath);
  if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

  console.log(`\n🔍 Searching for "${query}" (role: ${role})`);

  // Search both sources
  const [pexelsResults, pixabayResults] = await Promise.all([
    searchPexels(query, 8),
    searchPixabay(query, 8),
  ]);

  const allResults = [...pexelsResults, ...pixabayResults];
  console.log(`  Found ${pexelsResults.length} Pexels + ${pixabayResults.length} Pixabay = ${allResults.length} candidates`);

  if (allResults.length === 0) {
    console.error(`  ❌ No results from any source for "${query}"`);
    return null;
  }

  // Try each result until we find a non-duplicate
  for (let i = 0; i < Math.min(allResults.length, maxAttempts); i++) {
    const result = allResults[i];
    const tmpPath = path.join(assetsDir, `_tmp_${result.source}_${result.id}.jpg`);

    try {
      console.log(`  ↓ Downloading ${result.source}/${result.id}...`);
      const size = await downloadFile(result.url, tmpPath);

      if (size < 10240) {
        console.log(`  ✗ Too small (${size}B), skipping`);
        try { fs.unlinkSync(tmpPath); } catch {}
        continue;
      }

      // Check dedup
      const hash = md5File(tmpPath);
      if (registry.usedHashes.hasOwnProperty(hash)) {
        const prev = registry.usedHashes[hash];
        console.log(`  ✗ Duplicate of ${prev.project}/${prev.file} (${prev.date}), skipping`);
        try { fs.unlinkSync(tmpPath); } catch {}
        continue;
      }

      // Valid and unique — move to final destination
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      fs.renameSync(tmpPath, destPath);

      // Register
      registerFile(destPath, registry, {
        project: path.basename(projectDir),
        query,
        role,
      });
      saveRegistry(registry);

      const kb = Math.round(size / 1024);
      console.log(`  ✅ Saved ${path.basename(destPath)} (${kb}KB) from ${result.source}/${result.id}`);
      return destPath;

    } catch (err) {
      console.log(`  ✗ Download failed: ${err.message}`);
      try { fs.unlinkSync(tmpPath); } catch {}
    }
  }

  console.error(`  ❌ All ${Math.min(allResults.length, maxAttempts)} candidates were duplicates or failed`);
  return null;
}

// ── CLI ──
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log('Usage:');
    console.log('  node image-search.js <projectDir> --cover "query" --finale "query" [--interior1 "query" ...]');
    console.log('  node image-search.js <projectDir> --search "query" --count 5');
    console.log('');
    console.log('Environment:');
    console.log('  PEXELS_API_KEY  — Pexels API key');
    console.log('  PIXABAY_API_KEY — Pixabay API key');
    console.log('');
    console.log('Registry: ' + REGISTRY_FILE);
    process.exit(1);
  }

  const projectDir = path.resolve(args[0]);
  const assetsDir = path.join(projectDir, 'assets');
  if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

  // Parse named args
  const namedArgs = {};
  let i = 1;
  while (i < args.length) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      const val = args[i + 1];
      if (val && !val.startsWith('--')) {
        namedArgs[key] = val;
        i += 2;
      } else {
        i++;
      }
    } else {
      i++;
    }
  }

  console.log('═'.repeat(50));
  console.log('xhs-crafter Image Search');
  console.log('═'.repeat(50));
  console.log(`Project: ${projectDir}`);
  console.log(`Pexels:  ${PEXELS_KEY ? '✓ configured' : '✗ not set'}`);
  console.log(`Pixabay: ${PIXABAY_KEY ? '✓ configured' : '✗ not set'}`);
  console.log(`Registry: ${REGISTRY_FILE}`);

  const registry = loadRegistry();
  const hashCount = Object.keys(registry.usedHashes || {}).length;
  console.log(`Previously used images: ${hashCount}`);
  console.log('═'.repeat(50));

  // --search mode: download N images with sequential naming
  if (namedArgs.search) {
    const count = parseInt(namedArgs.count) || 5;
    console.log(`\nSearch mode: "${namedArgs.search}" × ${count}`);

    const [pexelsResults, pixabayResults] = await Promise.all([
      searchPexels(namedArgs.search, count + 5),
      searchPixabay(namedArgs.search, count + 5),
    ]);

    const allResults = [...pexelsResults, ...pixabayResults];
    console.log(`Found ${allResults.length} candidates, need ${count} unique`);

    let downloaded = 0;
    for (const result of allResults) {
      if (downloaded >= count) break;

      const destPath = path.join(assetsDir, `cand${downloaded + 1}.jpg`);
      const tmpPath = path.join(assetsDir, `_tmp_${result.source}_${result.id}.jpg`);

      try {
        const size = await downloadFile(result.url, tmpPath);
        if (size < 10240) { try { fs.unlinkSync(tmpPath); } catch {} continue; }

        const hash = md5File(tmpPath);
        if (registry.usedHashes.hasOwnProperty(hash)) {
          console.log(`  ✗ Duplicate, skipping ${result.source}/${result.id}`);
          try { fs.unlinkSync(tmpPath); } catch {}
          continue;
        }

        if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
        fs.renameSync(tmpPath, destPath);

        registerFile(destPath, registry, {
          project: path.basename(projectDir),
          query: namedArgs.search,
          role: `candidate-${downloaded + 1}`,
        });

        downloaded++;
        console.log(`  ✅ cand${downloaded}.jpg (${Math.round(size / 1024)}KB) from ${result.source}/${result.id}`);
      } catch (err) {
        try { fs.unlinkSync(tmpPath); } catch {}
      }
    }

    saveRegistry(registry);
    console.log(`\nDownloaded ${downloaded}/${count} unique images`);
    return;
  }

  // Named role mode: --cover, --finale, --interior1, etc.
  const roleMap = {
    cover: 'cover.jpg',
    finale: 'finale.jpg',
  };

  const results = {};
  for (const [key, query] of Object.entries(namedArgs)) {
    if (key === 'count') continue;
    const filename = roleMap[key] || `${key}.jpg`;
    const destPath = path.join(assetsDir, filename);
    const result = await searchAndDownload(query, destPath, key, projectDir);
    results[key] = result ? '✅' : '❌';
  }

  console.log('\n' + '═'.repeat(50));
  console.log('Summary:');
  for (const [key, status] of Object.entries(results)) {
    console.log(`  ${key}: ${status}`);
  }
  console.log('═'.repeat(50));
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
