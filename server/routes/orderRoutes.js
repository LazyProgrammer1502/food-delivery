const express = require('express');
const r = express.Router();
const {
  placeOrder, getMyOrders, getOrder, cancelOrder,
  getAllOrders, updateOrderStatus, getStats,
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

// Customer
r.post('/',             protect, placeOrder);
r.get('/me',            protect, getMyOrders);
r.get('/:id',           protect, getOrder);
r.put('/:id/cancel',    protect, cancelOrder);

// Admin
r.get('/',              protect, adminOnly, getAllOrders);
r.put('/:id/status',    protect, adminOnly, updateOrderStatus);
r.get('/admin/stats',   protect, adminOnly, getStats);

module.exports = r;
