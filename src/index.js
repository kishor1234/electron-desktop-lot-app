require('v8-compile-cache');
const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const { PosPrinter } = require('electron-pos-printer');

// process.setMaxListeners(Infinity); // <== Important line
require('events').EventEmitter.defaultMaxListeners = 90000;


let win;
let printers;
var PrinterName;
var width = "170px";
var options
app.on('ready', () => {
    win = new BrowserWindow({
        resizable: true,
        center: true,
        autoHideMenuBar: true,
        fullscreen: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
    });
    win.maximize();
    win.show();
    win.setAlwaysOnTop(true, 'screen');
    // win.loadURL(`http://web.rajshriwinlot.com/?app&r=logout`);
    win.loadURL(`http://web.yatara.lcl/?app`);

    // console.log(process.env.NODE_ENV);
    // win.loadURL(`${process.env.URL}`);
    const mainMenu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(mainMenu);
    printers = win.webContents.getPrinters(); //list the printers

    printers.map((item, index) => {
        //write in the screen the printers for choose
        if (item.isDefault) {
            PrinterName = item.name;
        }
    });
    options = {
        preview: false, // Preview in window or print
        width: width, //  width of content body
        margin: "0px 20px 0px 0px", // margin of content body
        copies: 1, // Number of copies to print
        printerName: PrinterName, // printerName: string, check it at webContent.getPrinters()
        timeOutPerLine: 500,
        silent: true,
    };
});


//Menu Templete
const menuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Bet',
                accelerator: process.platform === 'darwin' ? 'command+F6' : 'F6',
                click() {
                    regbet('bet');
                },
            },
            {
                label: 'UP',
                accelerator: process.platform === 'darwin' ? 'command+F8' : 'F8',
                click() {
                    regbet('up');
                },
            },
            {
                label: 'Down',
                accelerator: process.platform === 'darwin' ? 'command+F9' : 'F9',
                click() {
                    regbet('down');
                },
            },
            {
                label: 'Claim',
                accelerator: process.platform === 'darwin' ? 'command+F7' : 'F7',
                click() {
                    regbet('fclaim');
                },
            },
            {
                label: 'Reload',
                accelerator: process.platform === 'darwin' ? 'command+F7' : 'Ctrl+R',
                click() {
                    win.reload();
                },
            }, {
                label: 'Quit',
                accelerator: process.platform === 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click() {
                    app.quit();
                }
            }
        ]
    }
];
//End Menu

//Register bet
function regbet(todo) {
    
    win.webContents.send('register:bet', todo);
}

if (process.env.NODE_ENV !== 'production') {
    //production
    //developemnt
    //staging
    //test
    //     NODE_ENV=production
    // URL=http://web.yatara.lcl/?app
    menuTemplate.push({
        label: 'Developer',
        submenu: [
            {
                label: "Toggle Developer Tools",
                accelerator: process.platform === 'darwin' ? 'Command+Alt+i' : 'Ctrl+Shift+i',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            }
        ]
    });
}



ipcMain.on('todo:add', (event, todo) => {
    switch (todo) {
        case "quit":
            app.quit();
            break;
        default:
            var ticketArray = JSON.parse(todo);
            // console.log(ticketArray);
            if (PrinterName && width) {
                PosPrinter.print(ticketArray, options)
                    .then(() => {
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            } else {
                alert("Select the printer and the width");
            }
            break;

    }
});

