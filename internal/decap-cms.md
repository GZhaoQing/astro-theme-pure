# Decap CMS 部署

线上后台（`/admin`）核对事项。站点本身怎么挂到 Vercel，见主题文档 `src/content/docs/setup/deployment.mdx`。本地写稿不需要 OAuth，见文末「本地」。

> **不要改成纯静态。** `/oauth`、`/oauth/callback` 是按需渲染的服务端路由。必须保持 `astro.config.ts` 里的 `output: 'server'` 和 Vercel adapter。改成纯静态、GitHub Pages，或 `vercelStatic()`，线上登录会直接挂。

## 和普通部署差在哪

| 环节 | 普通站点 | 接了 Decap 之后 |
| --- | --- | --- |
| 写文章 | 本地改 Markdown，git push | 浏览器 `/admin` 保存 → 直接 commit 到 GitHub → Vercel 再构建 |
| 登录 | 无 | GitHub OAuth（本站不在 Netlify，不能用 Identity / Git Gateway） |
| 谁能进后台 | — | 对仓库有 **push** 权限的 GitHub 账号 |

## 上线前改三处 URL

这三处必须是 **同一个生产域名**，且 **不要末尾斜杠**（站点 `trailingSlash: 'never'`）。

1. `astro.config.ts` 的 `site`
2. `public/admin/config.yml` 的 `site_url`、`display_url`、`backend.base_url`
3. GitHub OAuth App 的 Homepage URL 和 Callback URL

当前仓库对应关系：

```yaml
# public/admin/config.yml
backend:
  name: github
  repo: GZhaoQing/astro-theme-pure
  branch: main
  base_url: https://你的生产域名
  auth_endpoint: oauth

site_url: https://你的生产域名
display_url: https://你的生产域名
```

`base_url` 是 OAuth 服务所在源站，也就是 **本站点自己**，不是 `https://github.com`。填错时，登录弹窗会跳到错误地址或一直转圈。

`repo` 必须是 `owner/name`，且与 Vercel 所连仓库一致。换 fork / 换分支时一起改 `branch`。

## GitHub OAuth App

