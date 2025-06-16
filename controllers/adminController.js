const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Doctor = require('../models/Doctor');
const Department = require('../models/Department');
const AppError = require('../utils/appError');


const signToken = (id) => {
  return jwt.sign({ id, role: 'admin' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};


exports.registerAdmin = async (req, res, next) => {
  try {
    const { name, phone, email, password } = req.body;
    const admin = await Admin.create({ name, phone, email, password });

    const token = signToken(admin._id);

    res.status(201).json({
      status: 'success',
      token,
      data: { admin }
    });
  } catch (err) {
    next(err);
  }
};


exports.loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    const token = signToken(admin._id);

    res.status(200).json({
      status: 'success',
      token,
      data: { admin }
    });
  } catch (err) {
    next(err);
  }
};


exports.createDoctor = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      departmentId,
      startTime,
      endTime,
      sessionTime,
      availableDays,
      fees,
      experience,
      about,
      address
    } = req.body;

    const doctor = await Doctor.create({
      name,
      email,
      password,
      department: departmentId,
      startTime,
      endTime,
      sessionTime,
      availableDays,
      fees,
      experience,
      about,
      address
    });

    res.status(201).json({
      status: 'success',
      data: { doctor }
    });
  } catch (err) {
    next(err);
  }
};


exports.deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) {
      return next(new AppError('No doctor found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    next(err);
  }
};


exports.createDepartment = async (req, res, next) => {
  try {
    const { name } = req.body;

    const department = await Department.create({ name });

    res.status(201).json({
      status: 'success',
      data: { department }
    });
  } catch (err) {
    next(err);
  }
};


exports.deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) {
      return next(new AppError('Department not found', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    next(err);
  }
};

exports.updateDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!department) {
      return next(new AppError('No department found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        department
      }
    });
  } catch (err) {
    next(err);
  }
};
