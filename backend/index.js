import express from "express";
import multer from "multer";
import cors from 'cors';
import fs from 'fs';
import FormData from 'form-data';
const port = 5100;
const app = express();
app.use(express.json());
app.use(cors());
app.get('/', (req, res) => {
    res.send("Welcome to Oratoris!")
});
const storage = multer.diskStorage({
    destination: (req, res, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname);
    }
})
const upload = multer({ storage });
app.post('/upload', upload.single('file'), async (req, reactRes) => {
    const f = new FormData();
    f.append('file', fs.createReadStream(req.file.path), req.file.originalname)
    const flaskRes = await fetch('http://127.0.0.1:5000/transcribe', {
        method: "POST",
        body: f,
        headers: f.getHeaders()
    });
    if(flaskRes.ok){
        const data = await flaskRes.json();
        reactRes.json({data})
    } else {
        reactRes.json(null)
    }
})
app.listen(port, () => {
    console.log(`App is running on port ${port}.`)
})