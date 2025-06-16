const Doctor = require('../models/Doctor');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');


const signToken = (id) => {
  return jwt.sign({ id, role: 'doctor' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};


exports.loginDoctor = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password!', 400));
    }

    const doctor = await Doctor.findOne({ email }).select('+password');

    if (!doctor || !(await doctor.correctPassword(password, doctor.password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    const token = signToken(doctor._id);

    res.status(200).json({
      status: 'success',
      token,
      data: {
        doctor,
      },
    });
  } catch (err) {
    next(err);
  }
};


exports.protectDoctor = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in as a doctor!', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const currentDoctor = await Doctor.findById(decoded.id);
    if (!currentDoctor) {
      return next(new AppError('Doctor belonging to this token no longer exists.', 401));
    }

    req.doctor = currentDoctor;
    next();
  } catch (err) {
    next(err);
  }
};
