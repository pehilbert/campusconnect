const {initializeAPI} = require("./api/api");
const express = require("express");
const cors = require("cors");

const PORT = 5000;

const app = express();

// Define CORS for the app
app.use(cors({
    origin: "http://localhost:3000"
}));

// Test database connection
console.log("Testing database connection...");

connectToMongo()
    .then(client => {
        console.log("Connected to database!");
        client.close();
    })
    .catch(error => {
        console.error("Error connecting to database:", error);
        throw error;
    });

// Initialize API Endpoints
console.log("Initializing API...");
initializeAPI(app);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
