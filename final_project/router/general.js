const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const { username, password } = req.body;

    // 1️⃣ Check if username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // 2️⃣ Check if username already exists
    const userExists = users.some(user => user.username === username);
    if (userExists) {
        return res.status(409).json({ message: "Username already exists" });
    }

    // 3️⃣ Add the new user
    users.push({ username, password });
    
    return res.status(201).json({ message: `User ${username} successfully registered` });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
Promise.resolve(books)
    .then(bookList => {
      res.status(200).json(bookList);
    })
    .catch(err => {
      res.status(500).json({ message: "Unable to fetch books", error: err.message });
    });  

});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;

    if (books[isbn]) {
        return res.status(200).json(books[isbn]);
    } else {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
const authorQuery = req.params.author.toLowerCase();  // Make search case-insensitive
    const matchingBooks = {};

    // 1️⃣ Get all keys of the books object
    const bookKeys = Object.keys(books);  // Each key is an ISBN

    // 2️⃣ Iterate through the books and check the author
    bookKeys.forEach(isbn => {
        if (books[isbn].author.toLowerCase() === authorQuery) {
            matchingBooks[isbn] = books[isbn];  // Add to matching books
        }
    });

    // Return results
    if (Object.keys(matchingBooks).length > 0) {
        return res.status(200).json(matchingBooks);
    } else {
        return res.status(404).json({ message: `No books found by author: ${req.params.author}` });
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const titleQuery = req.params.title.toLowerCase();  // Make search case-insensitive
    const matchingBooks = {};

    // Get all keys (ISBNs) of the books object
    const bookKeys = Object.keys(books);

    // Iterate through all books and check if title matches
    bookKeys.forEach(isbn => {
        if (books[isbn].title.toLowerCase() === titleQuery) {
            matchingBooks[isbn] = books[isbn];
        }
    });

    // Return matching books or 404
    if (Object.keys(matchingBooks).length > 0) {
        return res.status(200).json(matchingBooks);
    } else {
        return res.status(404).json({ message: `No books found with title: ${req.params.title}` });
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;

    if (books[isbn]) {
        return res.status(200).json(books[isbn].reviews);
    } else {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }
});

module.exports.general = public_users;
