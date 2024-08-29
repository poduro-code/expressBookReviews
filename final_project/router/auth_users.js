const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = []; // Array to store registered users

// Helper function to check if a username is valid
const isValid = (username) => {
    return users.some((user) => user.username === username);
};

// Helper function to check if the provided username and password match a registered user
const authenticatedUser = (username, password) => {
    return users.some((user) => user.username === username && user.password === password);
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid username or password." });
    }

    const accessToken = jwt.sign({ username }, 'your_jwt_secret_key', { expiresIn: '1h' });
    req.session.token = accessToken;
    req.session.username = username;

    return res.status(200).json({ message: "Login successful", token: accessToken });
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.session.username;

    if (!books[isbn]) {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
    }

    if (!review) {
        return res.status(400).json({ message: "Review content is required." });
    }

    books[isbn].reviews[username] = review;

    return res.status(200).json({ message: "Review added/modified successfully.", reviews: books[isbn].reviews });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.user; // Use req.user instead of req.session.username

    // Check if the book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
    }

    // Check if the review exists for this user
    if (!books[isbn].reviews[username]) {
        return res.status(404).json({ message: `No review found for user ${username} on book with ISBN ${isbn}.` });
    }

    // Delete the review
    delete books[isbn].reviews[username];

    return res.status(200).json({ message: "Review deleted successfully.", reviews: books[isbn].reviews });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
