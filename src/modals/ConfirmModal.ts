import { Modal } from "obsidian";

export class ConfirmModal extends Modal {
  private title: string;
  private message: string;
  private onConfirm: () => void;

  constructor(app: any, title: string, message: string, onConfirm: () => void) {
    super(app);
    this.title = title;
    this.message = message;
    this.onConfirm = onConfirm;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.createEl("h2", { text: this.title });
    contentEl.createEl("p", { text: this.message });

    const buttonDiv = contentEl.createDiv({ cls: "workspace-modal-buttons" });

    const confirmBtn = buttonDiv.createEl("button", {
      text: "确认",
      cls: "workspace-btn workspace-btn-primary",
    });
    confirmBtn.addEventListener("click", () => {
      this.onConfirm();
      this.close();
    });

    const cancelBtn = buttonDiv.createEl("button", {
      text: "取消",
      cls: "workspace-btn",
    });
    cancelBtn.addEventListener("click", () => {
      this.close();
    });
  }

  onClose() {
    this.contentEl.empty();
  }
}
