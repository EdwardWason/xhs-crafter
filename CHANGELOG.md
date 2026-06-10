# Changelog

All notable changes to this project will be documented in this file.

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
