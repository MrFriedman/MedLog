// server.js

const express = require('express');
const { SpeechClient } = require('@google-cloud/speech');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Google Cloud Speech-to-Text Client
const client = new SpeechClient();

// Set up Multer storage for audio file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Middleware
app.use(express.json());
app.use(express.static('public'));

// API Endpoint for uploading audio
app.post('/upload-audio', upload.single('audioFile'), async (req, res) => {
  const audioPath = req.file.path;
  const file = fs.readFileSync(audioPath);
  const audioBytes = file.toString('base64');

  const audio = {
    content: audioBytes,
  };

  const config = {
    encoding: 'LINEAR16',
    sampleRateHertz: 16000,
    languageCode: 'en-US',
  };

  const request = {
    audio: audio,
    config: config,
  };

  try {
    // Transcribe the audio file
    const [response] = await client.recognize(request);
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');
    fs.unlinkSync(audioPath); // Clean up the uploaded file

    // You can extract medical data (symptoms, prescriptions) here if needed
    const extractedData = extractMedicalData(transcription);

    res.json({
      transcription,
      extractedData,
    });
  } catch (error) {
    console.error('Error transcribing audio:', error);
    res.status(500).send('Error processing audio');
  }
});

// Function to extract medical data from transcription (simple placeholder)
function extractMedicalData(transcription) {
  // Placeholder function to extract data from transcription
  const symptoms = transcription.match(/symptom[s]*:?\s*(\w+)/i);
  const prescriptions = transcription.match(/prescription[s]*:?\s*(\w+)/i);

  return {
    symptoms: symptoms ? symptoms[1] : 'Not found',
    prescriptions: prescriptions ? prescriptions[1] : 'Not found',
  };
}

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
