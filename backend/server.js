const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Set up storage for images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Make uploads directory accessible
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// API endpoint to generate avatar
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, style } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    // Adjust the prompt based on the selected style
    let stylePrompt;
    switch (style) {
      case 'anime':
        stylePrompt = `${prompt}, anime style, vibrant colors, detailed character design`;
        break;
      case 'cyberpunk':
        stylePrompt = `${prompt}, cyberpunk style, neon lights, futuristic, high tech`;
        break;
      case 'pixel':
        stylePrompt = `${prompt}, pixel art style, retro game aesthetic, 16-bit`;
        break;
      case 'realistic':
        stylePrompt = `${prompt}, photorealistic, detailed portrait, high definition`;
        break;
      default:
        stylePrompt = prompt;
    }
    
    // Prepare payload for Stability AI
    const payload = {
      prompt: stylePrompt,
      output_format: "webp"
    };

    const formData = new FormData();
    for (const [key, value] of Object.entries(payload)) {
      formData.append(key, value);
    }
    
    // Call Stability AI API
    const response = await axios.post(
      'https://api.stability.ai/v2beta/stable-image/generate/ultra',
      formData,
      {
        validateStatus: undefined,
        responseType: 'arraybuffer',
        headers: { 
          Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
          Accept: 'image/*',
          ...formData.getHeaders()
        },
      }
    );
    
    if (response.status !== 200) {
      const errorMessage = Buffer.from(response.data).toString();
      throw new Error(`API Error (${response.status}): ${errorMessage}`);
    }
    
    // Save the generated image
    const filename = `${Date.now()}-avatar.webp`;
    const filepath = path.join(__dirname, 'uploads', filename);
    
    fs.writeFileSync(filepath, Buffer.from(response.data));
    
    res.json({
      success: true,
      imageUrl: `/uploads/${filename}`
    });
    
  } catch (error) {
    console.error('Error generating avatar:', error.message);
    res.status(500).json({ 
      error: 'Failed to generate avatar',
      details: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});