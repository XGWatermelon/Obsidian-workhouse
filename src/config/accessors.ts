import { App } from "obsidian";
import { AppConfig, DomainConfig, ModuleConfig, FolderConfig, UIConfig, WorkflowConfig } from "./types";
import { DEFAULT_CONFIG } from "./defaults";

/**
 * 获取插件完整配置
 */
export function getConfig(app: App): AppConfig {
  const plugin = (app as any).plugins?.plugins?.["worktop"];
  return plugin?.config || DEFAULT_CONFIG;
}

// ==================== 基础配置访问 ====================

/** 获取应用名称 */
export function getAppName(app: App): string {
  return getConfig(app).basic.app.name;
}

/** 获取视图标题 */
export function getViewTitle(app: App): string {
  return getConfig(app).basic.app.viewTitle;
}

/** 获取 UI 配置 */
export function getUIConfig(app: App): UIConfig {
  return getConfig(app).basic.ui;
}

/** 获取根目录 */
export function getRootFolder(app: App): string {
  return getConfig(app).basic.folders.root;
}

/** 获取文件夹配置 */
export function getFolderConfig(app: App, folderKey: string): FolderConfig | undefined {
  return getConfig(app).basic.folders.structure[folderKey];
}

/**
 * 获取文件夹路径
 * 如果 folder.name 包含 "/"（绝对路径如 "待整理/收藏摘录"），直接返回
 * 否则拼接 root/folder.name
 */
export function getFolderPath(app: App, folderKey: string): string {
  const config = getConfig(app);
  const folder = config.basic.folders.structure[folderKey];
  if (!folder) return `${config.basic.folders.root}/${folderKey}`;
  if (folder.name.includes("/")) return folder.name;
  return `${config.basic.folders.root}/${folder.name}`;
}

/**
 * 生成文件路径（使用命名模式）
 */
export function generateFilePath(app: App, folderKey: string, vars: Record<string, string>): string {
  const config = getConfig(app);
  const folder = config.basic.folders.structure[folderKey];
  if (!folder?.pattern) {
    return `${getFolderPath(app, folderKey)}/${vars.date || "untitled"}.md`;
  }
  let pattern = folder.pattern;
  Object.entries(vars).forEach(([key, value]) => {
    pattern = pattern.replace(`{${key}}`, value);
  });
  if (!pattern.endsWith(".md")) {
    pattern += ".md";
  }
  return `${getFolderPath(app, folderKey)}/${pattern}`;
}

/** 获取所有领域 */
export function getDomains(app: App): DomainConfig[] {
  return getConfig(app).basic.domains;
}

/** 获取指定领域 */
export function getDomain(app: App, domainId: string): DomainConfig | undefined {
  return getConfig(app).basic.domains.find((d) => d.id === domainId);
}

/** 获取领域的模块列表 */
export function getModules(app: App, domainId: string): ModuleConfig[] {
  const domain = getDomain(app, domainId);
  return domain?.modules || [];
}

/** 获取状态列表 */
export function getStatuses(app: App, type: "topic" | "learning" = "topic"): string[] {
  return getConfig(app).basic.statuses[type];
}

/** 获取默认状态 */
export function getDefaultStatus(app: App): string {
  return getConfig(app).basic.statuses.default;
}

/** 获取已完成状态列表 */
export function getCompletedStatuses(app: App): string[] {
  return getConfig(app).basic.statuses.completed;
}

/** 获取类型列表 */
export function getTypes(app: App) {
  return getConfig(app).basic.types;
}

/** 获取工作流按钮列表 */
export function getWorkflows(app: App): WorkflowConfig[] {
  return getConfig(app).basic.workflows;
}

/** 获取类型名称 */
export function getTypeName(app: App, typeId: string): string {
  const type = getConfig(app).basic.types.find((t) => t.id === typeId);
  return type?.name || typeId;
}

// ==================== 高级配置访问 ====================

/** 获取标签页配置 */
export function getTabs(app: App) {
  return getConfig(app).advanced.tabs;
}

/** 获取字段名 */
export function getFieldName(app: App, field: string): string {
  return getConfig(app).advanced.fields[field] || field;
}

/** 获取数值限制 */
export function getLimit(app: App, key: string): number {
  return getConfig(app).advanced.limits[key] ?? DEFAULT_CONFIG.advanced.limits[key] ?? 10;
}

/** 获取状态颜色 */
export function getStatusColor(app: App, colorKey: string): string {
  return getConfig(app).advanced.theme.statusColors[colorKey] || "var(--ws-gray)";
}

/** 获取周计划分类 */
export function getWeeklyCategories(app: App): string[] {
  return getConfig(app).advanced.templates.weeklyCategories;
}
