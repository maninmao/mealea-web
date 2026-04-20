const Menu = require('../models/Menu');

// Get all available dishes
exports.getAllMenus = async () => {
    return await Menu.find({});
};

// Get a single dish by ID
exports.getMenuById = async (id) => {
    const menu = await Menu.findById(id);
    if (!menu) throw new Error('Menu item not found');
    return menu;
};

// Create a new dish
exports.createMenu = async (menuData) => {
    return await Menu.create(menuData);
};

// Update an existing dish
exports.updateMenu = async (id, updateData) => {
    const menu = await Menu.findByIdAndUpdate(id, updateData, { 
        new: true, // Returns the updated document
        runValidators: true // Enforces model rules (like positive price)
    });
    if (!menu) throw new Error('Menu item not found');
    return menu;
};

// Delete a dish
exports.deleteMenu = async (id) => {
    const menu = await Menu.findByIdAndDelete(id);
    if (!menu) throw new Error('Menu item not found');
    return menu;
};