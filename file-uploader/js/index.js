// List of file formats to be supported by the browser
const imageFormats = ['png', 'jpg', 'jpeg', 'webp', 'gif'];
const videoFormats = ['mp4', 'm4v', 'webm'];
const audioFormats = ['aac', 'mp3', 'weba'];

// File type
const FILE_TYPE = {
  IMAGE: 'IMAGE',
  VIDEO: 'VIDEO',
  AUDIO: 'AUDIO'
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

/**
 * @param  {HTMLInputElement} event
 */
(function captureFile(event) {
  let fileInput = document.getElementById("file-input");
  let fileCapture = document.getElementById("file-capture");

  if(fileInput) {
    fileInput.onchange = function({target}) {
      handleFileOperation(this, {target});
    };
  }
})();

function handleFileOperation(thisParam, {target}) {
  // Image, video and audio HTMLElement
  let imageSrc = document.getElementsByClassName('src-image')[0];
  let videoSrc = document.getElementsByClassName('src-video')[0];
  let audioSrc = document.getElementsByClassName('src-audio')[0];

  // Preview
  let fileName = document.getElementsByClassName('preview-filename')[0];
  let deletePreview = document.getElementsByClassName('preview-delete')[0];
  let input = thisParam.files[0];
  target.value = ''; // resetting the target because if the user re-upload the same file, onchange is not fired (default browser behaviour)
  
  // Get the file type
  let fileType = getFileType(input.name);
  
  // Set the file name for preview
  if((fileType !== FILE_TYPE.IMAGE) && (fileType !== FILE_TYPE.VIDEO) && (fileType !== FILE_TYPE.AUDIO)) {
    alert("File type not supported.");
    return;
  } else {
    fileName.innerHTML = input.name;
    
    // Make delete visible when src is available
    deletePreview.style.display = "block";
  }

  // Check file type and src to respective tags
  switch(fileType) {
    case FILE_TYPE.IMAGE: {
      imageSrc.style.display = "unset";
      imageSrc.src = URL.createObjectURL(input);
      resetToDefaultOtherFileTypes(videoSrc);
      resetToDefaultOtherFileTypes(audioSrc);
      break;
    }
    case FILE_TYPE.VIDEO: {
      videoSrc.style.display = "unset";
      videoSrc.src = URL.createObjectURL(input);
      resetToDefaultOtherFileTypes(imageSrc);
      resetToDefaultOtherFileTypes(audioSrc);
      break;
    }
    case FILE_TYPE.AUDIO: {
      audioSrc.style.display = "unset";
      audioSrc.src = URL.createObjectURL(input);
      resetToDefaultOtherFileTypes(imageSrc);
      resetToDefaultOtherFileTypes(videoSrc);
      break;
    }
    default: {
      alert("File type not supported.");
    }
  }

  // To delete/remove the preview
  deletePreview.onclick = function() {
    if (confirm('Are you sure you want to delete this file?')) {
      if(fileType === FILE_TYPE.IMAGE) {
        resetToDefaultOtherFileTypes(imageSrc);
        resetFileName(fileName, deletePreview);
      } else if (fileType === FILE_TYPE.VIDEO) {
        resetToDefaultOtherFileTypes(videoSrc);
        resetFileName(fileName, deletePreview);
      } else if (fileType === FILE_TYPE.AUDIO) {
        resetToDefaultOtherFileTypes(audioSrc);
        resetFileName(fileName, deletePreview);
      }
    } else {
      return;
    }
  }
}

/**
 * @param {HTMLElement} fileSrc
 */
function resetToDefaultOtherFileTypes(fileSrc) {
  fileSrc.src = '#';
  fileSrc.style.display = "none";
};

function resetFileName(filename, deletePreview) {
  filename.innerHTML = "No file selected yet.";
  deletePreview.style.display = "none";
}
