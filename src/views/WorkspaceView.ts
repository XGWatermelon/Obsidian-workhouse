import { ItemView, WorkspaceLeaf } from "obsidian";
import { detectTheme, applyTheme } from "../utils/theme";
import { StatusBar } from "./StatusBar";
import { QuickActions } from "./QuickActions";
import { ActionTab } from "./tabs/ActionTab";
import { KnowledgeTab } from "./tabs/KnowledgeTab";
import { AnalysisTab } from "./tabs/AnalysisTab";
import { ReadingTab } from "./tabs/ReadingTab";

export const VIEW_TYPE_WORKSPACE = "workspace-view";

export class WorkspaceView extends ItemView {
  private activeTab: string = "action";
  private statusBar: StatusBar;
  private quickActions: QuickActions;
  private tabContent: HTMLElement;

  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }

  getViewType(): string {
    return VIEW_TYPE_WORKSPACE;
  }

  getDisplayText(): string {
    return "智能工作台";
  }

  getIcon(): string {
    return "layout-dashboard";
  }

  async onOpen(): Promise<void> {
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass("workspace-container");

    const theme = detectTheme();
    applyTheme(container as HTMLElement, theme);

    const statusContainer = container.createDiv();
    this.statusBar = new StatusBar(this.app, statusContainer);
    this.statusBar.render();

    const actionsContainer = container.createDiv();
    this.quickActions = new QuickActions(this.app, actionsContainer);
    this.quickActions.render();

    this.createTabNav(container as HTMLElement);

    this.tabContent = container.createDiv({ cls: "workspace-tab-content" });

    this.renderTab(this.activeTab);
  }

  private createTabNav(container: HTMLElement): void {
    const nav = container.createDiv({ cls: "workspace-tab-nav" });

    const tabs = [
      { id: "action", label: "行动指北" },
      { id: "knowledge", label: "知识管理" },
      { id: "analysis", label: "学习分析" },
      { id: "reading", label: "稍后阅读" },
    ];

    tabs.forEach((tab) => {
      const tabEl = nav.createDiv({
        cls: `workspace-tab-item ${tab.id === this.activeTab ? "active" : ""}`,
        text: tab.label,
      });
      tabEl.dataset.tabId = tab.id;
      tabEl.addEventListener("click", () => this.switchTab(tab.id));
    });
  }

  private switchTab(tabId: string): void {
    this.activeTab = tabId;

    this.containerEl.querySelectorAll(".workspace-tab-item").forEach((el) => {
      el.classList.toggle("active", (el as HTMLElement).dataset.tabId === tabId);
    });

    this.renderTab(tabId);
  }

  private renderTab(tabId: string): void {
    this.tabContent.empty();

    switch (tabId) {
      case "action":
        new ActionTab(this.app, this.tabContent).render();
        break;
      case "knowledge":
        new KnowledgeTab(this.app, this.tabContent).render();
        break;
      case "analysis":
        new AnalysisTab(this.app, this.tabContent).render();
        break;
      case "reading":
        new ReadingTab(this.app, this.tabContent).render();
        break;
    }
  }

  async onClose(): Promise<void> {
    // Cleanup
  }
}
