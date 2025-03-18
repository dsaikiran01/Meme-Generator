// Global variables
const canvas = document.getElementById('memeCanvas');
const ctx = canvas.getContext('2d');
let activeImage = null;
const video = document.getElementById('cameraVideo');
let stream = null;
let isUsingCamera = false;

// Menu toggle functionality
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const closeSidebar = document.getElementById('closeSidebar');
const body = document.body;

// Create overlay for mobile menu
const overlay = document.createElement('div');
overlay.className = 'overlay';
body.appendChild(overlay);

menuToggle.addEventListener('click', () => {
    sidebar.classList.add('active');
    overlay.classList.add('active');
});

closeSidebar.addEventListener('click', () => {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
});

overlay.addEventListener('click', () => {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
});

// Font and Style Controls
const textColor = document.getElementById('textColor');
const fontSize = document.getElementById('fontSize');
const fontSizeValue = document.getElementById('fontSizeValue');
const fontFamily = document.getElementById('fontFamily');
const textStroke = document.getElementById('textStroke');

// Update font size display
fontSize.addEventListener('input', () => {
    fontSizeValue.textContent = `${fontSize.value}px`;
});

// Canvas Size Controls
const canvasWidth = document.getElementById('canvasWidth');
const canvasHeight = document.getElementById('canvasHeight');
const widthUnit = document.getElementById('widthUnit');
const heightUnit = document.getElementById('heightUnit');
const applyCanvasSize = document.getElementById('applyCanvasSize');

let maintainAspectRatio = document.getElementById('maintainAspectRatio');
let defaultCanvasWidth = 580;
let defaultCanvasHeight = 450;

// Apply canvas size
applyCanvasSize.addEventListener('click', () => {
    let width = parseInt(canvasWidth.value);
    let height = parseInt(canvasHeight.value);

    // Convert units if necessary
    if (widthUnit.value === 'cm') {
        width = Math.round(width * 37.8); // cm to px (approximate)
    } else if (widthUnit.value === 'in') {
        width = Math.round(width * 96); // inches to px
    }

    if (heightUnit.value === 'cm') {
        height = Math.round(height * 37.8); // cm to px (approximate)
    } else if (heightUnit.value === 'in') {
        height = Math.round(height * 96); // inches to px
    }

    // Set minimum and maximum values
    width = Math.max(200, Math.min(width, 1200));
    height = Math.max(200, Math.min(height, 1200));

    // Maintain aspect ratio if checkbox is checked
    if (maintainAspectRatio.checked && activeImage) {
        const imgRatio = activeImage.width / activeImage.height;
        // If width was changed last, adjust height to maintain ratio
        if (width !== canvas.width) {
            height = Math.round(width / imgRatio);
        } else {
            // If height was changed last, adjust width to maintain ratio
            width = Math.round(height * imgRatio);
        }

        // Update the input fields to reflect the adjusted values
        canvasWidth.value = width;
        canvasHeight.value = height;
    }

    // Update canvas size
    canvas.width = width;
    canvas.height = height;

    // Redraw the canvas
    if (activeImage) {
        drawImageOnCanvas();
    } else {
        clearCanvas();
    }
});

// Keep track of which dimension was changed last
canvasWidth.addEventListener('change', function () {
    if (maintainAspectRatio.checked && activeImage) {
        const imgRatio = activeImage.width / activeImage.height;
        const newHeight = Math.round(parseInt(canvasWidth.value) / imgRatio);
        canvasHeight.value = newHeight;
    }
});

canvasHeight.addEventListener('change', function () {
    if (maintainAspectRatio.checked && activeImage) {
        const imgRatio = activeImage.width / activeImage.height;
        const newWidth = Math.round(parseInt(canvasHeight.value) * imgRatio);
        canvasWidth.value = newWidth;
    }
});


// Image Upload
const imageInput = document.getElementById('imageInput');
const fileName = document.getElementById('fileName');

// check if uploaded files are valid formats
function isValidFileType(filetype) {
    const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];

    if (supportedTypes.includes(filetype.toLowerCase())) {
        return true;
    } else {
        return false;
    }
}

