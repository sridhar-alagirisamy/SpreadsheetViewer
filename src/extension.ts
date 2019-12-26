import * as vscode from 'vscode';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('spreadsheet.preview', (uri) => {
		console.log(uri);
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

export function deactivate() {}
