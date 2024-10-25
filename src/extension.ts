import * as vscode from "vscode";
import simpleGit from "simple-git";
import { StashTreeProvider } from "./StashTreeProvider";

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
  const stashTreeProvider = new StashTreeProvider();
  vscode.window.registerTreeDataProvider("stashExplorer", stashTreeProvider);

  // Initialize simple-git with the workspace root path
  const git = simpleGit(
    vscode.workspace.workspaceFolders?.[0].uri.fsPath || ""
  );

  // Apply Stash Command
  const applyStash = vscode.commands.registerCommand(
    "git-stash-manager.applyStash",
    async (item) => {
      try {
        await git.stash(["apply", item.label]);
        vscode.window.showInformationMessage(`Applied ${item.label}`);
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to apply stash: ${error}`);
      }
    }
  );

  // Pop Stash Command
  const popStash = vscode.commands.registerCommand(
    "git-stash-manager.popStash",
    async (item) => {
      try {
        await git.stash(["pop", item.label]);
        vscode.window.showInformationMessage(`Popped ${item.label}`);
        stashTreeProvider.refresh();
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to pop stash: ${error}`);
      }
    }
  );

  // Drop Stash Command
  const dropStash = vscode.commands.registerCommand(
    "git-stash-manager.dropStash",
    async (item) => {
      try {
        await git.stash(["drop", item.label]);
        vscode.window.showInformationMessage(`Dropped ${item.label}`);
        stashTreeProvider.refresh();
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to drop stash: ${error}`);
      }
    }
  );

  // Register the commands and the tree provider
  context.subscriptions.push(applyStash, popStash, dropStash);

  // Hello World Command (example)
  const helloWorld = vscode.commands.registerCommand(
    "git-stash-manager.helloWorld",
    () => {
      vscode.window.showInformationMessage(
        "Hello World from Git Stash Manager!"
      );
    }
  );

  context.subscriptions.push(helloWorld);
}

// This method is called when your extension is deactivated
export function deactivate() {}
