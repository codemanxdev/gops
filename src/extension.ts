import * as vscode from 'vscode';
import { TreeDataProvider } from './tree/TreeDataProvider';
import { GitService } from './services/GitService';

export function activate(context: vscode.ExtensionContext) {
	const gitService = new GitService();
  const treeDataProvider = new TreeDataProvider(gitService);
  vscode.window.registerTreeDataProvider("gitOpsView", treeDataProvider);
	console.log('Congratulations, your extension "gops" is now active!');

	const disposable = vscode.commands.registerCommand('gops.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from gops!');
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
