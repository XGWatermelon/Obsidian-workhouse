import { App, Editor, EditorPosition, EditorSuggest, EditorSuggestContext, Plugin, TFile } from "obsidian";
import { getConfig } from "../config/accessors";

// ==================== types.json 注册属性类型 ====================

export async function registerPropertyTypes(app: App, config: any): Promise<void> {
  const adapter = app.vault.adapter;
  const typesPath = ".obsidian/types.json";

  let existing: Record<string, any> = {};
  try {
    const raw = await adapter.read(typesPath);
    if (raw) existing = JSON.parse(raw);
  } catch {
    // 文件不存在，从空对象开始
  }

  const fields = config.advanced.fields;
  const statuses = config.basic.statuses;

  // status → select
  if (fields.status) {
    existing[fields.status] = {
      type: "select",
      options: statuses.topic.map((v: string) => ({ value: v })),
    };
  }

  // 学习状态 → select
  if (fields.learningStatus) {
    existing[fields.learningStatus] = {
      type: "select",
      options: statuses.learning.map((v: string) => ({ value: v })),
    };
  }

  // type → select
  if (fields.type) {
    existing[fields.type] = {
      type: "select",
      options: config.basic.types.map((t: any) => ({ value: t.name })),
    };
  }

  await adapter.write(typesPath, JSON.stringify(existing, null, 2));

  // 同时通过内存 API 设置属性类型（立即生效，不依赖 types.json 热加载）
  try {
    const mtm = (app as any).metadataTypeManager;
    if (mtm) {
      Object.entries(existing).forEach(([key, val]: [string, any]) => {
        if (val.type === "select" && mtm.setTypeByName) {
          mtm.setTypeByName(key, "select");
        }
      });
    }
  } catch (e) {
    console.warn("[Worktop] 内存设置属性类型失败:", e);
  }
}

// ==================== EditorSuggest 源码模式补全 ====================

class FieldSuggest extends EditorSuggest<string> {
  private options: string[];
  private fieldName: string;

  constructor(app: App, fieldName: string, options: string[]) {
    super(app);
    this.fieldName = fieldName;
    this.options = options;
  }

  onTrigger(cursor: EditorPosition, editor: Editor, file: TFile): any {  // eslint-disable-line
    const line = editor.getLine(cursor.line);
    const match = line.match(/^(\s*[\w一-鿿]+)\s*:\s*/);
    if (!match) return null;

    const key = match[1].trim();
    if (key !== this.fieldName) return null;

    const colonPos = line.indexOf(":");
    if (cursor.ch <= colonPos) return null;

    const query = line.substring(colonPos + 1).trim();
    return {
      start: { line: cursor.line, ch: colonPos + 1 },
      end: cursor,
      query,
    };
  }

  getSuggestions(context: EditorSuggestContext): string[] {
    return this.options.filter((opt) => opt.includes(context.query));
  }

  renderSuggestion(value: string, el: HTMLElement): void {
    el.createEl("div", { text: value, cls: "workspace-suggest-item" });
  }

  selectSuggestion(value: string, evt: MouseEvent | KeyboardEvent): void {
    if (!this.context) return;
    const { editor } = this.context;
    const line = this.context.start.line;
    const colonPos = editor.getLine(line).indexOf(":");
    editor.replaceRange(` ${value}`, { line, ch: colonPos + 1 }, this.context.end);
  }
}

export function registerEditorSuggests(plugin: Plugin, config: any): void {
  const app = plugin.app;
  const fields = config.advanced.fields;
  const statuses = config.basic.statuses;

  if (fields.status) {
    plugin.registerEditorSuggest(new FieldSuggest(app, fields.status, statuses.topic));
  }

  if (fields.learningStatus) {
    plugin.registerEditorSuggest(new FieldSuggest(app, fields.learningStatus, statuses.learning));
  }

  if (fields.type) {
    const typeNames = config.basic.types.map((t: any) => t.name);
    plugin.registerEditorSuggest(new FieldSuggest(app, fields.type, typeNames));
  }
}
