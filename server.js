const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');
const swaggerDocs = require('./config/swagger');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: [
            process.env.SWAGGER_URL || '*', // Allow Swagger UI
            process.env.FRONTEND_URL || '*', // Allow frontend
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    },
});

// Middleware
app.use(cors({
    origin: [
        process.env.SWAGGER_URL || '*', // Allow Swagger UI
        process.env.FRONTEND_URL || '*', // Allow frontend
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));
app.use(bodyParser.json());

// Handle CORS Preflight Requests
app.options('*', cors({
    origin: [
        process.env.SWAGGER_URL || '*',
        process.env.FRONTEND_URL || '*',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/booking', require('./routes/booking')(io));
app.use('/bus', require('./routes/bus'));
app.use('/payment', require('./routes/payment'));
app.use('/admin', require('./routes/admin'));
app.use('/operator', require('./routes/operator'));
app.use('/commuter', require('./routes/commuter'));

// Swagger Documentation
swaggerDocs(app);

// MongoDB Connection
mongoose
    .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch((err) => {
        console.error('Database connection failed:', err);
        process.exit(1); // Exit the process if the database connection fails
    });

// Handle Invalid Routes
app.use((req, res, next) => {
    res.status(404).json({ error: 'Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong' });
});

// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
