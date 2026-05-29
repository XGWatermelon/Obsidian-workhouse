import { Plugin, TFile } from "obsidian";
import { AppConfig } from "./types";
import { DEFAULT_CONFIG } from "./defaults";

const CONFIG_FILE = "config.json";

/**
 * 加载配置（合并 config.json + 默认值）
 */
export async function loadConfig(plugin: Plugin): Promise<AppConfig> {
  const customConfig = await loadConfigFile(plugin);
  const merged = deepMerge(DEFAULT_CONFIG, customConfig);
  merged.version = merged.version || 1;
  return merged as AppConfig;
}

/**
 * 从插件目录加载 config.json
 */
async function loadConfigFile(plugin: Plugin): Promise<Partial<AppConfig> | null> {
  const pluginDir = (plugin as any).manifest?.dir || "";
  const configPath = pluginDir ? `${pluginDir}/${CONFIG_FILE}` : CONFIG_FILE;

  try {
    const file = plugin.app.vault.getAbstractFileByPath(configPath);
    if (file && file instanceof TFile) {
      const content = await plugin.app.vault.read(file);
      return JSON.parse(content);
    }
  } catch (e) {
    console.warn("加载 config.json 失败，使用默认配置:", e);
  }
  return null;
}

/**
 * 保存配置到 config.json
 */
export async function saveConfigFile(plugin: Plugin, config: Partial<AppConfig>): Promise<void> {
  const pluginDir = (plugin as any).manifest?.dir || "";
  const configPath = pluginDir ? `${pluginDir}/${CONFIG_FILE}` : CONFIG_FILE;
  const content = JSON.stringify(config, null, 2);

  try {
    const file = plugin.app.vault.getAbstractFileByPath(configPath);
    if (file && file instanceof TFile) {
      await plugin.app.vault.modify(file, content);
    } else {
      await plugin.app.vault.create(configPath, content);
    }
  } catch (e) {
    console.error("保存 config.json 失败:", e);
  }
}

/**
 * 验证配置
 */
export function validateConfig(config: Partial<AppConfig>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (config.basic?.app && !config.basic.app.name) {
    errors.push("basic.app.name 不能为空");
  }
  if (config.basic?.domains && !Array.isArray(config.basic.domains)) {
    errors.push("basic.domains 必须是数组");
  }
  if (config.basic?.domains) {
    config.basic.domains.forEach((domain, i) => {
      if (!domain.id) errors.push(`basic.domains[${i}].id 不能为空`);
      if (!domain.name) errors.push(`basic.domains[${i}].name 不能为空`);
      if (!Array.isArray(domain.modules)) errors.push(`basic.domains[${i}].modules 必须是数组`);
    });
  }
  if (config.basic?.statuses) {
    if (!Array.isArray(config.basic.statuses.topic)) errors.push("basic.statuses.topic 必须是数组");
    if (!Array.isArray(config.basic.statuses.learning)) errors.push("basic.statuses.learning 必须是数组");
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 深度合并对象
 */
function deepMerge(...objects: any[]): any {
  return objects.reduce((merged, obj) => {
    if (!obj) return merged;
    Object.keys(obj).forEach((key) => {
      if (
        obj[key] &&
        typeof obj[key] === "object" &&
        !Array.isArray(obj[key]) &&
        merged[key] &&
        typeof merged[key] === "object"
      ) {
        merged[key] = deepMerge(merged[key], obj[key]);
      } else {
        merged[key] = obj[key];
      }
    });
    return merged;
  }, {});
}
