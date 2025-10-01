import os
print("Current working dir:", os.getcwd())
import whisper
model = whisper.load_model("base")
print("CHECKING TEST 1:")
result = model.transcribe("test.m4a")
print(result["text"])
print("CHECKING TEST 2:")
result = model.transcribe("test3.m4a")
print(result["text"])
print("CHECKING 1 min speech:")
result = model.transcribe("1minspeech.mp3")
print(result["text"])