// audioLoader.js
export default function audioLoader(content) {
    return new Blob([content], { type: "audio/wav" }); // Adjust content type if needed
  }
  