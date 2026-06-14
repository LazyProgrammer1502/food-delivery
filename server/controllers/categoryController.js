const Category     = require('../models/Category');
const asyncHandler = require('../utils/asyncHandler');

// @route GET /api/categories
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ order: 1, name: 1 });
  res.json({ success: true, categories });
});

// @route POST /api/categories (admin)
const createCategory = asyncHandler(async (req, res) => {
  const { name, icon, order } = req.body;
  if (!name?.trim()) return res.status(400).json({ success: false, message: 'Name required.' });
  const category = await Category.create({ name: name.trim(), icon, order });
  res.status(201).json({ success: true, category });
});

// @route PUT /api/categories/:id (admin)
const updateCategory = asyncHandler(async (req, res) => {
  const { name, icon, order } = req.body;
  const updates = {};
  if (name  !== undefined) updates.name  = name.trim();
  if (icon  !== undefined) updates.icon  = icon;
  if (order !== undefined) updates.order = order;
  const category = await Category.findByIdAndUpdate(req.params.id, updates, { new: true });
  if (!category) return res.status(404).json({ success: false, message: 'Not found.' });
  res.json({ success: true, category });
});

// @route DELETE /api/categories/:id (admin)
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ success: false, message: 'Not found.' });
  await category.deleteOne();
  res.json({ success: true, message: 'Category deleted.' });
});

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
