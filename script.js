const canvas = document.getElementById('memeCanvas');
const ctx = canvas.getContext('2d');
const imageInput = document.getElementById('imageInput');
const cameraBtn = document.getElementById('cameraBtn');
const topTextInput = document.getElementById('topText');
const bottomTextInput = document.getElementById('bottomText');
const downloadBtn = document.getElementById('download');
const fileInput = document.getElementById('imageInput');
const fileNameSpan = document.getElementById('fileName');

let activeImage = null;
let cameraStream = null;
let videoElement = document.createElement('video');
let isCameraActive = false;

// updates file name when selected
fileInput.addEventListener('change', (e) => {
    const fileName = e.target.files[0].name;
    fileNameSpan.textContent = fileName;
});

// Start the camera
function startCamera() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        isCameraActive = true;
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function (stream) {
                // Attach the video stream to a video element
                videoElement.srcObject = stream;
                cameraStream = stream;
                videoElement.play();
                videoElement.width = canvas.width;
                videoElement.height = canvas.height;
                drawCameraFrame();
            })
            .catch(function (err) {
                // update state if cam not accessible
                isCameraActive = false;
                console.log("Error accessing camera: ", err);
            });
    } else {
        // update state if cam not accessible
        isCameraActive = false;
        alert("Camera not supported on this browser/device.");
    }
}

// Draw the camera frame onto the canvas continuously
function drawCameraFrame() {
    if (isCameraActive && cameraStream) {
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        requestAnimationFrame(drawCameraFrame);
    }
}

// Stop the camera stream
function stopCamera() {
    if (cameraStream) {
        const tracks = cameraStream.getTracks();
        tracks.forEach(track => track.stop());
        videoElement.srcObject = null;
        cameraStream = null;
    }
}


// Handle image upload
imageInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target.result;
            img.onload = () => {
                activeImage = img;
                stopCamera();
                cameraBtn.innerHTML = "Start Camera &#128247;";
                isCameraActive = false;
                drawImage();
            };
        };

        reader.readAsDataURL(file);
    }
});


// Handle camera button click
cameraBtn.addEventListener('click', () => {
    // clear selected photo name, if any
    fileNameSpan.textContent = '';
    if (isCameraActive) {
        const imageData = canvas.toDataURL('image/png');
        const img = new Image();
        img.src = imageData;
        img.onload = () => {
            activeImage = img;
            stopCamera();
            cameraBtn.innerHTML = "Start Camera &#128247;";
            isCameraActive = false;
            drawImage();
            imageInput.value = '';
        };
    } else {
        // If the camera is not started, start the camera
        stopCamera();
        imageInput.value = '';
        // isCameraActive = true;
        startCamera();
        if(isCameraActive) {
            cameraBtn.innerHTML = "Take Picture &#128248;";
        }  
    }
});

// Draw the current active image onto the canvas
function drawImage() {
    if (activeImage) {
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(activeImage, 0, 0, canvas.width, canvas.height);
    }
}

// Function to generate meme with text
function generateMeme() {
    const topText = topTextInput.value;
    const bottomText = bottomTextInput.value;

    drawImage();

    // Set text styles
    ctx.font = 'bold 40px Impact';
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#000';
    // #333, #666 & #000, #333
    ctx.lineWidth = 1;
    ctx.textAlign = 'center';

    // Draw top text
    if (topText) {
        ctx.fillText(topText, canvas.width / 2, 50);
        ctx.strokeText(topText, canvas.width / 2, 50);
    }

    // Draw bottom text
    if (bottomText) {
        ctx.fillText(bottomText, canvas.width / 2, canvas.height - 20);
        ctx.strokeText(bottomText, canvas.width / 2, canvas.height - 20);
    }
}

// calculate the present time
function getCurrentDateTime() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Month is zero-based, so add 1
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

// Function to download meme as an image
function downloadMeme() {
    const link = document.createElement('a');
    link.download = `meme-${getCurrentDateTime()}.png`;
    link.href = canvas.toDataURL();
    link.click();
}

// Reset page on load
window.onload = function () {
    activeImage = null;
    imageInput.value = '';
    topTextInput.value = '';
    bottomTextInput.value = '';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
};
