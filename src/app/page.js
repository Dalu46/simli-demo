"use client";
import { SimliClient } from "simli-client";
import React, { useRef } from "react";
import audioUrl from "../assets/aivoice.wav";

function Home() {
    const videoRef = useRef(null);
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const simliClient = new SimliClient();

    const simliConfig = {
        apiKey: "",
        faceID: "31e5dd74-a7a2-4a92-86dc-69e9c1cd7640",
        handleSilence: true,
        maxSessionLength: 3600,
        maxIdleTime: 600,
        videoRef: videoRef,
    };

    simliClient.on("connected", () => {
        console.log("SimliClient is now connected!");
        initializeClient();
    });

    simliClient.on("disconnected", () => {
        console.log("SimliClient has disconnected!");
    });

    simliClient.on("failed", () => {
        console.log("SimliClient has failed to connect!");
    });

    // Function to convert AudioBuffer to PCM16 format
    function convertToPCM16(audioBuffer) {
        const channelData = audioBuffer.getChannelData(0); // Get first channel
        const pcm16Data = new Int16Array(channelData.length);
        for (let i = 0; i < channelData.length; i++) {
            pcm16Data[i] = Math.max(-1, Math.min(1, channelData[i])) < 0 
                ? Math.max(-32768, Math.floor(channelData[i] * 32768)) 
                : Math.min(32767, Math.ceil(channelData[i] * 32768));
        }
        return pcm16Data.buffer;
    }

    // Send audio data in 6KB chunks
    async function sendAudioDataInChunks(arrayBuffer) {
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const pcm16Data = convertToPCM16(audioBuffer);
        const CHUNK_SIZE = 6000; // 6KB chunk size

        for (let i = 0; i < pcm16Data.byteLength; i += CHUNK_SIZE) {
            const chunk = new Uint8Array(pcm16Data.slice(i, i + CHUNK_SIZE));
            console.log(`Sending chunk of size: ${chunk.length} bytes`); // Log chunk size
            simliClient.sendAudioData(chunk);
        }

        console.log("Sent PCM16 audio data successfully in chunks.");
    }

    async function initializeClient() {
        const response = await fetch(audioUrl);
        const arrayBuffer = await response.arrayBuffer();

        // Make a copy of the arrayBuffer for decoding to avoid detachment
        const decodingBuffer = arrayBuffer.slice(0);

        simliClient.Initialize(simliConfig);
        await simliClient.start();

        // Send audio data in chunks
        sendAudioDataInChunks(arrayBuffer);

        // Optional: Client-side playback for verification with a copied buffer
        audioContext.decodeAudioData(
            decodingBuffer,
            (audioBuffer) => {
                const audioSource = audioContext.createBufferSource();
                audioSource.buffer = audioBuffer;
                audioSource.connect(audioContext.destination);
                audioSource.start();
            },
            (error) => console.error("Error decoding audio data:", error)
        );
    }

    return (
        <div>
            <div className="border-red-100 border w-1/4">
                <video ref={videoRef} autoPlay playsInline></video>
            </div>
            <button onClick={initializeClient}>Start connection</button>
            <button onClick={() => simliClient.close()}>Stop connection</button>
        </div>
    );
}

export default Home;