const express = require('express');
const appointmentController = require('../controllers/appointmentController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(appointmentController.getAllAppointments)
  .post(authController.protect,appointmentController.bookAppointment);

router
  .route('/my')
  .get(authController.protect, appointmentController.getAppointmentsForCurrentUser);



router
  .route('/:id')
  .get(appointmentController.getAppointment);

router
  .route('/doctor/:doctorId')
  .get(appointmentController.getAppointmentsByDoctor);

router
  .route('/:id/status')
  .patch(appointmentController.updateAppointmentStatus);

router
  .route('/:id/rate')
  .patch(authController.protect, appointmentController.rateAppointment);
  
router
  .route('/:id/cancel')
  .delete(authController.protect, appointmentController.cancelAppointment);


module.exports = router;