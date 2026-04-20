const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reservationRoutes = require('./routes/reservationRoutes');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json()); // JSON payloads
app.use(cookieParser()); // cookies for JWT
app.use(cors({
    origin: process.env.CLIENT_URL, // Allow requests from our react frontend
    credentials: true // for cookie
}));


// Authentication Routes
app.use('/api/auth', authRoutes);

// Menu Routes
app.use('/api/menu', menuRoutes);

// Cart Routes
app.use('/api/cart', cartRoutes);

// Order Routes
app.use('/api/orders', orderRoutes);

// Reservation Routes
app.use('/api/reservations', reservationRoutes);



app.get('/', (req, res) => {
    res.send('Mealea API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});