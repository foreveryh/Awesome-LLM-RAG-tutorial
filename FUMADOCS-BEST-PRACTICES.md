# Fumadocs 教程编写最佳实践

> 基于 RAG Tutorial 项目实战经验总结的完整指南

## 📋 目录

- [项目结构规范](#项目结构规范)
- [命名约定](#命名约定)
- [MDX 语法规范](#mdx-语法规范)
- [链接和导航](#链接和导航)
- [组件使用指南](#组件使用指南)
- [元数据管理](#元数据管理)
- [常见问题避坑](#常见问题避坑)
- [开发工作流](#开发工作流)
- [性能优化](#性能优化)

---

## 项目结构规范

### 标准目录结构

```
rag-tutorial/
├── app/                          # Next.js App Router
│   ├── (home)/                   # 首页分组
│   │   └── page.tsx
│   ├── docs/                     # 文档路由
│   │   ├── [[...slug]]/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── layout.tsx
│   └── global.css
├── content/
│   └── docs/                     # 文档内容目录
│       ├── index.mdx             # 首页文档
│       ├── about.mdx             # 关于页面
│       ├── meta.json             # (可选)导航排序
│       ├── section-1/            # 章节目录
│       │   ├── index.mdx         # 章节首页
│       │   ├── meta.json         # 子页面排序
│       │   ├── page-1.mdx
│       │   └── page-2.mdx
│       └── section-2/
│           └── ...
├── components/                   # 自定义组件
├── lib/                          # 工具函数
│   └── source.ts                # Fumadocs 配置
├── public/                       # 静态资源
└── package.json
```

### 关键原则

1. **内容与代码分离**: 所有 MDX 文档放在 `content/docs/` 下
2. **层级清晰**: 最多 3-4 层目录深度
3. **每个目录有 index.mdx**: 作为该章节的导航页
4. **assets 就近放置**: 图片等资源放在对应文档目录下

---

## 命名约定

### ✅ 推荐做法

#### 文件和目录命名

```
# 优先使用英文 + kebab-case
content/docs/
├── advanced-rag-intro/
│   ├── index.mdx
│   ├── complete-rag-survey.mdx
│   └── introduction-to-rag.mdx

# 如果必须使用中文，保持一致性
content/docs/
├── rag-project-analysis/
│   ├── 01-project-overview/      # 目录用英文
│   │   ├── index.mdx
│   │   ├── 01-九大项目总览.mdx    # 文件可用中文
│   │   └── 02-技术成熟度评估.mdx
```

#### URL 友好性规则

- **文件夹名**: 优先英文，使用 kebab-case
- **文件名**: 
  - 英文优先: `introduction-to-rag.mdx`
  - 中文可接受: `01-九大项目总览.mdx` (URL 会自动编码)
  - 数字前缀排序: `01-xxx.mdx`, `02-yyy.mdx`

### ❌ 避免的做法

```bash
# 不要使用空格
❌ my page.mdx
✅ my-page.mdx

# 不要使用特殊字符
❌ page#1.mdx
❌ page@home.mdx
✅ page-1.mdx
✅ page-home.mdx

# 不要混用大小写
❌ MyPage.mdx
✅ my-page.mdx
```

---

## MDX 语法规范

### 1. Frontmatter 必填字段

```mdx
---
title: "页面标题"                    # 必填，显示在浏览器标签和页面顶部
description: 简短的页面描述           # 必填，用于 SEO 和搜索
icon: BookOpen                       # 可选，侧边栏图标
---
```

### 2. 标题层级规范

```mdx
# 一级标题 - 页面主标题（只用一次，通常与 title 一致）

## 二级标题 - 主要章节

### 三级标题 - 子章节

#### 四级标题 - 详细说明

##### 五级标题 - 很少使用
```

**规则**:
- ✅ 不要跳级: `##` → `###` → `####`
- ✅ 一个页面只有一个 `#` 一级标题
- ✅ 标题后空一行再写内容

### 3. 代码块规范

````mdx
```typescript title="app/layout.tsx" {3-5}
import { RootProvider } from 'fumadocs-ui/provider';

export default function RootLayout({ children }) {
  return <RootProvider>{children}</RootProvider>;
}
```
````

**规则**:
- 始终指定语言: `typescript`, `python`, `bash`
- 使用 `title` 显示文件名
- 使用 `{行号}` 高亮重要代码
- 长代码建议折叠: `````mdx ```ts collapse`````

### 4. 链接语法（重要！）

#### 内部链接

```mdx
<!-- 相对路径链接到其他文档 -->
[查看详情](./other-page)
[上一级](../parent-page)

<!-- 绝对路径（从 /docs 开始）-->
[首页](/docs)
[关于](/docs/about)
```

#### 外部链接

```mdx
<!-- 基本外部链接 -->
[GitHub](https://github.com)

<!-- 带安全属性的外部链接（推荐）-->
<a href="https://example.com" target="_blank" rel="noopener noreferrer">
  访问网站
</a>
```

#### ⚠️ 关键避坑规则

```mdx
<!-- ❌ 错误：在 <a> 标签内直接放 URL -->
<a href="https://x.com/user">https://x.com/user</a>
<!-- 原因：MDX 会将 URL 文本自动转为链接，导致嵌套 <a> 标签 -->

<!-- ✅ 正确：使用描述性文本 -->
<a href="https://x.com/user" target="_blank" rel="noopener noreferrer">
  X/Twitter
</a>

<!-- ✅ 或使用 Markdown 语法 -->
[X/Twitter](https://x.com/user)
```

### 5. 图片使用

```mdx
<!-- 本地图片（推荐放在同目录或 images 子目录）-->
![架构图](./images/architecture.png)

<!-- 指定尺寸 -->
<img src="./diagram.png" alt="流程图" width="600" />

<!-- 外部图片 -->
![Logo](https://example.com/logo.png)
```

### 6. 表格规范

```mdx
| 项目 | 技术栈 | Stars | 适用场景 |
|------|--------|-------|----------|
| Onyx | Python/FastAPI | 5K+ | 企业知识库 |
| LightRAG | Python | 4K+ | 快速原型 |

<!-- 对齐方式 -->
| 左对齐 | 居中 | 右对齐 |
|:-------|:----:|-------:|
| 文本   | 123  | $99.99 |
```

---

## 链接和导航

### 1. 侧边栏导航自动生成

Fumadocs 会根据文件结构自动生成侧边栏:

```
content/docs/
├── index.mdx                    → "首页"
├── section-1/
│   ├── index.mdx                → "Section 1"
│   ├── page-a.mdx               → "Page A"
│   └── page-b.mdx               → "Page B"
```

### 2. 自定义导航顺序 (meta.json)

```json
{
  "title": "章节标题",
  "pages": [
    "index",
    "page-1",
    "page-2"
  ]
}
```

或更详细的配置:

```json
{
  "title": "Advanced RAG",
  "pages": [
    {
      "title": "简介",
      "url": "/docs/advanced-rag-intro"
    },
    "---",
    "deep-dive",
    "practice"
  ]
}
```

### 3. 文档内导航卡片

```mdx
<Cards>
  <Card 
    title="快速开始" 
    href="/docs/getting-started"
    description="5分钟搭建你的第一个 RAG 系统"
  />
  <Card 
    title="进阶教程" 
    href="/docs/advanced"
  />
</Cards>
```

### 4. 面包屑导航

Fumadocs 自动根据路径生成，无需手动配置。

---

## 组件使用指南

### 1. Callout 提示框

```mdx
<Callout type="info" title="提示">
这是一条信息提示
</Callout>

<Callout type="warn" title="警告">
注意：此操作不可逆
</Callout>

<Callout type="error" title="错误">
严重错误说明
</Callout>

<Callout type="success" title="成功">
操作成功完成
</Callout>
```

**使用场景**:
- `info`: 一般信息、提示、说明
- `warn`: 需要注意的事项、潜在问题
- `error`: 错误、不推荐的做法
- `success`: 最佳实践、推荐方案

### 2. Tabs 标签页

```mdx
<Tabs items={['npm', 'pnpm', 'yarn']}>
  <Tab value="npm">
    ```bash
    npm install fumadocs-ui
    ```
  </Tab>
  <Tab value="pnpm">
    ```bash
    pnpm add fumadocs-ui
    ```
  </Tab>
  <Tab value="yarn">
    ```bash
    yarn add fumadocs-ui
    ```
  </Tab>
</Tabs>
```

### 3. Accordion 折叠面板

```mdx
<Accordion title="为什么选择 RAG？">
RAG 结合了检索和生成的优势，能够...
</Accordion>

<Accordion title="如何优化性能？">
可以从以下几个方面入手：
1. 优化分块策略
2. 选择合适的 embedding 模型
3. ...
</Accordion>
```

### 4. Steps 步骤指引

```mdx
<Steps>

### 第一步：安装依赖

```bash
npm install fumadocs-ui fumadocs-core
```

### 第二步：配置 source

创建 `lib/source.ts` 文件...

### 第三步：设置路由

在 `app/docs/[[...slug]]/page.tsx` 中...

</Steps>
```

---

## 元数据管理

### 1. source.ts 配置

```typescript
import { docs, meta } from '@/.source';
import { createMDXSource } from 'fumadocs-mdx';
import { loader } from 'fumadocs-core/source';

export const source = loader({
  baseUrl: '/docs',
  source: createMDXSource(docs, meta),
});
```

### 2. 页面元数据

```tsx
// app/docs/[[...slug]]/page.tsx
import { source } from '@/lib/source';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
```

### 3. SEO 优化

```mdx
---
title: "完整的 RAG 系统开发指南 | 2024"
description: "从零开始构建生产级 RAG 系统，涵盖架构设计、性能优化和最佳实践"
keywords: ["RAG", "LLM", "检索增强生成", "向量数据库"]
author: "你的名字"
---
```

---

## 常见问题避坑

### 1. 嵌套链接问题 ⚠️

**问题**: MDX 自动将 URL 文本转为链接，导致 `<a>` 标签嵌套

```mdx
<!-- ❌ 错误示例 -->
<a href="https://github.com/user/repo">
  https://github.com/user/repo
</a>
<!-- 结果: <a><a>...</a></a> 导致 hydration 错误 -->

<!-- ✅ 解决方案 -->
<a href="https://github.com/user/repo" target="_blank" rel="noopener noreferrer">
  GitHub Repo
</a>
```

### 2. 中文路径 404

**问题**: 链接使用中文路径但文件名是英文

```mdx
<!-- 文件: content/docs/advanced-rag/introduction.mdx -->

<!-- ❌ 错误 -->
[查看详情](./高级介绍)

<!-- ✅ 正确 -->
[查看详情](./introduction)
```

**解决方案**: 保持链接路径与实际文件/文件夹名一致

### 3. 组件首字母大写

```mdx
<!-- ❌ 错误 -->
<callout type="info">提示内容</callout>

<!-- ✅ 正确 -->
<Callout type="info">提示内容</Callout>
```

### 4. 代码块中的特殊字符

````mdx
<!-- ❌ 如果代码包含三个反引号 -->
```
这里有 ``` 会导致解析错误
```

<!-- ✅ 使用四个反引号包裹 -->
````
这里有 ``` 正常显示
````
````

### 5. 清理缓存

如果修改后页面没更新:

```bash
# 删除 Next.js 缓存
rm -rf .next

# 重启开发服务器
npm run dev
```

---

## 开发工作流

### 1. 新建文档流程

```bash
# 1. 创建文件
touch content/docs/section/new-page.mdx

# 2. 添加 frontmatter
cat > content/docs/section/new-page.mdx << 'EOF'
---
title: "新页面标题"
description: 页面描述
---

# 新页面标题

内容...
EOF

# 3. (可选) 更新 meta.json 排序

# 4. 在浏览器预览
npm run dev
```

### 2. 本地开发命令

```bash
# 开发模式（热重载）
npm run dev

# 类型检查
npm run typecheck

# 构建生产版本
npm run build

# 预览生产版本
npm run start
```

### 3. Git 提交规范

```bash
# 文档相关提交
git commit -m "docs: 添加 RAG 优化最佳实践"
git commit -m "docs: 修复检索架构文档中的链接"
git commit -m "docs: 更新项目概览表格"

# 组件相关
git commit -m "feat: 添加自定义 Callout 组件"
git commit -m "fix: 修复导航栏显示问题"
```

### 4. 文档审查清单

发布前检查:

- [ ] 所有链接可点击无 404
- [ ] 图片正常显示
- [ ] 代码块语法高亮正确
- [ ] 没有拼写错误
- [ ] 元数据完整（title, description）
- [ ] 移动端显示正常
- [ ] 清理了开发用的 TODO 注释
- [ ] 运行 `npm run build` 无错误

---

## 性能优化

### 1. 图片优化

```mdx
<!-- 使用 Next.js Image 组件 -->
import Image from 'next/image';

<Image 
  src="/images/architecture.png" 
  alt="系统架构"
  width={800}
  height={600}
  priority={false}
/>
```

### 2. 代码分割

```typescript
// 动态导入大组件
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('@/components/Heavy'), {
  loading: () => <p>加载中...</p>,
});
```

### 3. 搜索索引优化

```typescript
// source.ts 中配置搜索
export const source = loader({
  baseUrl: '/docs',
  source: createMDXSource(docs, meta),
  // 优化搜索性能
  pageTree: {
    attachFile: false, // 不在树中附加完整文件内容
  },
});
```

### 4. 构建优化

```json
// package.json
{
  "scripts": {
    "build": "next build",
    "analyze": "ANALYZE=true next build"
  }
}
```

---

## 模板示例

### 教程页面模板

```mdx
---
title: "如何优化 RAG 检索性能"
description: "详细介绍 RAG 系统中检索模块的优化策略和实践案例"
---

# 如何优化 RAG 检索性能

<Callout type="info" title="阅读时间">
预计 15-20 分钟
</Callout>

## 概述

简要介绍本文要解决的问题和覆盖的内容...

## 问题背景

### 为什么需要优化检索？

1. 检索延迟影响用户体验
2. 检索质量决定生成效果
3. ...

## 优化策略

### 1. 分块优化

<Tabs items={['固定分块', '语义分块', '滑动窗口']}>
  <Tab value="固定分块">
    ```python
    def chunk_text(text, size=512):
        ...
    ```
  </Tab>
  ...
</Tabs>

### 2. 索引优化

<Steps>

### 选择合适的向量数据库

对比不同数据库的性能特点...

### 配置索引参数

```python
index = faiss.IndexHNSW(dimension, M=32)
```

### 测试和调优

</Steps>

## 实践案例

### 案例 1: 企业知识库优化

**背景**: ...  
**问题**: ...  
**方案**: ...  
**效果**: 检索时间从 500ms 降至 50ms

## 总结

本文介绍了...

<Callout type="success" title="关键要点">
- 要点 1
- 要点 2
- 要点 3
</Callout>

## 延伸阅读

- [向量搜索详解](./vector-search)
- [混合检索实践](./hybrid-search)

## 参考资料

1. [论文标题](链接)
2. [博客文章](链接)
```

### 索引页面模板

```mdx
---
title: "Advanced RAG 深入"
description: "深入理解 Advanced RAG 的核心概念、优化策略和实现原理"
---

# Advanced RAG 深入

欢迎来到 Advanced RAG 深入学习部分。

## 学习路径

<Cards>
  <Card 
    title="向量搜索详解" 
    href="./vector-search"
    description="理解 RAG 的技术基础"
  />
  <Card 
    title="构建高质量 RAG" 
    href="./building-rag"
    description="从系统工程角度构建 RAG"
  />
</Cards>

## 内容概览

### 核心概念

| 文章 | 难度 | 时间 | 重点 |
|------|------|------|------|
| [向量搜索](./vector-search) | 基础 | 40min | kNN/ANN 算法 |
| [RAG 架构](./architecture) | 中级 | 30min | 系统设计 |

### 优化策略

- [性能优化](./performance)
- [质量优化](./quality)

## 学习建议

### 初学者路径

1. 阅读[向量搜索详解](./vector-search)
2. 实践[快速开始](./quickstart)
3. 学习[优化策略](./optimization)

### 进阶路径

1. 深入[架构设计](./architecture)
2. 研究[生产实践](./production)
3. 探索[前沿技术](./advanced)
```

---

## 快速参考

### 常用组件速查

| 组件 | 语法 | 用途 |
|------|------|------|
| Callout | `<Callout type="info">` | 提示框 |
| Card | `<Card title="xx" href="xx">` | 导航卡片 |
| Tabs | `<Tabs items={[]}>` | 标签切换 |
| Steps | `<Steps>` | 步骤指引 |
| Accordion | `<Accordion title="xx">` | 折叠面板 |

### 常用命令

```bash
# 开发
npm run dev

# 清理缓存
rm -rf .next

# 构建
npm run build

# 查找断链
npm run lint
```

### 文件结构速查

```
content/docs/
  ├── index.mdx          # 文档首页
  ├── section/
  │   ├── index.mdx      # 章节首页
  │   ├── meta.json      # 导航配置
  │   └── page.mdx       # 具体页面
```

---

## 总结

遵循这些最佳实践可以:

✅ **提高开发效率**: 标准化的结构和命名  
✅ **提升用户体验**: 清晰的导航和组织  
✅ **减少错误**: 避免常见陷阱  
✅ **便于维护**: 一致的代码风格和文档结构  
✅ **优化性能**: 正确使用组件和资源  

**记住**: 这是一个持续演进的文档，随着项目发展会不断更新。

---

## 附录：常见错误速查表

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| Hydration error | 嵌套 `<a>` 标签 | 检查链接文本是否为 URL |
| 404 on links | 路径与文件名不匹配 | 使用实际文件/文件夹名 |
| 组件不渲染 | 首字母小写 | 改为大写 `<Callout>` |
| 图片不显示 | 路径错误 | 使用相对路径 `./images/xx.png` |
| 构建失败 | MDX 语法错误 | 检查代码块闭合、组件标签 |

---

**最后更新**: 2025-10-29  
**版本**: 1.0  
**维护者**: 熊布朗
