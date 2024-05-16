const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const port = 5000;

// Define CORS for the app
app.use(cors({
    origin: 'http://localhost:3000'
}));

// Middleware to parse JSON bodies
app.use(express.json());

// Connect to MongoDB (Update with your connection string)
mongoose.connect("mongodb://localhost:27017/clockwork", {})
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch(err => {
        console.error("Connection error:", err);
    });

// Test route
app.get("/test", (req, res) => {
  res.send("Welcome to Clockwork!");
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
