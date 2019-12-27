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
      panel.webview.onDidReceiveMessage((message: any) => {
        fs.writeFileSync(uri.fsPath, (message.file as string).replace("data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,", ""), {encoding: 'base64'});
        vscode.window.showInformationMessage("File saved!");
      });
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
    path.join(extensionPath, 'out/scripts', 'ej2.min.js')
  );

  // Local path to styles run in the webview
  const ej2StylePathOnDisk = vscode.Uri.file(
    path.join(extensionPath, 'out/styles', 'fabric.css')
  );
  const ej2DarkStylePathOnDisk = vscode.Uri.file(
    path.join(extensionPath, 'out/styles', 'fabric-dark.css')
  );

  // And the uri we use to load this script and styles in the webview
  const scriptUri = webview.asWebviewUri(scriptPathOnDisk);
  const ej2ScriptUri = webview.asWebviewUri(ej2scriptPathOnDisk);
  const ej2StyleUri = webview.asWebviewUri(ej2StylePathOnDisk);
  const ej2DarkStyleUri = webview.asWebviewUri(ej2DarkStylePathOnDisk);
  

  // Use a nonce to whitelist which scripts can be run
  const nonce = getNonce();

  return `<!DOCTYPE html>
  <html lang="en">
  <head>
	  <meta charset="UTF-8">
	  <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Spreadsheet Viewer</title>
    <link id="spreadsheet-theme" href="${ej2StyleUri}" rel="stylesheet">
    <script nonce="${nonce}" src="${scriptUri}" type="text/javascript"></script>
	  <style>
      body {
        overflow: hidden;
        margin: 0;
        padding: 0;
      }
	  </style>
  </head>
  <body>
  <script>
      console.log(document.body.className.indexOf('dark') > -1 || document.body.className.indexOf('high-contrast') > -1);
      if (document.body.className.indexOf('dark') > -1 || document.body.className.indexOf('high-contrast') > -1) {
        document.getElementById("spreadsheet-theme").href = "${ej2DarkStyleUri}";
      }
  </script>
  <div id="spreadsheet"></div>
  <script nonce="${getej2Nonce}" src="${ej2ScriptUri}" type="text/javascript"></script>
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
