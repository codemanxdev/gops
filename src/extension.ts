import * as vscode from 'vscode';
import { TreeDataProvider } from './TreeDataProvider';

export function activate(context: vscode.ExtensionContext) {
  const treeDataProvider = new TreeDataProvider();
  vscode.window.registerTreeDataProvider("gitOpsView", treeDataProvider);
	console.log('Congratulations, your extension "gops" is now active!');

	const disposable = vscode.commands.registerCommand('gops.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from gops!');
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
