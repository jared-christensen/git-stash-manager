import * as vscode from "vscode";
import simpleGit, { SimpleGit } from "simple-git";

export class StashTreeProvider implements vscode.TreeDataProvider<StashItem> {
  private git: SimpleGit = simpleGit();
  private _onDidChangeTreeData: vscode.EventEmitter<
    StashItem | undefined | void
  > = new vscode.EventEmitter<StashItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<StashItem | undefined | void> =
    this._onDidChangeTreeData.event;

  async getChildren(element?: StashItem): Promise<StashItem[]> {
    if (element) return [];
    const stashes = await this.getStashes();
    return stashes.map(
      (stash, index) => new StashItem(`stash@{${index}}`, stash)
    );
  }

  async getStashes(): Promise<string[]> {
    const stashList = await this.git.stashList();
    return stashList.all.map((stash) => stash.message);
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
