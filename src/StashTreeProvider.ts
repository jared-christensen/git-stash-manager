import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import simpleGit, { SimpleGit } from "simple-git";

export class StashTreeProvider implements vscode.TreeDataProvider<StashItem> {
  private git: SimpleGit;
  private _onDidChangeTreeData: vscode.EventEmitter<
    StashItem | undefined | void
  > = new vscode.EventEmitter<StashItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<StashItem | undefined | void> =
    this._onDidChangeTreeData.event;

  constructor() {
    const rootPath = vscode.workspace.workspaceFolders?.[0].uri.fsPath || "";
    console.log("Initializing simple-git with rootPath:", rootPath); // Debug line
    this.git = simpleGit(rootPath);
  }

  async getChildren(element?: StashItem): Promise<StashItem[]> {
    if (element) return [];

    if (!this.isGitRepository()) {
      vscode.window.showErrorMessage("This workspace is not a Git repository.");
      return [];
    }

    const stashes = await this.getStashes();
    return stashes.map(
      (stash, index) => new StashItem(`stash@{${index}}`, stash)
    );
  }

  isGitRepository(): boolean {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) return false;
    const rootPath = workspaceFolders[0].uri.fsPath;
    return fs.existsSync(path.join(rootPath, ".git"));
  }

  async getStashes(): Promise<string[]> {
    console.log("getStashes:");
    try {
      const stashList = await this.git.stashList();
      console.log("Stashes found:", stashList.all);
      return stashList.all.map((stash) => stash.message);
    } catch (error) {
      console.error("Error retrieving stashes:", error);
      return [];
    }
  }

  getTreeItem(element: StashItem): vscode.TreeItem {
    return element;
  }
}

class StashItem extends vscode.TreeItem {
  constructor(public readonly label: string, public readonly tooltip: string) {
    super(label);
    this.tooltip = tooltip;
    this.contextValue = "stashItem";
  }
}
