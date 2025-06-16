const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Appointment = require('../models/Appointment');
const AppError = require('../utils/appError');

exports.createCheckoutSession = async (req, res, next) => {
  try {
    const { appointmentId } = req.body;
    console.log('🔥 Received appointmentId:', appointmentId);

    const appointment = await Appointment.findById(appointmentId).populate('doctor');
    console.log('🧠 Fetched appointment from DB:', appointment);

    if (!appointment) {
      return next(new AppError('Appointment not found', 404));
    }

    if (appointment.paymentStatus === 'paid') {
      return next(new AppError('This appointment is already paid', 400));
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url:  `http://localhost:5173/payment-success?appointmentId=${appointment._id}`,
      cancel_url: `http://localhost:5173/payment-cancelled`,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Appointment with Dr. ${appointment.doctor.name}`
            },
            unit_amount: appointment.doctor.fees * 100
          },
          quantity: 1
        }
      ],
      metadata: {
        appointmentId: appointment._id.toString()
      }
    });

    res.status(200).json({
      status: 'success',
      url: session.url
    });

  } catch (err) {
    console.error('💥 Error in createCheckoutSession:', err);
    next(err);
  }
};



exports.mockPaymentSuccess = async (req, res, next) => {
  try {
    const { appointmentId } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return next(new AppError('Appointment not found', 404));
    }

    appointment.paymentStatus = 'paid';
    await appointment.save();

    res.status(200).json({
      status: 'success',
      message: 'Mock payment recorded',
      data: { appointment }
    });

  } catch (err) {
    next(err);
  }
};
