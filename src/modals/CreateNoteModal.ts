import { App, Modal, Setting, Notice } from "obsidian";
import { getTopicTemplate, getTopicPath } from "../utils/templates";
import { getTypes, getStatuses, getTypeName } from "../config/accessors";
import { ensureFolder } from "../utils/dataview";

export class CreateNoteModal extends Modal {
  private noteType: string;
  private title: string = "";
  private status: string;
  private learningStatus: string;
  private deadline: string = "";
  private onSubmit: (path: string, content: string) => void;

  constructor(
    app: App,
    noteType: string,
    onSubmit: (path: string, content: string) => void
  ) {
    super(app);
    this.noteType = noteType;
    this.onSubmit = onSubmit;
    // 从配置读取默认值
    this.status = getStatuses(app, "topic")[0];
    this.learningStatus = getStatuses(app, "learning")[0];
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.addClass("workspace-modal");

    contentEl.createEl("h2", { text: `创建${this.getTypeLabel()}` });

    // 标题输入
    new Setting(contentEl).setName("标题").addText((text) =>
      text.setPlaceholder("输入标题...").onChange((value) => {
        this.title = value;
      })
    );

    // 状态下拉框 - 从配置读取
    const topicStatuses = getStatuses(this.app, "topic");
    new Setting(contentEl).setName("状态").addDropdown((dropdown) => {
      topicStatuses.forEach((s) => dropdown.addOption(s, s));
      dropdown.setValue(this.status).onChange((value) => {
        this.status = value;
      });
    });

    // 学习状态下拉框 - 从配置读取
    const learningStatuses = getStatuses(this.app, "learning");
    new Setting(contentEl).setName("学习状态").addDropdown((dropdown) => {
      learningStatuses.forEach((s) => dropdown.addOption(s, s));
      dropdown.setValue(this.learningStatus).onChange((value) => {
        this.learningStatus = value;
      });
    });

    // 截止日期选择器
    const dateSetting = new Setting(contentEl).setName("截止日期");
    const dateInput = document.createElement("input");
    dateInput.type = "date";
    dateInput.value = this.deadline;
    dateInput.addEventListener("change", (e) => {
      this.deadline = (e.target as HTMLInputElement).value;
    });
    dateSetting.settingEl.appendChild(dateInput);

    // 按钮
    const buttonEl = contentEl.createDiv({ cls: "workspace-modal-buttons" });

    const submitBtn = buttonEl.createEl("button", {
      text: "创建",
      cls: "workspace-btn workspace-btn-primary",
    });
    submitBtn.addEventListener("click", () => this.submitTopic());

    const cancelBtn = buttonEl.createEl("button", {
      text: "取消",
      cls: "workspace-btn",
    });
    cancelBtn.addEventListener("click", () => this.close());
  }

  private getTypeLabel(): string {
    return getTypeName(this.app, this.noteType);
  }

  private getTypeValue(): string {
    return getTypeName(this.app, this.noteType);
  }

  private async submitTopic(): Promise<void> {
    if (!this.title.trim()) {
      return;
    }
    try {
      const path = getTopicPath(this.app, this.title, this.getTypeValue());
      const content = getTopicTemplate(
        this.app,
        this.getTypeValue(),
        this.title,
        this.status,
        this.learningStatus,
        this.deadline
      );
      // 确保父文件夹存在
      const folder = path.split("/").slice(0, -1).join("/");
      await ensureFolder(this.app, folder);
      this.onSubmit(path, content);
      this.close();
    } catch (error) {
      new Notice(`创建失败: ${error.message}`);
      console.error("创建事项失败:", error);
    }
  }

  onClose(): void {
    const { contentEl } = this;
    contentEl.empty();
  }
}
