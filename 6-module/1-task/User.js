const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [{
      validator: function(v) {
        return /^[-.\w]+@([\w-]+\.)+[\w-]{2,12}$/.test(v);
      },
      message: '{VALUE} is not a valid phone number!'
    }],
    lowercase: true,
    trim: true,
  },
  displayName: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
}, {timestamps: true});

module.exports = mongoose.model('User', schema);
