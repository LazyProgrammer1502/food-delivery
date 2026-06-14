const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name:  { type: String, required: true, trim: true, unique: true, maxlength: 50 },
  icon:  { type: String, default: '🍽️' }, // emoji icon for UI
  order: { type: Number, default: 0 },    // display order
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
