const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['administrator', 'moderator', 'zwykly'],
    default: 'zwykly'
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;