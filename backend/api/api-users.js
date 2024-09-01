const dbUtil = require("../database/database-util");
const {verifyToken} = require("../auth/token-handling");
const bcrypt = require("bcrypt");

const {ObjectId} = require("mongodb");
const {SALT_ROUNDS} = require("../vars");

module.exports = {
    initialize : (app) => {
        /*
        Endpoint: POST /api/users/create
        Description: Creates a new user in the database and responds with
        the new user's ID if successful
        Authentication: None

        Expected request body: {
            username (required), 
            password (required),
            email (required),
            other values are optional
        }
        Status codes and responses:
        201 - Success 
            {message, new_id}
        400 - Username or email already exists or not all values provided
            {message}
        500 - Server Error
            {message}
        */
        app.post("/api/users/create", async (req, res) => {
            if (req.body.username === null || 
                req.body.password === null || 
                req.body.email === null) {
                    console.log("Not all values provided in body: " + req.body);
                    return res.status(400).send({
                        message : "Missing required value(s)"
                    });
                }
            
            try {
                let hashedPassword = await bcrypt.hash(req.body.password, SALT_ROUNDS);
                req.body.password = hashedPassword;

                let result = await dbUtil.createDocument("users", req.body);
                console.log("User successfully created with ID " + result);

                return res.status(201).send({
                    message : "User successfully created!",
                    new_id : result
                });
            } catch (error) {
                console.error(error);

                if (error.code === 11000) {
                    // Handle duplicate key error
                    if (error.keyPattern && error.keyPattern.username) {
                        return res.status(400).send({
                            message : "Username already in use"
                        });
                    } else if (error.keyPattern && error.keyPattern.email) {
                        return res.status(400).send({
                            message : "Email already in use"
                        });
                    } else {
                        return res.status(500).send({
                            message : "Server Error"
                        });
                    }
                } else {
                    return res.status(500).send({
                        message : "Server Error"
                    });
                }
            }
        });

        /*
        Endpoint: GET /api/users/myinfo
        Description: Retrieves all the info except for the password for the
        requesting user, identified by the token
        Authentication: Valid JWT in request header

        Expected request body: none
        Status codes and responses:
        200 - OK
            {message, userInfo}
        403 - Invalid or expired token
            {message}
        404 - Not Found
            {message}
        500 - Server Error
            {message}
        */
        app.get("/api/users/myinfo", verifyToken, async (req, res) => {
            try {
                let result = await dbUtil.getDocument("users", {_id : new ObjectId(req.user.id)}, {password : false});

                if (result) {
                    console.log("Successfully retrieved user info for " + result.username);
                    return res.status(200).send({
                        message : "User found",
                        userInfo : result
                    });
                } else {
                    console.log("User not found, ID: " + req.user.id);
                    return res.status(404).send({
                        message : "User not found"
                    });
                }
            } catch (error) {
                console.error(error);

                return res.status(500).send({
                    message : "Server Error"
                });
            }
        });

        /*
        Endpoint: GET /api/users/profile/:id
        Description: Retrieves non-sensitive info about a user given by 
        ID in parameters
        Info retrieved is username, first name, last name, and school
        Authentication: None

        Expected request body: none
        Status codes and responses:
        200 - OK
            {message, userInfo}
        404 - Not Found
            {message}
        500 - Server Error
            {message}
        */
        app.get("/api/users/profile/:id", async (req, res) => {
            try {
                let result = await dbUtil.getDocument("users", {_id : new ObjectId(req.params.id)}, 
                {
                    username : true,
                    firstName : true,
                    lastName : true,
                    school : true
                });

                if (result) {
                    console.log("Successfully retrieved user info for " + result.username);
                    return res.status(200).send({
                        message : "User found",
                        userInfo : result
                    });
                } else {
                    console.log("User not found, ID: " + req.params.id);
                    return res.status(404).send({
                        message : "User not found"
                    });
                }
            } catch (error) {
                console.error(error);

                return res.status(500).send({
                    message : "Server Error"
                });
            }
        });

        /*
        Endpoint: POST /api/users/updateme
        Description: Updates the requesting user, identified by the token,
        with the new desired values given in the request body
        Authentication: Valid JWT token in request headers

        Expected request body: {newValues}
        Status codes and responses:
        200 - OK
            {message}
        400 - Username or email already exists
            {message}
        403 - Invalid or expired token
            {message}
        404 - Not Found
            {message}
        500 - Server Error
            {message}
        */
        app.post("/api/users/updateme", verifyToken, async (req, res) => {
            try {
                let result = await dbUtil.updateDocument("users", {_id : new ObjectId(req.user.id)}, {$set : req.body.newValues});

                if (result.matchedCount === 0) {
                    console.log("User not found, ID: " + req.user.id);
                    return res.status(404).send({
                        message : "User not found"
                    });
                }

                console.log("User successfully updated, result object:\n" + result);
                return res.status(200).send({
                    message : "User successfully updated"
                });
            } catch (error) {
                console.error(error);
                
                if (error.code === 11000) {
                    // Handle duplicate key error
                    if (error.keyPattern && error.keyPattern.username) {
                        return res.status(400).send({
                            message : "Username already in use"
                        });
                    } else if (error.keyPattern && error.keyPattern.email) {
                        return res.status(400).send({
                            message : "Email already in use"
                        });
                    } else {
                        return res.status(500).send({
                            message : "Server Error"
                        });
                    }
                } else {
                    return res.status(500).send({
                        message : "Server Error"
                    });
                }
            }
        });

        /*
        Endpoint: POST /api/users/deleteme
        Description: Deletes the requesting user, identified by the token
        Authentication: Valid JWT token in request headers

        Expected request body: new values
        Status codes and responses:
        200 - OK
            {message}
        403 - Invalid or expired token
            {message}
        404 - Not Found
            {message}
        500 - Server Error
            {message}
        */
        app.post("/api/users/deleteme", verifyToken, async (req, res) => {
            try {
                let result = await dbUtil.deleteDocument("users", {_id : new ObjectId(req.user.id)});

                if (result.deletedCount === 0) {
                    console.log("User not found, ID: " + req.user.id);
                    return res.status(404).send({
                        message : "User not found"
                    });
                }

                console.log("User successfully deleted, result object:\n" + result);
                return res.status(200).send({
                    message : "User successfully deleted"
                });
            } catch (error) {
                console.error(error);
                return res.status(500).send({
                    message : "Server Error"
                });
            }
        });
    }
}