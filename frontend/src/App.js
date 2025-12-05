import React, { useRef, useState } from "react";
import "./App.css";
import WpmChart from "./WPMchart.js";
import VolumeChart from "./VolumeChart.js";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Astronaut from "./astronaut";
import { Html } from "@react-three/drei";
import { Suspense } from "react";
function App() {
  const ref = useRef(null);
  const [file, setFile] = useState(null);
  const [transcription, setTranscription] = useState("");
  const [fillers, setFillers] = useState({});
  const [totalWPM, setTotalWPM] = useState(0);
  const [wpmTimeline, setWpmTimeline] = useState([]);
  const [volumeTimeline, setVolumeTimeline] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [currentFeedbackIndex, setCurrentFeedbackIndex] = useState(0);
React.useEffect(() => {
  if (!feedback || feedback.length === 0) return;
  setCurrentFeedbackIndex(0);
  const interval = setInterval(() => {
    setCurrentFeedbackIndex((prev) =>
      (prev + 1) % feedback.length
    );
  }, 3000);
  return () => clearInterval(interval);
}, [feedback]);



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

  // Starfield with twinkling stars
  const stars = Array.from({ length: 120 }).map((_, i) => (
    <div
      key={i}
      className="star"
      style={{
        width: `${Math.random() * 2 + 0.5}px`,
        height: `${Math.random() * 2 + 0.5}px`,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        '--duration': `${Math.random() * 3 + 2}s`,
      }}
    />
  ));

  // Nebula clouds
  const nebulas = Array.from({ length: 3 }).map((_, i) => (
    <div
      key={i}
      className={`nebula ${i % 2 === 0 ? 'nebula-purple' : 'nebula-cyan'}`}
      style={{
        width: `${200 + Math.random() * 300}px`,
        height: `${200 + Math.random() * 300}px`,
        top: `${Math.random() * 80 - 40}%`,
        left: `${Math.random() * 100 - 50}%`,
      }}
    />
  ));

  return (
    <div className="relative min-h-screen flex flex-col items-center p-6 overflow-hidden bg-transparent" style={{zIndex: 10}}>
      {stars}

      <h1 className="text-7xl font-extrabold mb-10 z-10 relative" style={{letterSpacing: '0.1em', color: '#00ffff', textShadow: '0 0 30px rgba(0, 255, 255, 0.8), 0 0 60px rgba(138, 43, 226, 0.4)'}}>
        ORATORIS
      </h1>

      <form className="flex flex-col md:flex-row gap-4 mb-10 w-full max-w-lg z-10 relative">
        <input
          name="file"
          onChange={check}
          ref={ref}
          type="file"
          className="border rounded-lg px-4 py-2 flex-1 button-glow"
        />
        <button
          onClick={uploading}
          className="bg-cyan-500 text-white px-6 py-2 rounded-lg font-bold button-glow hover:bg-cyan-400"
        >
          Upload
        </button>
      </form>

      <div className="recorder flex flex-col items-center mb-10 space-y-4 z-10 relative">
        {!recording ? (
          <button
            onClick={startRecording}
            className="bg-cyan-500 text-white px-8 py-3 rounded-lg font-bold button-glow hover:bg-cyan-400"
          >
            Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="bg-red-500 text-white px-8 py-3 rounded-lg font-bold button-glow hover:bg-red-400"
          >
            Stop Recording
          </button>
        )}
        {audioURL && <audio controls src={audioURL} className="mt-2 z-10 relative" style={{filter: 'brightness(1.2)'}} />}
      </div>

      <div className="display w-full max-w-3xl space-y-6 z-10 relative">
        {/* Transcription Card */}
        <div className="card card-teal shadow-xl">
          <h2 className="text-2xl font-semibold text-cyan-300 mb-2">◆ TRANSCRIPTION</h2>
          <p className="text-blue-50">{transcription || "Awaiting transcription..."}</p>
        </div>

        {/* Filler Words Card */}
        <div className="card card-indigo shadow-xl">
          <h2 className="text-2xl font-semibold text-purple-300 mb-2">◆ FILLER WORDS</h2>
          {fillers && Object.keys(fillers).length > 0 ? (
            Object.entries(fillers).map(([word, count]) => (
              <div key={word} className="text-blue-50 my-1">
                → <span className="text-pink-400">{word}</span>: <span className="text-cyan-300">{count}</span>
              </div>
            ))
          ) : (
            <p className="text-blue-50">No filler words detected.</p>
          )}
        </div>

        {/* WPM Timeline Card */}
        <div className="card card-violet shadow-xl">
          <h2 className="text-2xl font-semibold text-purple-300 mb-2">◆ SPEAKING SPEED ANALYSIS</h2>
          {wpmTimeline && wpmTimeline.length > 0 ? (
            <WpmChart data={wpmTimeline} />
          ) : (
            <p className="text-blue-50">No WPM data available yet.</p>
          )}
        </div>
        {/* Volume Timeline Card */}
        <div className="card card-violet shadow-xl">
          <h2 className="text-2xl font-semibold text-purple-300 mb-2">◆ VOLUME ANALYSIS</h2>
          {volumeTimeline ? (
            <VolumeChart data={volumeTimeline} />
          ) : (
            <p className="text-blue-50">No volume data available yet.</p>
          )}
        </div>
        <div
          className="card card-violet shadow-xl mx-auto"
          style={{
            height: "400px",
            width: "100%",
            maxWidth: "800px",
            overflow: "hidden",
            padding: "2",
          }}
        >
          <h2 className="text-2xl font-semibold text-emerald-300 mb-2">Coach Feedback</h2>
          <Canvas camera={{ position: [0, 1.2, 2] }}>
            <color attach="background" args={["#1b1b2e"]} />

            <ambientLight intensity={0.7} />
            <directionalLight intensity={1.2} position={[3, 3, 3]} />
            <directionalLight intensity={0.6} position={[-3, 2, -2]} />

            <Suspense fallback={null}>
              <Astronaut position={[0, 0, 0]} scale={1.8} />
              {/*Speech Bubble*/}
              <Html
                position={[1.4, 1.3, 0]}
                center
                style={{
                  background: "white",
                  padding: "6px 10px",
                  borderRadius: "10px",
                  fontSize: "12px",
                  color: "#222",
                  maxWidth: "120px",
                  lineHeight: "1.2",
                  textAlign: "left",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                  position: "relative",
                }}
              >
                {feedback.length > 0
                  ? feedback[currentFeedbackIndex]
                  : "I'm ready when you are!"}

                {/* Bubble Tail */}
                <div
                  style={{
                    position: "absolute",
                    left: "-8px",
                    top: "14px",
                    width: 0,
                    height: 0,
                    borderTop: "6px solid transparent",
                    borderBottom: "6px solid transparent",
                    borderRight: "8px solid white",
                    filter: "drop-shadow(-1px 1px 1px rgba(0,0,0,0.15))",
                  }}
                />
              </Html>
            </Suspense>
            <OrbitControls
              enableZoom={false}
              target={[0, 1, 0]}
            />
          </Canvas>
        </div>
        {/* Feedback Card */}
        <div className="card card-emerald shadow-xl">
          <h2 className="text-2xl font-semibold text-emerald-300 mb-2">Compiled Speaking Feedback</h2>
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
