function stopRecording() {
    document.getElementById('recording-section').classList.add('hidden');
    document.getElementById('transcription-section').classList.remove('hidden');
  
    // Stop recording logic (e.g., stopping the microphone stream)
    const audioBlob = getAudioBlob(); // Get the audio Blob (this depends on your recording logic)
  
    // Send the audio file to the server
    const formData = new FormData();
    formData.append('audioFile', audioBlob, 'recording.wav');
  
    fetch('/upload-audio', {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(data => {
        // Display the transcription and medical records
        document.getElementById('transcription-text').innerText = data.transcription;
        document.getElementById('symptoms').innerText = `Symptoms: ${data.extractedData.symptoms}`;
        document.getElementById('prescriptions').innerText = `Prescriptions: ${data.extractedData.prescriptions}`;
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Failed to process the audio');
      });
  }
  