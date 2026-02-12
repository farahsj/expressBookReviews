const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    // returns boolean: check if username is valid (not already taken)
    return !users.some(user => user.username === username);
}

const authenticatedUser = (username, password) => {
    // returns boolean: check if username and password match
    return users.some(user => user.username === username && user.password === password);
}

// only registered users can login
console.log("Current users:", users);
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    const user = users.find(user => user.username === username && user.password === password);
    if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
    }

    const accessToken = jwt.sign(
        { username: username },
        "fingerprint_customer",
        { expiresIn: "1h" }
    );

    req.session.authorization = { accessToken };

    return res.status(200).json({ message: `User ${username} successfully logged in`, accessToken });
});

// Add/update a review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.user.username; // ✅ from middleware

    if (!books[isbn]) {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }

    books[isbn].reviews[username] = review;

    return res.status(200).json({
        message: `Review for ISBN ${isbn} has been added/updated`,
        reviews: books[isbn].reviews
    });
});

// Delete a review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.user.username; // ✅ from middleware

    if (!books[isbn]) {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }

    if (!books[isbn].reviews[username]) {
        return res.status(404).json({ message: `No review found for user ${username} on ISBN ${isbn}` });
    }

    delete books[isbn].reviews[username];

    return res.status(200).json({
        message: `Review by ${username} for ISBN ${isbn} has been deleted`,
        reviews: books[isbn].reviews
    });

});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;