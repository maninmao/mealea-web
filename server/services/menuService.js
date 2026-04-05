const Menu = require("../models/menu");

exports.getAllMenu = async () => {
  return await Menu.find();
};

exports.createMenuItem = async (data) => {
  return await Menu.create(data);
};

exports.deleteMenuItem = async (id) => {
  return await Menu.findByIdAndDelete(id);
};