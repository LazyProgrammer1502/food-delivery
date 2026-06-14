const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItem:  { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  name:      { type: String, required: true },   // snapshot at order time
  price:     { type: Number, required: true },   // snapshot at order time
  image:     { type: String, default: '' },
  quantity:  { type: Number, required: true, min: 1 },
  subtotal:  { type: Number, required: true },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderNumber:    { type: String, unique: true },   // e.g. ORD-20240601-001
  items:          [orderItemSchema],
  totalPrice:     { type: Number, required: true },
  deliveryFee:    { type: Number, default: 50 },    // fixed delivery fee
  grandTotal:     { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'on_the_way', 'delivered', 'cancelled'],
    default: 'pending',
  },
  deliveryAddress: {
    street:  { type: String, required: true },
    city:    { type: String, default: '' },
  },
  phone:         { type: String, required: true },
  specialNote:   { type: String, maxlength: 300, default: '' },
  // Track when each status was set
  statusHistory: [{
    status:    String,
    timestamp: { type: Date, default: Date.now },
  }],
  estimatedDelivery: { type: Number, default: 30 }, // in minutes
}, { timestamps: true });

// Auto-generate order number before save
orderSchema.pre('save', async function (next) {
  if (this.isNew) {
    const today  = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count  = await this.constructor.countDocuments();
    this.orderNumber = `ORD-${today}-${String(count + 1).padStart(3, '0')}`;
    this.statusHistory = [{ status: 'pending', timestamp: new Date() }];
  }
  next();
});

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
