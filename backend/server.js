const express = require("express");
const { MongoClient, Double } = require("mongodb");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SECRET_KEY = "earl";

const app = express();
const port = 5000;

const url = "mongodb://localhost:27017";
const dbName = "clockwork";

const saltRounds = 10;

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
app.get("/users", async (req, res) => {
    console.log("Request to get all users");

    try {
        client = await connectToMongo();
        const db = client.db(dbName);
        const users = db.collection("users");

        try {
            const result = await users.find({}).toArray();
            res.status(201).send(result);
        } catch (error) {
            console.error("Error fetching user:", error);
            res.status(500).send({
                message : "Something went wrong fetching users"
            });
        }

        client.close();
    } catch (error) {
        console.error("Error connecting to database:", error);
        res.status(500).send({
            message : "Could not connect to database"
        });
    }
});

app.get("/users/:username", async (req, res) => {
    console.log("Request to get user: " + req.params.username);

    try {
        client = await connectToMongo();
        const db = client.db(dbName);
        const users = db.collection("users");

        try {
            const result = await users.findOne({username : req.params.username});

            if (!result) {
                console.log("User not found");

                res.status(404).send({
                    message : "User not found"
                })
            } else {
                console.log("User found:", result);
                res.status(201).send(result);
            }
        } catch (error) {
            console.error("Error fetching user:", error);
            res.status(500).send({
                message : "Something went wrong fetching user"
            });
        }

        client.close();
    } catch (error) {
        console.error("Error connecting to database:", error);
        res.status(500).send({
            message : "Could not connect to database"
        });
    }
});

// Route to crate a new user
app.post("/createuser", async (req, res) => {
    console.log("Request to create user");
    console.log("Request body: " + JSON.stringify(req.body));

    if (!req.body.username || !req.body.password || !req.body.email) {
        console.log("Not all information was provided");

        return res.status(400).send({
            error: "Must provide username, password, and email"
        });
    }
    
    try {
        const client = await connectToMongo();
        const db = client.db(dbName);
        const users = db.collection("users");

        try {
            let hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

            const result = await users.insertOne({
                username: req.body.username,
                password: hashedPassword,
                email: req.body.email
            });

            console.log(`Successfully added user with the _id: ${result.insertedId}`);
            console.log("Result object:", result);

            res.status(201).send({ 
                message: "User created successfully", 
                userId: result.insertedId 
            });
        } catch (error) {
            console.error("Error creating user:", error);

            // Checks for duplicate key error
            if (error.code === 11000) {
                if (error.errorResponse.keyPattern.username) {
                    res.status(400).send({message : "Username already in use"});
                }
                else if (error.errorResponse.keyPattern.email) {
                    res.status(400).send({message : "Email already in use"});
                }
            } else {
                res.status(500).send({ message: "Something went wrong, try again later" });
            }
        }

        client.close();
    } catch (error) {
        console.error("Error connecting to database:", error);
        res.status(500).send({
            message : "Something went wrong, try again later"
        });
    }
});

// login route
app.post("/login", async (req, res) => {
    try {
        let client = await connectToMongo();
        let db = client.db(dbName);
        let users = db.collection("users");
        
        if (!(req.body.username && req.body.password)) {
            client.close();
            return res.status(400).send({message : "Not all info provided"});
        }

        let user = await users.findOne({username : req.body.username});

        if (user && user.password && bcrypt.compareSync(req.body.password, user.password)) {
            let token = jwt.sign({username : user.username}, SECRET_KEY, {expiresIn : "1h"});
            res.status(200).send({message : "Login successful!", token});
        } else {
            res.status(401).send({message : "Unauthorized"});
        }

        client.close();
    } catch (error) {
        console.error("Error fetching from database:", error);
        res.status(500).send({message : "Server error"});
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