// Image Upload - Updated to set default canvas size based on image dimensions
imageInput.addEventListener('change', function () {
    if (this.files && this.files[0]) {
        const file = this.files[0];

        // Validate file type (only allow .jpg and .png)
        const fileType = file.type;
        // if (fileType !== 'image/jpeg' && fileType !== 'image/png') {
        if (isValidFileType(fileType)) { }
        alert('Please upload a supported image file (JPG, JPEG, PNG, WebP or SVG).');
        return; // Stop further processing if file is invalid
    }

    // Reset camera state when uploading an image
    if (isUsingCamera) {
        stopCamera();
    }

    // Hide switch camera button when uploading an image
    switchCameraBtn.style.display = 'none';
    cameraBtn.innerHTML = '<i class="fas fa-camera"></i> Start Camera';

    fileName.textContent = file.name;

    const reader = new FileReader();
    reader.onload = function (e) {
        const img = new Image();
        img.src = e.target.result;

        img.onload = function () {
            activeImage = img;

            // Set canvas dimensions based on uploaded image size
            // (capped at reasonable max dimensions)
            const maxWidth = 1200;
            const maxHeight = 1200;

            let newWidth = img.width;
            let newHeight = img.height;

            // Scale down if image is too large
            if (newWidth > maxWidth) {
                const ratio = maxWidth / newWidth;
                newWidth = maxWidth;
                newHeight = Math.floor(newHeight * ratio);
            }

            if (newHeight > maxHeight) {
                const ratio = maxHeight / newHeight;
                newHeight = maxHeight;
                newWidth = Math.floor(newWidth * ratio);
            }

            // Update canvas size
            canvas.width = newWidth;
            canvas.height = newHeight;

            // Update size input fields to match
            canvasWidth.value = newWidth;
            canvasHeight.value = newHeight;

            // Set units to px
            widthUnit.value = 'px';
            heightUnit.value = 'px';

            video.style.display = 'none';
            canvas.style.display = 'block';
            drawImageOnCanvas();
        };
    };
    reader.readAsDataURL(file);
});

// Camera functionality
const cameraBtn = document.getElementById('cameraBtn');
const switchCameraBtn = document.getElementById('switchCameraBtn');
const fileNameSpan = document.getElementById('fileName');
let facingMode = "user";

cameraBtn.addEventListener('click', function (e) {
    e.preventDefault();

    if (video.style.display === 'block') {
        // Take picture from the video stream
        captureImage();
        this.innerHTML = '<i class="fas fa-camera"></i> Start Camera';
        switchCameraBtn.style.display = 'none';
        video.style.display = 'none';
        canvas.style.display = 'block';
        imageInput.value = '';
    } else {
        // Start the camera
        fileNameSpan.textContent = '';
        imageInput.value = '';
        startCamera();
    }
});

// Add switch camera button handler
switchCameraBtn.addEventListener('click', function () {
    // Toggle between front and back camera
    facingMode = facingMode === "user" ? "environment" : "user";
    startCamera(); // Restart camera with new facing mode
});

// Function to check if device has multiple cameras (for mobile devices)
async function hasMultipleCameras() {
    // Only proceed if the mediaDevices API and enumerateDevices are supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        return false;
    }

    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        return videoDevices.length > 1;
    } catch (err) {
        console.error("Error checking for multiple cameras:", err);
        return false;
    }
}

function startCamera() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Stop any existing stream first
        if (stream) {
            stopCamera();
        }

        // Initialize with switch camera button hidden
        switchCameraBtn.style.display = 'none';

        // remove any active selected image
        activeImage = null;

        // Display video element and hide canvas
        video.style.display = 'block';
        document.getElementById('memeCanvas').style.display = 'none';

        navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: facingMode,
            }
        })
            .then(function (mediaStream) {
                stream = mediaStream;
                video.srcObject = mediaStream;
                video.style.display = 'block';
                canvas.style.display = 'none';
                video.play();
                isUsingCamera = true;
                cameraBtn.innerHTML = '<i class="fas fa-camera-retro"></i> Take Picture';

                // Set the size inputs to default camera values
                canvasWidth.value = defaultCanvasWidth;
                canvasHeight.value = defaultCanvasHeight;
                widthUnit.value = 'px';
                heightUnit.value = 'px';

                // Update canvas size to match video dimensions after the video loads
                video.onloadedmetadata = function () {
                    defaultCanvasWidth = video.videoWidth;
                    defaultCanvasHeight = video.videoHeight;
                    canvasWidth.value = defaultCanvasWidth;
                    canvasHeight.value = defaultCanvasHeight;
                };

                // Check if device has multiple cameras and show switch button only if it does
                hasMultipleCameras().then(hasMultiple => {
                    if (hasMultiple) {
                        switchCameraBtn.style.display = 'block';
                    }
                });
            })
            .catch(function (err) {
                isUsingCamera = false;
                console.log("Error accessing camera: " + err);
                alert("Error accessing camera. Please make sure you've granted permission.");
                // Revert button text and hide switch camera button
                cameraBtn.innerHTML = '<i class="fas fa-camera"></i> Start Camera';
                switchCameraBtn.style.display = 'none';
            });
    } else {
        isUsingCamera = false;
        alert("Sorry, your browser doesn't support accessing the camera.");
    }
}

