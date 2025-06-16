const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
   password: {
    type: String,
    required: [true, 'Doctor must have a password'],
    minlength: 8,
    select: false
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  startTime: {
    type: String,
    required: true,
    match: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/ 
  },
  endTime: {
    type: String,
    required: true,
    match: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
  },
  sessionTime: {
    type: Number,
    required: true,
    min: 15,
    max: 120
  },
  availableDays: {
    type: [String],
    required: true,
    enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  },
  fees: {
    type: Number,
    required: true,
    min: 0
  },
  experience: {
    type: String, 
    required: true
  },
  about: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  
ratings: [{
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  value: { type: Number, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now }
}],
avgRating: { 
  type: Number, 
  default: 0,
  min: 0,
  max: 5
},
totalReviews: { 
  type: Number, 
  default: 0 
},
  createdAt: {
    type: Date,
    default: Date.now
  }
});


doctorSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

doctorSchema.methods.correctPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Doctor', doctorSchema);