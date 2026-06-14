const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, maxlength: 300, default: '' },
  price:       { type: Number, required: true, min: 0 },
  image:       { type: String, default: '' },
  category:    { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  isAvailable: { type: Boolean, default: true },
  isPopular:   { type: Boolean, default: false },   // shown in "Popular" section
  isFeatured:  { type: Boolean, default: false },   // shown in hero banner
  prepTime:    { type: Number, default: 15 },       // prep time in minutes
  tags:        [{ type: String, trim: true }],      // e.g. ['spicy', 'vegan', 'bestseller']
  calories:    { type: Number, default: 0 },
}, { timestamps: true });

menuItemSchema.index({ category: 1, isAvailable: 1 });
menuItemSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('MenuItem', menuItemSchema);
