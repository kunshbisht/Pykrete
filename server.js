const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const path = require('path');
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Create a MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',         // replace with your MySQL username
    password: '',         // replace with your MySQL password
    database: 'pykrete'
});

// Connect to MySQL
db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL database');
});

// Handle registration or login
app.post('/authenticate', async (req, res) => {
    const { username, password } = req.body;

    // Query to find the user by username
    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], async (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('An error occurred');
        }

        if (results.length === 0) {
            // Username does not exist, register the user
            const hashedPassword = await bcrypt.hash(password, 10);
            const insertQuery = 'INSERT INTO users (username, password) VALUES (?, ?)';
            db.query(insertQuery, [username, hashedPassword], (err, result) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('An error occurred during registration');
                }
                res.redirect('/dowload'); // Redirect to home page after registration
            });
        } else {
            // Username exists, check the password
            const user = results[0];
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                res.redirect('/download'); // Redirect to home page after successful login
            } else {
                res.status(401).send('Invalid username or password');
            }
        }
    });
});

// Serve the home page
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/home/index.html'));
});

// Serve the login/register page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/start-page/index.html'));
});

// Serve the login/register page
app.get('/download', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/download/index.html'));
});

app.get('/', (req, res) => {
    res.redirect('/home');
})

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
