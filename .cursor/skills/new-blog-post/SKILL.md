---
name: new-blog-post
description: >-
  Create a new Markdown/MDX article in this Astro Theme Pure repo under
  src/content/blog/. Use whenever the user wants a new post, note, 笔记, 文章,
  博客, draft, or MDX page; when they say 写一篇 / 新建文章 / add a blog post; or when
  an agent needs to add content that should appear at /blog. Do not use for
  theme docs (src/content/docs/), site config, or editing src/pages/.
---

# New blog post

Follow [Authoring Content](https://astro-pure.js.org/docs/setup/content). Posts are a content collection. Routes already exist. Do not add or edit files under `src/pages/` to publish an article.

## Workflow

1. Pick **category**, **slug**, **format**, and **frontmatter** (below).
2. Confirm the target path does not already exist (`*.md`, `*.mdx`, or `*/index.md`).
3. Write the file with the Write tool. Fill the body in the same step when the user gave content.
4. Reply with the file path and the public URL `/blog/<id>` (`<id>` is the path under `src/content/blog/` without the extension; a folder post’s id omits `/index`).

Prefer writing the file directly. `bun pure new` only scaffolds a **root-level** post, cannot choose a category folder, writes `lang` (schema field is `language`), and slugifies Chinese titles to `untitled`. Use it only if the user explicitly asks for that CLI.

## Where the file goes

Collection root: `src/content/blog/`.

| User intent | Directory |
| --- | --- |
| Unspecified, notes, 笔记, quick capture | `notes/` |
| Skills, programming, tools | `skills/` |
| Reading, books, quotes | `reading/` |
| Life, journal | `life/` |

A new topic is a new folder under `src/content/blog/<category>/`. Do not invent a second collection or a `/notes` route.

**Short post** (no local images):

```text
src/content/blog/<category>/<slug>.md
→ /blog/<category>/<slug>
```

**Post with local assets** (`heroImage` or images beside the article): folder + `index.md` or `index.mdx`:

```text
src/content/blog/<category>/<slug>/index.md
src/content/blog/<category>/<slug>/thumbnail.jpg
→ /blog/<category>/<slug>
```

Use `.mdx` only when the body needs MDX components (`Aside`, `Tabs`, … from `astro-pure/user`).

**Slug:** lowercase kebab-case ASCII (`how-to-write`). Derive from the English meaning of a Chinese title; do not slugify CJK (it becomes empty / `untitled`).

## Frontmatter

Source of truth: `src/content.config.ts` blog schema. Official field notes: [Authoring Content](https://astro-pure.js.org/docs/setup/content).

Required:

- `title` — string, max 60 characters
- `description` — string, max 160 characters (docs: keep at least ~10)
- `publishDate` — date; `YYYY-MM-DD` or `YYYY-MM-DD HH:mm:ss`

Optional:

- `updatedDate` — date
- `tags` — string list (stored lowercase, duplicates dropped)
- `draft` — `true` hides the post in production; default `false`
- `language` — e.g. `中文` or `English` (not `lang`)
- `author` — overrides the share-card / copyright author for this post; omit to use the site default (`theme.author` in `src/site.config.ts`)
- `comment` — `false` to disable comments on this post
- `heroImage` — only if the image file exists (same folder) or the remote URL includes `inferSize: true` or `width` + `height`

Minimal template:

```markdown
---
title: 'Post title'
description: 'One-line summary for cards and SEO.'
publishDate: 2026-08-29
tags:
  - example
draft: false
---

Body starts here.
```

With cover (folder layout):

```yaml
heroImage: { src: './thumbnail.jpg', alt: 'cover', color: '#B4C6DA' }
```

Remote cover:

```yaml
heroImage:
  {
    src: 'https://example.com/cover.jpg',
    inferSize: true
  }
```

Quote `title` / `description` when they contain `:`, `'`, or `#`. Do not add `order` (docs collection only). Do not set `heroImage` without a real image.

## Do not

- Create or edit `src/pages/**` for a new article
- Put posts in `src/content/docs/` (theme documentation)
- Put internal/ops notes in `src/content/**`; those go in `internal/`
- Change `src/content.config.ts` or `src/site.config.ts` unless the user asked to change site config
- Copy theme demo posts as the new article
- Commit unless the user asked
