const express = require('express');
const departmentController = require('../controllers/departmentController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(departmentController.getAllDepartments)


router
  .route('/:id')
  .get(departmentController.getDepartment)


module.exports = router;