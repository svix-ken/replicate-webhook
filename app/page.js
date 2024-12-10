'use client';
 
import { useState, useEffect } from "react";

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
    let eventSource;
  
    const connect = () => {
      eventSource = new EventSource('/api/sse');
  
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received data:', data);
  
          if (data.type === 'image') {
            setPrediction(data.data);
          } else {
            setTranscription(data.data);
          }
        } catch (error) {
          console.error('Error parsing SSE data:', error);
        }
      };
  
      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        eventSource.close();
  
        // Reconnect after 3 seconds
        setTimeout(() => {
          console.log('Reconnecting SSE...');
          connect();
        }, 3000);
      };
    };
  
    connect(); // Initial connection
  
    return () => {
      if (eventSource) {
        eventSource.close();
        console.log('SSE connection closed.');
      }
    };
  }, []);
  
  
 
  return (
    <div className="container max-w-2xl mx-auto p-5">
      <h1 className="py-6 text-center font-bold text-2xl">
        Create an image with your voice:
      </h1>

      <AudioRecorder transcribe={transcribe}/>
 
      {error && <div>{error}</div>}
 
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
        </>
      )}
    </div>
  );
}