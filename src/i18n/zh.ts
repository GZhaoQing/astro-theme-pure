import type { Messages } from './types'

export const zh = {
  nav: {
    blog: '博客',
    docs: '文档',
    projects: '项目',
    links: '友链',
    about: '关于',
    search: '搜索',
    category: '分类'
  },
  common: {
    back: '返回',
    backHome: '回首页',
    menu: '菜单',
    darkTheme: '深色主题',
    switchLang: '切换语言',
    viewAll: '查看全部 →',
    previous: '上一页',
    next: '下一页',
    backToTop: '回到顶部',
    toggleSidebar: '打开目录'
  },
  blog: {
    title: '博客',
    noPosts: '还没有文章。',
    pageStatus: '第 {page} 页 · {showing}/{total} 篇',
    prevPosts: '← 上一页',
    nextPosts: '下一页 →',
    byYear: '按年份查看全部 →',
    tags: '标签',
    tagsPrefix: '标签：',
    draft: '（草稿）',
    updated: '更新',
    minutesRead: '{n} 分钟阅读',
    postCount: '{n} 篇',
    noTags: '还没有标签。',
    prevTags: '← 上一页',
    nextTags: '下一页 →',
    postsList: '文章列表',
    viewByYear: '按年份查看全部文章',
    viewCategories: '查看全部分类'
  },
  page: {
    home: '首页',
    search: '搜索',
    archives: '归档',
    docs: '文档',
    docsTitle: 'Astro Theme Pure 文档',
    docsTheme: '主题文档',
    docsFeedback: '反馈',
    docsFeedbackBody: '遇到问题可到 Github Issues 寻求社区支持。',
    docsNews: '动态说明（Alpha）',
    notFound: '未找到',
    notFoundHint: '出错了。',
    notFoundSorry: '找不到这个页面。',
    allTags: '全部标签',
    category: '分类',
    searchPrompt: '输入关键词搜索博客。',
    searchDisabled: '搜索未启用。',
    searchDev: '当前是开发模式，搜索不可用。',
    editGithub: '在 GitHub 上编辑'
  },
  category: {
    notes: '笔记',
    skills: '技能',
    reading: '阅读',
    life: '生活',
    uncategorized: '未分类',
    empty: '这个分类还没有文章。'
  },
  home: {
    somewhere: '某处',
    sourceCode: '源代码',
    getTemplate: '获取模板',
    about: '关于',
    posts: '文章',
    moreAbout: '更多关于我',
    morePosts: '更多文章',
    education: '教育',
    websiteList: '网站列表',
    certifications: '证书',
    skills: '技能',
    languages: '语言',
    frontend: '前端',
    backend: '后端',
    moreProjects: '更多项目'
  },
  footer: {
    powered: '主题驱动'
  },
  copyright: {
    author: '作者',
    publishedAt: '发布于',
    copyright: '版权',
    buyCoffee: '请我喝杯咖啡 ☕',
    copyLink: '复制链接',
    getQr: '查看二维码',
    shareTo: '分享到 {name}'
  },
  toast: {
    localeZh: '已切换为中文',
    localeEn: 'Switched to English',
    theme: '已切换为 {name}',
    linkCopied: '链接已复制'
  },
  about: {
    sponsorMe: '赞助我'
  },
  projects: {
    checkoutSponsorship: '查看赞助'
  },
  searchUi: {
    placeholder: '搜索',
    clear: '清除',
    loadMore: '加载更多',
    zeroResults: '没有与 [SEARCH_TERM] 匹配的结果',
    manyResults: '[COUNT] 条与 [SEARCH_TERM] 相关的结果',
    oneResult: '[COUNT] 条与 [SEARCH_TERM] 相关的结果',
    searching: '正在搜索 [SEARCH_TERM]…'
  }
} satisfies Messages
