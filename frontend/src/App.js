import React, { useRef, useState } from "react";
import "./App.css";
import WpmChart from "./WPMchart.js";
import VolumeChart from "./VolumeChart.js";
function App() {
  const ref = useRef(null);
  const [file, setFile] = useState(null);
  const [transcription, setTranscription] = useState("");
  const [fillers, setFillers] = useState({});
  const [totalWPM, setTotalWPM] = useState(0);
  const [wpmTimeline, setWpmTimeline] = useState([]);
  const [volumeTimeline, setVolumeTimeline] = useState(null);
  const [feedback, setFeedback] = useState([]);


  const check = (event) => {
    if (event.target.files[0]?.type.startsWith("audio/")) {
      setFile(event.target.files[0]);
    } else {
      alert("Please select an audio file.");
      setFile(null);
      ref.current.value = "";
    }
  };

  const uploading = async (event) => {
    event.preventDefault();
    if (!file) return alert("No file selected!");
    const form = new FormData();
    form.append("file", file);
    const info = await fetch("http://localhost:5100/upload", {
      method: "POST",
      body: form,
    });
    const result = await info.json();
    setTranscription(result.text);
    setFillers(result.fillers);
    setTotalWPM(result.totalWPM);
    setWpmTimeline(result.wpmTimeline);
    setVolumeTimeline(result.volumeTimeline);
    setFeedback(result.feedback);
    if (result.volumeTimeline?.samples) {
      console.log(
        result.volumeTimeline.samples.some(v => !isFinite(v)),
        result.volumeTimeline.samples
      );
    }
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
    mediaRecorder.ondataavailable = (event) => chunksRef.current.push(event.data);
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

  // Random floating shapes for the background
  const shapes = Array.from({ length: 8 }).map((_, i) => (
    <div
      key={i}
      className="floating-shape"
      style={{
        width: `${30 + Math.random() * 50}px`,
        height: `${30 + Math.random() * 50}px`,
        background: `rgba(${50 + Math.random()*200}, ${50 + Math.random()*200}, 255, 0.2)`,
        top: `${Math.random() * 100}vh`,
        left: `${Math.random() * 100}vw`,
        animationDuration: `${10 + Math.random() * 10}s`,
      }}
    />
  ));

  return (
    <div className="relative min-h-screen flex flex-col items-center p-6 bg-gradient-to-b from-[#1b1b2e] to-[#2c2c3e] overflow-hidden">
      {shapes}

      <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-indigo-500 mb-10 z-10 relative">
        Oratoris
      </h1>

      <form className="flex flex-col md:flex-row gap-4 mb-10 w-full max-w-lg z-10 relative">
        <input
          name="file"
          onChange={check}
          ref={ref}
          type="file"
          className="border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-sm bg-[#2a2a40] text-[#f0f0f5]"
        />
        <button
          onClick={uploading}
          className="bg-gradient-to-r from-indigo-600 to-teal-400 text-white px-6 py-2 rounded-lg shadow-lg button-glow"
        >
          Upload
        </button>
      </form>

      <div className="recorder flex flex-col items-center mb-10 space-y-4 z-10 relative">
        {!recording ? (
          <button
            onClick={startRecording}
            className="bg-gradient-to-r from-teal-400 to-indigo-500 text-white px-6 py-2 rounded-lg shadow-lg button-glow"
          >
            Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="bg-red-500 text-white px-6 py-2 rounded-lg shadow-lg button-glow"
          >
            Stop Recording
          </button>
        )}
        {audioURL && <audio controls src={audioURL} className="mt-2 shadow rounded z-10 relative" />}
      </div>

      <div className="display w-full max-w-3xl space-y-6 z-10 relative">
        {/* Transcription Card */}
        <div className="card card-teal shadow-xl">
          <h2 className="text-2xl font-semibold text-teal-300 mb-2">Transcription</h2>
          <p>{transcription || "Transcription appears here."}</p>
        </div>

        {/* Filler Words Card */}
        <div className="card card-indigo shadow-xl">
          <h2 className="text-2xl font-semibold text-indigo-300 mb-2">Filler Words</h2>
          {fillers ? (
            Object.entries(fillers).map(([word, count]) => (
              <div key={word}>
                {word}: {count}
              </div>
            ))
          ) : (
            <p>No filler words yet.</p>
          )}
        </div>

        {/* WPM Timeline Card */}
        <div className="card card-violet shadow-xl">
          <h2 className="text-2xl font-semibold text-violet-300 mb-2">WPM Timeline</h2>
          {wpmTimeline && wpmTimeline.length > 0 ? (
            <WpmChart data={wpmTimeline} />
          ) : (
            <p>No WPM data available yet.</p>
          )}
        </div>
        {/* Volume Timeline Card */}
        <div className="card card-violet shadow-xl">
          <h2 className="text-2xl font-semibold text-violet-300 mb-2">Volume Timeline</h2>
          {volumeTimeline ? (
            <VolumeChart data={volumeTimeline} />
          ) : (
            <p>No volume data available yet.</p>
          )}
        </div>
        {/* Feedback Card */}
        <div className="card card-emerald shadow-xl">
          <h2 className="text-2xl font-semibold text-emerald-300 mb-2">Speaking Feedback</h2>
          {feedback?.length > 0 ? (
            feedback.map((msg, i) => (
              <p key={i} className="mb-1">• {msg}</p>
            ))
          ) : (
            <p>No feedback yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
