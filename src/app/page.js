// y68ygrn6v2s05qw1wxcz6aa
"use client";
import { SimliClient } from "simli-client";
import React, { useEffect, useRef, useState } from "react";
import { textToAudioPCM } from "@/utils/audioConverter";
import audioUrl from "../assets/simli-demo.mp3";
import { AudioContext } from "standardized-audio-context";

function Home() {
  // const [isInitialized, setIsInitialized] = useState(false);

  const videoRef = useRef(null);
  const audioRef = useRef(null);
  // const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const simliClient = new SimliClient();

  const simliConfig = {
    apiKey: "",
    faceID: "tmp9i8bbq7c",
    handleSilence: true,
    maxSessionLength: 3600,
    maxIdleTime: 600,
    videoRef: videoRef,
    audioRef: audioRef,
  };

  simliClient.on("connected", () => {
    console.log("SimliClient is now connected!");
    // initializeClient();
  });

  simliClient.on("disconnected", () => {
    console.log("SimliClient has disconnected!");
  });

  simliClient.on("failed", () => {
    console.log("SimliClient has failed to connect!");
  });

  // Utility function to downsample and chunk the audio data
  const downsampleAndChunkAudio = async (audioUrl, chunkSizeInMs = 100) => {
    // Create an AudioContext with a target sample rate of 16kHz
    const audioContext = new AudioContext({ sampleRate: 16000 });

    // Fetch and decode audio file
    const response = await fetch(audioUrl);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // Extract PCM data from audio buffer
    const rawPCM = audioBuffer.getChannelData(0); // assuming mono audio for simplicity

    // Calculate chunk size in samples (16-bit PCM)
    const chunkSizeInSamples = (chunkSizeInMs / 1000) * 16000;
    const pcmChunks = [];

    // Loop through the raw PCM data and create chunks
    for (let i = 0; i < rawPCM.length; i += chunkSizeInSamples) {
      const chunk = rawPCM.subarray(i, i + chunkSizeInSamples);

      // Convert each chunk to Int16Array PCM data
      const int16Chunk = new Int16Array(chunk.length);
      for (let j = 0; j < chunk.length; j++) {
        int16Chunk[j] = Math.max(-32768, Math.min(32767, chunk[j] * 32768));
      }

      pcmChunks.push(int16Chunk);
    }

    return pcmChunks;
  };

  async function initializeClient() {
    try {
      simliClient.Initialize(simliConfig);
      await simliClient.start();
      // setIsInitialized(true);

      // Send audio data in chunks
      const pcmChunks = await downsampleAndChunkAudio(audioUrl);

      const interval = setInterval(() => {
        const chunk = pcmChunks.shift();
        // if (isInitialized && chunk) {
          chunk && simliClient.sendAudioData(chunk);
        // }
        if (!pcmChunks.length) clearInterval(interval);
        console.log("PCM ", chunk);
      }, 120);
    } catch(error){
      alert(error);
    }
  }

  return (
    <div className="wrap">
      <div className="videoBox">
        <video ref={videoRef} autoPlay playsInline></video>
        <audio ref={audioRef} autoPlay></audio>
      </div>
      <div className="btnWrap">
        <button
          onClick={initializeClient}
          className="btn"
        >
          Start connection
        </button>
        <button
          onClick={() => (simliClient.close())}
          className="btn"
        >
          Stop connection
        </button>
      </div>
    </div>
  );
}

export default Home;

