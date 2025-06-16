const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const AppError = require('../utils/appError');



exports.bookAppointment = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { doctorId, date, time } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return next(new AppError('Doctor not found', 404));
    }
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(time)) {
      return next(new AppError('Invalid time format. Please use HH:mm 24-hour format (e.g. 14:00)', 400));
    }


    const appointmentDateTime = new Date(`${date}T${time}`);
    if (appointmentDateTime <= new Date()) {
      return next(new AppError('Cannot book an appointment in the past', 400));
    }

    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      date,
      time,
      status: { $ne: 'cancelled' }
    });

    if (existingAppointment) {
      return next(new AppError('This time slot is already booked', 400));
    }

    const appointment = await Appointment.create({
      user: userId,
      doctor: doctorId,
      date,
      time,
      status: 'booked'
    });

    res.status(201).json({
      status: 'success',
      data: {
        appointment
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find()
      .populate('user')
      .populate('doctor');

    res.status(200).json({
      status: 'success',
      results: appointments.length,
      data: {
        appointments
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getAppointment = async (req, res, next) => {
  try {
    const appointmentId = req.params.id;

    console.log('Getting appointment with ID:', appointmentId);

    if (!appointmentId || appointmentId.length !== 24) {
      return next(new AppError('Invalid appointment ID format', 400));
    }

    const appointment = await Appointment.findById(appointmentId)
      .populate('user')
      .populate('doctor');

    if (!appointment) {
      console.log('Appointment not found for ID:', appointmentId);
      return next(new AppError('Appointment not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        appointment
      }
    });
  } catch (err) {
    console.error('Error getting appointment:', err.message);
    next(err);
  }
};
exports.getAppointmentsForCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;


    const appointments = await Appointment.find({ user: userId })
      .populate('doctor')
      .sort({ date: 1, time: 1 });

    res.status(200).json({
      status: 'success',
      results: appointments.length,
      data: {
        appointments
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getAppointmentsByDoctor = async (req, res, next) => {
  try {
    const doctorId = req.params.doctorId;

    console.log('Fetching appointments for doctor:', doctorId);

    const appointments = await Appointment.find({ doctor: doctorId })
      .populate('user')
      .sort({ date: 1, time: 1 });

    res.status(200).json({
      status: 'success',
      results: appointments.length,
      data: {
        appointments
      }
    });
  } catch (err) {
    next(err);
  }
};



exports.updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!appointment) {
      return next(new AppError('Appointment not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        appointment
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.rateAppointment = async (req, res, next) => {
  try {
    const { rating } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return next(new AppError('Appointment not found', 404));
    }

    
    if (appointment.rating) {
      return next(new AppError('You have already rated this appointment', 400));
    }

    
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
    if (appointmentDateTime > new Date()) {
      return next(new AppError('You can only rate after the appointment time has passed', 400));
    }

    appointment.rating = rating;
    await appointment.save();

    const ratedAppointments = await Appointment.find({
      doctor: appointment.doctor,
      rating: { $ne: null }
    });

    const totalRatings = ratedAppointments.reduce((sum, app) => sum + app.rating, 0);
    const avgRating = totalRatings / ratedAppointments.length;

    await Doctor.findByIdAndUpdate(appointment.doctor, {
      avgRating,
      totalReviews: ratedAppointments.length
    });

    res.status(200).json({
      status: 'success',
      data: {
        appointment
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return next(new AppError('Appointment not found', 404));
    }

    if (appointment.user.toString() !== req.user._id.toString()) {
      return next(new AppError('You are not authorized to cancel this appointment', 403));
    }

    await Appointment.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      message: 'Appointment cancelled successfully'
    });

  } catch (err) {
    next(err);
  }
};

