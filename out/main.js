// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
    window.file; 
    window.onload = () => {
        document.body.style.height = document.documentElement.clientHeight + 'px';
        spreadsheet = new ej.spreadsheet.Spreadsheet({
            openUrl: 'https://ej2services.syncfusion.com/production/web-services/api/spreadsheet/open',
            saveUrl: 'https://ej2services.syncfusion.com/production/web-services/api/spreadsheet/save',
            created: () => {
                if (window.file) {
                    spreadsheet.open({ file: new File([window.file], "sample.xlsx") });
                }                
            }
        });
        spreadsheet.appendTo('#spreadsheet');
    }
    
    // Handle messages sent from the extension to the webview
    window.addEventListener('message', event => {
        const message = event.data; // The json data that the extension sent
        if (message.file) {      
            fetch(message.file).then(res => {
                res.blob().then(file => {
                    window.file = file;
                });
            })                
        }        
    });
}());