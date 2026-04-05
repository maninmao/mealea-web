const menuService = require("../services/menuService");

exports.getMenu = async (req, res) => {
  try {
    const menu = await menuService.getAllMenu();
    res.json(menu);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addMenu = async (req, res) => {
  try {
    const item = await menuService.createMenuItem(req.body);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};