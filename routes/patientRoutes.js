const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');

// Main CRUD operations
router.post('/patients', patientController.createPatient);
router.get('/patients', patientController.getAllPatients);
router.get('/patients/:pid', patientController.getPatientById);
router.put('/patients/:pid', patientController.updatePatientById);
router.delete('/patients/:pid', patientController.deletePatientById);

// Search by specific fields
router.get('/patients/firstname/:name', patientController.getPatientsByFirstName);
router.get('/patients/lastname/:name', patientController.getPatientsByLastName);
router.get('/patients/email/:email', patientController.getPatientsByEmail);
router.get('/patients/city/:city', patientController.getPatientsByCity);
router.get('/patients/doctor/:doctorName', patientController.getPatientsByDoctor);
router.get('/patients/guardian/:guardianName', patientController.getPatientsByGuardian);

// Update by first name
router.put('/patients/firstname/:name', patientController.updatePatientsByFirstName);

// Additional utility routes
router.get('/search/patients', patientController.searchPatients);
router.get('/stats/patients', patientController.getPatientStats);

module.exports = router;
