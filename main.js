const { app, BrowserWindow, screen }  = require('electron');
const initDBDao = require('./app/dao/initDBDao');

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

    /*
    let templateMenu = templateGenerator.geraMenuPrincipalTemplate(app);
    let menuPrincipal = Menu.buildFromTemplate(templateMenu);
    Menu.setApplicationMenu(menuPrincipal);
    */

    // Inicializando banco de dados
    initDBDao.startDB();

    // Carregando tela principal
    mainWindow.loadURL(`file://${__dirname}/app/main.html`);
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });
});

app.on('window-all-closed', () => {
    initDBDao.closeDB();
    app.quit();
});