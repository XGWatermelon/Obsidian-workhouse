import { App, TFile } from "obsidian";

export class ReadingTab {
  private container: HTMLElement;
  private app: App;

  constructor(app: App, container: HTMLElement) {
    this.app = app;
    this.container = container;
  }

  render(): void {
    this.container.empty();
    this.container.addClass("workspace-reading-tab");

    this.renderSavedArticles();
    this.renderToBeCategorized();
  }

  private renderSavedArticles(): void {
    const section = this.container.createDiv({ cls: "workspace-section" });
    section.createEl("h3", { text: "收藏摘录" });

    const files = this.getFilesInFolder("待整理/收藏摘录");
    if (files.length === 0) {
      section.createEl("p", {
        cls: "workspace-empty-text",
        text: "暂无收藏摘录",
      });
    } else {
      const list = section.createEl("ul", { cls: "workspace-reading-list" });
      files.forEach((file) => {
        const item = list.createEl("li", { cls: "workspace-reading-item" });
        const link = item.createEl("a", {
          cls: "workspace-reading-title",
          text: file.basename,
          href: "#",
        });
        link.addEventListener("click", (e) => {
          e.preventDefault();
          this.app.workspace.openLinkText(file.path, "");
        });
        item.createDiv({
          cls: "workspace-reading-meta",
          text: `添加于 ${new Date(file.stat.ctime).toLocaleDateString()}`,
        });
      });
    }
  }

  private renderToBeCategorized(): void {
    const section = this.container.createDiv({ cls: "workspace-section" });
    section.createEl("h3", { text: "待归类" });

    const files = this.getFilesInFolder("待整理/待归类");
    if (files.length === 0) {
      section.createEl("p", {
        cls: "workspace-empty-text",
        text: "暂无待归类笔记",
      });
    } else {
      const list = section.createEl("ul", { cls: "workspace-reading-list" });
      files.forEach((file) => {
        const item = list.createEl("li", { cls: "workspace-reading-item" });
        const link = item.createEl("a", {
          cls: "workspace-reading-title",
          text: file.basename,
          href: "#",
        });
        link.addEventListener("click", (e) => {
          e.preventDefault();
          this.app.workspace.openLinkText(file.path, "");
        });
        item.createDiv({
          cls: "workspace-reading-meta",
          text: `添加于 ${new Date(file.stat.ctime).toLocaleDateString()}`,
        });
      });
    }
  }

  private getFilesInFolder(folderPath: string): TFile[] {
    return this.app.vault
      .getMarkdownFiles()
      .filter((f) => f.path.startsWith(folderPath + "/"))
      .sort((a, b) => b.stat.ctime - a.stat.ctime);
  }
}
