const express = require("express");
const cors = require("cors");

const api = require("./api/api-main");
const {connectToMongo} = require("./database/database-util");
const {testMailjet} = require("./api/api-users");

require("dotenv").config()
const PORT = process.env.PORT;

const app = express();

// Define CORS for the app
app.use(cors({
    origin: "http://localhost:3000"
}));

// Make it able to parse JSON
app.use(express.json());

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

// Initialize API
console.log("Initializing API...");
api.initialize(app);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
