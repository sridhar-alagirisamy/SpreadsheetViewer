import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

const http = require("http");
const express = require("express");
const cors = require("cors");

export function activate(context: vscode.ExtensionContext) {
  const app = express();
  const server = http.createServer();
  app.use(cors());

  let panel: any = null;
  var fileStream: any;
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
            vscode.Uri.file(path.join(context.extensionPath, "scripts"))
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
      
      fileStream = fs.readFileSync(uri.fsPath);

      const port = server.listen(0).address()["port"];
      

      panel.webview.html = getWebviewContent(port, path.basename(uri.fsPath));

      app.get("/file", function(req: any, res: any) {
        res.send(fileStream);
        server.close();
      });
      server.on("request", app);
    }
  );
  context.subscriptions.push(disposable);
}

function getWebviewContent(port: string, fileName: string) {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
	  <meta charset="UTF-8">
	  <meta name="viewport" content="width=device-width, initial-scale=1.0">
	  <title>Spreadsheet Viewer</title>
	  <script src="https://cdn.syncfusion.com/ej2/17.4.39/dist/ej2.min.js" type="text/javascript"></script>
	  <link href="https://cdn.syncfusion.com/ej2/fabric.css" rel="stylesheet">
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

	fetch('http://localhost:${port}/file')
	.then(response => response.blob())
	.then(function(myBlob) {
		const fileBook = new File([myBlob], '${fileName}');
    	spreadsheet.open({ file: fileBook });
	});

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
