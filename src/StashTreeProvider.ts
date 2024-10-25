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
      (stash) => new StashItem(stash.id, stash.description, stash.tooltip)
    );
  }

  isGitRepository(): boolean {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) return false;
    const rootPath = workspaceFolders[0].uri.fsPath;
    return fs.existsSync(path.join(rootPath, ".git"));
  }

  async getStashes(): Promise<
    { id: string; description: string; tooltip: string }[]
  > {
    try {
      const stashList = await this.git.stashList();
      return stashList.all.map((stash, index) => {
        // Parse the stash message to separate branch, commit, and message details
        const [_, branch, commit, message] = stash.message.match(
          /WIP on (.*?): (\S+) (.*)/
        ) || ["", "Unknown branch", "Unknown commit", stash.message];

        return {
          id: `stash@{${index}}`,
          description: `${branch}: ${message}`,
          tooltip: `Commit: ${commit}\nMessage: ${message}`,
        };
      });
    } catch (error) {
      console.error("Error retrieving stashes:", error);
      return [];
    }
  }

  getTreeItem(element: StashItem): vscode.TreeItem {
    return element;
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }
}

class StashItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly description: string,
    public readonly tooltip: string
  ) {
    super(label);
    this.description = description;
    this.tooltip = tooltip;
    this.contextValue = "stashItem";
  }
}
