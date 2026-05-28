import { Plugin, WorkspaceLeaf } from "obsidian";
import { WorkspaceView, VIEW_TYPE_WORKSPACE } from "./src/views/WorkspaceView";
import { CreateNoteModal } from "./src/modals/CreateNoteModal";
import {
  getDiaryTemplate,
  getDiaryPath,
  getWeeklyPlanTemplate,
  getWeeklyPlanPath,
} from "./src/utils/templates";

export default class WorkspacePlugin extends Plugin {
  async onload() {
    console.log("Loading Workspace Plugin");

    // 注册视图
    this.registerView(VIEW_TYPE_WORKSPACE, (leaf) => new WorkspaceView(leaf));

    // 侧边栏图标
    this.addRibbonIcon("layout-dashboard", "打开工作台", () => {
      this.activateView();
    });

    // 打开工作台命令
    this.addCommand({
      id: "open-workspace",
      name: "打开工作台",
      callback: () => {
        this.activateView();
      },
    });

    // 创建今日日记命令
    this.addCommand({
      id: "create-diary",
      name: "创建今日日记",
      callback: async () => {
        const path = getDiaryPath();
        const existing = this.app.vault.getAbstractFileByPath(path);
        if (existing) {
          this.app.workspace.openLinkText(path, "");
        } else {
          const content = getDiaryTemplate();
          const file = await this.app.vault.create(path, content);
          this.app.workspace.openLinkText(file.path, "");
        }
      },
    });

    // 创建本周计划命令
    this.addCommand({
      id: "create-weekly-plan",
      name: "创建本周计划",
      callback: async () => {
        const path = getWeeklyPlanPath();
        const existing = this.app.vault.getAbstractFileByPath(path);
        if (existing) {
          this.app.workspace.openLinkText(path, "");
        } else {
          const content = getWeeklyPlanTemplate();
          const file = await this.app.vault.create(path, content);
          this.app.workspace.openLinkText(file.path, "");
        }
      },
    });

    // 创建选题命令
    this.addCommand({
      id: "create-topic",
      name: "创建选题",
      callback: () => {
        new CreateNoteModal(this.app, "task", async (path, content) => {
          const file = await this.app.vault.create(path, content);
          this.app.workspace.openLinkText(file.path, "");
        }).open();
      },
    });
  }

  async activateView(): Promise<void> {
    const { workspace } = this.app;
    let leaf: WorkspaceLeaf | null = null;
    const leaves = workspace.getLeavesOfType(VIEW_TYPE_WORKSPACE);

    if (leaves.length > 0) {
      leaf = leaves[0];
    } else {
      leaf = workspace.getRightLeaf(false);
      if (leaf) {
        await leaf.setViewState({ type: VIEW_TYPE_WORKSPACE, active: true });
      }
    }

    if (leaf) {
      workspace.revealLeaf(leaf);
    }
  }

  onunload() {
    console.log("Unloading Workspace Plugin");
  }
}
