'use client';

import { useState } from "react";
import * as Bytescale from "@bytescale/sdk";

const AudioRecorder = (props) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [stream, setStream] = useState(null);

  let localAudioChunks = []; // Local variable to accumulate chunks

  const handleStartRecording = async () => {
    try {
      const userStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/ogg;codecs=opus";

      const recorder = new MediaRecorder(userStream, { mimeType });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          localAudioChunks.push(event.data); // Add to local chunks
        }
      };

      recorder.onstop = () => {

        if (localAudioChunks.length === 0) {
          return;
        }

        // Create a Blob from the recorded chunks
        const blob = new Blob(localAudioChunks, { type: mimeType });

        if (blob.size > 0) {
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
          handleUpload(blob); // Call the upload function here
        } else {
          console.error("Blob is empty");
        }

        // Clear local chunks
        localAudioChunks = [];
      };

      recorder.start();

      setStream(userStream); // Save the stream
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      console.error("Error starting recording:", err);
    }
  };

  const handleStopRecording = () => {

    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);

      stream.getTracks().forEach((track) => {
        track.stop();
      });

      setStream(null);
    } else {
      console.error("No media recorder available to stop.");
    }
  };

  const uploadManager = new Bytescale.UploadManager({
    apiKey: "public_12a1zCrFyiiAgn9ZGEjEvXdEfic6" // This is your API key.
  });

  const handleUpload = async (audioBlob) => {
    try {
      const result = await uploadManager.upload({
        data: audioBlob,
      });
  
      props.transcribe(result.fileUrl)

    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div>
      <h1>Audio Recorder</h1>
      <button onClick={isRecording ? handleStopRecording : handleStartRecording}>
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>

      {audioUrl && (
        <div>
          <h2>Recorded Audio</h2>
          <audio src={audioUrl} controls />
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
