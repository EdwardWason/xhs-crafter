# Image Sources Specification

> 图片来源规范：免费图库 API、选图规则与裁切指南。

---

## 三大免费图库

### 1. Pexels

| 项目 | 说明 |
|------|------|
| **网址** | https://www.pexels.com/api/ |
| **特点** | 支持中文搜索；通用/热门场景覆盖好 |
| **API** | `GET https://api.pexels.com/v1/search?query={keyword}&per_page=5` |
| **认证** | 需要 API Key（免费层：200 次/小时） |
| **备用** | 浏览 https://www.pexels.com/search/{keyword}/ |
| **版权** | 免费商用，无需署名（但建议署名） |

**API 调用示例：**

```bash
curl -H "Authorization: YOUR_API_KEY" \
  "https://api.pexels.com/v1/search?query=workspace&per_page=5"
```

**响应关键字段：**

```json
{
  "photos": [
    {
      "id": 12345,
      "width": 4000,
      "height": 6000,
      "src": {
        "original": "https://images.pexels.com/…",
        "large2x": "https://images.pexels.com/…?w=1600",
        "large": "https://images.pexels.com/…?w=940"
      },
      "alt": "workspace with laptop and coffee"
    }
  ]
}
```

---

### 2. Unsplash

| 项目 | 说明 |
|------|------|
| **网址** | https://unsplash.com/developers |
| **特点** | 摄影质量最高，尤其擅长人物/生活方式/空间 |
| **API** | `GET https://api.unsplash.com/search/photos?query={keyword}&per_page=5` |
| **认证** | 需要 API Key（免费层：50 次/小时） |
| **备用** | 浏览 https://unsplash.com/s/photos/{keyword} |
| **版权** | 免费商用，Unsplash License |

**API 调用示例：**

```bash
curl -H "Authorization: Client-ID YOUR_ACCESS_KEY" \
  "https://api.unsplash.com/search/photos?query=minimal+interior&per_page=5"
```

**响应关键字段：**

```json
{
  "results": [
    {
      "id": "abc123",
      "width": 5472,
      "height": 3648,
      "urls": {
        "raw": "https://images.unsplash.com/…",
        "full": "https://images.unsplash.com/…?w=2160",
        "regular": "https://images.unsplash.com/…?w=1080"
      },
      "alt_description": "minimal interior design",
      "user": { "name": "Photographer Name" }
    }
  ]
}
```

---

### 3. Wallhaven

| 项目 | 说明 |
|------|------|
| **网址** | https://wallhaven.cc/help/api |
| **特点** | 游戏、摄影、壁纸类内容丰富 |
| **API** | `GET https://wallhaven.cc/api/v1/search?q={keyword}&categories=111&purity=100` |
| **认证** | 免费，基础搜索无需 API Key |
| **备用** | 浏览 https://wallhaven.cc/search?q={keyword} |
| **版权** | 混合版权，商用优先选择 Pexels/Unsplash |

**API 调用示例：**

```bash
curl "https://wallhaven.cc/api/v1/search?q=nature&categories=111&purity=100&sorting=relevance"
```

**响应关键字段：**

```json
{
  "data": [
    {
      "id": "abc123",
      "width": 3840,
      "height": 2160,
      "path": "https://w.wallhaven.cc/full/abc123.jpg",
      "url": "https://wallhaven.cc/w/abc123",
      "category": "nature",
      "purity": "sfw"
    }
  ]
}
```

**参数说明：**

| 参数 | 值 | 说明 |
|------|---|------|
| `categories` | `111` | 三个数字分别代表 General/Anime/People，1=启用 |
| `purity` | `100` | 三个数字分别代表 SFW/Sketchy/NSFW，1=启用 |
| `sorting` | `relevance`, `random`, `date_added`, `views`, `favorites`, `toplist` | 排序方式 |

---

## 图片选择规则（Image Selection Rules）

### 优先级排序

```
1. 用户提供的图片（最真实，最无"AI 感"）
2. 免费图库搜索（匹配页面视觉角色，非泛泛装饰）
3. AI 生成图片（仅在确实增加价值时使用，通常 1-2 页）
```

### 选图原则

- **匹配视觉角色**：图片应服务于页面的视觉叙事，而非泛泛装饰
- **风格一致**：同一组卡片内图片风格应统一（色调、构图、氛围）
- **避免"AI 感"**：优先真实摄影，生成图片应自然、不夸张
- **生成图片限制**：不嵌入标题、页码、Logo 或虚假 UI 标签

### 尺寸与比例

| 规则 | 要求 |
|------|------|
| **比例匹配** | 图片比例必须匹配布局槽位（3:4 竖版、16:9 横版等） |
| **最小宽度** | 1600px（适配高 DPI 显示器） |
| **推荐宽度** | 2000-4000px |
| **格式** | 优先 JPEG（照片）、PNG（UI/截图） |

---

## 主体感知裁切（Subject-Aware Cropping）

始终根据照片主体位置设置 `object-position` 内联样式：

| 主体位置 | object-position | 典型场景 |
|---------|-----------------|---------|
| 主体偏上 | `center 25-35%` | 天空、建筑顶部、头部特写 |
| 主体居中 | `center 50%`（默认） | 居中构图、正面肖像 |
| 主体偏中下 | `center 55-65%` | 半身像、桌面物品 |
| 主体偏下/前景 | `center 70-80%` | 地面物品、低角度拍摄 |

**使用示例：**

```html
<!-- 人物半身照，主体偏中下 -->
<img src="…" style="object-fit:cover;object-position:center 60%">

<!-- 建筑照片，主体偏上 -->
<img src="…" style="object-fit:cover;object-position:center 30%">

<!-- 居中构图，默认 -->
<img src="…" style="object-fit:cover;object-position:center 50%">
```

### 裁切决策流程

```
1. 观察照片主体位置
   ↓
2. 选择对应的 object-position 范围
   ↓
3. 微调百分比确保主体完整可见
   ↓
4. 在目标比例下验证裁切效果
```

### 注意事项

- `object-fit:cover` 会裁切图片以填满容器，必须配合正确的 `object-position`
- `object-fit:contain` 保持完整但可能留白，适用于 UI 截图
- 人像裁切时避免切到面部关键区域（眼睛、嘴巴）
- 产品图裁切时确保产品主体完整可见
