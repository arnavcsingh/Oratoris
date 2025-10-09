import express from "express";

const app = express();
app.use(express.json());
app.get('/', (req, res) => {
    res.send("Welcome to Oratoris!")
});
app.listen(5100, () => {
    console.log("App is running on port 5100.")
})