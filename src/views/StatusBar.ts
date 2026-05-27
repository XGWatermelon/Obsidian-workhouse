import { App } from "obsidian";
import {
  getTodayDiaryPath,
  fileExists,
  getOverdueTopics,
} from "../utils/dataview";

export class StatusBar {
  private container: HTMLElement;
  private app: App;

  constructor(app: App, container: HTMLElement) {
    this.app = app;
    this.container = container;
  }

  render(): void {
    this.container.empty();
    this.container.addClass("workspace-status-bar");

    const todayPath = getTodayDiaryPath();
    const todayExists = fileExists(this.app, todayPath);
    const overdueCount = getOverdueTopics(this.app).length;

    this.createStatCard({
      label: "今日日志",
      value: todayExists ? "已创建" : "未创建",
      color: todayExists ? "var(--ws-primary)" : "var(--ws-gray)",
      onClick: () => {
        if (todayExists) {
          this.app.workspace.openLinkText(todayPath, "");
        } else {
          (this.app as any).commands.executeCommandById(
            "obsidian-workspace-plugin:create-diary"
          );
        }
      },
    });

    this.createStatCard({
      label: "今日待办",
      value: "...",
      color: "var(--ws-primary)",
      onClick: () => {
        this.app.workspace.openLinkText(todayPath, "");
      },
    });

    this.createStatCard({
      label: "本周待办",
      value: "...",
      color: "var(--ws-secondary)",
      onClick: () => {},
    });

    this.createStatCard({
      label: "逾期",
      value: String(overdueCount),
      color: overdueCount > 0 ? "#FF6B6B" : "var(--ws-gray)",
      onClick: () => {},
    });
  }

  private createStatCard(options: {
    label: string;
    value: string;
    color: string;
    onClick: () => void;
  }): void {
    const card = this.container.createDiv({ cls: "workspace-stat-card" });
    card.createDiv({ cls: "workspace-stat-value", text: options.value });
    card.createDiv({ cls: "workspace-stat-label", text: options.label });
    card.style.borderLeft = `4px solid ${options.color}`;
    card.addEventListener("click", options.onClick);
  }
}