function stopCamera() {
    // Hide video element and show canvas
    video.style.display = 'none';
    switchCameraBtn.style.display = 'none';
    document.getElementById('memeCanvas').style.display = 'block';

    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    video.srcObject = null;
    isUsingCamera = false;
    cameraBtn.innerHTML = '<i class="fas fa-camera"></i> Start Camera';
}


function captureImage() {
    // Get video dimensions
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    // Set canvas dimensions to match video
    canvas.width = videoWidth;
    canvas.height = videoHeight;

    // Draw the video frame onto the canvas
    ctx.drawImage(video, 0, 0, videoWidth, videoHeight);

    // Create image from canvas
    activeImage = new Image();
    activeImage.src = canvas.toDataURL('image/png');

    // Stop the camera
    stopCamera();
}


// Drawing Functions
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}


function drawImageOnCanvas() {
    clearCanvas();

    if (!activeImage) return;

    // Calculate aspect ratio
    const imgRatio = activeImage.width / activeImage.height;
    const canvasRatio = canvas.width / canvas.height;

    let drawWidth, drawHeight, x, y;

    if (imgRatio > canvasRatio) {
        // Image is wider than canvas (relative to height)
        drawWidth = canvas.width;
        drawHeight = canvas.width / imgRatio;
        x = 0;
        y = (canvas.height - drawHeight) / 2;
    } else {
        // Image is taller than canvas (relative to width)
        drawHeight = canvas.height;
        drawWidth = canvas.height * imgRatio;
        x = (canvas.width - drawWidth) / 2;
        y = 0;
    }

    // Clear the canvas
    clearCanvas();

    // Draw the image
    ctx.drawImage(activeImage, x, y, drawWidth, drawHeight);
}


// Drag and drop functionality
const dropZone = document.getElementById('dropZone');
const dropMessage = document.getElementById('dropMessage');

// Prevent default drag behaviors
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
});

// Highlight drop zone when item is dragged over it
['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, unhighlight, false);
});

// Handle drop event
dropZone.addEventListener('drop', handleDrop, false);

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight() {
    dropZone.classList.add('drag-over');
}

function unhighlight() {
    dropZone.classList.remove('drag-over');
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;

    if (files.length) {
        const file = files[0];

        // Check if file is a supported image type
        const fileType = file.type;

        if (isValidFileType(fileType)) {
            // Reset camera if it's active
            if (isUsingCamera) {
                stopCamera();
            }

            // Hide switch camera button
            switchCameraBtn.style.display = 'none';
            cameraBtn.innerHTML = '<i class="fas fa-camera"></i> Start Camera';

            // Update file name display
            fileName.textContent = file.name;

            // Process the file
            const reader = new FileReader();
            reader.onload = function (e) {
                const img = new Image();
                img.src = e.target.result;

                img.onload = function () {
                    // Set activeImage to the new image
                    activeImage = img;

                    // Set canvas dimensions based on uploaded image size
                    // (capped at reasonable max dimensions)
                    const maxWidth = 1200;
                    const maxHeight = 1200;

                    let newWidth = img.width;
                    let newHeight = img.height;

                    // Scale down if image is too large
                    if (newWidth > maxWidth) {
                        const ratio = maxWidth / newWidth;
                        newWidth = maxWidth;
                        newHeight = Math.floor(newHeight * ratio);
                    }

                    if (newHeight > maxHeight) {
                        const ratio = maxHeight / newHeight;
                        newHeight = maxHeight;
                        newWidth = Math.floor(newWidth * ratio);
                    }

                    // Update canvas size
                    canvas.width = newWidth;
                    canvas.height = newHeight;

                    // Update size input fields to match
                    canvasWidth.value = newWidth;
                    canvasHeight.value = newHeight;

                    // Set units to px
                    widthUnit.value = 'px';
                    heightUnit.value = 'px';

                    // Make sure canvas is visible
                    video.style.display = 'none';
                    canvas.style.display = 'block';

                    // Draw the image on the canvas
                    drawImageOnCanvas();
                };
            };
            reader.readAsDataURL(file);
        } else {
            alert('Please upload a supported image file (JPG, JPEG, PNG, WebP or SVG).');
        }
    }
}

