require('dotenv').config();
const express = require('express');
const path = require('path');
const connectDB = require('./config/dbConfig');
const app = express();
const port = process.env.PORT || 3000;

connectDB();

// Routes
const authRoute = require('./routes/authRoute');
const pagesRoute = require('./routes/pagesRoutes');

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './pages/index.html'));
});

app.use('/api/auth', authRoute);
app.use('/', pagesRoute);

// Start server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});