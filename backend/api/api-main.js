const test = require("./api-test");
const auth = require("./api-auth");
const users = require("./api-users");

module.exports = {
    /*
    Adds API routes to the given Express app
    */
    initialize : (app) => {
        test.initialize(app);
        auth.initialize(app);
        users.initialize(app);
    }
}