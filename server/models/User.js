const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:    { type: String, required: true, trim: true, maxlength: 60 },
  email:   { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:{ type: String, required: true, minlength: 6, select: false },
  phone:   { type: String, default: '' },
  address: { type: String, default: '' },
  role:    { type: String, enum: ['customer', 'admin'], default: 'customer' },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
