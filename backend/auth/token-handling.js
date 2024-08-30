const {SECRET_KEY} = require("./vars");

module.exports = {
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