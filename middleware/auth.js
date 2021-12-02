const jwt  = require('jsonwebtoken');


const authenticateJWT = (req, res, next) => {
    let payload;
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        try {
            payload = jwt.verify(token, 'tokenCript');
        } catch (e) {
            return res.status(400).send('Invalid User');
        }
        decoded = jwt.decode(token, {complete: true});
        req.id = decoded.payload.id;
        next()
    } else {
        res.sendStatus(401);
    }
};


module.exports = authenticateJWT;
