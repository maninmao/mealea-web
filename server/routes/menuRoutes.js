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
const upload = require('../middleware/uploadMiddleware');

// Public routes (Customers browsing the site)
router.get('/', getMenus);
router.get('/:id', getMenuById);

// Protected Admin routes (Staff managing the dashboard)
router.post('/', protect, admin, upload.single('image'), createMenu);
router.put('/:id', protect, admin, upload.single('image'), updateMenu);
router.delete('/:id', protect, admin, deleteMenu);

module.exports = router;