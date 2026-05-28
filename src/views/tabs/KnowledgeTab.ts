import { App } from "obsidian";
import { getTopicsByStatus, getRecentFiles } from "../../utils/dataview";

export class KnowledgeTab {
  private container: HTMLElement;
  private app: App;

  constructor(app: App, container: HTMLElement) {
    this.app = app;
    this.container = container;
  }

  render(): void {
    this.container.empty();
    this.container.addClass("workspace-knowledge-tab");

    this.renderTopicList();
    this.renderTopicPool();
    this.renderRecentNotes();
  }

  private renderTopicList(): void {
    const section = this.container.createDiv({ cls: "workspace-section" });
    section.createEl("h3", { text: "选题清单" });

    const topics = getTopicsByStatus(this.app, "进行中");
    if (topics.length === 0) {
      section.createEl("p", {
        cls: "workspace-empty-text",
        text: "暂无进行中的选题",
      });
    } else {
      const grid = section.createDiv({ cls: "workspace-topic-grid" });
      topics.forEach((topic) => {
        const card = grid.createDiv({ cls: "workspace-topic-card" });
        const header = card.createDiv({ cls: "workspace-topic-header" });
        const typeTag = header.createSpan({
          cls: `workspace-type-tag ${topic.type}`,
          text: topic.type,
        });
        const title = card.createEl("a", {
          cls: "workspace-topic-title",
          text: topic.title,
          href: "#",
        });
        title.addEventListener("click", (e) => {
          e.preventDefault();
          this.app.workspace.openLinkText(topic.path, "");
        });
        if (topic.deadline) {
          card.createDiv({
            cls: "workspace-topic-deadline",
            text: `截止: ${topic.deadline}`,
          });
        }
      });
    }
  }

  private renderTopicPool(): void {
    const section = this.container.createDiv({ cls: "workspace-section" });
    section.createEl("h3", { text: "选题池" });

    const topics = getTopicsByStatus(this.app, "待评估");
    if (topics.length === 0) {
      section.createEl("p", {
        cls: "workspace-empty-text",
        text: "暂无待评估的选题",
      });
    } else {
      const list = section.createEl("ul", { cls: "workspace-simple-list" });
      topics.forEach((topic) => {
        const item = list.createEl("li");
        const link = item.createEl("a", {
          text: topic.title,
          href: "#",
        });
        link.addEventListener("click", (e) => {
          e.preventDefault();
          this.app.workspace.openLinkText(topic.path, "");
        });
        item.createSpan({
          cls: "workspace-list-date",
          text: topic.created,
        });
      });
    }
  }

  private renderRecentNotes(): void {
    const section = this.container.createDiv({ cls: "workspace-section" });
    section.createEl("h3", { text: "最近笔记" });

    const files = getRecentFiles(this.app, 7);
    if (files.length === 0) {
      section.createEl("p", {
        cls: "workspace-empty-text",
        text: "暂无最近修改的笔记",
      });
    } else {
      const list = section.createEl("ul", { cls: "workspace-simple-list" });
      files.slice(0, 15).forEach((file) => {
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
          cls: "workspace-list-date",
          text: new Date(file.stat.mtime).toLocaleDateString(),
        });
      });
    }
  }
}
