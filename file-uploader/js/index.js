// List of file formats to be supported by the browser
const imageFormats = ['png', 'jpg', 'jpeg', 'webp', 'gif'];
const videoFormats = ['mp4', 'm4v', 'webm'];
const audioFormats = ['aac', 'mp3', 'weba'];

// File type
const FILE_TYPE = {
  IMAGE: 'IMAGE',
  VIDEO: 'VIDEO',
  AUDIO: 'AUDIO',
  OTHER: 'OTHER'
};

/**
 * @param  {string} path
 */
function getFileType(path) {
  const extension = getExtension(path);
  if (imageFormats.includes(extension)) {
    return FILE_TYPE.IMAGE;
  } else if (videoFormats.includes(extension)) {
    return FILE_TYPE.VIDEO;
  } else if (audioFormats.includes(extension)) {
    return FILE_TYPE.AUDIO;
  } else {
    return FILE_TYPE.OTHER;
  }
}

/**
 * @param  {string} path
 */
function getExtension(path) {
  const fullFileName = path.substring(path.lastIndexOf('/') + 1);
  return fullFileName.substring(fullFileName.lastIndexOf('.') + 1).toLowerCase();
}


// Check user media for video streaming
(function checkUserMedia() {
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || null;
  
  let video_audio_properties = {video: true, audio: true};
  video_audio_properties = {video: {mandatory: {minWidth: 300, minHeight: 300, minFrameRate: 30}, optional: [{ minFrameRate: 60 }]}, audio: true};
  let videoElement = document.createElement('video');

  function onSuccess(stream) {
    videoElement.src = window.URL.createObjectURL(stream);
    videoElement.play();
  }

  function onError(error){
    alert("Video capture error");
    console.log("Video capture error: ", error.code);
  }

  if(navigator.getUserMedia != null) {
    navigator.getUserMedia(video_audio_properties, onSuccess, onError);
  } else {
    alert("microphone and webcam API not supported");
  }
})();

/**
 * @param  {HTMLInputElement} event
 */
(function captureFile(event) {
  let fileInput = document.getElementById("file-input");
  let fileCapture = document.getElementById("file-capture");
  let arrayOfFiles = [];

  if(fileInput) {
    fileInput.onchange = function({target}) {
      handleFileOperation(this, {target}, arrayOfFiles);
    };
  }
})();

function handleFileOperation(thisParam, {target}, arrayOfFiles) {
  let input = thisParam.files[0];
  target.value = ''; // resetting the target because if the user re-upload the same file, onchange is not fired (default browser behaviour)
  
  // Get the file type
  let fileType = getFileType(input.name);
  
  // Check for file type not supported
  if((fileType !== FILE_TYPE.IMAGE) && (fileType !== FILE_TYPE.VIDEO) && (fileType !== FILE_TYPE.AUDIO)) {
    alert("File type not supported.");
    return;
  }

  // Check file type and push the src in arrayOfFiles
  switch(fileType) {
    case FILE_TYPE.IMAGE: {
      arrayOfFiles.push(URL.createObjectURL(input));
      break;
    }
    case FILE_TYPE.VIDEO: {
      arrayOfFiles.push(URL.createObjectURL(input));
      break;
    }
    case FILE_TYPE.AUDIO: {
      arrayOfFiles.push(URL.createObjectURL(input));
      break;
    }
    default: {
      alert("File type not supported.");
    }
  }

  let srcWrapper = document.getElementsByClassName('src-wrapper')[0];
  srcWrapper.style.display = "flex"; // to be visible when atleast 1 src is available in the wrapper
  const files = arrayOfFiles.map((item) => (
    srcWrapper.appendChild(createCustomElement(item, fileType))
  ));
  arrayOfFiles.length = 0;
}

function createCustomElement(src, fileType) {
  let divElement = document.createElement("div");
  let deleteElement = document.createElement("div");

  deleteElement.innerHTML = '✕';
  deleteElement.title = 'Delete this file';
  
  switch(fileType) {
    case FILE_TYPE.IMAGE: {
      let imageElement = document.createElement("img");
      
      divElement.appendChild(imageElement);
      divElement.appendChild(deleteElement);

      divElement.classList.add("src-image-container");
      imageElement.src = src;
      imageElement.classList.add("src-image");

      deleteElement.classList.add("src-delete");
      deleteElement.onclick = function() {
        divElement.parentNode.removeChild(divElement);
        checkForChildNodes();
      }
      break;
    }
    case FILE_TYPE.VIDEO: {
      let videoElement = document.createElement("video");  

      divElement.appendChild(videoElement);
      divElement.appendChild(deleteElement);

      divElement.classList.add("src-video-container");
      videoElement.src = src;
      videoElement.controls = true;
      videoElement.playsInline = true;
      videoElement.classList.add("src-video");

      deleteElement.classList.add("src-delete");
      deleteElement.onclick = function() {
        divElement.parentNode.removeChild(divElement);
        checkForChildNodes();
      }
      break;
    }
    case FILE_TYPE.AUDIO: {
      let audioElement = document.createElement("audio");

      divElement.appendChild(audioElement);
      divElement.appendChild(deleteElement);

      divElement.classList.add("src-audio-container");
      audioElement.src = src;
      audioElement.controls = true;
      audioElement.classList.add("src-audio");

      deleteElement.classList.add("src-delete");
      deleteElement.onclick = function() {
        divElement.parentNode.removeChild(divElement);
        checkForChildNodes();
      }
      break;
    }
    default: {
      return;
    }
  }
  return divElement;
}

function checkForChildNodes() {
  let srcWrapper = document.getElementsByClassName('src-wrapper')[0];
  if(!srcWrapper.hasChildNodes()) {
    srcWrapper.style.display = "none";
  }
}
