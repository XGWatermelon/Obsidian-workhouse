import { App } from "obsidian";
import { CreateNoteModal } from "../modals/CreateNoteModal";

export class QuickActions {
  private container: HTMLElement;
  private app: App;

  constructor(app: App, container: HTMLElement) {
    this.app = app;
    this.container = container;
  }

  render(): void {
    this.container.empty();
    this.container.addClass("workspace-quick-actions");

    const createGroup = this.container.createDiv({
      cls: "workspace-action-group",
    });

    const createButtons = [
      { type: "task", label: "任务" },
      { type: "idea", label: "想法" },
      { type: "project", label: "项目" },
      { type: "inspiration", label: "灵感" },
      { type: "writing", label: "写作" },
      { type: "learning", label: "学习" },
      { type: "diary", label: "日志" },
    ];

    createButtons.forEach((btn) => {
      const button = createGroup.createDiv({
        cls: "workspace-action-btn",
        text: btn.label,
      });
      button.addEventListener("click", () => {
        this.openCreateModal(btn.type);
      });
    });

    this.container.createDiv({ cls: "workspace-action-separator" });

    const workflowGroup = this.container.createDiv({
      cls: "workspace-action-group",
    });

    const workflowButtons = [
      { id: "daily-start", label: "每日开始" },
      { id: "task-overview", label: "任务总览" },
      { id: "inbox-list", label: "待整理清单" },
      { id: "file-archive", label: "文件归档" },
      { id: "task-eval", label: "任务评估" },
      { id: "writing-mgmt", label: "写作管理" },
      { id: "learning-stats", label: "学习统计" },
      { id: "recent-activity", label: "最近动态" },
    ];

    workflowButtons.forEach((btn) => {
      const button = workflowGroup.createDiv({
        cls: "workspace-action-btn workflow",
        text: btn.label,
      });
      button.addEventListener("click", () => {
        this.handleWorkflowAction(btn.id);
      });
    });
  }

  private openCreateModal(type: string): void {
    new CreateNoteModal(this.app, type, async (path, content) => {
      const file = await this.app.vault.create(path, content);
      this.app.workspace.openLinkText(file.path, "");
    }).open();
  }

  private handleWorkflowAction(actionId: string): void {
    console.log("Workflow action:", actionId);
  }
}
