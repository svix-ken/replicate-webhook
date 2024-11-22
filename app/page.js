'use client';
 
import { useState, useEffect } from "react";
import Image from "next/image";
import Replicate from "replicate";

import AudioRecorder from "./AudioRecorder";
  
export default function Home() {
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [transcription, setTranscription] = useState(null)

  const transcribe = async url => {
    try {
      const response = await fetch("/api/speech-to-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
  
      const data = await response.json();
      if (response.ok) {
        console.log("Replicate output:", data.output);
      } else {
        console.error("Error from API route:", data.error);
      }
    } catch (error) {
      console.error("Error calling API route:", error);
    }
  }

  useEffect(() => {
    const eventSource = new EventSource('/api/sse');

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setPrediction(data)
      console.log(data)
    };

    eventSource.onerror = (error) => {
      console.error('Error in SSE connection:', error);
      // Try to reconnect if the connection is closed unexpectedly
      eventSource.close();
      setTimeout(() => {
        const newEventSource = new EventSource('/api/sse');
        eventSource = newEventSource;
      }, 3000); // Attempt to reconnect after 3 seconds
    };

    return () => {
      eventSource.close();
    };
  }, []);
 
  return (
    <div className="container max-w-2xl mx-auto p-5">
      <h1 className="py-6 text-center font-bold text-2xl">
        Create an image with your voice:
      </h1>

      <AudioRecorder transcribe={transcribe}/>
 
      {error && <div>{error}</div>}

      <span>transcription: {transcription}</span>
 
      {prediction && (
        <>
          {prediction.output && (
            <div className="image-wrapper mt-5">
              <img
                src={prediction.output[0]}
                alt="output"
                sizes="100vw"
                height={768}
                width={768}
              />
            </div>
          )}
          <p className="py-3 text-sm opacity-50">status: {prediction.status}</p>
        </>
      )}
    </div>
  );
}