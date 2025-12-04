# Oratoris

Oratoris is an AI-powered public speaking assistant designed to help users improve clarity, pacing, vocal projection, and overall delivery. It provides transcription, filler word detection, speaking speed analysis, volume tracking, and personalized coaching through an animated 3D astronaut model that displays feedback dynamically.

---

## Features

### 1. Audio Upload and Recording

* Upload audio files (`.mp3`, `.wav`, `.webm`, `.m4a`, etc.)
* Record speech directly in the browser using the MediaRecorder API
* Audio is sent through a unified pipeline (React → Node → Flask → ML models)

---

### 2. AI Transcription (Whisper)

* Uses OpenAI Whisper for accurate speech-to-text
* Converts spoken audio into formatted, reviewable transcription
* Designed for clarity and ease of reading

---

### 3. Filler Word Detection

Automatically detects and counts:

* um
* uh
* oh
* er
* ah
* you know
* like
* basically

A summary card displays occurrences clearly and concisely.

---

### 4. Speaking Speed (WPM) Timeline

* Calculates total WPM
* Generates an interactive WPM-over-time chart (Recharts)
* Helps users understand pacing and identify inconsistent speaking sections

---

### 5. Volume Timeline

* Uses PyDub to compute consistent dBFS measurements
* Produces a smooth, continuous volume graph
* Shows projection strength, quiet sections, and speaking intensity trends

---

### 6. Automated Coaching Feedback

The backend performs multi-dimensional analysis and generates structured feedback for:

* Overall speed
* Pace consistency
* Average volume
* Volume variation
* Quiet or weak vocal moments
* Ending strength of speech

These insights appear in both a text list and a rotating 3D speech bubble.

---

### 7. 3D Astronaut Coach (Three.js + React Three Fiber)

A fully animated astronaut model acts as the user's speaking coach.

Features include:

* Idle hovering motion
* Subtle head and arm animations
* Side-to-side floating
* Camera orbit interactions
* Cycling speech bubble showing feedback messages

This creates an engaging and memorable coaching experience.

---

### 8. Modern Space-Themed Interface

* Built using React and Tailwind CSS
* Gradient backgrounds, depth shadows, glowing buttons, and smooth transitions
* Clean dark mode aesthetic optimized for reading and long-term use

---

## Technologies Used

### Frontend

* React
* Tailwind CSS
* Recharts
* Three.js
* React Three Fiber
* React Three Drei
* MediaRecorder API

### Backend

* Node.js (file handling and routing)
* Flask (processing and ML inference)
* OpenAI Whisper
* PyDub
* NumPy

---

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/oratoris.git
cd oratoris
```

### 2. Install frontend dependencies

```bash
cd frontend
npm install
```

### 3. Install backend dependencies

```bash
cd ../backend
pip install -r requirements.txt
```

### 4. Start the Flask backend

```bash
python app.py
```

### 5. Start the Node server

```bash
node index.js
```

### 6. Start the React frontend

```bash
npm start
```

---

## Project Structure

```
oratoris/
│
├── frontend/         # React UI, components, charts, 3D astronaut
├── backend/          # Flask ML pipeline: Whisper, analysis, feedback
└── node-server/      # File upload routing and middleware
```

---

## Thanks for using Oratoris!

---