function processFile(file) {
    // Update file name display
    document.getElementById('fileName').textContent = file.name;

    // Create a FileReader to read the image
    const reader = new FileReader();
    reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
            // Clear any previous content
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw the image on the canvas
            drawImageScaled(img, ctx, canvas);

            // Make sure canvas is visible (in case camera was on)
            stopCamera();
            canvas.style.display = 'block';

            // Reset camera button text
            document.getElementById('cameraBtn').innerHTML = '<i class="fas fa-camera"></i> Start Camera';
            document.getElementById('switchCameraBtn').style.display = 'none';
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Helper function to draw the image scaled to fit
function drawImageScaled(img, ctx, canvas) {
    const ratio = Math.min(canvas.width / img.width, canvas.height / img.height);
    const centerX = (canvas.width - img.width * ratio) / 2;
    const centerY = (canvas.height - img.height * ratio) / 2;

    ctx.drawImage(img, 0, 0, img.width, img.height,
        centerX, centerY, img.width * ratio, img.height * ratio);
}


// Generate Meme
const topTextInput = document.getElementById('topText');
const bottomTextInput = document.getElementById('bottomText');
const generateBtn = document.getElementById('generate');

generateBtn.addEventListener('click', generateMeme);

function generateMeme() {
    if (!activeImage && !isUsingCamera) {
        alert("Please upload an image or use the camera first.");
        return;
    }

    if (!activeImage) {
        alert("Please upload an image or take a photo.");
        return;
    }

    if (isUsingCamera) {
        captureImage();
    }

    // Redraw the image
    drawImageOnCanvas();

    // Get text inputs
    const topText = topTextInput.value.toUpperCase();
    const bottomText = bottomTextInput.value.toUpperCase();

    // Get style settings
    const color = textColor.value;
    const size = parseInt(fontSize.value);
    const font = fontFamily.value;
    const useStroke = textStroke.checked;

    // Set text style
    ctx.textAlign = 'center';
    ctx.fillStyle = color;
    ctx.font = `bold ${size}px ${font}`;

    // Draw top text
    if (topText) {
        wrapText(topText, canvas.width / 2, size + 10, canvas.width - 20, size, useStroke);
    }

    // Draw bottom text
    if (bottomText) {
        wrapText(bottomText, canvas.width / 2, canvas.height - 20, canvas.width - 20, size, useStroke);
    }
}


// Text wrapping function
function wrapText(text, x, y, maxWidth, lineHeight, useStroke) {
    const words = text.split(' ');
    let line = '';
    let testLine = '';
    let lineArray = [];

    // Break text into lines
    for (let n = 0; n < words.length; n++) {
        testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;

        if (testWidth > maxWidth && n > 0) {
            lineArray.push(line);
            line = words[n] + ' ';
        } else {
            line = testLine;
        }
    }

    lineArray.push(line);

    // For bottom text, move up to accommodate multiple lines
    if (y > canvas.height / 2) {
        y -= lineHeight * (lineArray.length - 1);
    }

    // Draw each line
    for (let i = 0; i < lineArray.length; i++) {
        if (useStroke) {
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 4;
            ctx.strokeText(lineArray[i], x, y);
        }
        ctx.fillText(lineArray[i], x, y);
        y += lineHeight;
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

// Download Meme
const downloadBtn = document.getElementById('download');

downloadBtn.addEventListener('click', downloadMeme);

function downloadMeme() {
    if (!activeImage && !isUsingCamera) {
        alert("Please generate a meme first.");
        return;
    }

    const link = document.createElement('a');
    link.download = `meme-${getCurrentDateTime()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}


// Initialize - save the original canvas dimensions
window.addEventListener('load', function () {
    clearCanvas();
    fontSizeValue.textContent = `${fontSize.value}px`;
    defaultCanvasWidth = canvas.width;
    defaultCanvasHeight = canvas.height;
});
