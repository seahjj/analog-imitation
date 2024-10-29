document.getElementById('uploadForm').addEventListener('submit', async function (event) {
    event.preventDefault();  // Prevent default form submission

    const fileInput = document.getElementById('photo');
    const formData = new FormData();
    formData.append('photo', fileInput.files[0]);

    const response = await fetch('/upload', {
        method: 'POST',
        body: formData
    });

    const data = await response.json();
    document.getElementById('weatheredImage').src = data.url;
});
document.getElementById('weatheringStage').addEventListener('input', async function () {
    const stage = this.value;
    const response = await fetch(`/weather?stage=${stage}`);
    const data = await response.json();
    document.getElementById('weatheredImage').src = data.url;
});
// server.js
const express = require('express');
const multer = require('multer');
const sharp = require('sharp'); // for image processing
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Configure multer for file uploads
const storage = multer.memoryStorage(); 
const upload = multer({ storage });

// Serve static files from 'images' folder
app.use('/images', express.static(path.join(__dirname, 'images')));

// Handle photo upload and save initial processed image
app.post('/upload', upload.single('photo'), async (req, res) => {
    const photoBuffer = req.file.buffer;
    const initialImagePath = path.join(__dirname, 'images', 'initial.jpg');
    
    // Save initial image and process it with sharp
    await sharp(photoBuffer)
        .resize(800) // Resize if needed
        .toFile(initialImagePath); 

    res.json({ url: '/images/initial.jpg' });
});

// Handle weathering adjustments based on 'stage' parameter
app.get('/weather', async (req, res) => {
    const stage = parseInt(req.query.stage, 10);
    const imagePath = path.join(__dirname, 'images', `weathered_${stage}.jpg`);
    
    // Apply weathering effect using sharp
    await sharp(path.join(__dirname, 'images', 'initial.jpg'))
        .modulate({ brightness: 1 - stage / 100, saturation: 1 - stage / 200 })
        .toFile(imagePath);

    res.json({ url: `/images/weathered_${stage}.jpg` });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
// app.js
document.getElementById('weatheringStage').addEventListener('input', async function () {
    const stage = this.value;
    const response = await fetch(`/weather?stage=${stage}`);
    const data = await response.json();
    document.getElementById('weatheredImage').src = data.url; // Update image source
});

