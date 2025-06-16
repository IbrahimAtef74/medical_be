const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Department = require('../models/Department');
const Appointment = require('../models/Appointment');
const AppError = require('../utils/appError');
const { generateSlots } = require('../utils/slotGenerator');

exports.getAllDoctors = async (req, res, next) => {
  try {
    console.log(1);
    const doctors = await Doctor.find()
      .populate('ratings.user')
      .populate('department');

    res.status(200).json({
      status: 'success',
      results: doctors.length,
      data: {
        doctors
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('ratings.user')
      .populate('department');

    if (!doctor) {
      return next(new AppError('No doctor found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        doctor
      }
    });
  } catch (err) {
    next(err);
  }
};



exports.updateDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!doctor) {
      return next(new AppError('No doctor found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        doctor
      }
    });
  } catch (err) {
    next(err);
  }
};



exports.getAvailableSlots = async (req, res, next) => {
  try {
    const { date } = req.query;
    const doctor = await Doctor.findById(req.params.id);
    
    if (!doctor) {
      return next(new AppError('Doctor not found', 404));
    }


    const bookedAppointments = await Appointment.find({
      doctor: doctor._id,
      date,
      status: { $ne: 'cancelled' }
    });

    const bookedSlots = bookedAppointments.map(app => app.time);
    const allSlots = generateSlots(doctor.startTime, doctor.endTime, doctor.sessionTime);
    
    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

    res.status(200).json({
      status: 'success',
      data: {
        availableSlots
      }
    });
  } catch (err) {
    next(err);
  }
};