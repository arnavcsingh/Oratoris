//import logo from './logo.svg';
import React, { useRef, useState } from 'react';
import './App.css';
function App() {
  const ref = useRef(null);
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);
  const check = (event) => {
    if(event.target.files[0].type.startsWith("audio/")){
      setFile(event.target.files[0]);
    } else {
      alert("Please select an audio file.");
      setFile(null);
      ref.current.value = ""
    }
  };
  const uploading = async (event) => {
    event.preventDefault();
    const form = new FormData();
    console.log(file)
    form.append('file',file);
    const info = await fetch('http://localhost:5100/upload', {
      method: "POST",
      body: form
    })
    console.log(info)
    setData(await info.json());
  };
  return (
    <div className="App">
      <h1>Oratoris</h1>
      <form>
        <input onChange = {check} ref = {ref} type = "file"/>
        <button onClick = {uploading}>Upload</button>
      </form>
      <div className = "display">
        <p className = "transcription">
          Transcription appears here.
          {data?.text}
        </p>
        <p className = "filler">
          Filler words appear here.
        </p>
        <p>
          Speed at which they talk appears here.
        </p>
      </div>
    </div>
  );
}

export default App;
