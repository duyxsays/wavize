// New elements
const btn2 = document.getElementById('btn2');
const btn3 = document.getElementById('btn3');
const btn4 = document.getElementById('btn4');
const btn5 = document.getElementById('btn5');
const btn6 = document.getElementById('btn6');

var sampleFolderLabel = document.getElementById("sampleFolderText");
var destinationFolderLabel = document.getElementById("destinationFolderText");
var folderSelection = document.getElementById("folderSelection");
var selectedFoldersList = document.getElementById("selectedFoldersList");
var afterLoading = document.getElementById("afterLoading");
var loadingContainer = document.getElementById("loadingDiv");

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

btn2.addEventListener('click', async () => {
  const filePath = await window.ipcRenderer.request('dialog:openDirectory', 'samplesPath');
  console.log(filePath);
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
  folderSelection.style.display = "none";
  btn4.style.display = "none";
  loadingContainer.style.display = "block";
  
  ipcRenderer.send('test:script', {});
  // simulateLoading();
});

function simulateLoading() 
{
  setTimeout(function()
  {
    loadingContainer.style.display = "none";
    afterLoading.style.display = "block";
    btn5.style.display = "block";
    showSelectedFolders();
  }, 3000); 
}

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
  ipcRenderer.send('fetch:samples', {});
}

ipcRenderer.on('responses:handled', (event, data) => {
  afterLoading.style.display = "block";
  loadingContainer.style.display = "none";
  btn5.style.display = "block";

  showSelectedFolders();
});

// Handle the received data
ipcRenderer.on('requested:samples', (event, data) => {
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
      label.style.color = "#E1D6C1"
      label.textContent = data[i][j];
      selectedFoldersList.appendChild(label);
      selectedFoldersList.appendChild(document.createElement("br"));
    }
  }
});