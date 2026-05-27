# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在本仓库中工作时提供指引。

## 项目概述

Obsidian 工作台插件 — 基于 TypeScript 开发的 Obsidian 插件。

## 构建与开发命令

```bash
npm run dev          # 开发模式，监听文件变化自动构建 (esbuild)
npm run build        # 生产构建 (esbuild, 压缩)
npm run version      # 更新 manifest.json 和 versions.json 中的版本号
```

## 架构说明

- `main.ts` — 插件入口，继承 obsidian 模块的 `Plugin` 类
- `manifest.json` — 插件元数据 (id, name, version, minAppVersion)
- `styles.css` — 插件样式 (可选)
- `esbuild.config.mjs` — 构建配置 (externalize obsidian, electron, codemirror)
- `versions.json` — 插件版本与最低 Obsidian 版本的映射

构建输出 `main.js` 到项目根目录 — 这是 Obsidian 加载的文件。

## 编码准则 (Karpathy 原则)

### 先思考再编码
- 明确说出假设。不确定就问。
- 存在多种理解时，全部列出 — 不要默默选一种。
- 有更简单的方案就提出来。

### 简洁优先
- 最少代码解决问题。不做投机性设计。
- 不加没被要求的功能。
- 只用一次的代码不抽象。
- 不为不可能的场景写错误处理。

### 外科手术式改动
- 只动必须动的。不顺手"改进"周围的代码。
- 遵循现有风格，即使你会写得不同。
- 只清理你自己改动造成的未使用导入/变量/函数。

### 目标驱动执行
- 实现前先定义成功标准。
- 多步任务列出简要计划，每步附验证方式。
- 修 bug 前先写能复现的测试。

## Superpowers 技能

本项目通过 `.claude/settings.json` 局部启用了 superpowers 插件（仅本项目生效，不影响其他项目）。以下技能随时可用：

| 技能 | 用途 | 触发方式 |
|------|------|----------|
| brainstorming | 头脑风暴，探索设计方案 | `/brainstorming` 或开始新功能时 |
| writing-plans | 编写实施计划 | `/writing-plans` |
| executing-plans | 按计划执行实施 | `/executing-plans` |
| test-driven-development | 测试驱动开发 | `/test-driven-development` |
| systematic-debugging | 系统化调试 | 遇到 bug 时 |
| requesting-code-review | 请求代码审查 | `/requesting-code-review` |
| receiving-code-review | 接收并处理审查反馈 | 收到审查时 |
| verification-before-completion | 完成前验证 | 任务完成前 |
| finishing-a-development-branch | 完成开发分支 | 合并分支前 |
| subagent-driven-development | 子代理驱动开发 | 大型任务时 |
| dispatching-parallel-agents | 并行代理调度 | 需要并行工作时 |
| using-git-worktrees | 使用 git worktrees | 需要隔离工作时 |
| writing-skills | 编写新技能 | `/writing-skills` |

### 使用原则

- 有 1% 可能用到某个技能，就必须调用它
- 技能优先级：流程技能 (brainstorming, debugging) > 实现技能
- 用户指令优先级最高，技能次之
- 技能分刚性 (TDD, debugging: 严格遵循) 和柔性 (patterns: 灵活应用)
