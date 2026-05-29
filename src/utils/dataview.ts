import { App, TFile } from "obsidian";
import {
  getStatuses,
  getCompletedStatuses,
  getFieldName,
  getFolderPath,
  getLimit,
  getDomains,
} from "../config/accessors";

export interface TaskItem {
  text: string;
  file: string;
  line: number;
  completed: boolean;
}

export interface TopicItem {
  title: string;
  type: string;
  status: string;
  created: string;
  deadline: string;
  path: string;
}

export function toLocalDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getTodayDiaryPath(app: App): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${getFolderPath(app, "diary")}/${year}-${month}-${day}.md`;
}

export function fileExists(app: App, path: string): boolean {
  return app.vault.getAbstractFileByPath(path) !== null;
}

/**
 * 确保文件夹存在，不存在则逐级创建
 */
export async function ensureFolder(app: App, folderPath: string): Promise<void> {
  const parts = folderPath.split("/");
  let current = "";
  for (const part of parts) {
    current = current ? `${current}/${part}` : part;
    if (!fileExists(app, current)) {
      await app.vault.createFolder(current);
    }
  }
}

export function getRecentFiles(app: App, days: number = 7): TFile[] {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const limit = getLimit(app, "recentFiles");
  return app.vault
    .getMarkdownFiles()
    .filter((f) => f.stat.mtime > cutoff)
    .sort((a, b) => b.stat.mtime - a.stat.mtime)
    .slice(0, limit);
}

export function getTopicsByStatus(app: App, status: string): TopicItem[] {
  const topicFolder = getFolderPath(app, "topic");
  const files = app.vault
    .getMarkdownFiles()
    .filter((f) => f.path.startsWith(topicFolder + "/"));

  const topics: TopicItem[] = [];

  files.forEach((file) => {
    const cache = app.metadataCache.getFileCache(file);
    if (cache?.frontmatter) {
      const fm = cache.frontmatter;
      if (fm.status === status) {
        topics.push({
          title: file.basename,
          type: fm.type || "",
          status: fm.status || "",
          created: fm.created || "",
          deadline: fm.deadline || "",
          path: file.path,
        });
      }
    }
  });

  return topics;
}

export function getOverdueTopics(app: App): TopicItem[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const topicFolder = getFolderPath(app, "topic");
  const completedStatuses = getCompletedStatuses(app);

  const files = app.vault
    .getMarkdownFiles()
    .filter((f) => f.path.startsWith(topicFolder + "/"));

  const overdue: TopicItem[] = [];

  files.forEach((file) => {
    const cache = app.metadataCache.getFileCache(file);
    if (cache?.frontmatter) {
      const fm = cache.frontmatter;
      if (fm.deadline && !completedStatuses.includes(fm.status)) {
        const deadlineDate = new Date(fm.deadline);
        if (!isNaN(deadlineDate.getTime()) && deadlineDate < today) {
          overdue.push({
            title: file.basename,
            type: fm.type || "",
            status: fm.status || "",
            created: fm.created || "",
            deadline: fm.deadline,
            path: file.path,
          });
        }
      }
    }
  });

  return overdue;
}

export function getLearningStats(app: App): Record<string, number> {
  const learningStatuses = getStatuses(app, "learning");
  const learningStatusField = getFieldName(app, "learningStatus");
  const stats: Record<string, number> = {};
  learningStatuses.forEach((s) => (stats[s] = 0));

  app.vault.getMarkdownFiles().forEach((file) => {
    const cache = app.metadataCache.getFileCache(file);
    if (cache?.frontmatter?.[learningStatusField]) {
      const status = cache.frontmatter[learningStatusField];
      if (status in stats) {
        stats[status]++;
      }
    }
  });

  return stats;
}

export function getActivityData(
  app: App,
  days: number = 365
): Record<string, number> {
  const data: Record<string, number> = {};
  const now = Date.now();
  const cutoff = now - days * 24 * 60 * 60 * 1000;

  app.vault.getMarkdownFiles().forEach((file) => {
    if (file.stat.ctime > cutoff) {
      const date = toLocalDateStr(new Date(file.stat.ctime));
      data[date] = (data[date] || 0) + 1;
    }
    if (file.stat.mtime > cutoff && file.stat.mtime !== file.stat.ctime) {
      const date = toLocalDateStr(new Date(file.stat.mtime));
      data[date] = (data[date] || 0) + 1;
    }
  });

  return data;
}

export interface DomainModuleStatsResult {
  /** 模块统计（同一文件可能出现在多个模块中） */
  moduleStats: Record<string, Record<string, number>>;
  /** 领域去重后的文件总数 */
  domainTotal: number;
}

/**
 * 获取指定领域的模块学习统计
 * 同一篇文章可匹配多个模块（在各模块中都显示）
 * 但领域总数只计算去重后的唯一文件数
 */
export function getDomainModuleStats(
  app: App,
  domainId: string
): DomainModuleStatsResult {
  const domains = getDomains(app);
  const domain = domains.find((d) => d.id === domainId);
  if (!domain) return { moduleStats: {}, domainTotal: 0 };

  const learningStatuses = getStatuses(app, "learning");
  const learningStatusField = getFieldName(app, "learningStatus");
  const domainLower = domain.name.toLowerCase();

  // 初始化所有模块 + "未分类"
  const moduleStats: Record<string, Record<string, number>> = {};
  const initStats = () => {
    const s: Record<string, number> = {};
    learningStatuses.forEach((status) => (s[status] = 0));
    s["未标记"] = 0;
    return s;
  };
  domain.modules.forEach((mod) => { moduleStats[mod.name] = initStats(); });
  const uncategorizedName = "未分类";
  moduleStats[uncategorizedName] = initStats();

  // 用于领域总数去重
  const countedFiles = new Set<string>();

  app.vault.getMarkdownFiles().forEach((file) => {
    const cache = app.metadataCache.getFileCache(file);
    const tags: string[] = cache?.frontmatter?.tags || [];
    const tagsLower = tags.map((t) => String(t).toLowerCase());

    // 先检查是否属于该领域
    const inDomain = tagsLower.includes(domainLower);
    if (!inDomain) return;

    // 找所有匹配的模块（一篇文章可匹配多个）
    const matchedMods = domain.modules.filter((m) =>
      tagsLower.includes(m.name.toLowerCase()) || tagsLower.includes(m.id.toLowerCase())
    );

    const status = cache?.frontmatter?.[learningStatusField];
    const statusKey = status && status in initStats() ? status : "未标记";

    if (matchedMods.length > 0) {
      // 匹配到模块 → 在每个匹配的模块中都计数
      matchedMods.forEach((mod) => {
        moduleStats[mod.name][statusKey]++;
      });
    } else {
      // 未匹配任何模块 → 归入"未分类"
      moduleStats[uncategorizedName][statusKey]++;
    }

    // 领域总数：每个文件只算一次
    countedFiles.add(file.path);
  });

  // 如果"未分类"为空，移除
  const uncategorizedTotal = Object.values(moduleStats[uncategorizedName]).reduce((a, b) => a + b, 0);
  if (uncategorizedTotal === 0) {
    delete moduleStats[uncategorizedName];
  }

  return { moduleStats, domainTotal: countedFiles.size };
}

// 获取文件夹统计
export function getFolderStats(app: App): Record<string, number> {
  const stats: Record<string, number> = {};
  app.vault.getMarkdownFiles().forEach((file) => {
    const topLevel = file.path.split("/")[0];
    if (topLevel !== file.path) {
      stats[topLevel] = (stats[topLevel] || 0) + 1;
    }
  });
  return stats;
}

// 获取领域统计（大小写不敏感匹配 tags）
export function getDomainStats(app: App, domain: string): Record<string, number> {
  const learningStatuses = getStatuses(app, "learning");
  const learningStatusField = getFieldName(app, "learningStatus");
  const stats: Record<string, number> = {};
  learningStatuses.forEach((s) => (stats[s] = 0));
  stats["未标记"] = 0;

  const domainLower = domain.toLowerCase();
  app.vault.getMarkdownFiles().forEach((file) => {
    const cache = app.metadataCache.getFileCache(file);
    const tags: string[] = cache?.frontmatter?.tags || [];
    const matched = tags.some((t) => String(t).toLowerCase() === domainLower);
    if (matched) {
      const status = cache?.frontmatter?.[learningStatusField];
      if (status && status in stats) {
        stats[status]++;
      } else {
        stats["未标记"]++;
      }
    }
  });

  return stats;
}

// 获取领域的文件列表
export function getDomainFiles(app: App, domain: string): TFile[] {
  const files: TFile[] = [];

  app.vault.getMarkdownFiles().forEach((file) => {
    const cache = app.metadataCache.getFileCache(file);
    if (cache?.frontmatter?.tags?.includes(domain)) {
      files.push(file);
    }
  });

  return files.sort((a, b) => b.stat.mtime - a.stat.mtime);
}

// 获取全部事项（不限状态）
export function getAllTopics(app: App): TopicItem[] {
  const topicFolder = getFolderPath(app, "topic");
  const files = app.vault
    .getMarkdownFiles()
    .filter((f) => f.path.startsWith(topicFolder + "/"));

  const topics: TopicItem[] = [];

  files.forEach((file) => {
    const cache = app.metadataCache.getFileCache(file);
    if (cache?.frontmatter) {
      const fm = cache.frontmatter;
      topics.push({
        title: file.basename,
        type: fm.type || "",
        status: fm.status || "",
        created: fm.created || "",
        deadline: fm.deadline || "",
        path: file.path,
      });
    }
  });

  return topics;
}

// 按类型筛选事项
export function getTopicsByType(app: App, type: string): TopicItem[] {
  const topicFolder = getFolderPath(app, "topic");
  const files = app.vault
    .getMarkdownFiles()
    .filter((f) => f.path.startsWith(topicFolder + "/"));

  const topics: TopicItem[] = [];

  files.forEach((file) => {
    const cache = app.metadataCache.getFileCache(file);
    if (cache?.frontmatter) {
      const fm = cache.frontmatter;
      if (fm.type === type) {
        topics.push({
          title: file.basename,
          type: fm.type || "",
          status: fm.status || "",
          created: fm.created || "",
          deadline: fm.deadline || "",
          path: file.path,
        });
      }
    }
  });

  return topics;
}
