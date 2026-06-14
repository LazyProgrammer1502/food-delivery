const MenuItem     = require('../models/MenuItem');
const asyncHandler = require('../utils/asyncHandler');

// @route GET /api/menu — public, with optional filters
const getMenu = asyncHandler(async (req, res) => {
  const { category, search, popular, featured } = req.query;
  const query = { isAvailable: true };

  if (category) query.category = category;
  if (popular  === 'true') query.isPopular  = true;
  if (featured === 'true') query.isFeatured = true;
  if (search)  query.$text = { $search: search.trim() };

  const items = await MenuItem.find(query)
    .sort(search ? { score: { $meta: 'textScore' } } : { isPopular: -1, createdAt: -1 })
    .populate('category', 'name icon');

  res.json({ success: true, items, count: items.length });
});

// @route GET /api/menu/admin — admin sees all items including unavailable
const getAdminMenu = asyncHandler(async (req, res) => {
  const items = await MenuItem.find()
    .sort({ createdAt: -1 })
    .populate('category', 'name icon');
  res.json({ success: true, items, count: items.length });
});

// @route GET /api/menu/:id — public
const getMenuItem = asyncHandler(async (req, res) => {
  const item = await MenuItem.findById(req.params.id).populate('category', 'name icon');
  if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });
  res.json({ success: true, item });
});

// @route POST /api/menu — admin
const createMenuItem = asyncHandler(async (req, res) => {
  const { name, description, price, category, isPopular, isFeatured, prepTime, tags, calories } = req.body;
  if (!name?.trim()) return res.status(400).json({ success: false, message: 'Name required.' });
  if (!price)        return res.status(400).json({ success: false, message: 'Price required.' });
  if (!category)     return res.status(400).json({ success: false, message: 'Category required.' });

  const item = await MenuItem.create({
    name:        name.trim(),
    description: description?.trim() || '',
    price:       Number(price),
    category,
    image:       req.file?.path || '',
    isPopular:   isPopular === 'true',
    isFeatured:  isFeatured === 'true',
    prepTime:    Number(prepTime) || 15,
    tags:        tags ? JSON.parse(tags) : [],
    calories:    Number(calories) || 0,
  });

  await item.populate('category', 'name icon');
  res.status(201).json({ success: true, item });
});

// @route PUT /api/menu/:id — admin
const updateMenuItem = asyncHandler(async (req, res) => {
  const { name, description, price, category, isPopular, isFeatured,
          prepTime, tags, calories, isAvailable } = req.body;

  const updates = {};
  if (name        !== undefined) updates.name        = name.trim();
  if (description !== undefined) updates.description = description.trim();
  if (price       !== undefined) updates.price       = Number(price);
  if (category    !== undefined) updates.category    = category;
  if (isPopular   !== undefined) updates.isPopular   = isPopular === 'true' || isPopular === true;
  if (isFeatured  !== undefined) updates.isFeatured  = isFeatured === 'true' || isFeatured === true;
  if (isAvailable !== undefined) updates.isAvailable = isAvailable === 'true' || isAvailable === true;
  if (prepTime    !== undefined) updates.prepTime    = Number(prepTime);
  if (calories    !== undefined) updates.calories    = Number(calories);
  if (tags        !== undefined) updates.tags        = typeof tags === 'string' ? JSON.parse(tags) : tags;
  if (req.file)                  updates.image       = req.file.path;

  const item = await MenuItem.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
    .populate('category', 'name icon');
  if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });
  res.json({ success: true, item });
});

// @route DELETE /api/menu/:id — admin
const deleteMenuItem = asyncHandler(async (req, res) => {
  const item = await MenuItem.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });
  await item.deleteOne();
  res.json({ success: true, message: 'Item deleted.' });
});

// @route PUT /api/menu/:id/toggle — admin, toggle availability
const toggleAvailability = asyncHandler(async (req, res) => {
  const item = await MenuItem.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });
  item.isAvailable = !item.isAvailable;
  await item.save();
  res.json({ success: true, isAvailable: item.isAvailable, item });
});

module.exports = {
  getMenu, getAdminMenu, getMenuItem,
  createMenuItem, updateMenuItem, deleteMenuItem, toggleAvailability,
};
