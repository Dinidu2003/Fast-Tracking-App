const express = require('express');
const path = require('path');

console.log('Starting demo server...');
console.log('Express loaded successfully');

// Create demo server for testing without MongoDB
const app = express();
const PORT = process.env.PORT || 3001;

console.log(`Port configured: ${PORT}`);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock patient data for demonstration
let mockPatients = [
  {
    _id: "demo1",
    PID: "P001",
    FirstName: "Harry",
    LastName: "Silva",
    Email: "harry.silva@gmail.com",
    NearCity: "Kandy",
    Doctor: "Dr. James Cameron",
    Guardian: "John Silva",
    MedicalConditions: ["Hypertension", "Stage 2"],
    Medications: ["Losartan", "Furosemide"],
    Allergies: ["Penicillin"],
    Status: "Alive",
    LastVisitDate: "2025-05-10T00:00:00.000Z",
    createdAt: "2025-06-01T00:00:00.000Z",
    updatedAt: "2025-06-01T00:00:00.000Z"
  },
  {
    _id: "demo2",
    PID: "P002",
    FirstName: "Emma",
    LastName: "Watson",
    Email: "emma.watson@email.com",
    NearCity: "Colombo",
    Doctor: "Dr. Sarah Johnson",
    Guardian: "Michael Watson",
    MedicalConditions: ["Diabetes Type 2"],
    Medications: ["Metformin", "Insulin"],
    Allergies: ["Aspirin"],
    Status: "Stable",
    LastVisitDate: "2025-06-08T00:00:00.000Z",
    createdAt: "2025-06-02T00:00:00.000Z",
    updatedAt: "2025-06-02T00:00:00.000Z"
  },
  {
    _id: "demo3",
    PID: "P003",
    FirstName: "Maria",
    LastName: "Garcia",
    Email: "maria.garcia@email.com",
    NearCity: "Kandy",
    Doctor: "Dr. Robert Brown",
    Guardian: "Carlos Garcia",
    MedicalConditions: ["Heart Disease"],
    Medications: ["Atorvastatin", "Lisinopril"],
    Allergies: ["Iodine"],
    Status: "Critical",
    LastVisitDate: "2025-06-09T00:00:00.000Z",
    createdAt: "2025-06-03T00:00:00.000Z",
    updatedAt: "2025-06-03T00:00:00.000Z"
  },
  {
    _id: "demo4",
    PID: "P004",
    FirstName: "David",
    LastName: "Johnson",
    Email: "david.johnson@email.com",
    NearCity: "Negombo",
    Doctor: "Dr. Sarah Johnson",
    Guardian: "Linda Johnson",
    MedicalConditions: ["Depression", "Anxiety"],
    Medications: ["Sertraline", "Lorazepam"],
    Allergies: ["Latex"],
    Status: "Recovering",
    LastVisitDate: "2025-06-07T00:00:00.000Z",
    createdAt: "2025-06-04T00:00:00.000Z",
    updatedAt: "2025-06-04T00:00:00.000Z"
  },
  {
    _id: "demo5",
    PID: "P005",
    FirstName: "Sarah",
    LastName: "Wilson",
    Email: "sarah.wilson@email.com",
    NearCity: "Colombo",
    Doctor: "Dr. Michael Davis",
    Guardian: "Thomas Wilson",
    MedicalConditions: ["Migraine"],
    Medications: ["Sumatriptan", "Propranolol"],
    Allergies: ["Codeine"],
    Status: "Stable",
    LastVisitDate: "2025-06-06T00:00:00.000Z",
    createdAt: "2025-06-05T00:00:00.000Z",
    updatedAt: "2025-06-05T00:00:00.000Z"
  }
];

// Helper function to generate new PID
function generateNextPID() {
  const lastPID = mockPatients.reduce((max, patient) => {
    const num = parseInt(patient.PID.substring(1));
    return num > max ? num : max;
  }, 0);
  return `P${String(lastPID + 1).padStart(3, '0')}`;
}

// Mock API Routes

// GET /api/patients - Get all patients
app.get('/api/patients', (req, res) => {
  const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;
  
  const sortedPatients = [...mockPatients].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    const comparison = aVal > bVal ? 1 : -1;
    return order === 'desc' ? -comparison : comparison;
  });
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedPatients = sortedPatients.slice(startIndex, endIndex);
  
  res.json({
    success: true,
    message: 'Patients retrieved successfully',
    data: {
      patients: paginatedPatients,
      totalPages: Math.ceil(mockPatients.length / limit),
      currentPage: parseInt(page),
      total: mockPatients.length
    }
  });
});

// GET /api/patients/:pid - Get patient by ID
app.get('/api/patients/:pid', (req, res) => {
  const patient = mockPatients.find(p => p.PID === req.params.pid);
  if (!patient) {
    return res.status(404).json({
      success: false,
      error: 'Patient not found'
    });
  }
  res.json({
    success: true,
    message: 'Patient retrieved successfully',
    data: patient
  });
});

