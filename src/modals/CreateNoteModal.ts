import { App, Modal, Setting } from "obsidian";
import { getDiaryTemplate, getTopicTemplate, getDiaryPath, getTopicPath } from "../utils/templates";

export class CreateNoteModal extends Modal {
  private noteType: string;
  private title: string = "";
  private onSubmit: (path: string, content: string) => void;

  constructor(
    app: App,
    noteType: string,
    onSubmit: (path: string, content: string) => void
  ) {
    super(app);
    this.noteType = noteType;
    this.onSubmit = onSubmit;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.addClass("workspace-modal");

    contentEl.createEl("h2", { text: `创建${this.getTypeLabel()}` });

    if (this.noteType === "diary") {
      this.submitDiary();
      return;
    }

    new Setting(contentEl).setName("标题").addText((text) =>
      text.setPlaceholder("输入标题...").onChange((value) => {
        this.title = value;
      })
    );

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
    const labels: Record<string, string> = {
      task: "任务",
      idea: "想法",
      project: "项目",
      inspiration: "灵感",
      writing: "写作",
      learning: "学习",
      diary: "日记",
    };
    return labels[this.noteType] || "笔记";
  }

  private getTypeValue(): string {
    const typeMap: Record<string, string> = {
      task: "任务",
      idea: "想法",
      project: "项目",
      inspiration: "灵感",
      writing: "写作",
      learning: "学习",
    };
    return typeMap[this.noteType] || "任务";
  }

  private async submitDiary(): Promise<void> {
    const path = getDiaryPath();
    const content = getDiaryTemplate();
    this.onSubmit(path, content);
    this.close();
  }

  private async submitTopic(): Promise<void> {
    if (!this.title.trim()) {
      return;
    }
    const path = getTopicPath(this.title);
    const content = getTopicTemplate(this.getTypeValue(), this.title);
    this.onSubmit(path, content);
    this.close();
  }

  onClose(): void {
    const { contentEl } = this;
    contentEl.empty();
  }
}
