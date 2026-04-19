const User = require('../models/User');

// registering a user
exports.createUser = async (userData) => {
    const { name, email, password } = userData;
    
    // Validate Email Format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new Error('Please provide a valid email address');
    }

    // Validate Password Length
    if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
    }
    
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new Error('User already exists');
    }

    // Create and return the user
    return await User.create({ name, email, password });
};

// logging in
exports.authenticateUser = async (email, password) => {
    const user = await User.findOne({ email });
    
    if (user && (await user.matchPassword(password))) {
        return user;
    }
    
    throw new Error('Invalid email or password');
};