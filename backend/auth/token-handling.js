const {SECRET_KEY} = require("./vars");
const jwt = require("jsonwebtoken");

module.exports = {
    /*
    Function that can be called before a request is executed,
    and either allows the next action to be executed or returns with a 403
    status code, meaning the token was invalid or expired
    */
    verifyToken : (req, res, next) => {
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
}