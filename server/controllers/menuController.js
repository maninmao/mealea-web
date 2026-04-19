const menuService = require('../services/menuService');

exports.getMenus = async (req, res) => {
    try {
        const menus = await menuService.getAllMenus();
        res.status(200).json(menus);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMenuById = async (req, res) => {
    try {
        const menu = await menuService.getMenuById(req.params.id);
        res.status(200).json(menu);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

exports.createMenu = async (req, res) => {
    try {
        const newMenu = await menuService.createMenu(req.body);
        res.status(201).json(newMenu);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateMenu = async (req, res) => {
    try {
        const updatedMenu = await menuService.updateMenu(req.params.id, req.body);
        res.status(200).json(updatedMenu);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteMenu = async (req, res) => {
    try {
        await menuService.deleteMenu(req.params.id);
        res.status(200).json({ message: 'Menu item deleted successfully' });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};