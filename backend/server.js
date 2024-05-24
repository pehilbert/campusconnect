const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
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

// Token verification middleware
function verifyToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).send({message : "Access token required"});
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).send({
                message : "Invalid or expired token"
            });
        }

        req.user = decoded;
        next();
    });
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

/*
Users CRUD operations
*/

// Routes to fetch all users or specific user
app.get("/users", async (req, res) => {
    console.log("Request to get all users");

    try {
        client = await connectToMongo();
        const db = client.db(dbName);
        const users = db.collection("users");

        try {
            const result = await users.find({}).toArray();
            res.status(200).send(result);
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

app.get("/users/:id", async (req, res) => {
    console.log("Request to get user: " + req.params.id);

    try {
        client = await connectToMongo();
        const db = client.db(dbName);
        const users = db.collection("users");

        try {
            const result = await users.findOne({_id : new ObjectId(req.params.id)});

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

// Creates a new user with username, password, and email
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

// Updates a user with the id given by the token associated with the request
app.post("/updateuser", verifyToken, async (req, res) => {
    try {
        let client = await connectToMongo();
        let db = client.db(dbName);
        let users = db.collection("users");

        if (!req.body.newValues) {
            client.close();
            return res.status(400).send({
                message : "Must provide values to update"
            });
        }

        let result = await users.updateOne({_id : new ObjectId(req.user.id)}, {$set : req.body.newValues});
        console.log("Sucessfully updated user, result object:", result);

        if (result.modifiedCount === 1 || result.matchedCount === 1) {
            res.status(201).send({ 
                message: "User profile updated successfully", 
            });
        } else {
            res.status(404).send({
                message : "User not found"
            })
        }

        client.close();
    } catch (error) {
        console.error("Error connecting to database:", error);
        res.status(500).send({
            message : "Something went wrong, try again later"
        });
    }
});

// Deletes a user's account, can only be done with authentication
app.post("/deleteuser", verifyToken, async (req, res) => {
    try {
        let client = await connectToMongo();
        let db = client.db(dbName);
        let users = db.collection("users");

        let result = await users.deleteOne({_id : new ObjectId(req.user.id)});
        console.log("Sucessfully deleted user, result object:", result);

        if (result.deletedCount === 1) {
            res.status(201).send({
                message : "User deleted successfully"
            })
        } else {
            res.status(404).send({
                message : "User not found"
            })
        }

        client.close();
    } catch (error) {
        console.error("Error with database:", error);
        res.status(500).send({
            message : "Something went wrong, try again later"
        });
    }
});

/*
    Courses CRUD operations
*/

// Gets a specific course by its id
app.get("/courses/:id", async (req, res) => {
    let client;

    try {
        client = await connectToMongo();
        let db = client.db(dbName);
        let courses = db.collection("courses");

        const result = await courses.findOne({_id : new ObjectId(req.params.id)});

        if (result) {
            res.status(200).send(JSON.stringify(result));
        } else {
            res.status(404).send({
                message : "Course not found"
            });
        }
    } catch (error) {
        console.error("Error with database:", error);
        res.status(500).send({
            message : "Something went wrong, try again later"
        });
    } finally {
        if (client) {
            client.close();
        }
    }
});

// Gets all the courses for the requesting user, requires authentication
app.get("/mycourses", verifyToken, async (req, res) => {
    let client;

    try {
        let client = await connectToMongo();
        let db = client.db(dbName);
        let courses = db.collection("courses");

        let result = await courses.find({user_id : new ObjectId(req.user.id)}).toArray();

        res.status(200).send(result);
    } catch (error) {
        console.error("Error with database:", error);
        res.status(500).send({
            message : "Something went wrong, try again later"
        });
    } finally {
        if (client) {
            client.close();
        }
    }
});

// Creates a course for the requesting user
app.post("/addcourse", verifyToken, async (req, res) => {
    let client;
    
    console.log("Body received:", req.body);

    try {
        let client = await connectToMongo();
        let db = client.db(dbName);
        let courses = db.collection("courses");

        let result = await courses.insertOne({
            user_id : new ObjectId(req.user.id),
            courseCode : req.body.courseCode,
            courseName : req.body.courseName,
            instructors : req.body.instructors,
            meetings : req.body.meetings
        });

        if (result.insertedId) {
            res.status(201).send({
                courseId : result.insertedId
            });
        } else {
            res.status(500).send({
                message : "Failed to add course"
            });
        }
    } catch (error) {
        console.error("Error with database:", error);
        res.status(500).send({
            message : "Something went wrong, try again later"
        });
    } finally {
        if (client) {
            client.close();
        }
    }
});

// Updates an existing course
app.post("/editcourse/:id", verifyToken, async (req, res) => {
    let client;

    try {
        let client = await connectToMongo();
        let db = client.db(dbName);
        let courses = db.collection("courses");

        if (!req.body.newValues) {
            client.close();
            return res.status(400).send({
                message : "Must provide values to update"
            });
        }

        let result = await courses.updateOne({_id : new ObjectId(req.params.id)}, {$set : req.body.newValues});
        console.log("Sucessfully updated course, result object:", result);

        if (result.modifiedCount === 1 || result.matchedCount === 1) {
            res.status(201).send({ 
                message: "Course edited successfully", 
            });
        } else {
            res.status(404).send({
                message : "Course not found"
            })
        }
    } catch (error) {
        console.error("Error with database:", error);
        res.status(500).send({
            message : "Something went wrong, try again later"
        });
    } finally {
        if (client) {
            client.close();
        }
    }
});

// Deletes a course
app.post("/dropcourse/:id", verifyToken, async (req, res) => {
    let client;

    try {
        client = await connectToMongo();
        let db = client.db(dbName);
        let courses = db.collection("courses");

        let result = await courses.deleteOne({_id : new ObjectId(req.params.id)});
        console.log("Sucessfully deleted course, result object:", result);

        if (result.deletedCount === 1) {
            res.status(201).send({
                message : "Course dropped successfully"
            })
        } else {
            res.status(404).send({
                message : "Course not found"
            })
        }
    } catch (error) {
        console.error("Error with database:", error);
        res.status(500).send({
            message : "Something went wrong, try again later"
        });
    } finally {
        if (client) {
            client.close();
        }
    }
});

/*
Assignments CRUD operations
*/

// Adds an assignment to a certain course
app.post("/addassignment", verifyToken, async (req, res) => {
    let client;
    console.log("Body received:", req.body);
    try {
        client = await connectToMongo();
        db = client.db(dbName);
        courses = db.collection("courses");
        assignments = db.collection("assignments");

        let course = await courses.findOne({_id : new ObjectId(req.body.course_id)});

        if (!course) {
            res.status(404).send({
                message : "Course for new assignment not found"
            });
        } else {
            let result = await assignments.insertOne({
                course_id : new ObjectId(req.body.course_id),
                name : req.body.name,
                description : req.body.description,
                deadline : req.body.deadline || null,
                priority : req.body.priority,
                status : req.body.status
            });
    
            if (result.insertedId) {
                res.status(201).send({
                    assignmentId : result.insertedId
                });
                console.log("Added assignment!");
            } else {
                res.status(500).send({
                    message : "Failed to add assignment"
                });
                console.log("Something went wrong :(");
            }
        }
    } catch (error) {
        console.error("Something went wrong with the database:", error);
        res.status(500).send({
            message : "Something went wrong, try again later"
        });
    } finally {
        if (client) {
            client.close();
        }
    }
});

// Gets all assignments for a requesting user, grouped by course
// (course ID's mapped to arrays of assignments)
app.get("/myassignments", verifyToken, async (req, res) => {
    let client;

    try {
        client = await connectToMongo();
        let db = client.db(dbName);
        let courseCollection = db.collection("courses");
        let assignmentCollection = db.collection("assignments");

        // get all courses for the user
        let courses = await courseCollection.find({user_id : new ObjectId(req.user.id)}).toArray();
        let result = {};

        // get all assignments for each course
        for (let i = 0; i < courses.length; i++) {
            let assignments = await assignmentCollection.find({course_id : new ObjectId(courses[i]._id)}).toArray();
            // add the array of assignments to the resulting object with its corresponding course
            result[courses[i]._id] = assignments;
        }

        res.status(200).send(result);
    } catch (error) {
        console.error("Something went wrong with the database:", error);
        res.status(500).send({
            message : "Something went wrong, try again later"
        });
    } finally {
        if (client) {
            client.close();
        }
    }
});

// Gets all assignments for a certain course
app.get("/courseassignments/:course_id", async (req, res) => {
    let client;

    try {
        client = await connectToMongo();
        let db = client.db(dbName);
        let courses = db.collection("courses");
        let assignments = db.collection("assignments");

        // make sure the course exists
        let course = await courses.findOne({_id : new ObjectId(req.params.course_id)});

        if (!course) {
            res.status(404).send({
                message : "Course not found"
            });
        } else {
            let result = await assignments.find({course_id : new ObjectId(req.params.course_id)}).toArray();
            res.status(200).send(result);
        }
    } catch (error) {
        console.error("Something went wrong with the database:", error);
        res.status(500).send({
            message : "Something went wrong, try again later"
        });
    } finally {
        if (client) {
            client.close();
        }
    }
});

// Updates a certain assignment by ID
app.post("/updateassignment/:assignment_id", verifyToken, async (req, res) => {
    let client;
    console.log("Body received:", req.body);

    try {
        let client = await connectToMongo();
        let db = client.db(dbName);
        let assignments = db.collection("assignments");

        if (!req.body.newValues) {
            client.close();
            return res.status(400).send({
                message : "Must provide values to update"
            });
        }

        if (req.body.newValues.course_id) {
            req.body.newValues.course_id = new ObjectId(req.body.newValues.course_id);
        }

        let result = await assignments.updateOne({_id : new ObjectId(req.params.assignment_id)}, {$set : req.body.newValues});
        console.log("Sucessfully updated assignment, result object:", result);

        if (result.modifiedCount === 1 || result.matchedCount === 1) {
            res.status(201).send({ 
                message: "Course edited successfully", 
            });
        } else {
            res.status(404).send({
                message : "Course not found"
            })
        }
    } catch (error) {
        console.error("Error with database:", error);
        res.status(500).send({
            message : "Something went wrong, try again later"
        });
    } finally {
        if (client) {
            client.close();
        }
    }
});

// Deletes an assignment by ID
app.post("/deleteassignment/:assignment_id", verifyToken, async (req, res) => {
    let client;

    try {
        client = await connectToMongo();
        let db = client.db(dbName);
        let assignments = db.collection("assignments");

        let result = await assignments.deleteOne({_id : new ObjectId(req.params.assignment_id)});
        console.log("Sucessfully deleted assignment, result object:", result);

        if (result.deletedCount === 1) {
            res.status(201).send({
                message : "Assignment deleted successfully"
            })
        } else {
            res.status(404).send({
                message : "Assignment not found"
            })
        }
    } catch (error) {
        console.error("Error with database:", error);
        res.status(500).send({
            message : "Something went wrong, try again later"
        });
    } finally {
        if (client) {
            client.close();
        }
    }
});

/*
Authentication routes
*/
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
            let token = jwt.sign({id : user._id}, SECRET_KEY, {expiresIn : "1h"});
            res.status(200).send({message : "Login successful!", token, id : user._id});
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
