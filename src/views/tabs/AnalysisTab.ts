import { App } from "obsidian";
import {
  getLearningStats,
  getSapModuleStats,
  getActivityData,
} from "../../utils/dataview";

export class AnalysisTab {
  private container: HTMLElement;
  private app: App;

  constructor(app: App, container: HTMLElement) {
    this.app = app;
    this.container = container;
  }

  render(): void {
    this.container.empty();
    this.container.addClass("workspace-analysis-tab");

    this.renderHeatmap();
    this.renderLearningStats();
    this.renderModuleCoverage();
    this.renderObjectStats();
  }

  private renderHeatmap(): void {
    const section = this.container.createDiv({
      cls: "workspace-section workspace-heatmap-section",
    });
    section.createEl("h3", { text: "年度活跃度热力图" });

    const heatmapContainer = section.createDiv({ cls: "workspace-heatmap" });

    const activityData = getActivityData(this.app, 365);

    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 364);

    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);

    // 月份标签
    const monthRow = heatmapContainer.createDiv({
      cls: "workspace-heatmap-months",
    });
    let lastMonth = -1;
    for (let i = 0; i < 53; i++) {
      const weekDate = new Date(startDate);
      weekDate.setDate(weekDate.getDate() + i * 7);
      const month = weekDate.getMonth();
      if (month !== lastMonth) {
        const monthLabel = monthRow.createDiv({
          cls: "workspace-heatmap-month",
          text: this.getMonthName(month),
        });
        monthLabel.style.gridColumn = `${i + 1}`;
        lastMonth = month;
      }
    }

    // 热力图网格
    const grid = heatmapContainer.createDiv({ cls: "workspace-heatmap-grid" });

    for (let week = 0; week < 53; week++) {
      const weekCol = grid.createDiv({ cls: "workspace-heatmap-week" });

      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(currentDate.getDate() + week * 7 + day);

        if (currentDate > today) {
          weekCol.createDiv({ cls: "workspace-heatmap-day future" });
          continue;
        }

        const dateStr = currentDate.toISOString().split("T")[0];
        const count = activityData[dateStr] || 0;

        const cell = weekCol.createDiv({
          cls: `workspace-heatmap-day level-${this.getActivityLevel(count)}`,
        });
        cell.title = `${dateStr}: ${count} 篇笔记`;
      }
    }
  }

  private getActivityLevel(count: number): number {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 10) return 3;
    return 4;
  }

  private getMonthName(month: number): string {
    const names = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];
    return names[month];
  }

  private renderLearningStats(): void {
    const section = this.container.createDiv({ cls: "workspace-section" });
    section.createEl("h3", { text: "学习状态分布" });

    const stats = getLearningStats(this.app);
    const statsEl = section.createDiv({
      cls: "workspace-learning-stats-horizontal",
    });

    const colors: Record<string, string> = {
      待阅读: "var(--ws-gray)",
      已阅读: "var(--ws-primary)",
      已理解: "#4FC1FF",
      已掌握: "var(--ws-secondary)",
    };

    const total = Object.values(stats).reduce((a, b) => a + b, 0);

    Object.entries(stats).forEach(([status, count]) => {
      const statCard = statsEl.createDiv({ cls: "workspace-stat-card-small" });
      const value = statCard.createDiv({
        cls: "workspace-stat-value-small",
        text: String(count),
      });
      value.style.color = colors[status];
      statCard.createDiv({ cls: "workspace-stat-label-small", text: status });
      if (total > 0) {
        const percent = Math.round((count / total) * 100);
        statCard.createDiv({
          cls: "workspace-stat-percent",
          text: `${percent}%`,
        });
      }
    });
  }

  private renderModuleCoverage(): void {
    const section = this.container.createDiv({ cls: "workspace-section" });
    section.createEl("h3", { text: "模块覆盖" });

    const stats = getSapModuleStats(this.app);
    const grid = section.createDiv({ cls: "workspace-module-grid" });

    Object.entries(stats).forEach(([mod, statusCounts]) => {
      const card = grid.createDiv({ cls: "workspace-module-card" });
      card.createEl("h4", { text: mod });

      const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);
      const mastered = statusCounts["已掌握"] || 0;

      card.createDiv({
        cls: "workspace-module-progress",
        text: `${mastered}/${total}`,
      });

      const progressBar = card.createDiv({ cls: "workspace-progress-bar" });
      const progressFill = progressBar.createDiv({
        cls: "workspace-progress-fill",
      });
      if (total > 0) {
        progressFill.style.width = `${(mastered / total) * 100}%`;
      }
    });
  }

  private renderObjectStats(): void {
    const section = this.container.createDiv({ cls: "workspace-section" });
    section.createEl("h3", { text: "对象图谱" });

    const objectFiles = this.app.vault
      .getMarkdownFiles()
      .filter((f) => f.path.startsWith("对象/"));

    const statEl = section.createDiv({ cls: "workspace-object-stats" });
    statEl.createEl("p", {
      text: `共 ${objectFiles.length} 个知识图谱节点`,
    });

    const list = statEl.createEl("ul", { cls: "workspace-simple-list" });
    objectFiles.slice(0, 10).forEach((file) => {
      const item = list.createEl("li");
      const link = item.createEl("a", {
        text: file.basename,
        href: "#",
      });
      link.addEventListener("click", (e) => {
        e.preventDefault();
        this.app.workspace.openLinkText(file.path, "");
      });
    });
  }
}