// POST /api/patients - Add new patient
app.post('/api/patients', (req, res) => {
  const newPatient = {
    _id: `demo${Date.now()}`,
    PID: req.body.PID || generateNextPID(),
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  mockPatients.push(newPatient);
  
  res.status(201).json({
    success: true,
    message: 'Patient created successfully',
    data: newPatient
  });
});

// PUT /api/patients/:pid - Update patient
app.put('/api/patients/:pid', (req, res) => {
  const patientIndex = mockPatients.findIndex(p => p.PID === req.params.pid);
  if (patientIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Patient not found'
    });
  }
  
  mockPatients[patientIndex] = {
    ...mockPatients[patientIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  res.json({
    success: true,
    message: 'Patient updated successfully',
    data: mockPatients[patientIndex]
  });
});

// DELETE /api/patients/:pid - Delete patient
app.delete('/api/patients/:pid', (req, res) => {
  const patientIndex = mockPatients.findIndex(p => p.PID === req.params.pid);
  if (patientIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Patient not found'
    });
  }
  
  const deletedPatient = mockPatients.splice(patientIndex, 1)[0];
  
  res.json({
    success: true,
    message: 'Patient deleted successfully',
    data: deletedPatient
  });
});

// Search endpoints
app.get('/api/patients/firstname/:name', (req, res) => {
  const patients = mockPatients.filter(p => 
    p.FirstName.toLowerCase().includes(req.params.name.toLowerCase())
  );
  res.json({
    success: true,
    message: `Found ${patients.length} patients`,
    data: patients
  });
});

app.get('/api/patients/lastname/:name', (req, res) => {
  const patients = mockPatients.filter(p => 
    p.LastName.toLowerCase().includes(req.params.name.toLowerCase())
  );
  res.json({
    success: true,
    message: `Found ${patients.length} patients`,
    data: patients
  });
});

app.get('/api/patients/email/:email', (req, res) => {
  const patients = mockPatients.filter(p => 
    p.Email.toLowerCase().includes(req.params.email.toLowerCase())
  );
  res.json({
    success: true,
    message: `Found ${patients.length} patients`,
    data: patients
  });
});

app.get('/api/patients/city/:city', (req, res) => {
  const patients = mockPatients.filter(p => 
    p.NearCity.toLowerCase().includes(req.params.city.toLowerCase())
  );
  res.json({
    success: true,
    message: `Found ${patients.length} patients`,
    data: patients
  });
});

app.get('/api/patients/doctor/:doctorName', (req, res) => {
  const patients = mockPatients.filter(p => 
    p.Doctor.toLowerCase().includes(req.params.doctorName.toLowerCase())
  );
  res.json({
    success: true,
    message: `Found ${patients.length} patients`,
    data: patients
  });
});

app.get('/api/patients/guardian/:guardianName', (req, res) => {
  const patients = mockPatients.filter(p => 
    p.Guardian.toLowerCase().includes(req.params.guardianName.toLowerCase())
  );
  res.json({
    success: true,
    message: `Found ${patients.length} patients`,
    data: patients
  });
});

// Advanced search
app.get('/api/search/patients', (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({
      success: false,
      error: 'Search query is required'
    });
  }
  
  const searchTerm = query.toLowerCase();
  const patients = mockPatients.filter(p => 
    p.FirstName.toLowerCase().includes(searchTerm) ||
    p.LastName.toLowerCase().includes(searchTerm) ||
    p.Email.toLowerCase().includes(searchTerm) ||
    p.NearCity.toLowerCase().includes(searchTerm) ||
    p.Doctor.toLowerCase().includes(searchTerm) ||
    p.Guardian.toLowerCase().includes(searchTerm) ||
    p.PID.toLowerCase().includes(searchTerm)
  );
  
  res.json({
    success: true,
    message: `Found ${patients.length} patients`,
    data: patients
  });
});

// Statistics
app.get('/api/stats/patients', (req, res) => {
  const total = mockPatients.length;
  
  const statusStats = mockPatients.reduce((acc, patient) => {
    acc[patient.Status] = (acc[patient.Status] || 0) + 1;
    return acc;
  }, {});
  
  const cityStats = mockPatients.reduce((acc, patient) => {
    acc[patient.NearCity] = (acc[patient.NearCity] || 0) + 1;
    return acc;
  }, {});
  
  const doctorStats = mockPatients.reduce((acc, patient) => {
    acc[patient.Doctor] = (acc[patient.Doctor] || 0) + 1;
    return acc;
  }, {});
  
  res.json({
    success: true,
    message: 'Statistics retrieved successfully',
    data: {
      total,
      statusDistribution: Object.entries(statusStats).map(([status, count]) => ({
        _id: status,
        count
      })),
      topCities: Object.entries(cityStats)
        .map(([city, count]) => ({ _id: city, count }))
        .sort((a, b) => b.count - a.count),
      topDoctors: Object.entries(doctorStats)
        .map(([doctor, count]) => ({ _id: doctor, count }))
        .sort((a, b) => b.count - a.count)
    }
  });
});

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`🏥 Patient Record Management System (DEMO MODE)`);
  console.log(`🚀 Demo server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`🌐 Frontend accessible at http://localhost:${PORT}`);
  console.log(`⚠️  NOTE: This is running in DEMO MODE with mock data (no MongoDB required)`);
  console.log(`⏰ Started at: ${new Date().toLocaleString()}`);
});

console.log('Demo server setup complete, attempting to start...');
