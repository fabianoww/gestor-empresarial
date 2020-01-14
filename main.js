const { app, BrowserWindow, screen }  = require('electron');

let mainWindow = null;
app.on('ready', () => {
    console.log('Aplicacão iniciada');
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    mainWindow = new BrowserWindow({  
        width, 
        height,  
        webPreferences: {
            nodeIntegration: true
        },
        show: false
    });

    /*
    let templateMenu = templateGenerator.geraMenuPrincipalTemplate(app);
    let menuPrincipal = Menu.buildFromTemplate(templateMenu);
    Menu.setApplicationMenu(menuPrincipal);
    */

    mainWindow.loadURL(`file://${__dirname}/app/main.html`);
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });
});

app.on('window-all-closed', () => {
    app.quit();
});