const express = require('express');
const adminController = require('../controllers/adminController');

const router = express.Router();


router.post('/register', adminController.registerAdmin);
router.post('/login', adminController.loginAdmin);


router.post('/doctors', adminController.createDoctor);
router.delete('/doctors/:id', adminController.deleteDoctor);


router.post('/departments', adminController.createDepartment);
router.delete('/departments/:id', adminController.deleteDepartment);
router.patch('/departments/:id', adminController.updateDepartment);

module.exports = router;
