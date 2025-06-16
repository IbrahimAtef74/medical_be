const Department = require('../models/Department');
const AppError = require('../utils/appError');

exports.getAllDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find();
    
    res.status(200).json({
      status: 'success',
      results: departments.length,
      data: {
        departments
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    
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

