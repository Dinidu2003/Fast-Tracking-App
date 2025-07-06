const Patient = require('../models/Patient');

// Helper function to handle errors
const handleError = (res, error, statusCode = 500) => {
  console.error('Error:', error);
  res.status(statusCode).json({ 
    success: false, 
    error: error.message || 'An error occurred' 
  });
};

// Helper function to handle success responses
const handleSuccess = (res, data, message = 'Operation successful', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

// POST /patients - Add a new patient
exports.createPatient = async (req, res) => {
  try {
    // Generate next PID if not provided
    if (!req.body.PID) {
      req.body.PID = await Patient.generateNextPID();
    }

    const patient = new Patient(req.body);
    const savedPatient = await patient.save();
    handleSuccess(res, savedPatient, 'Patient created successfully', 201);
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyValue)[0];
      handleError(res, new Error(`${field} already exists`), 400);
    } else if (error.name === 'ValidationError') {
      handleError(res, error, 400);
    } else {
      handleError(res, error);
    }
  }
};

// GET /patients - List all patients
exports.getAllPatients = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: order === 'desc' ? -1 : 1 }
    };

    const patients = await Patient.find()
      .sort(options.sort)
      .limit(options.limit * 1)
      .skip((options.page - 1) * options.limit);

    const total = await Patient.countDocuments();
    
    handleSuccess(res, {
      patients,
      totalPages: Math.ceil(total / options.limit),
      currentPage: options.page,
      total
    }, 'Patients retrieved successfully');
  } catch (error) {
    handleError(res, error);
  }
};

// GET /patients/:pid - Get patient by ID
exports.getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findOne({ PID: req.params.pid });
    
    if (!patient) {
      return handleError(res, new Error('Patient not found'), 404);
    }
    
    handleSuccess(res, patient, 'Patient retrieved successfully');
  } catch (error) {
    handleError(res, error);
  }
};

// GET /patients/firstname/:name - Get patients by first name
exports.getPatientsByFirstName = async (req, res) => {
  try {
    const patients = await Patient.find({ 
      FirstName: { $regex: req.params.name, $options: 'i' } 
    });
    
    handleSuccess(res, patients, `Found ${patients.length} patients with first name matching '${req.params.name}'`);
  } catch (error) {
    handleError(res, error);
  }
};

// GET /patients/lastname/:name - Get patients by last name
exports.getPatientsByLastName = async (req, res) => {
  try {
    const patients = await Patient.find({ 
      LastName: { $regex: req.params.name, $options: 'i' } 
    });
    
    handleSuccess(res, patients, `Found ${patients.length} patients with last name matching '${req.params.name}'`);
  } catch (error) {
    handleError(res, error);
  }
};

// GET /patients/email/:email - Get patients by email
exports.getPatientsByEmail = async (req, res) => {
  try {
    const patients = await Patient.find({ 
      Email: { $regex: req.params.email, $options: 'i' } 
    });
    
    handleSuccess(res, patients, `Found ${patients.length} patients with email matching '${req.params.email}'`);
  } catch (error) {
    handleError(res, error);
  }
};

// GET /patients/city/:city - Get patients by nearest city
exports.getPatientsByCity = async (req, res) => {
  try {
    const patients = await Patient.find({ 
      NearCity: { $regex: req.params.city, $options: 'i' } 
    });
    
    handleSuccess(res, patients, `Found ${patients.length} patients from city '${req.params.city}'`);
  } catch (error) {
    handleError(res, error);
  }
};

// GET /patients/doctor/:doctorName - Get patients by assigned doctor
exports.getPatientsByDoctor = async (req, res) => {
  try {
    const patients = await Patient.find({ 
      Doctor: { $regex: req.params.doctorName, $options: 'i' } 
    });
    
    handleSuccess(res, patients, `Found ${patients.length} patients assigned to '${req.params.doctorName}'`);
  } catch (error) {
    handleError(res, error);
  }
};

