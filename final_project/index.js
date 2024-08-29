// index.js
const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer", session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true
}));

// Authentication middleware
app.use("/customer/auth/*", function auth(req, res, next) {
    const token = req.headers['authorization']; // Get the token from the request headers

    if (!token) {
        return res.status(403).json({ message: "No token provided." });
    }

    jwt.verify(token.split(' ')[1], 'your_jwt_secret_key', (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Failed to authenticate token." });
        }

        req.user = decoded.username; // Store the username in the request object
        req.session.username = decoded.username; // Also store it in the session
        next(); // Proceed to the next middleware or route handler
    });
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running on port " + PORT));
