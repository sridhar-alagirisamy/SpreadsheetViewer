import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

export function activate(context: vscode.ExtensionContext) {  
  let panel: vscode.WebviewPanel;  
  let disposable = vscode.commands.registerCommand(
    "spreadsheet.preview",
    (uri: vscode.Uri) => {
      if (uri && !(uri instanceof vscode.Uri)) {
        vscode.window.showInformationMessage(
          "Open a XLSX file to show a preview."
        );
        return;
      }
      panel = vscode.window.createWebviewPanel(
        "spreadsheet",
        "Spreadsheet Viewer",
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          localResourceRoots: [
            vscode.Uri.file(path.join(context.extensionPath, "out"))
          ]
        }
      );
		vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Loading EJ2 Spreadsheet",
        cancellable: true
      }, (progress, token) => {
        token.onCancellationRequested(() => {
          console.log("User canceled the long running operation");
        });
  
        progress.report({ increment: 0 });
  
        setTimeout(() => {
          progress.report({ increment: 10, message: "Loading..." });
        }, 1000);
  
        setTimeout(() => {
          progress.report({ increment: 40, message: "Loading..." });
        }, 2000);
  
        setTimeout(() => {
          progress.report({ increment: 50, message: "Loaded!" });
        }, 3000);
  
        var p = new Promise(resolve => {
          setTimeout(() => {
            resolve();
          }, 5000);
        });
  
        return p;
      });
      var fileStream = fs.readFileSync(uri.fsPath);
      panel.webview.html = getWebviewContent(panel.webview, context.extensionPath);   
      panel.webview.postMessage({ file: "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64," + new Buffer(fileStream).toString('base64') });
    }
  );
  context.subscriptions.push(disposable);
}

function getWebviewContent(webview: vscode.Webview, extensionPath: string) {
  // Local path to main script run in the webview
  const scriptPathOnDisk = vscode.Uri.file(
    path.join(extensionPath, 'out', 'main.js')
  );

   // Local path to main script run in the webview
   const ej2scriptPathOnDisk = vscode.Uri.file(
    path.join(extensionPath, 'out', 'ej2.min.js')
  );

  // And the uri we use to load this script in the webview
  const scriptUri = webview.asWebviewUri(scriptPathOnDisk);
  const ej2ScriptUri = webview.asWebviewUri(ej2scriptPathOnDisk);

  // Use a nonce to whitelist which scripts can be run
  const nonce = getNonce();

  return `<!DOCTYPE html>
  <html lang="en">
  <head>
	  <meta charset="UTF-8">
	  <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Spreadsheet Viewer</title> 
    <script nonce="${nonce}" src="${scriptUri}" type="text/javascript"></script>    
	  <style>
      body {
        overflow: hidden;
        margin: 0;
      }
	  </style>
  </head>
  <body>
  <div id="spreadsheet"></div>
  <script nonce="${getej2Nonce}" src="${ej2ScriptUri}" type="text/javascript"></script>
	<link href="https://cdn.syncfusion.com/ej2/material.css" rel="stylesheet">  
  </body>
  </html>`;
}

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function getej2Nonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01234567890';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}


export function deactivate() {}
