const express = require('express');
const router = express.Router();
const { 
    getMenus, 
    getMenuById, 
    createMenu, 
    updateMenu, 
    deleteMenu 
} = require('../controllers/menuController');

const { protect, admin } = require('../middleware/authMiddleware');

// Public routes (Customers browsing the site)
router.get('/', getMenus);
router.get('/:id', getMenuById);

// Protected Admin routes (Staff managing the dashboard)
router.post('/', protect, admin, createMenu);
router.put('/:id', protect, admin, updateMenu);
router.delete('/:id', protect, admin, deleteMenu);

module.exports = router;