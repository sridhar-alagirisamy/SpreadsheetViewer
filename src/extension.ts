import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { urlToOptions } from "vscode-test/out/util";

export function activate(context: vscode.ExtensionContext) {
  let postFile: Promise<string>;  
  let webviewPanel: vscode.WebviewPanel;

  // register spreadsheet open command.
  let disposable = vscode.commands.registerCommand("boldsheet.open", (uri: vscode.Uri) => {
    let fileStream: Buffer;
    let fileName: string = "";
    let base64File: string = "";
    showProgress();

    // read excel file using node fs.
    if (uri) {
      fileName = path.basename(uri.fsPath);
      fileStream = fs.readFileSync(uri.fsPath);
      base64File = getMimeType(fileName) + ";base64," + Buffer.from(fileStream).toString('base64');
    }

    // Create web view panel.
    webviewPanel = vscode.window.createWebviewPanel(
      "spreadsheet",
      fileName || "BoldSheet",
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.file(path.join(context.extensionPath, "out"))
        ]
      }
    );
    webviewPanel.webview.html = getWebviewContent(webviewPanel.webview, context.extensionPath);    

    // send file as base64 to webview.
    webviewPanel.webview.postMessage({ file: base64File, showRibbon: <boolean>vscode.workspace.getConfiguration('boldsheet').get("showRibbon") });

    // receive file as base64 from webview to save.
    webviewPanel.webview.onDidReceiveMessage((message: any) => {
      fs.writeFileSync(uri.fsPath, (message.file as string).replace(getMimeType(fileName) + ";base64,", ""), { encoding: 'base64' });
      vscode.window.showInformationMessage("File Saved!");
    });
  });

  // Dispose registered command.
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
  const ej2ContrastStylePathOnDisk = vscode.Uri.file(
    path.join(extensionPath, 'out/styles', 'highcontrast.css')
  );

  // And the uri we use to load this script and styles in the webview
  const scriptUri = webview.asWebviewUri(scriptPathOnDisk);
  const ej2ScriptUri = webview.asWebviewUri(ej2scriptPathOnDisk);
  const ej2StyleUri = webview.asWebviewUri(ej2StylePathOnDisk);
  const ej2DarkStyleUri = webview.asWebviewUri(ej2DarkStylePathOnDisk);
  const ej2ContrastStyleUri = webview.asWebviewUri(ej2ContrastStylePathOnDisk);
  

  // Use a nonce to whitelist which scripts can be run
  const nonce = getNonce();

  return `<!DOCTYPE html>
  <html lang="en">
  <head>
	  <meta charset="UTF-8">
	  <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BoldSheet</title>
    <link id="spreadsheet-theme" href="" rel="stylesheet">
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
    if (document.body.className.indexOf('dark') > -1) {
      document.getElementById("spreadsheet-theme").href = "${ej2DarkStyleUri}";
    } else if (document.body.className.indexOf('high-contrast') > -1) {
      document.getElementById("spreadsheet-theme").href = "${ej2ContrastStyleUri}";
    } else {
      document.getElementById("spreadsheet-theme").href = "${ej2StyleUri}";
    }
  </script>
  <div id="spreadsheet"></div>
  <script nonce="${nonce}" src="${ej2ScriptUri}" type="text/javascript"></script>
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

function showProgress() {
  vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    title: "Loading BoldSheet",
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
}

function getMimeType(fileName: string) {
  if (fileName.indexOf("xlsx") > -1) {
    return "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  } else if (fileName.indexOf("xls") > -1) {
    return "data:application/vnd.ms-excel";
  } else if (fileName.indexOf("csv") > -1) {
    return "data:text/csv";
  } else if (fileName.indexOf("tsv") > -1) {
    return "data:text/tab-separated-values";
  } else {
    return "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  }
}

export function deactivate() { }
