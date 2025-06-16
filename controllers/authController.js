const User = require('../models/User');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, dateOfBirth, gender } = req.body;

    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email already exists', 400));
    }

    
    const newUser = await User.create({
      name,
      email,
      password,
      phone,
      dateOfBirth,
      gender
    });

    
    const token = signToken(newUser._id);

    
    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: newUser
      }
    });
  } catch (err) {
    next(err);
  }
};


exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    
    if (!email || !password) {
      return next(new AppError('Please provide email and password!', 400));
    }

    
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    
    const token = signToken(user._id);

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.protect = async (req, res, next) => {
  
  try {
    let token;
    
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
       token = req.headers.authorization.replace('Bearer', '').trim();
    }
    console.log('AUTH HEADER:', req.headers.authorization);
console.log('TOKEN:', token);


    if (!token) {
      return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }


    const decoded = jwt.verify(token, process.env.JWT_SECRET);


    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError('The user belonging to this token does no longer exist.', 401));
    }


 req.user = {
  _id: currentUser._id.toString(),
  email: currentUser.email,
  name: currentUser.name
};

    next();
  } catch (err) {
    next(err);
  }
};