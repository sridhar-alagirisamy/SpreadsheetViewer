// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "spreadsheetviewer" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.helloWorld', () => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		//vscode.window.showInformationMessage('Hello VSCode!');
		const panel = vscode.window.createWebviewPanel('spreadsheet', 'Spreadsheet Viewer', vscode.ViewColumn.One, { enableScripts: true,
			localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'scripts'))] });
		panel.webview.html = getWebviewContent();
	});

	context.subscriptions.push(disposable);
}

function getWebviewContent() {
	return `<!DOCTYPE html>
  <html lang="en">
  <head>
	  <meta charset="UTF-8">
	  <meta name="viewport" content="width=device-width, initial-scale=1.0">
	  <title>Spreadsheet Viewer</title>
	  <script src="https://cdn.syncfusion.com/ej2/17.4.39/dist/ej2.min.js" type="text/javascript"></script>
	  <link href="https://cdn.syncfusion.com/ej2/material.css" rel="stylesheet">
	  <style>
	  body {
		overflow: hidden;
		margin: 0;
	  }
	  </style>
  </head>
  <body>
	<div id="spreadsheet"></div>
	<script>
	document.body.style.height = document.documentElement.clientHeight + 'px';
	
	var spreadsheet = new ej.spreadsheet.Spreadsheet({
        openUrl: 'https://ej2services.syncfusion.com/production/web-services/api/spreadsheet/open',
        saveUrl: 'https://ej2services.syncfusion.com/production/web-services/api/spreadsheet/save'
    });
	spreadsheet.appendTo('#spreadsheet');

	window.addEventListener('resize', onResize);
	function onResize() {
    	document.body.style.height = document.documentElement.clientHeight + 'px';
    	spreadsheet.resize();
	}
	</script>
  </body>
  </html>`;
  }

// this method is called when your extension is deactivated
export function deactivate() {}
