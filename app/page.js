'use client';
 
import { useState, useEffect } from "react";

import AudioRecorder from "./AudioRecorder";
  
export default function Home() {
  const [error, setError] = useState(null);
  const [image, setImage] = useState(null);
  const [prompt, setPrompt] =useState("")

  const transcribe = async url => {
    try {
      const response = await fetch("/api/speech-to-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
  
      const data = await response.json();
      if (response.ok) {
        setPrompt("Transcribing Audio...")
      } else {
        setError(data.error)
      }
    } catch (error) {
      setError(error)
    }
  }
 
  return (
    <div className="container max-w-2xl mx-auto p-5">
      <h1 className="py-6 text-center font-bold text-2xl">
        Create an image with your voice:
      </h1>

      <AudioRecorder transcribe={transcribe}/>

      <p>{prompt}</p>

      {image ? <img href={image} /> : null}
 
      {error && <div>{error}</div>}
 
    </div>
  );
}