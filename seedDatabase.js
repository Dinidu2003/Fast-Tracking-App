const mongoose = require('mongoose');
const Patient = require('./models/Patient');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/patient_records';

// Sample patient data for demonstration
const samplePatients = [
  {
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
    LastVisitDate: "2025-05-10"
  },
  {
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
    LastVisitDate: "2025-06-08"
  },
  {
    PID: "P003",
    FirstName: "John",
    LastName: "Smith",
    Email: "john.smith@hospital.lk",
    NearCity: "Galle",
    Doctor: "Dr. James Cameron",
    Guardian: "Mary Smith",
    MedicalConditions: ["Asthma", "Mild"],
    Medications: ["Albuterol", "Fluticasone"],
    Allergies: [],
    Status: "Alive",
    LastVisitDate: "2025-06-05"
  },
  {
    PID: "P004",
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
    LastVisitDate: "2025-06-09"
  },
  {
    PID: "P005",
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
    LastVisitDate: "2025-06-07"
  },
  {
    PID: "P006",
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
    LastVisitDate: "2025-06-06"
  },
  {
    PID: "P007",
    FirstName: "Michael",
    LastName: "Brown",
    Email: "michael.brown@email.com",
    NearCity: "Matara",
    Doctor: "Dr. James Cameron",
    Guardian: "Patricia Brown",
    MedicalConditions: ["Arthritis", "Osteoarthritis"],
    Medications: ["Ibuprofen", "Glucosamine"],
    Allergies: ["Shellfish"],
    Status: "Alive",
    LastVisitDate: "2025-06-04"
  },
  {
    PID: "P008",
    FirstName: "Lisa",
    LastName: "Anderson",
    Email: "lisa.anderson@email.com",
    NearCity: "Kandy",
    Doctor: "Dr. Sarah Johnson",
    Guardian: "Robert Anderson",
    MedicalConditions: ["Thyroid Disorder"],
    Medications: ["Levothyroxine"],
    Allergies: ["Nuts"],
    Status: "Stable",
    LastVisitDate: "2025-06-03"
  },
  {
    PID: "P009",
    FirstName: "James",
    LastName: "Martinez",
    Email: "james.martinez@email.com",
    NearCity: "Galle",
    Doctor: "Dr. Robert Brown",
    Guardian: "Anna Martinez",
    MedicalConditions: ["Chronic Pain"],
    Medications: ["Tramadol", "Acetaminophen"],
    Allergies: ["Morphine"],
    Status: "Alive",
    LastVisitDate: "2025-06-02"
  },
  {
    PID: "P010",
    FirstName: "Jennifer",
    LastName: "Taylor",
    Email: "jennifer.taylor@email.com",
    NearCity: "Colombo",
    Doctor: "Dr. Michael Davis",
    Guardian: "William Taylor",
    MedicalConditions: ["COPD"],
    Medications: ["Spiriva", "Prednisone"],
    Allergies: ["Sulfa drugs"],
    Status: "Critical",
    LastVisitDate: "2025-06-09"
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Clear existing patients (optional - comment out if you want to keep existing data)
    const existingCount = await Patient.countDocuments();
    if (existingCount > 0) {
      console.log(`Found ${existingCount} existing patients. Skipping seeding to avoid duplicates.`);
      console.log('💡 To reseed, delete existing patients first or modify this script.');
      process.exit(0);
    }
    
    // Insert sample patients
    const insertedPatients = await Patient.insertMany(samplePatients);
    
    console.log(`✅ Successfully inserted ${insertedPatients.length} sample patients:`);
    insertedPatients.forEach(patient => {
      console.log(`   - ${patient.PID}: ${patient.FirstName} ${patient.LastName} (${patient.Status})`);
    });
    
    // Display some statistics
    const stats = await Patient.aggregate([
      { $group: { _id: '$Status', count: { $sum: 1 } } }
    ]);
    
    console.log('\n📊 Patient Status Distribution:');
    stats.forEach(stat => {
      console.log(`   - ${stat._id}: ${stat.count} patients`);
    });
    
    const cityStats = await Patient.aggregate([
      { $group: { _id: '$NearCity', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\n🏙️ Patients by City:');
    cityStats.forEach(city => {
      console.log(`   - ${city._id}: ${city.count} patients`);
    });
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('🚀 You can now start the server with: npm start');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('📦 Database connection closed');
  }
}

// Run the seeder if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, samplePatients };
