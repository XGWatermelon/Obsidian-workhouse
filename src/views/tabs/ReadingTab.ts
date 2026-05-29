import { App, TFile } from "obsidian";
import { getFolderPath } from "../../config/accessors";

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

    this.renderFileList("收藏", "savedArticles");
    this.renderFileList("待整理", "inbox");
  }

  private renderFileList(title: string, folderKey: string): void {
    const section = this.container.createDiv({ cls: "workspace-section" });
    section.createEl("h3", { text: title });

    const folder = getFolderPath(this.app, folderKey);
    const files = this.app.vault
      .getMarkdownFiles()
      .filter((f) => f.path.startsWith(folder + "/"))
      .sort((a, b) => b.stat.ctime - a.stat.ctime);

    if (files.length === 0) {
      section.createEl("p", {
        cls: "workspace-empty-text",
        text: `暂无${title}文件`,
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
}
