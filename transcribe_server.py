from flask import Flask, request, jsonify
import whisper

app = Flask(__name__)
model = whisper.load_model("base")

@app.route("/transcribe", methods=["POST"])
def transcribe():
    print(request.files)
    audio_file = request.files["file"]
    audio_file.save("temp_audio.wav")
    result = model.transcribe("temp_audio.wav")
    return jsonify({"text": result["text"]})

if __name__ == "__main__":
    app.run(port=5000)