1. 打开 [Register a new OAuth application](https://github.com/settings/applications/new)。

2. 填写：

   | 字段 | 值 |
   | --- | --- |
   | Application name | 任意，例如 `astro-theme-pure cms` |
   | Homepage URL | `https://你的生产域名` |
   | Authorization callback URL | `https://你的生产域名/oauth/callback` |

   Callback **不要**写成 `/oauth/callback/`，也不要写成 `/api/callback`。

3. 创建后 Generate a new client secret，复制 **Client ID** 和 **Client Secret**。Secret 只显示一次。

4. 不要把这对密钥写进仓库。`.env` 已被 gitignore；可参考根目录 `.env.example`。

OAuth 申请的 scope 是 `repo,user`：公开仓库理论上 `public_repo` 就够，但当前实现按 `repo` 走，私有仓库也适用。能登录的人 = 对该仓库有 push 权限的人。不要把仓库 Collaborator 随便加给外人。

## Vercel 环境变量

1. 项目 → Settings → Environment Variables，增加：

   | Name | Value | 环境 |
   | --- | --- | --- |
   | `GITHUB_CLIENT_ID` | OAuth App Client ID | Production |
   | `GITHUB_CLIENT_SECRET` | OAuth App Client Secret | Production |

   名称必须完全一致，**不要**加 `PUBLIC_` 前缀，否则会打进前端包。

2. 改过变量后要 **Redeploy** 一次，旧部署读不到新密钥。

3. Preview 部署默认不要勾选这两项。GitHub OAuth App 只能登记 **一个** Callback URL，预览域名（`*.vercel.app` 随机后缀）对不上，登录会失败。需要预览环境后台时，另建一个 OAuth App，Callback 填该预览 URL，并用 Preview 专用环境变量。

若 Vercel 开了 Deployment Protection（访问预览要登录 Vercel），GitHub 跳回 `/oauth/callback` 可能被拦。生产环境关掉保护，或把 `/oauth` 加进例外。

## 部署后自检

1. 打开 `https://你的域名/admin`（**不要** `/admin/`）。
2. 点 Login with GitHub，应弹出授权窗口，同意后回到后台。
3. 能看到「笔记 / 技术 / 阅读 / 生活」，能打开已有笔记。
4. 改一篇草稿并 Save：GitHub 上应出现新 commit，Vercel 开始构建；构建完成后前台才能看到（`draft: true` 的文章生产环境不会出现）。

失败时对照：

| 现象 | 常见原因 |
| --- | --- |
| `/admin` 404 或跳到带 `/` 的警告页 | 用了 `/admin/`；本主题 `trailingSlash: 'never'` |
| 弹窗里 `Missing GITHUB_CLIENT_ID` | Vercel 没配变量，或配完没 Redeploy |
| 授权后立刻关窗 / Invalid OAuth state | Callback URL 与 OAuth App 不一致，或 Cookie 被拦 |
| Login with Netlify Identity | `config.yml` 被改成了 `git-gateway`，改回 `github` |
| 能进后台但不能 Save（403） | GitHub 账号对 `repo` 没有 push 权限 |
| 保存成功但线上没有文章 | Vercel 还在构建，或 `draft: true` |
| 登录跳到 `astro-pure.js.org` | `config.yml` 的 `base_url` 还是模板域名 |

## 构建与运行时

- **Node.js ≥ 22.12**（Astro 6 要求）。Vercel 项目 Settings → General → Node.js Version 选 `22.x`。
- 构建命令保持 `bun run build`（即 `astro-pure check && astro check && astro build`）。
- `decap-server` 只给本地用，**不要**写进 Vercel Start Command。
- 后台 JS 从 jsDelivr 加载；国内网络若 CDN 失败，登录页会白屏，与 OAuth 无关。

## 保存之后 Git 里会发生什么

Decap 用你的 GitHub 身份直接往 `main`（或你配置的 `branch`）提交 Markdown 和 `public/images/uploads/` 里的媒体。

- 没有 Review：默认不是 Editorial Workflow，保存即上主分支。
- Vercel 会因这次 commit 再部署一遍；前台不是即时刷新。
- 封面 `heroImage` 不在 CMS 表单里（Astro `image()` 要同目录相对路径或带尺寸的远程 URL）。正文配图用 `/images/uploads/...`。

不要在 `config.yml` 里打开 `publish_mode: editorial_workflow`，除非你明确要用 PR 发文。该模式与本地 `local_backend` 不兼容。

## 绑定自定义域名之后

域名变了就要同步改：

1. `astro.config.ts` → `site`
2. `public/admin/config.yml` → `base_url` / `site_url` / `display_url`
3. GitHub OAuth App → Homepage URL 与 Authorization callback URL

只改进 Vercel Domain、不改这三处，登录仍会回调到旧地址。

## 本地（不上线也能写）

不需要 OAuth。两个终端：

```shell
bun run cms
bun run dev
```

打开 [http://localhost:4321/admin](http://localhost:4321/admin)。`local_backend: true` 时，本机访问会走 `decap-server`（默认 `8081`），写入本地文件而不是 GitHub。

`8081` 被占用时：`PORT=8082 bun run cms`，并在 `config.yml` 里改成：

```yaml
local_backend:
  url: http://localhost:8082/api/v1
```

## 上线核对清单

- [ ] `site` 与 `config.yml` 里的三个 URL 都是生产域名、无末尾 `/`
- [ ] `backend.repo` / `branch` 与 GitHub、Vercel 一致
- [ ] 仍是 `output: 'server'` + `@astrojs/vercel`
- [ ] OAuth Callback = `https://生产域名/oauth/callback`
- [ ] Vercel Production 已设 `GITHUB_CLIENT_ID`、`GITHUB_CLIENT_SECRET` 并 Redeploy
- [ ] Node 22.x；密钥未提交进 git
- [ ] 你的 GitHub 账号对该仓库有 push 权限
- [ ] 用 `/admin` 登录，保存后能在 GitHub 看到 commit
