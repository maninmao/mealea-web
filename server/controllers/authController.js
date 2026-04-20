const authService = require('../services/authService');
const jwt = require('jsonwebtoken');

// handle the cookie
const generateTokenAndSetCookie = (res, userId) => {
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
};

exports.registerUser = async (req, res) => {
    try {
        // Pass data to the service
        const user = await authService.createUser(req.body);
        
        generateTokenAndSetCookie(res, user._id);
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        // 400 Bad Request
        res.status(400).json({ message: error.message });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Pass data to the service
        const user = await authService.authenticateUser(email, password);
        
        generateTokenAndSetCookie(res, user._id);
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        // 401 Unauthorized
        res.status(401).json({ message: error.message });
    }
};

exports.logoutUser = (req, res) => {
    res.cookie('jwt', '', { httpOnly: true, expires: new Date(0) });
    res.status(200).json({ message: 'Logged out successfully' });
};