require('dotenv').config();
const express = require('express');
const path = require('path');
const ejs = require('ejs');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/dbConfig');
const app = express();
const port = process.env.PORT || 3000;

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());
app.set('view engine', 'ejs');

// Routes
const authRoute = require('./routes/authRoute');
const pagesRoute = require('./routes/pagesRoutes');
const eventRoute = require('./routes/eventRoutes');
const paymentRoute = require('./routes/paymentRoutes');
const ticketRoute = require('./routes/ticketRoutes');
const checkAuth = require('./middlewares/checkAuth');

app.get('/', checkAuth, (req, res) => {
    res.render(path.join(__dirname, './pages/index'), { user: req.user });
});

app.use('/api/auth', authRoute);
app.use('/', pagesRoute);
app.use('/api/events', eventRoute);
app.use('/api/payment', paymentRoute);
app.use('/api/ticket', ticketRoute);

// Start server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});