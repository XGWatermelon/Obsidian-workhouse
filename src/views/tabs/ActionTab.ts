import { App } from "obsidian";
import {
  getTodayDiaryPath,
  fileExists,
  getTopicsByStatus,
  getLearningStats,
  getRecentFiles,
} from "../../utils/dataview";

export class ActionTab {
  private container: HTMLElement;
  private app: App;

  constructor(app: App, container: HTMLElement) {
    this.app = app;
    this.container = container;
  }

  render(): void {
    this.container.empty();
    this.container.addClass("workspace-action-tab");

    const left = this.container.createDiv({ cls: "workspace-action-left" });
    this.renderTodayTasks(left);
    this.renderActiveTopics(left);

    const right = this.container.createDiv({ cls: "workspace-action-right" });
    this.renderWeeklyPlan(right);
    this.renderLearningProgress(right);
    this.renderRecentModified(right);
  }

  private renderTodayTasks(container: HTMLElement): void {
    const card = container.createDiv({ cls: "workspace-card" });
    card.createEl("h3", { text: "今日要事" });

    const todayPath = getTodayDiaryPath();
    if (fileExists(this.app, todayPath)) {
      const content = card.createDiv({ cls: "workspace-card-content" });
      content.createEl("p", { text: "加载中..." });
      const editBtn = card.createDiv({
        cls: "workspace-card-action",
        text: "编辑",
      });
      editBtn.addEventListener("click", () => {
        this.app.workspace.openLinkText(todayPath, "");
      });
    } else {
      const empty = card.createDiv({ cls: "workspace-card-empty" });
      empty.createEl("p", { text: "今日日记未创建" });
      const createBtn = empty.createDiv({
        cls: "workspace-card-action",
        text: "创建日记",
      });
      createBtn.addEventListener("click", () => {
        (this.app as any).commands.executeCommandById(
          "obsidian-workspace-plugin:create-diary"
        );
      });
    }
  }

  private renderActiveTopics(container: HTMLElement): void {
    const card = container.createDiv({ cls: "workspace-card" });
    card.createEl("h3", { text: "活跃任务" });

    const topics = getTopicsByStatus(this.app, "进行中");
    if (topics.length === 0) {
      card.createEl("p", {
        cls: "workspace-card-empty-text",
        text: "暂无进行中的任务",
      });
    } else {
      const list = card.createEl("ul", { cls: "workspace-topic-list" });
      topics.slice(0, 10).forEach((topic) => {
        const item = list.createEl("li");
        const typeTag = item.createSpan({
          cls: `workspace-type-tag ${topic.type}`,
          text: topic.type,
        });
        const titleLink = item.createEl("a", {
          text: topic.title,
          href: "#",
        });
        titleLink.addEventListener("click", (e) => {
          e.preventDefault();
          this.app.workspace.openLinkText(topic.path, "");
        });
      });
    }
  }

  private renderWeeklyPlan(container: HTMLElement): void {
    const card = container.createDiv({ cls: "workspace-card" });
    card.createEl("h3", { text: "本周计划" });

    const now = new Date();
    const weekNum = this.getWeekNumber(now);
    const year = now.getFullYear();
    const planPath = `日记/${year}-W${weekNum
      .toString()
      .padStart(2, "0")}-本周计划.md`;

    if (fileExists(this.app, planPath)) {
      const content = card.createDiv({ cls: "workspace-card-content" });
      content.createEl("p", { text: "加载中..." });
    } else {
      const empty = card.createDiv({ cls: "workspace-card-empty" });
      empty.createEl("p", { text: "本周计划未创建" });
      const createBtn = empty.createDiv({
        cls: "workspace-card-action",
        text: "创建计划",
      });
      createBtn.addEventListener("click", () => {
        (this.app as any).commands.executeCommandById(
          "obsidian-workspace-plugin:create-weekly-plan"
        );
      });
    }
  }

  private renderLearningProgress(container: HTMLElement): void {
    const card = container.createDiv({ cls: "workspace-card" });
    card.createEl("h3", { text: "学习进度" });

    const stats = getLearningStats(this.app);
    const statsEl = card.createDiv({ cls: "workspace-learning-stats" });

    const colors: Record<string, string> = {
      待阅读: "var(--ws-gray)",
      已阅读: "var(--ws-primary)",
      已理解: "#4FC1FF",
      已掌握: "var(--ws-secondary)",
    };

    Object.entries(stats).forEach(([status, count]) => {
      const statItem = statsEl.createDiv({ cls: "workspace-stat-item" });
      const dot = statItem.createSpan({ cls: "workspace-stat-dot" });
      dot.style.background = colors[status];
      statItem.createSpan({ text: `${status}: ${count}` });
    });
  }

  private renderRecentModified(container: HTMLElement): void {
    const card = container.createDiv({ cls: "workspace-card" });
    card.createEl("h3", { text: "最近修改" });

    const files = getRecentFiles(this.app, 7);
    if (files.length === 0) {
      card.createEl("p", {
        cls: "workspace-card-empty-text",
        text: "暂无最近修改",
      });
    } else {
      const list = card.createEl("ul", { cls: "workspace-file-list" });
      files.slice(0, 10).forEach((file) => {
        const item = list.createEl("li");
        const link = item.createEl("a", {
          text: file.basename,
          href: "#",
        });
        link.addEventListener("click", (e) => {
          e.preventDefault();
          this.app.workspace.openLinkText(file.path, "");
        });
        item.createSpan({
          cls: "workspace-file-date",
          text: new Date(file.stat.mtime).toLocaleDateString(),
        });
      });
    }
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(
      ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
    );
  }
}
