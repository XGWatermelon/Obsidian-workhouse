import { Plugin } from "obsidian";

export default class WorkspacePlugin extends Plugin {
  async onload() {
    console.log("Loading Workspace Plugin");
  }

  onunload() {
    console.log("Unloading Workspace Plugin");
  }
}
