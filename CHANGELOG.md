# Changelog

All notable changes to this project will be documented in this file.

## [7.1.1] - 2026-06-11

### Changed
- Embedded font size cheat sheet (15-level type scale) directly in SKILL.md Step 3 Compose for cross-session consistency
- Fixed title consistency rule: h-xl 96px → 110px in SKILL.md iron rules section
- Updated README.md: version badge 7.1.1, 11 categories, validate.js and background-systems.md in file structure
- Added .claude-plugin/plugin.json for Claude Code metadata

## [7.1.0] - 2026-06-11

### Added
- Background systems reference (paper→wash→grain three-layer architecture, atmosphere intensity levels)
- validate.js automated validation script (7 rules: overflow, footer collision, Swiss bold, min font size, 4-band density, h-xl line caps, figure margin)
- Image source triage gate in Step 1 Intake (user image / web search / AI generation)
- "Larger = Lighter" font weight iron rule to components.md
- Title consistency iron rule (same role = same class across all pages)
- Consecutive 3 same-theme pages = P0 error to rhythm rules
- Hero title color rule: cover/finale must use #ffffff + text-shadow, not #ece2cf
- Screenshot size anomaly detection in screenshot.js

### Changed
- Type scale increased ~15% for mobile readability (h-xl: 96→110px, body: 28→32px, kicker: 22→26px, meta: 20→24px)
- Cover/finale titles use .h-display (136px) vs content pages .h-xl (110px) for visual hierarchy
- Category cookbook expanded from 7 to 11 categories with outside-scope list
- Theme presets: added hard rules (no custom hex, Lemon Green ≤20%)
- Image sources: added Unsplash direct download method and AI image API same-placeholder verification
- SKILL.md: added background systems reference, validate.js integration, screenshot size check, image download verification

## [7.0.1] - 2026-06-10

### Fixed
- screenshot.js: replaced hardcoded local paths with environment variable detection (security fix)
- Added .gitattributes to enforce UTF-8 + LF encoding
- Added README.md for GitHub repository

## [7.0.0] - 2026-06-10

### Added
- Editorial Magazine x E-ink + Swiss International dual-mode design system
- 10 theme presets (6 Editorial + 4 Swiss)
- 28 layout templates (M01-M16 + S01-S12)
- Three-Layer Rhythm System (light/dark + atmosphere + layout diversity)
- Density rules (active composition >= 78% canvas height)
- First/last page image frame rule (5+ pages require cover/finale background images)
- Image overlay rules for text-on-image pages
- Category cookbook for 7 content categories
- Content planning with compression ladder and page roles
- 5-step fully automated workflow (Intake → Content Plan → Compose → Validate → Screenshot & Deliver)
- Dual delivery: local folder + Feishu cloud drive sync
- Text compression template preserving original quotes and scene descriptions
- Puppeteer screenshot script with auto page ID detection and Chrome path discovery
