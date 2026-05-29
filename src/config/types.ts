// ============================================================
// 配置类型定义 — 分为基础配置和高级配置
// ============================================================

/** 完整配置 */
export interface AppConfig {
  version: number;
  /** 基础配置 */
  basic: BasicConfig;
  /** 高级配置 */
  advanced: AdvancedConfig;
}

// ---- 基础配置 ---- 用户日常会改的部分

export interface BasicConfig {
  app: AppConfig_App;
  ui: UIConfig;
  folders: FoldersConfig;
  domains: DomainConfig[];
  statuses: StatusesConfig;
  types: TypeConfig[];
  workflows: WorkflowConfig[];
}

export interface WorkflowConfig {
  id: string;
  label: string;
  folderKey?: string;
  docName?: string;
}

export interface UIConfig {
  openInMainEditor: boolean;
  themeId: string;
}

export interface AppConfig_App {
  name: string;
  icon: string;
  viewTitle: string;
}

export interface FoldersConfig {
  root: string;
  structure: Record<string, FolderConfig>;
}

export interface FolderConfig {
  name: string;
  pattern?: string;
}

export interface DomainConfig {
  id: string;
  name: string;
  color?: string;
  modules: ModuleConfig[];
}

export interface ModuleConfig {
  id: string;
  name: string;
}

export interface StatusesConfig {
  topic: string[];
  learning: string[];
  default: string;
  /** 视为"已完成"的状态列表（用于逾期过滤等） */
  completed: string[];
}

export interface TypeConfig {
  id: string;
  name: string;
  icon?: string;
}

// ---- 高级配置 ---- 一般不需要改的部分

export interface AdvancedConfig {
  tabs: TabConfig[];
  fields: Record<string, string>;
  limits: Record<string, number>;
  theme: ThemeConfig;
  templates: TemplatesConfig;
}

export interface TabConfig {
  id: string;
  name: string;
  icon?: string;
}

export interface ThemeConfig {
  defaultId: string;
  statusColors: Record<string, string>;
}

export interface TemplatesConfig {
  weeklyCategories: string[];
}
