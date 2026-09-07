---
title: '如何新建一篇笔记（写给AI）'
description: '笔记存放位置、分类目录和 frontmatter 约定'
publishDate: 2026-08-29
tags:
  - meta
---

按主题约定，笔记和文章都写在 `src/content/blog/`，由现成的 `/blog` 页面展示。不必改 `src/pages/` 里的 Astro 文件。

## 放哪里

按分类建文件，路径会变成网址：

```text
src/content/blog/<分类>/<笔记名>.md  →  /blog/<分类>/<笔记名>
```

已开好的分类：

| 目录 | 用途 |
| --- | --- |
| `notes/` | 笔记，未整理的先丢这里 |
| `skills/` | 技能 |
| `reading/` | 阅读、摘录 |
| `life/` | 生活、随笔 |

也可以用官方命令生成一篇（默认在 `src/content/blog/` 根目录）：

```shell
bun pure new "笔记标题"
bun pure new -f "带配图的笔记"
```

## 两种写法

短笔记直接一个文件：

```text
src/content/blog/skills/astro-content.md
```

需要配图或附件时，用同名文件夹，正文叫 `index.md`：

```text
src/content/blog/skills/astro-content/
  index.md
  thumbnail.jpg
```

## Frontmatter

`title`、`description`、`publishDate` 必填（标题不超过 60 字，摘要 10–160 字）：

```markdown
---
title: '笔记标题'
description: '一句话摘要'
publishDate: 2026-08-29
tags:
  - Astro
draft: false
---

正文从这里开始。
```

- `draft: true` 只在本地开发可见，生产构建会隐藏。
- `author` 可选，覆盖正文底部分享卡的作者名；不写则用站点默认作者。
- 配图写相对路径，例如 `![说明](./thumbnail.jpg)`。
