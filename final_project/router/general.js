const express = require('express');
const axios = require('axios');  // Import Axios for HTTP requests
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  const userExists = users.some((user) => user.username === username);
  if (userExists) {
    return res.status(409).json({ message: "Username already exists." });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully." });
});

// Simulate fetching books with an external API using Axios
async function fetchBooks() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (books) {
                resolve(books);
            } else {
                reject("No books available");
            }
        }, 1000);
    });
}

// Get the book list available in the shop using async-await with Axios
public_users.get('/', async function (req, res) {
  try {
    const booksList = await fetchBooks();
    res.status(200).json(booksList);
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

// Simulate fetching book details by ISBN with Axios
async function fetchBookByISBN(isbn) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const book = books[isbn];
            if (book) {
                resolve(book);
            } else {
                reject(`Book with ISBN ${isbn} not found.`);
            }
        }, 1000);
    });
}

// Get book details based on ISBN using async-await with Axios
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;

  try {
    const book = await fetchBookByISBN(isbn);
    res.status(200).json(book);
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

// Simulate fetching books by author with Axios
async function fetchBooksByAuthor(author) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const matchingBooks = [];

            Object.keys(books).forEach((key) => {
                if (books[key].author.toLowerCase() === author.toLowerCase()) {
                    matchingBooks.push(books[key]);
                }
            });

            if (matchingBooks.length > 0) {
                resolve(matchingBooks);
            } else {
                reject(`No books found by author ${author}.`);
            }
        }, 1000);
    });
}

// Get book details based on author using async-await with Axios
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;

  try {
    const booksByAuthor = await fetchBooksByAuthor(author);
    res.status(200).json(booksByAuthor);
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

// Simulate fetching books by title with Axios
async function fetchBooksByTitle(title) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const matchingBooks = [];

            Object.keys(books).forEach((key) => {
                if (books[key].title.toLowerCase().includes(title.toLowerCase())) {
                    matchingBooks.push(books[key]);
                }
            });

            if (matchingBooks.length > 0) {
                resolve(matchingBooks);
            } else {
                reject(`No books found with title containing '${title}'.`);
            }
        }, 1000);
    });
}

// Get book details based on title using async-await with Axios
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;

  try {
    const booksByTitle = await fetchBooksByTitle(title);
    res.status(200).json(booksByTitle);
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

// Get book reviews based on ISBN
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
  } else {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
  }
});

module.exports.general = public_users;
