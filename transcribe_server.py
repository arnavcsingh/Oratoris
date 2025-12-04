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
    feedback = generate_feedback(segment_wpm, totalWPM, volume_timeline["samples"])
    print(feedback)
    return jsonify({
        "text": result["text"],
        "fillers": fillers,
        "totalWPM": totalWPM,
        "wpmTimeline": segment_wpm,
        "volumeTimeline": volume_timeline,
        "feedback": feedback
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
def compute_volume_timeline(audio, window_ms=200, max_points=150):
    samples = []
    for i in range(0, len(audio), window_ms):
        chunk = audio[i:i+window_ms]
        db = chunk.dBFS
        if db == float('-inf') or db is None:
            db = -80
        samples.append(db)

    if len(samples) > max_points:
        import numpy as np
        idx = np.linspace(0, len(samples)-1, max_points).astype(int)
        samples = [samples[i] for i in idx]

    return {
        "window_ms": window_ms,
        "samples": samples
    }


def generate_feedback(wpm_timeline, total_wpm, volume_samples):
    feedback = []

    #WPM FEEDBACK
    if total_wpm < 110:
        feedback.append("Your speaking pace was on the slower side. Try increasing your pace slightly to sound more confident and natural.")
    elif total_wpm > 170:
        feedback.append("You spoke quite fast overall. Slowing down a bit can improve clarity and help listeners follow your ideas.")
    else:
        feedback.append("Your speaking pace was within a clear and natural range.")

    # WPM stability (variation)
    if len(wpm_timeline) > 1:
        wpms = [point["wpm"] for point in wpm_timeline]
        import statistics
        wpm_stdev = statistics.stdev(wpms)

        if wpm_stdev < 15:
            feedback.append("Your pacing was very steady, which helps create a smooth delivery.")
        elif wpm_stdev < 30:
            feedback.append("Your pacing varied at times. Keep practicing to maintain a more consistent rhythm.")
        else:
            feedback.append("Your pacing fluctuated significantly. Try aiming for a steadier, more controlled pace.")

    #VOLUME FEEDBACK
    cleaned_volume = [v if v != float("-inf") else -80 for v in volume_samples]
    import statistics

    avg_volume = sum(cleaned_volume) / len(cleaned_volume)
    stdev_volume = statistics.stdev(cleaned_volume) if len(cleaned_volume) > 1 else 0
    max_volume = max(cleaned_volume)
    min_volume = min(cleaned_volume)

    # overall loudness
    if avg_volume < -32:
        feedback.append("Your overall volume was on the quieter side. Try projecting your voice more for clarity.")
    elif avg_volume < -22:
        feedback.append("Your volume stayed within a comfortable speaking range.")
    else:
        feedback.append("You spoke loudly and clearly, which helps you sound confident.")

    # volume variation (monotony)
    if stdev_volume < 3:
        feedback.append("Your volume stayed very flat, which can make speech sound monotone. Try adding more emphasis and vocal energy.")
    elif stdev_volume < 7:
        feedback.append("You used some vocal variation, which helps maintain engagement.")
    else:
        feedback.append("You used strong vocal dynamics, which helps emphasize important points.")

    # quiet sections
    quiet_frames = sum(1 for v in cleaned_volume if v < -35)
    if quiet_frames > len(cleaned_volume) * 0.3:
        feedback.append("Some sections were noticeably quiet. Make sure you're staying close to the microphone and projecting consistently.")

    # peak loudness
    if max_volume > -12:
        feedback.append("A few moments were very loud and close to clipping. Try to maintain consistent distance from the microphone.")

    # ending strength
    if cleaned_volume[-1] < avg_volume - 5:
        feedback.append("Your volume dropped toward the end. Try to finish with the same energy you started with.")

    return feedback

if __name__ == "__main__":
    app.run(port=5000)
