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
    <h1 className="text-5xl font-extrabold text-indigo-700 mb-8 drop-shadow-lg">
      Oratoris
    </h1>

    <form className="flex flex-col md:flex-row gap-4 mb-8 w-full max-w-lg">
      <input
        name="file"
        onChange={check}
        ref={ref}
        type="file"
        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-sm transition"
      />
      <button
        onClick={uploading}
        className="bg-indigo-600 text-white px-6 py-2 rounded-lg shadow-lg hover:bg-indigo-700 hover:scale-105 transition transform duration-300"
      >
        Upload
      </button>
    </form>

    <div className="recorder flex flex-col items-center mb-8 space-y-4">
      {!recording ? (
        <button
          onClick={startRecording}
          className="bg-teal-400 text-white px-6 py-2 rounded-lg shadow-lg hover:bg-teal-500 hover:-translate-y-1 hover:scale-105 transition transform duration-300"
        >
          Start Recording
        </button>
      ) : (
        <button
          onClick={stopRecording}
          className="bg-red-500 text-white px-6 py-2 rounded-lg shadow-lg hover:bg-red-600 hover:-translate-y-1 hover:scale-105 transition transform duration-300"
        >
          Stop Recording
        </button>
      )}
      {audioURL && <audio controls src={audioURL} className="mt-2 shadow rounded" />}
    </div>

    <div className="display w-full max-w-3xl space-y-6">
      {/** Cards with 3D hover effect **/}
      <div className="p-6 bg-white rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-2 transition transform duration-300">
        <h2 className="text-2xl font-semibold text-indigo-600 mb-2">Transcription</h2>
        <p>{data?.text || "Transcription appears here."}</p>
      </div>

      <div className="p-6 bg-white rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-2 transition transform duration-300">
        <h2 className="text-2xl font-semibold text-teal-500 mb-2">Filler Words</h2>
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

      <div className="p-6 bg-white rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-2 transition transform duration-300">
        <h2 className="text-2xl font-semibold text-indigo-600 mb-2">WPM Timeline</h2>
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
