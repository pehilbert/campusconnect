module.exports = {
    initialize : (app) => {
        /*
        Test endpoint, simply returns a message string
        */
        app.get("/api/test", (req, res) => {
            res.send("Welcome to Clockwork!");
        });
    }
}