# Git 工作流

## 分支策略

```
main          ← 稳定发布版本，始终可构建
  └── dev     ← 日常开发主线
       ├── feature/xxx   ← 新功能
       ├── fix/xxx       ← 修复 bug
       └── refactor/xxx  ← 重构
```

## 常用命令

### 开始新功能
```bash
git checkout dev
git pull origin dev
git checkout -b feature/功能名
```

### 提交规范
```bash
# 格式: <type>: <description>
git commit -m "feat: 添加工作台面板组件"
git commit -m "fix: 修复面板拖拽偏移问题"
git commit -m "refactor: 拆分 settings 模块"
git commit -m "docs: 更新 README"
```

Type 类型:
- `feat` — 新功能
- `fix` — 修复 bug
- `refactor` — 重构（不改变功能）
- `docs` — 文档
- `style` — 格式调整（不影响逻辑）
- `chore` — 构建/依赖/工具变更

### 完成功能并合并
```bash
git checkout dev
git merge feature/功能名
git push origin dev
```

### 发布版本
```bash
git checkout main
git merge dev
git tag v1.0.0
git push origin main --tags
```

## 日常节奏

1. 开始工作前: `git pull origin dev`
2. 小步提交，每完成一个逻辑单元就 commit
3. 功能完成后合并回 dev
4. 稳定后合并到 main 并打 tag
