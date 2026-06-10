# Category Cookbook

Per-category cheat sheet for common content types. Each entry maps a category to style mode, theme, recipes, and image source strategy.

When the user names a category, find the row here and start from the listed recipes instead of building from a blank file.

---

## 商业/科技分析 · Business & Tech Analysis

**Strongest fit for our skill.**

- **Recipes**: M01 (text-led cover) or M16 (image-led cover when hero image available), M04 (pull quote), M08 (pipeline), M12 (data cards), M07 (closing note)
- **Style mode**: Editorial × Indigo Porcelain (tech/AI) or × Ink Classic (general business). Swiss × IKB Blue for pure data posts
- **Theme**: Indigo Porcelain for tech/AI topics; Ink Classic for general business; IKB Blue for data-heavy analysis
- **Text scheme**: Text-beside-image for feature pages. Text-on-image only for cover with qualified photo. Body pages use serif text + data cards + pull quotes
- **Image source**: AI generated (editorial documentary style) > Unsplash (tech/office scenes) > Pexels (Chinese keyword search). Avoid stock handshake/laptop photos
- **Content shape**: 5-7 pages. Cover (hook + 1-line deck) → opening thesis + data → 2-3 evidence pages (pipeline/ledger/quote) → closing
- **Pitfalls**:
  1. Generic "industry analysis" voice without specific numbers. Cure: every claim needs a data point
  2. Too many data cards without narrative. Cure: alternate data pages with essay/quote pages
  3. Cover with vague hype instead of concrete hook

---

## 职场/干货 · Workplace & How-to

**Strong fit.** This is what Swiss-International was made for.

- **Recipes**: S01 (cover), S02 (comparison), S05 (warning rows), S06 (pipeline), S07 (takeaway ledger), S09 (KPI tower), S11 (stacked ledger)
- **Style mode**: Swiss × IKB Blue or × Safety Orange. Avoid lemon-yellow/lemon-green for serious content
- **Theme**: IKB Blue (default), Safety Orange (warning/urgent content)
- **Text scheme**: Text-only or text-with-diagram. Almost never text-on-photo (workplace photos read as stock)
- **Image source**: Avoid stock business photos. Prefer diagrams, screenshots of real artifacts (Notion, Linear, Figma), or omit. Generated images rarely add value
- **Content shape**: 5-9 pages. Cover question/claim → context KPI → 3-5 numbered insights as ledger → one comparison or pipeline diagram → takeaway
- **Pitfalls**:
  1. Listicle voice ("8 个让你..."). Cure: rewrite as numbered argument, not tips
  2. Cheap "advice" energy ("一定要", "千万别"). Cure: replace with observed action verbs + a number
  3. Stock-photo seasoning (handshake, laptop-with-coffee). Cure: omit, or use a small icon glyph

---

## 旅行/生活方式 · Travel & Lifestyle

**Strongest fit.**

- **Recipes**: M16 (image-led cover when user has great photos), M01 (text-led cover), M02 (field-note photo), M11 (marginalia essay), S11 (itinerary ledger), M07 (closing note)
- **Style mode**: Editorial × Kraft Paper (warm-tone destinations) or × Dune (art/creative destinations) or × Forest Ink (mountain/wilderness)
- **Theme**: Kraft Paper for warm/cultural trips; Dune for art/design destinations; Forest Ink for outdoor/nature
- **Text scheme**: Text beside image is default. Cover can use text-on-image only when photo has quiet zone. Body pages use photo + caption pairs (field-note style)
- **Image source**: User photos > Pexels (Chinese keyword search for domestic destinations) > Unsplash (overseas/English keywords) > Flickr CC (documentary feel)
- **Content shape**: 5-7 pages. Cover (destination + dates) → atmosphere photo + lead → itinerary ledger → 2-3 field notes → closing quote
- **Pitfalls**: Generic "best places in X city" listicle voice. Cure: keep one specific date/weather/mileage detail per page

---

## 教程/工具 · Tutorial & Tools

**Strong fit.** Screenshot treatment is the key differentiator.

