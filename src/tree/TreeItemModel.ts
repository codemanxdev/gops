import * as vscode from 'vscode';

export class TreeItemModel extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly contextValue?: string,
    public readonly command?: vscode.Command,
  ) {
    super(label, collapsibleState);
    this.contextValue = contextValue;
    this.command = command;    
  }
}