// GET /patients/guardian/:guardianName - Get patients by guardian name
exports.getPatientsByGuardian = async (req, res) => {
  try {
    const patients = await Patient.find({ 
      Guardian: { $regex: req.params.guardianName, $options: 'i' } 
    });
    
    handleSuccess(res, patients, `Found ${patients.length} patients with guardian '${req.params.guardianName}'`);
  } catch (error) {
    handleError(res, error);
  }
};

// PUT /patients/:pid - Update patient by ID
exports.updatePatientById = async (req, res) => {
  try {
    const patient = await Patient.findOneAndUpdate(
      { PID: req.params.pid },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!patient) {
      return handleError(res, new Error('Patient not found'), 404);
    }
    
    handleSuccess(res, patient, 'Patient updated successfully');
  } catch (error) {
    if (error.name === 'ValidationError') {
      handleError(res, error, 400);
    } else {
      handleError(res, error);
    }
  }
};

// PUT /patients/firstname/:name - Update patients by first name
exports.updatePatientsByFirstName = async (req, res) => {
  try {
    const result = await Patient.updateMany(
      { FirstName: { $regex: req.params.name, $options: 'i' } },
      req.body,
      { runValidators: true }
    );
    
    if (result.matchedCount === 0) {
      return handleError(res, new Error('No patients found with that first name'), 404);
    }
    
    handleSuccess(res, { 
      matchedCount: result.matchedCount, 
      modifiedCount: result.modifiedCount 
    }, `Updated ${result.modifiedCount} patients`);
  } catch (error) {
    if (error.name === 'ValidationError') {
      handleError(res, error, 400);
    } else {
      handleError(res, error);
    }
  }
};

// DELETE /patients/:pid - Delete patient by ID
exports.deletePatientById = async (req, res) => {
  try {
    const patient = await Patient.findOneAndDelete({ PID: req.params.pid });
    
    if (!patient) {
      return handleError(res, new Error('Patient not found'), 404);
    }
    
    handleSuccess(res, patient, 'Patient deleted successfully');
  } catch (error) {
    handleError(res, error);
  }
};

// Additional utility endpoints

// GET /patients/search - Advanced search
exports.searchPatients = async (req, res) => {
  try {
    const { query, field = 'all' } = req.query;
    
    if (!query) {
      return handleError(res, new Error('Search query is required'), 400);
    }
    
    let searchFilter = {};
    
    if (field === 'all') {
      searchFilter = {
        $or: [
          { FirstName: { $regex: query, $options: 'i' } },
          { LastName: { $regex: query, $options: 'i' } },
          { Email: { $regex: query, $options: 'i' } },
          { NearCity: { $regex: query, $options: 'i' } },
          { Doctor: { $regex: query, $options: 'i' } },
          { Guardian: { $regex: query, $options: 'i' } },
          { PID: { $regex: query, $options: 'i' } }
        ]
      };
    } else {
      searchFilter[field] = { $regex: query, $options: 'i' };
    }
    
    const patients = await Patient.find(searchFilter);
    handleSuccess(res, patients, `Found ${patients.length} patients matching '${query}'`);
  } catch (error) {
    handleError(res, error);
  }
};

// GET /patients/stats - Get statistics
exports.getPatientStats = async (req, res) => {
  try {
    const total = await Patient.countDocuments();
    const statusStats = await Patient.aggregate([
      { $group: { _id: '$Status', count: { $sum: 1 } } }
    ]);
    const cityStats = await Patient.aggregate([
      { $group: { _id: '$NearCity', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    const doctorStats = await Patient.aggregate([
      { $group: { _id: '$Doctor', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    handleSuccess(res, {
      total,
      statusDistribution: statusStats,
      topCities: cityStats,
      topDoctors: doctorStats
    }, 'Statistics retrieved successfully');
  } catch (error) {
    handleError(res, error);
  }
};
