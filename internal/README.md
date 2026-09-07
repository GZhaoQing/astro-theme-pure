# Internal docs

仓库内给自己看的说明，**不会**出现在网站上。Astro 只发布 `src/pages/`、`src/content/` 集合和 `public/`，这个目录不在其中。

| 要写的东西 | 放哪 |
| --- | --- |
| 内部说明、部署备忘、OAuth 步骤 | `internal/` |
| 给读者看的博客 / 笔记 | `src/content/blog/` |
| 主题公开文档 | `src/content/docs/` |

用普通 Markdown。不要用 `astro-pure/user` 的 MDX 组件（这里不会编译）。
