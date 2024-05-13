const { app, BrowserWindow, ipcMain, dialog, shell} = require('electron/main');
const HfInference = require('@huggingface/inference');
const path = require('node:path');
const fs = require('node:fs');

const config = require('./renderer/js/config');

const isMac = process.platform === 'darwin';
// const isDev = process.env.NODE_ENV !== 'production';

let _sampleFolder = '';
let _destinationFolder = '/Users/duyx/Code/electron-app/samples/';
let _files = [];

let win;

const createWindow = () => {
    win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
        contextIsolation: true,
        nodeIntegration: true,
        preload: path.join(__dirname, 'preload.js')
    }
  });

  // Open devtools if in dev env
  // if(isDev) { win.webContents.openDevTools(); }

  win.loadFile(path.join(__dirname, './renderer/index.html'))
}

app.on('window-all-closed', () => {
    if (!isMac) {
      app.quit()
    }
});

app.whenReady().then(() => {    
    createWindow()

    win.on('close', () => (win = null));
    
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    });
})

ipcMain.handle('dialog:openDirectory', (e, message) => {
    return await = handleFileOpen(message)
});

async function handleFileOpen (message) 
{
    const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openDirectory', 'createDirectory'],
        filters: [{ name: 'Audio', extensions: ['wav', 'mp3'] }],
    })

    if (!canceled) {
        if(message == 'samplesPath') { 
            _sampleFolder = filePaths[0]
            console.log(_sampleFolder);
            loadDirectory(_sampleFolder);
        }
        else { 
            _destinationFolder = filePaths[0];
            console.log(_destinationFolder); 
        }
        
        return filePaths[0]
    }  
}

ipcMain.on('test:script', (e, options) => {
    // tester();
    tester2();
});

ipcMain.on('fetch:samples', (e, options) => {
    const struct = getFilenamesInSubfolders(_destinationFolder);
    
    win.webContents.send('requested:samples', struct);
});

ipcMain.on('open:dir', (e, options) => {
    openDir();
});

function tester2() {
    const filePaths = constructFilePathArray();

    sendPredictionRequests(filePaths);
}

function constructFilePathArray() 
{
    let filePaths = []
    for (let i = 0; i < _files.length; i++)
    {
        const filePath = constructPathWith(_files[i]);
        filePaths.push(filePath);
    }

    return filePaths;
}

function constructPathWith(file)
{
    return path.join(_sampleFolder, file);
}

function sendPredictionRequests(filePaths) 
{
    runMultipleApiCalls(filePaths, (error, results) => 
    {
        handleResponse(error, results);
    });
}

async function runMultipleApiCalls(filePaths, callback) {
    console.log(filePaths);
    const promises = filePaths.map(filePath => apiCall(filePath));
    try {
        const results = await Promise.all(promises);
        callback(null, results); // Call the callback function with results
    } catch (error) {
        callback(error); // Call the callback function with error if any
    }
}

async function apiCall(filePath) 
{
    const fileData = fs.readFileSync(filePath)
    const response = await fetch(
        'https://api-inference.huggingface.co/models/TheDuyx/distilhubert-bass-classifier9',
        {
            headers: { Authorization: config.API_KEY },
            method: 'Post',
            body: fileData,
        }, 
        
    );
    
    const result = await response.json();
    return {filePath, result};
}

function handleResponse(error, results) 
{
    if (error) {
        console.error('Error occurred:', error);
    } else {
        console.log('All API calls completed successfully');
        results.forEach(({filePath, result }) => {
            // console.log('Result for ' + filePath +': ' + JSON.stringify(result));
            
            handlePrediction(filePath, result);
        });

        win.webContents.send('responses:handled');
    }
}

function handlePrediction(filePath, result) {
    console.log(result);
    prediction = findClosestTo1(result);

    const categoryPath = path.join(_destinationFolder, prediction.label);
    console.log(categoryPath);
    
    if (folderExistsOrCreate(categoryPath)) {
        copyFileToDirectory(filePath, categoryPath);
    } else {
        return;
    }
}

function findClosestTo1(arr) 
{
    // Initialize variables to store the closest object and its distance from 1
    let closestObj = arr[0];
    let minDistance = Math.abs(arr[0].score - 1);
  
    // Loop through the array to find the object with a score closest to 1
    for (let i = 1; i < arr.length; i++) {
        // Calculate the absolute difference between the current object's score and 1
        let distance = Math.abs(arr[i].score - 1);
        
        // If the current object's score is closer to 1 than the previous closest object, update the closest object and the minimum distance
        if (distance < minDistance) {
            minDistance = distance;
            closestObj = arr[i];
        }
    }
    console.log(closestObj.label);
    return closestObj;
}

