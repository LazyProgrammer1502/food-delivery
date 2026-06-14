const Order        = require('../models/Order');
const MenuItem     = require('../models/MenuItem');
const asyncHandler = require('../utils/asyncHandler');

const DELIVERY_FEE = 50;

// ── Customer routes ───────────────────────────────────────

// @route POST /api/orders — place a new order
const placeOrder = asyncHandler(async (req, res) => {
  const { items, deliveryAddress, phone, specialNote } = req.body;

  if (!items?.length)
    return res.status(400).json({ success: false, message: 'Order must have at least one item.' });
  if (!deliveryAddress?.street)
    return res.status(400).json({ success: false, message: 'Delivery address required.' });
  if (!phone)
    return res.status(400).json({ success: false, message: 'Phone number required.' });

  // Validate each item and calculate totals using live prices
  const orderItems = [];
  let totalPrice   = 0;

  for (const { menuItem: itemId, quantity } of items) {
    if (!quantity || quantity < 1) continue;
    const menuItem = await MenuItem.findById(itemId);
    if (!menuItem)
      return res.status(400).json({ success: false, message: `Item ${itemId} not found.` });
    if (!menuItem.isAvailable)
      return res.status(400).json({ success: false, message: `${menuItem.name} is not available.` });

    const subtotal = menuItem.price * quantity;
    totalPrice    += subtotal;

    orderItems.push({
      menuItem: menuItem._id,
      name:     menuItem.name,     // snapshot
      price:    menuItem.price,    // snapshot
      image:    menuItem.image,
      quantity,
      subtotal,
    });
  }

  const grandTotal = totalPrice + DELIVERY_FEE;

  const order = await Order.create({
    user:            req.user._id,
    items:           orderItems,
    totalPrice,
    deliveryFee:     DELIVERY_FEE,
    grandTotal,
    deliveryAddress,
    phone,
    specialNote:     specialNote?.trim() || '',
  });

  await order.populate('user', 'name email');
  res.status(201).json({ success: true, order });
});

// @route GET /api/orders/me — customer's own orders
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .select('-__v');
  res.json({ success: true, orders });
});

// @route GET /api/orders/:id — single order (customer can only see own)
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email phone');
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

  const isOwner = order.user._id.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin)
    return res.status(403).json({ success: false, message: 'Not authorized.' });

  res.json({ success: true, order });
});

// ── Admin routes ──────────────────────────────────────────

// @route GET /api/orders — all orders (admin)
const getAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = {};
  if (status) query.status = status;

  const pageNum  = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, parseInt(limit));

  const [orders, total] = await Promise.all([
    Order.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate('user', 'name phone'),
    Order.countDocuments(query),
  ]);

  res.json({ success: true, orders, total, totalPages: Math.ceil(total / limitNum), currentPage: pageNum });
});

// @route PUT /api/orders/:id/status — update order status (admin)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'confirmed', 'preparing', 'on_the_way', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status))
    return res.status(400).json({ success: false, message: 'Invalid status.' });

  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

  order.status = status;
  order.statusHistory.push({ status, timestamp: new Date() });
  await order.save();

  res.json({ success: true, order });
});

// @route DELETE /api/orders/:id — cancel order (customer — only if pending)
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

  const isOwner = order.user.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin')
    return res.status(403).json({ success: false, message: 'Not authorized.' });

  if (order.status !== 'pending' && req.user.role !== 'admin')
    return res.status(400).json({ success: false, message: 'Cannot cancel — order already confirmed.' });

  order.status = 'cancelled';
  order.statusHistory.push({ status: 'cancelled', timestamp: new Date() });
  await order.save();

  res.json({ success: true, message: 'Order cancelled.', order });
});

// @route GET /api/orders/stats — admin dashboard stats
const getStats = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalOrders,
    todayOrders,
    pendingOrders,
    activeOrders,
    revenueData,
    todayRevenueData,
    recentOrders,
  ] = await Promise.all([
    Order.countDocuments({ status: { $ne: 'cancelled' } }),
    Order.countDocuments({ createdAt: { $gte: today }, status: { $ne: 'cancelled' } }),
    Order.countDocuments({ status: 'pending' }),
    Order.countDocuments({ status: { $in: ['confirmed', 'preparing', 'on_the_way'] } }),
    Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } },
    ]),
    Order.aggregate([
      { $match: { status: 'delivered', createdAt: { $gte: today } } },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } },
    ]),
    Order.find({ status: { $ne: 'cancelled' } })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name'),
  ]);

  res.json({
    success: true,
    stats: {
      totalOrders,
      todayOrders,
      pendingOrders,
      activeOrders,
      totalRevenue:  revenueData[0]?.total      || 0,
      todayRevenue:  todayRevenueData[0]?.total  || 0,
    },
    recentOrders,
  });
});

module.exports = {
  placeOrder, getMyOrders, getOrder, cancelOrder,
  getAllOrders, updateOrderStatus, getStats,
};
