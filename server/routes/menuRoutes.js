const express = require('express');
const r = express.Router();
const {
  getMenu, getAdminMenu, getMenuItem,
  createMenuItem, updateMenuItem, deleteMenuItem, toggleAvailability,
} = require('../controllers/menuController');
const { protect, adminOnly } = require('../middleware/auth');
const { uploadMenuImage } = require('../config/cloudinary');

// Public
r.get('/',          getMenu);
r.get('/admin',     protect, adminOnly, getAdminMenu);
r.get('/:id',       getMenuItem);

// Admin
r.post('/',         protect, adminOnly, uploadMenuImage.single('image'), createMenuItem);
r.put('/:id',       protect, adminOnly, uploadMenuImage.single('image'), updateMenuItem);
r.delete('/:id',    protect, adminOnly, deleteMenuItem);
r.put('/:id/toggle',protect, adminOnly, toggleAvailability);

module.exports = r;
