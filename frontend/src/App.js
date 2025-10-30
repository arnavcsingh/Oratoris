import React, { useRef, useState } from 'react';
import './App.css';
import WpmChart from "./WPMchart.js";

function App() {
  const ref = useRef(null);
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);
  const check = (event) => {
    if (event.target.files[0].type.startsWith("audio/")) {
      setFile(event.target.files[0]);
    } else {
      alert("Please select an audio file.");
      setFile(null);
      ref.current.value = "";
    }
  };

  const uploading = async (event) => {
    event.preventDefault();
    const form = new FormData();
    form.append('file', file);
    const info = await fetch('http://localhost:5100/upload', {
      method: "POST",
      body: form
    });
    const data = await info.json()
    console.log("Chart data:", data.wpmTimeline);
    setData(data);
  };

  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    chunksRef.current = [];
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.ondataavailable = (event) => {
      chunksRef.current.push(event.data);
    };
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const url = URL.createObjectURL(blob);
      setAudioURL(url);
      setFile(new File([blob], "recording.webm", { type: "audio/webm" }));
    };
    mediaRecorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-white flex flex-col items-center p-6">
      <h1 className="text-4xl font-bold text-indigo-700 mb-6">Oratoris</h1>

      <form className="flex flex-col md:flex-row gap-4 mb-6 w-full max-w-lg">
        <input
          name="file"
          onChange={check}
          ref={ref}
          type="file"
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <button
          onClick={uploading}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
        >
          Upload
        </button>
      </form>

      <div className="recorder flex flex-col items-center mb-6 space-y-4">
        {!recording ? (
          <button
            onClick={startRecording}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
          >
            Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          >
            Stop Recording
          </button>
        )}
        {audioURL && <audio controls src={audioURL} className="mt-2" />}
      </div>

      <div className="display w-full max-w-3xl space-y-6">
        <div className="p-4 bg-white shadow rounded">
          <h2 className="text-xl font-semibold mb-2">Transcription</h2>
          <p>{data?.text || "Transcription appears here."}</p>
        </div>

        <div className="p-4 bg-white shadow rounded">
          <h2 className="text-xl font-semibold mb-2">Filler Words</h2>
          {data?.fillers ? (
            Object.entries(data.fillers).map(([word, count]) => (
              <div key={word}>
                {word}: {count}
              </div>
            ))
          ) : (
            <p>No filler words yet.</p>
          )}
        </div>

        <div className="p-4 bg-white shadow rounded">
          <h2 className="text-xl font-semibold mb-2">WPM Timeline</h2>
          {data?.wpmTimeline && data.wpmTimeline.length > 0 ? (
            <WpmChart data={data.wpmTimeline} />
          ) : (
            <p>No WPM data available yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
