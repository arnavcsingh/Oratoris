import express from "express";
import multer from "multer";
const port = 5100;
const app = express();
app.use(express.json());
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
    const flaskRes = await fetch('http://127.0.0.1:5000/flask');
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