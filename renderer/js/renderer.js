const form = document.querySelector('#img-form');
const dirInput = document.querySelector('#dir-input');
const outputPath = document.querySelector('#output-path');
const filename = document.querySelector('#filename');
const heightInput = document.querySelector('#height');
const widthInput = document.querySelector('#width');
const btn = document.getElementById('btn');
const btn2 = document.getElementById('btn2');
const btn3 = document.getElementById('btn3');
const btn4 = document.getElementById('btn4');
const filePathElement = document.getElementById('filePath');
const destPathElement = document.getElementById('destPath');
const list = document.getElementById('list');

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
  const width = widthInput.value;
  const height = heightInput.value;


  ipcRenderer.send('audio:predict', {
    imgPath,
    height,
    width,
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
  */
});

btn2.addEventListener('click', async () => {
  const filePath = await window.ipcRenderer.request('dialog:openDirectory', 'samplesPath');
  console.log(filePath);
  // loadDirectory(filePath);
  filePathElement.innerText = filePath;
});

btn3.addEventListener('click', async () => {
  const filePath = await window.ipcRenderer.request('dialog:openDirectory', "");
  destPathElement.innerHTML = filePath;
});

btn4.addEventListener('click', async () => {
  ipcRenderer.send('test:script', {});
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