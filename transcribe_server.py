from flask import Flask, request, jsonify
import whisper
import re
from pydub import AudioSegment
import json

app = Flask(__name__)
model = whisper.load_model("base")

@app.route("/transcribe", methods=["POST"])
def transcribe():
    audio_file = request.files["file"]
    audio_file.save("temp_audio.wav")
    result = model.transcribe("temp_audio.wav")
    audio = AudioSegment.from_file("temp_audio.wav")
    volume_timeline = compute_volume_timeline(audio)
    transcription = result["text"].lower()
    fillers = {
        "um": 0,
        "uh": 0,
        "oh": 0,    
        "er": 0,
        "ah": 0,
        "you know": 0,
        "like": 0,
        "basically": 0
    }
    num_words = len(re.findall(r'\b\w+\b', transcription))
    if "segments" in result and len(result["segments"]) > 0:
        total_duration = result["segments"][-1]["end"]
    else:
        total_duration = 0
    totalWPM = (num_words / total_duration) * 60 if total_duration > 0 else 0
    for filler in fillers:
        pattern = r'\b' + re.escape(filler) + r'\b'
        fillers[filler] = len(re.findall(pattern, transcription))
    segment_wpm = []
    for seg in result.get("segments", []):
        seg_text = seg["text"]
        num_words = len(re.findall(r'\b\w+\b', seg_text))
        duration_sec = seg["end"] - seg["start"]
        wpm = (num_words / duration_sec) * 60 if duration_sec > 0 else 0
        segment_wpm.append({
            "time": round(seg["end"],2),
            "wpm": round((wpm),2)
        })
    return jsonify({
        "text": result["text"],
        "fillers": fillers,
        "totalWPM": totalWPM,
        "wpmTimeline": segment_wpm,
        "volumeTimeline": volume_timeline
        })
def dbfs_to_score(dbfs, min_db=-60.0, max_db=-5.0):
    if dbfs == float("-inf"):
        return 0
    norm = (dbfs - min_db) / (max_db - min_db)
    score = norm * 100
    if score < 0:
        score = 0
    if score > 100:
        score = 100 
    return score
def compute_volume_timeline(audio, window_ms=200):
    samples = []
    for i in range(0, len(audio), window_ms):
        chunk = audio[i:i+window_ms]
        samples.append(chunk.dBFS)
    return {
        "window_ms": window_ms,
        "samples": samples
    }

if __name__ == "__main__":
    app.run(port=5000)
