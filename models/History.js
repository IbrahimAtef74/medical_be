const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  data: { type: [String], required: true }, 
  response: { type: Object }, 
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('History', historySchema);
