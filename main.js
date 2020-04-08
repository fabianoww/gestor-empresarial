const { app, BrowserWindow, screen }  = require('electron');
const dbDao = require('./app/dao/dbDao');

let mainWindow = null;
app.on('ready', () => {
    console.log('Aplicacao iniciada');
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    mainWindow = new BrowserWindow({  
        width, 
        height,  
        webPreferences: {
            nodeIntegration: true
        },
        show: false
    });

    // TODO Exibir splash screen

    // Inicializando banco de dados
    dbDao.initDB();

    // Carregando tela principal
    mainWindow.loadURL(`file://${__dirname}/app/main.html`);
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });
});

app.on('window-all-closed', () => {
    app.quit();
});