function getFilenamesInSubfolders(directoryPath) 
{
    const result = [];

    const subfolders = fs.readdirSync(directoryPath);

    subfolders.forEach(subfolder => {
        const subfolderPath = path.join(directoryPath, subfolder);

        if (fs.statSync(subfolderPath).isDirectory()) {
            const filenames = fs.readdirSync(subfolderPath);

            // Push an array with subfolder path as the first element followed by filenames
            result.push([subfolder].concat(filenames));
        }
    });

    return result;
}

function loadDirectory(directory) 
{
    const files = fs.readdirSync(directory);
    _files = files
    console.log(_files);
}

function copyFileToDirectory(filePath, destPath) 
{
    // Get the filename from the filePath
    const fileName = path.basename(filePath);

    // Construct the destination path
    const finalDestination = path.join(destPath, fileName);
    console.log(finalDestination);
    
    // Copy the file to the target directory
    fs.copyFile(filePath, finalDestination, (err) => {
        if (err) {
            console.error('Error copying file:', err);
            return;
        }
        console.log(`File ${fileName} copied to ${destPath}`);
    });
}

function folderExistsOrCreate(folderPath)
{
    try {
        // Check if the folder exists
        fs.accessSync(folderPath, fs.constants.F_OK);
        return true; // Folder exists
    } catch (err) {
        // Folder does not exist, create it
        try {
            fs.mkdirSync(folderPath, { recursive: true });
            console.log(`Folder created: ${folderPath}`);
            return true; // Folder created
        } catch (err) {
            console.error('Error creating folder:', err);
            return false; // Failed to create folder
        }
    }
}


function openDir()
{
    shell.openPath(_destinationFolder);
}

ipcMain.on('inference:test', (e, options) => {
    runMultipleRequests();
});

async function inferenceTest(filePath)
{
    const hf = new HfInference('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');
    
    try {
      const result = await hf.audioClassification({
        model: 'TheDuyx/distilhubert-bass9',
        data: fs.readFileSync(filePath)
      })

      return result;

    } catch(error) {
      console.error('Error:', error);
      throw error; // Rethrow the error if needed
    }
}

async function runMultipleRequests() {
    const files = [
      '/Users/duyx/Code/Classify/data/train/version2.0/acid/acid_1.wav',
      '/Users/duyx/Code/Classify/data/train/version2.0/acid/acid_2.wav'
    ];
  
    const promises = files.map(filePath => inferenceTest(filePath));
  
    try {
        const results = await Promise.all(promises);
        console.log('All results:', results);
    } catch (error) {
        console.error('Error:', error);
    }
  }

/* ------------ Redacted
function tester() 
{
    let filePaths = []
    for (let i = 0; i < 4; i++)
    {
        const filePath = constructPathWith(_files[i]);
        filePaths.push(filePath);
    }
    console.log(filePaths);
    
    runMultipleApiCalls(filePaths, (error, results) => {
        if (error) {
            console.error('Error occurred:', error);
        } else {
            console.log('All API calls completed successfully');
            results.forEach(({filePath, result }) => {
                console.log('Result for ' + filePath +': ' + JSON.stringify(result));
                
                handlePrediction(filePath, result);
            });   
        }
    });
}

async function query(filename) 
{
	const data = fs.readFileSync(filename);
    _selectedFile = filename;
    console.log("starting fetch");
	const response = await fetch(
		"https://api-inference.huggingface.co/models/TheDuyx/distilhubert-bass-classifier5",
		{
			headers: { Authorization: config.API_KEY },
			method: "POST",
			body: data,
		}
	);
	const result = await response.json();
    console.log("responded");
	
    return result;
}


async function resizeImage ({imgPath, width, height, dest}) { 
    try {
        const newPath = await reziseImg(fs.readFileSync(imgPath), {
            width: +width,
            height: +height
        });

        const filename = path.basename(imgPath);
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest);
        }

        fs.writeFileSync(path.join(dest, filename), newPath);

        win.webContents.send('image:done')

        shell.openPath(dest);
    } catch(error) {
        console.log(error);
    }
}

ipcMain.on('image:resize', (e, options) => { 
    options.dest = path.join(os.homedir(), 'imageresizer');
    console.log(options);
});

ipcMain.handle('hf:rq', (e, message) => {
    console.log('handle method')
    console.log(message)
    return await = query(message)
});

ipcMain.on('audio:predict', (e, message) => {
    console.log(message);
    let file = '/Users/duyx/Code/Classify/data/evaluate/version2.0/808/JETSONMADE_808_class2_C.wav';
    
    query(file).then((response) => {
        console.log(JSON.stringify(response))
        win.webContents.send('audio:done', response)
    });
});

ipcMain.on('copy:file', (e, options) => {
    // console.log(options);
    // copyFileToDirectory(options);
    handlePrediction(options)
});

ipcMain.on('image:resize', (e, options) => { 
    options.dest = path.join(os.homedir(), 'imageresizer');
    console.log(options);
});
*/