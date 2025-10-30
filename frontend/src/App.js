import React, { useRef, useState } from 'react';
import './App.css';

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
    setData(await info.json());
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
    <div className="App">
      <h1>Oratoris</h1>
      <form>
        <input name="file" onChange={check} ref={ref} type="file" />
        <button onClick={uploading}>Upload</button>
      </form>
      <div className="recorder">
        {!recording ? (
          <button onClick={startRecording}>Start Recording</button>
        ) : (
          <button onClick={stopRecording}>Stop Recording</button>
        )}
        {audioURL && <audio controls src={audioURL}></audio>}
      </div>
      <div className="display">
        <p className="transcription">
          Transcription appears here:
          <br />
          {data?.text}
        </p>
        <p className="filler">
          Filler words appear here:
          <br />
          {data?.fillers &&
            Object.entries(data.fillers).map(([word, count]) => (
              <div key={word}>{word}: {count}</div>
            ))}
        </p>
        <p>Speed at which they talk appears here:</p>
      </div>
    </div>
  );
}

export default App;