- **Recipes**: S01 (cover), S06 (pipeline for steps), S08 (duo compare), S11 (stacked ledger for shortcuts), M04 (pull quote for key insight)
- **Style mode**: Swiss × IKB Blue (default) or × Safety Orange (warning tips). Editorial × Indigo Porcelain for long-form tutorials
- **Theme**: IKB Blue for tool tutorials; Indigo Porcelain for methodology tutorials
- **Text scheme**: Screenshot-heavy. Use `.frame-shot` + `.device-browser` for all screenshots. Text above/below screenshots, not beside
- **Image source**: User screenshots (mandatory for real tutorials). Use `.frame-shot` with device chrome + background texture. Never use stock UI screenshots
- **Content shape**: 5-8 pages. Cover (tool name + what you'll learn) → context → 3-5 step pages (screenshot + 1-2 sentence instruction) → tips/shortcuts ledger → closing
- **Pitfalls**:
  1. Screenshots too small to read. Cure: give screenshots 45-65% page height
  2. Full-screen dumps without focus. Cure: crop to relevant area, preserve readable UI labels
  3. Dark screenshots on dark background. Cure: use `.frame-shot` with paper-2 background

---

## 影视/读书 · Film & Books

**Strong fit** for reviews, scene analysis, quote cards.

- **Recipes**: M01 (cover), M04 (pull quote for memorable lines), M10 (evidence feature for scene analysis), M11 (marginalia essay), S02 (comparison), S12 (matrix for weekly roundups)
- **Style mode**: Editorial × Ink Classic or × Indigo Porcelain. Letterboxd visual vocabulary fits Editorial naturally
- **Theme**: Ink Classic (default for reviews); Indigo Porcelain (sci-fi/tech films); Kraft Paper (literature/classics)
- **Text scheme**: Text-beside-image for review cards (poster on left, take on right). Text-on-image only for atmospheric quote pages
- **Image source**: Official posters/stills. Do not generate fake stills. User photos of book covers acceptable
- **Content shape**: 5-7 pages. Cover (title + year + 1-line take) → 1-2 scene captures → director-quote/theme pullquote → verdict ledger
- **Pitfalls**:
  1. Fake film-festival typography (adding fake awards badges). Don't
  2. Spoiler in title without warning. Mark `剧透` in kicker if needed

---

## 游戏 · Gaming

**Strong fit** for journals, recaps, build lists. **Has image-rights risk.**

- **Recipes**: M01 (cover with full-bleed art), M08 (boss tier ledger), S07 (takeaway ledger), S11 (chapter timeline), M15 (build before/after)
- **Style mode**: Editorial dark (Ink Classic with paper inverted to near-black) for atmospheric games. Swiss for esports/competitive data
- **Theme**: Midnight Ink for atmospheric games; IKB Blue for esports/data
- **Text scheme**: Text-on-image is standard for game covers (game art is the primary draw). Use subject mapping from image-overlay.md
- **Image source**: Wallhaven for keyword pulls, official screenshots. Always disclose copyright risk and log to SOURCES.md
- **Content shape**: 4-6 pages. Cover (game name + playtime) → first impression → chapter ledger → memorable boss/scene → verdict
- **Pitfalls**: Score-card seriousness (8.5/10 in giant block). Keep verdict as one short clause, not a number

---

## 美食 · Food

**Split fit.** Recipes work. Food-photo showcase does not.

- **Recipes**: M16 (image-led cover with finished-dish photo), S11 (ingredient/price ledger), M14 (cooking steps pipeline), M02 (extra dish detail)
- **Style mode**: Editorial × Kraft Paper (cookbook feel). Swiss × Lemon Yellow/Safety Orange for "cost-per-serving" data posts
- **Image source**: User photos of finished dish are best. Pexels for Chinese food scenes. Unsplash food photos read as Western stock
- **Pitfalls**: Excited recipe voice ("超绝!!!"). Editorial doesn't shout — let the dish do the talking

---

## Capability Circle Summary

**End-to-end strong** (text + structure + image all from skill):
- 商业/科技分析 · 旅行 · 职场 · 教程/工具

**Strong on text/structure, needs user photos for image**:
- 影视/读书 · 游戏 · 美食(食谱)

**Outside scope** (skill cannot reliably produce):
- 美食(菜品大片摆盘) · OOTD实拍流 · 梦核/氛围感装饰风 · 纯摄影展示

Be explicit with the user when their request lands in "outside scope". Do not promise a result the system was not designed to make.
