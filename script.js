// Global variables
let canvas = document.getElementById('memeCanvas');
let ctx = canvas.getContext('2d');
let img = null;
let video = document.getElementById('cameraVideo');
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
    
    // Update canvas size
    canvas.width = width;
    canvas.height = height;
    
    // Redraw the canvas
    if (img) {
        drawImageOnCanvas();
    } else {
        clearCanvas();
    }
});

// Image Upload
const imageInput = document.getElementById('imageInput');
const fileName = document.getElementById('fileName');

imageInput.addEventListener('change', function() {
    if (this.files && this.files[0]) {
        if (isUsingCamera) {
            stopCamera();
        }
        
        const file = this.files[0];
        fileName.textContent = file.name;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            img = new Image();
            img.onload = function() {
                drawImageOnCanvas();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Camera functionality
const cameraBtn = document.getElementById('cameraBtn');

cameraBtn.addEventListener('click', function() {
    if (!isUsingCamera) {
        startCamera();
    } else {
        stopCamera();
    }
});

function startCamera() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function(mediaStream) {
                stream = mediaStream;
                video.srcObject = mediaStream;
                video.style.display = 'block';
                canvas.style.display = 'none';
                video.play();
                isUsingCamera = true;
                cameraBtn.innerHTML = '<i class="fas fa-camera"></i> Capture';
            })
            .catch(function(err) {
                console.log("Error accessing camera: " + err);
                alert("Error accessing camera. Please make sure you've granted permission.");
            });
    } else {
        alert("Sorry, your browser doesn't support accessing the camera.");
    }
}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    video.style.display = 'none';
    canvas.style.display = 'block';
    isUsingCamera = false;
    cameraBtn.innerHTML = '<i class="fas fa-camera"></i> Camera';
}

function captureImage() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    img = new Image();
    img.src = canvas.toDataURL('image/png');
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
    
    // Calculate aspect ratio
    const imgRatio = img.width / img.height;
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
    
    ctx.drawImage(img, x, y, drawWidth, drawHeight);
}

// Generate Meme
const topTextInput = document.getElementById('topText');
const bottomTextInput = document.getElementById('bottomText');
const generateBtn = document.getElementById('generate');

generateBtn.addEventListener('click', generateMeme);

function generateMeme() {
    if (!img && !isUsingCamera) {
        alert("Please upload an image or use the camera first.");
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

// Download Meme
const downloadBtn = document.getElementById('download');

downloadBtn.addEventListener('click', downloadMeme);

function downloadMeme() {
    if (!img && !isUsingCamera) {
        alert("Please generate a meme first.");
        return;
    }
    
    const link = document.createElement('a');
    link.download = 'meme.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// Initialize
window.addEventListener('load', function() {
    clearCanvas();
    fontSizeValue.textContent = `${fontSize.value}px`;
});
