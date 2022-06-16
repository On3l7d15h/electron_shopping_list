/**
 * Creating our vars
 */
const electron = require("electron");
const url = require("url");
const path = require("path");

/**
 * The base of the project
 */

const { app, BrowserWindow, Menu, ipcMain } = electron;
let mainWindow, addWindow; //creating our main window

//SET ENV
process.env.NODE_ENV = "production";

// 1- Listen for the app to be ready
app.on('ready', () => {
    //creating a new windows
    mainWindow = new BrowserWindow({
        //if you want to pass ipcRenderer you need this,
        //this afford require in html
            webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });
    
    //load an html file 
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    })) //is pasing something like file//dirname/mainWindow.html
    //Quit app when closed
    mainWindow.on("close", () => {
        app.quit();
    })

    //build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

    //insert the menu
    Menu.setApplicationMenu(mainMenu)
})

// Handle create Add Windows
const createAddWindow = () => {
    //creating a new sub window

    addWindow = "";
    console.log(addWindow)

    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: "Add shopping list item",    
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });

    console.log(addWindow)

    //adding a path
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'),
        protocol: "file:",
        slashes: true
    }))

    //garbage collection handle
    addWindow.on("close", function(){
        addWindow = null;
    })
}

//Catch item:add
ipcMain.on("item:add", function(e, item){
    mainWindow.webContents.send("item:add", item);
    if(addWindow !== null){
        addWindow.close();
    }
})

//creating meu template
const mainMenuTemplate = [
    {
        //menu
        label: 'File',
        submenu: [
            {
                label: "Add item",
                click(){
                    createAddWindow()
                }
            },
            {
                label: "Clear items",
                click(){
                    mainWindow.webContents.send("item:clear")
                }
            },
            {
                label: 'Quit',
                accelerator: process.platform === 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click(){
                    app.quit();
                }
            }
        ]
    }
]

//if mac add empty object to menu
if(process.platform == "darwin"){
    mainMenuTemplate.unshift({})
}

//Add developer tools item if we are not in production
if(process.env.NODE_ENV !== "production"){
    mainMenuTemplate.push({
        label: "Developers Tools",
        submenu: [
            {
                label: "Toogle DEvTools",
                accelerator: process.platform === "darwin" ? "Command+I": "Ctrl+I",
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: "reload"
            }
        ]
    })
}