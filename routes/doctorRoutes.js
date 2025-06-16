const express = require('express');
const doctorController = require('../controllers/doctorController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(doctorController.getAllDoctors)
 

router
  .route('/:id')
  .get(doctorController.getDoctor)
  .patch(doctorController.updateDoctor)
  

router
  .route('/:id/available-slots')
  .get(doctorController.getAvailableSlots);

module.exports = router;