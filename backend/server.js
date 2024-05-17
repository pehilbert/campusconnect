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
app.get("/allusers", async (req, res) => {
    console.log("Request to fetch users");

    let client;
    try {
        client = await connectToMongo();  // Ensure you handle MongoDB connection properly
        const db = client.db(dbName);
        const users = db.collection("users");

        const result = await users.find({}).toArray();
        console.log("Users fetched:", result);
        res.json(result);
    } catch (error) {
        console.error("Error fetching users or connecting to database:", error);
        res.status(500).send({
            error: "Error fetching users"
        });
    } finally {
        if (client) {
            client.close(); // Ensures that the database connection is closed even if an error occurs
        }
    }
});

// Route to crate a new user
app.post("/createuser", async (req, res) => {
    console.log("Request to create user");

    if (!req.body.username || !req.body.password || req.body.email) {
        console.log("Not all information was provided");

        return res.status(400).send({
            error: "Must provide username, password, and email"
        });
    }

    try {
        const client = await connectToMongo();
        const db = client.db(dbName);
        const users = db.collection("users");

        const result = await users.insertOne({
            username: req.body.username,
            password: req.body.password,
            email: req.body.email
        });

        console.log(`Successfully added user with the _id: ${result.insertedId}`);
        console.log("Result object:", result);

        res.status(201).send({ 
            message: "User created successfully", 
            userId: result.insertedId 
        });
    } catch (error) {
        console.error("Error during user creation or database connection:", error);
        res.status(500).send({
            error: "Error adding user"
        });
    } finally {
        if (client) {
            client.close();
        }
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
