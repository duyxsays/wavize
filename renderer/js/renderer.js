const form = document.querySelector('#img-form');
const dirInput = document.querySelector('#dir-input');
const outputPath = document.querySelector('#output-path');
const filename = document.querySelector('#filename');
const filePathElement = document.getElementById('filePath');
const destPathElement = document.getElementById('destPath');
const list = document.getElementById('list');

// New elements
const btn = document.getElementById('btn');
const btn2 = document.getElementById('btn2');
const btn3 = document.getElementById('btn3');
const btn4 = document.getElementById('btn4');
const btn5 = document.getElementById('btn5')
const btn6 = document.getElementById('btn6')

var sampleFolderLabel = document.getElementById("sampleFolderText");
var destinationFolderLabel = document.getElementById("destinationFolderText");
var folderSelection = document.getElementById("folderSelection");
var loading = document.getElementById("loading");
var selectedFoldersList = document.getElementById("selectedFoldersList");
var afterLoading = document.getElementById("afterLoading");

function isFileAudio(file) {
  const acceptedAudioTypes = ['audio/wav', 'audio/mp3'];
  return file && acceptedAudioTypes.includes(file['type']);
}

function loadDirectory(directory) {
  const files = fs.readdirSync(directory);
  files.map(item => {
    let li = document.createElement('li');
    li.innerText = item;
    list.appendChild(li);
  });
  console.log(files);
}

// Resize image
function resizeImage(e) {
  e.preventDefault();

  if (!audio.files[0]) {
    alertError('Please upload an image');
    return;
  }

  if (widthInput.value === '' || heightInput.value === '') {
    alertError('Please enter a width and height');
    return;
  }

  // Electron adds a bunch of extra properties to the file object including the path
  const imgPath = audio.files[0].path;

  ipcRenderer.send('audio:predict', {
    imgPath,
  });
}

// When done, show message
ipcRenderer.on('image:done', () =>
  alertSuccess(`Image resized to ${heightInput.value} x ${widthInput.value}`)
);

function alertSuccess(message) {
  Toastify.toast({
    text: message,
    duration: 5000,
    close: false,
    style: {
      background: 'green',
      color: 'white',
      textAlign: 'center',
    },
  });
}

function alertError(message) {
  Toastify.toast({
    text: message,
    duration: 5000,
    close: false,
    style: {
      background: 'red',
      color: 'white',
      textAlign: 'center',
    },
  });
}

function sendRequest() {
  ipcRenderer.send('audio:predict', {
    imgPath,
    height,
    width,
  });
}

// form.addEventListener('submit', resizeImage);
/*
btn.addEventListener('click', async () => {
  const data = await window.ipcRenderer.request('hf:rq', '/Users/duyx/Code/Classify/data/evaluate/version2.0/808/JETSONMADE_808_class2_C.wav');
  
  ipcRenderer.send('copy:file', data);

  // const prediction = findClosestTo1(data);
  // filePathElement.innerText = prediction.label;
  
  /*
  moveFile(
    '/Users/duyx/Code/Classify/data/evaluate/version2.0/808/JETSONMADE_808_class2_C.wav',
    '/Users/duyx/Code/electron-app/samples/'
  );

});
*/

btn2.addEventListener('click', async () => {
  const filePath = await window.ipcRenderer.request('dialog:openDirectory', 'samplesPath');
  console.log(filePath);
  // loadDirectory(filePath);
  if (filePath != null) 
  {
    sampleFolderLabel.textContent = filePath;
  }
  
});

btn3.addEventListener('click', async () => {
  const filePath = await window.ipcRenderer.request('dialog:openDirectory', "");
  //destPathElement.innerHTML = filePath;
  if (filePath != null)
  {
    destinationFolderLabel.textContent = filePath;
  }
});

btn4.addEventListener('click', async () => {
  // ipcRenderer.send('test:script', {});
  
  folderSelection.style.display = "none";
  btn4.style.display = "none";
  loading.style.display = "block";

  
  setTimeout(function() {
    loading.style.display = "none";
    afterLoading.style.display = "block";
    btn5.style.display = "block";
    showSelectedFolders();
  }, 3000); // Adjust the time as needed
});

btn5.addEventListener('click', async () => {
  afterLoading.style.display = "none";
  folderSelection.style.display = "block";
  btn5.style.display = "none";
  btn4.style.display = "block";
});

btn6.addEventListener('click', async () => {
  ipcRenderer.send('open:dir', {});
});

function showSelectedFolders() 
{
  // Example data for selected folders (replace with actual data)

  ipcRenderer.send('fetch:samples', {});
}

ipcRenderer.on('requested:samples', (event, data) => {
  // Handle the received data
  selectedFoldersList.innerHTML = ''; // Clear previous content

  for (let i = 0; i < data.length; i++)
  {
    console.log(data[i][0])
    var header = document.createElement("h3");
    header.textContent = data[i][0];
    selectedFoldersList.appendChild(header);

    for (let j = 1; j < data[i].length; j++) 
    {
      console.log(data[i][j])
      var label = document.createElement("label");
      label.textContent = data[i][j];
      selectedFoldersList.appendChild(label);
      selectedFoldersList.appendChild(document.createElement("br"));
    }
  }
});

/* -------- Redacted
// dirInput.addEventListener('change', loadAudio);

function loadAudio(e) {
  const file = e.target.files[0];

  // Check if file is an image
  if (!isFileAudio(file)) {
    alertError('Please select an image');
    return;
  }
  console.log('test');

  form.style.display = 'block';
  filename.innerHTML = audio.files[0].name;
  outputPath.innerText = path.join(os.homedir(), 'imageresizer');
}

*/

/* ------- Title bar things
// Minimize button event listener
document.getElementById('titlebar-minimize-button').addEventListener('click', function() {
  require('electron').remote.getCurrentWindow().minimize();
});

// Maximize button event listener
document.getElementById('titlebar-maximize-button').addEventListener('click', function() {
  var window = require('electron').remote.getCurrentWindow();
  if (!window.isMaximized()) {
    window.maximize();
  } else {
    window.unmaximize();
  }
});

// Close button event listener
document.getElementById('titlebar-close-button').addEventListener('click', function() {
  require('electron').remote.getCurrentWindow().close();
});
*/