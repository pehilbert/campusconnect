const dbUtil = require("../database/database-util");
const {verifyToken} = require("../auth/token-handling");
const bcrypt = require("bcrypt");
const Mailjet = require("node-mailjet");

const {ObjectId} = require("mongodb");
const {SALT_ROUNDS, MJ_PUBLIC_APIKEY, MJ_SECRET_KEY} = require("../vars");

function generateVerificationCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    const length = 6;

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code += characters[randomIndex];
    }

    return code;
}

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
        400 - Username or email already exists or not all values provided, or invalid email
            {message}
        500 - Server Error
            {message}
        */
        app.post("/api/users/create", async (req, res) => {
            if (!req.body.username || 
                !req.body.password || 
                !req.body.email) {
                    console.log("Not all values provided in body: " + req.body);
                    return res.status(400).send({
                        message : "Missing required value(s)"
                    });
                }
            
            try {
                // Make sure they used a valid email to sign up
                let searchEmail = req.body.email.split("@")[1];
                let schoolForEmail = await dbUtil.getDocument("schools", {emailSuffix : searchEmail});

                if (!schoolForEmail) {
                    return res.status(400).send({
                        message : "Email must be a .edu email address for a supported school"
                    });
                }

                let hashedPassword = await bcrypt.hash(req.body.password, SALT_ROUNDS);
                let verificationCode = generateVerificationCode();

                let result = await dbUtil.createDocument("users", {
                    username : req.body.username,
                    password : hashedPassword,
                    email : req.body.email,
                    school : schoolForEmail._id,
                    verified : false,
                    verificationCode : verificationCode
                });
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
        Endpoint: POST /api/users/verifyme
        Description: Attempts to verify the user identified by the token
        by matching the given verification code
        Authentication: Valid JWT token in request headers

        Expected request body: verification code to try
        Status codes and responses:
        200 - OK
            {message}
        400 - User already verified or incorrect code or code not provided
            {message}
        403 - Invalid or expired token
            {message}
        404 - Not Found
            {message}
        500 - Server Error
            {message}
        */
        app.post("/api/users/verifyme", verifyToken, async (req, res) => {
            if (!req.body.code) {
                console.log("Verification code not provided");
                return res.status(400).send({
                    message : "Verification code not provided"
                });
            }

            try {
                let userInfo = await dbUtil.getDocument("users", {_id : new ObjectId(req.user.id)}, {username : 1, verified : 1, verificationCode : 1});

                if (!userInfo) {
                    console.log("User not found, ID: " + req.user.id);
                    return res.status(404).send({
                        message : "User not found"
                    });
                }

                if (userInfo.verified === true) {
                    console.log("User " + userInfo.username + " already verified");
                    return res.status(400).send({
                        message : "Already verified"
                    });
                }

                if (userInfo.verificationCode && userInfo.verificationCode === req.body.code) {
                    await dbUtil.updateDocument("users", {_id : new ObjectId(req.user.id)}, {$set : {verified : true, verificationCode : null}});
                    console.log("User " + userInfo.username + " successfully verified");

                    return res.status(200).send({
                        message : "Email verification successful"
                    });
                } else {
                    return res.status(400).send({
                        message : "Verification code is incorrect"
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
        Endpoint: POST /api/users/sendverification
        Description: User is identified by provided token. If they are not yet
        verified, an email is sent to them with their verification code
        via Mailjet
        Authentication: Valid JWT token in request headers

        Responses:
        200 - OK
            {message}
        400 - User already verified
            {message}
        404 - User not found
            {message}
        500 - Server Error
            {message}
        */
        app.post("/api/users/sendverification", verifyToken, async (req, res) => {
            try {
                const mailjet = new Mailjet({
                    apiKey: MJ_PUBLIC_APIKEY,
                    apiSecret: MJ_SECRET_KEY
                });

                let userInfo = await dbUtil.getDocument("users", {_id : new ObjectId(req.user.id)}, {username : true, email : true, verified : true, verificationCode : true});

                if (!userInfo) {
                    console.log("User not found, ID: " + req.user.id);
                    return res.status(404).send({
                        message : "User not found"
                    });
                }

                if (userInfo.verified === true) {
                    console.log("User " + userInfo.username + " already verified");
                    return res.status(400).send({
                        message : "Already verified"
                    });
                }

                await mailjet
                    .post('send', { version: 'v3.1' })
                    .request({
                        Messages: [
                            {
                            From: {
                                Email: "pehilbert03@gmail.com",
                                Name: "CampusConnect"
                            },
                            To: [
                                {
                                Email: userInfo.email,
                                Name: userInfo.username
                                }
                            ],
                            Subject: "Your CampusConnect Verification Code",
                            HTMLPart: `
                            <p>Hi ${userInfo.username}, your verification code is <b>${userInfo.verificationCode}</b></p>
                            <p>Enter this code on the app to gain access to all features!</p>
                            `
                            }
                        ]
                    });

                console.log("Verification email sent to " + userInfo.email);
                return res.status(200).send({
                    message : "Verification email sent!"
                });
            } catch (error) {
                console.error(error);

                return res.status(500).send({
                    message : "Server Error"
                });
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
    },

    testMailjet : () => {
        const mailjet = new Mailjet({
            apiKey: MJ_PUBLIC_APIKEY,
            apiSecret: MJ_SECRET_KEY
        });

        console.log("\nConnected to Mailjet!");

        const request = mailjet
            .post('send', { version: 'v3.1' })
            .request({
            Messages: [
                {
                    From: {
                        Email: "pehilbert03@gmail.com",
                        Name: "CampusConnect Test"
                    },
                    To: [
                        {
                        Email: "pehilbert03@gmail.com",
                        Name: "Test User"
                        }
                    ],
                    Subject: "This is a test",
                    HTMLPart: "<h1>Congrats!</h1><h2>Your Mailjet was successfully set up!</h1>"
                }
            ]
            })

        request
            .then((result) => {
                console.log(result.body)
            })
            .catch((err) => {
                console.log(err.statusCode)
            })
    }
}