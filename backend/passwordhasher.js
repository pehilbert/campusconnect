const url = "mongodb://localhost:27017";
const bcrypt = require('bcrypt');
const { MongoClient, Double } = require("mongodb");

async function connectToMongo() {
    try {
        let client = await MongoClient.connect(url);
        return client;
    } catch (error) {
        throw error;
    }
}

async function hashPasswords() {
    try {
        let client = await connectToMongo();
        let db = client.db("clockwork");
        let users = db.collection("users");
        
        try {
            let userDocs = await users.find({}).toArray();

            for (let i = 0; i < userDocs.length; i++) {
                let user = userDocs[i];

                if (user.username && user.password) {
                    let hashedPassword = await bcrypt.hash(user.password, 10);
                    console.log(user.password, "->", hashedPassword);

                    await users.updateOne({username : user.username}, {$set : {password : hashedPassword}}, {});
                }
            }

            return true;

        } catch (error) {
            console.error("Error updating passwords:", error);
            throw new Error(error);
        } finally {
            client.close();
        }
    }
    catch (error) {
        console.error("Error connecting to database:", error);
        throw new Error(error);
    }
}

hashPasswords();