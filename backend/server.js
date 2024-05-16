const express = require("express");
const { MongoClient, Double } = require("mongodb");
const cors = require("cors");

const app = express();
const port = 5000;

const url = "mongodb://localhost:27017";
const dbName = "clockwork";

// Define CORS for the app
app.use(cors({
    origin: "http://localhost:3000"
}));

// Middleware to parse JSON bodies
app.use(express.json());

// Database connection function
async function connectToMongo() {
    try {
        let client = await MongoClient.connect(url);
        return client;
    } catch (error) {
        throw error;
    }
}

// Test database connection
console.log("Testing database connection...");

connectToMongo()
    .then(client => {
        console.log("Connected to database!");
        client.close();
    })
    .catch(error => {
        console.error("Error connecting to database:", error);
    });

/* 
ROUTES
*/

// Test route
app.get("/test", (req, res) => {
    res.send("Welcome to Clockwork!");
});

// Fetch users
app.get("/allusers", (req, res) => {
    console.log("Request to fetch users");

    connectToMongo()
        .then(client => {
            let db = client.db(dbName);
            let collection = db.collection("users");

            collection.find({}).toArray()
                .then(result => {
                    console.log("Users fetched:");
                    console.log(result);
                    res.json(result);
                })
                .catch(error => {
                    console.error("Error fetching users", error);
                })
                .finally(() => {
                    client.close();
                });
        });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
