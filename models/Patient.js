const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  PID: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  FirstName: {
    type: String,
    required: true,
    trim: true
  },
  LastName: {
    type: String,
    required: true,
    trim: true
  },
  Email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  NearCity: {
    type: String,
    required: true,
    trim: true
  },
  Doctor: {
    type: String,
    required: true,
    trim: true
  },
  Guardian: {
    type: String,
    required: true,
    trim: true
  },
  MedicalConditions: {
    type: [String],
    default: []
  },
  Medications: {
    type: [String],
    default: []
  },
  Allergies: {
    type: [String],
    default: []
  },
  Status: {
    type: String,
    required: true,
    enum: ['Alive', 'Deceased', 'Critical', 'Stable', 'Recovering'],
    default: 'Alive'
  },
  LastVisitDate: {
    type: Date,
    required: true,
    default: Date.now
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Index for better search performance
patientSchema.index({ FirstName: 1 });
patientSchema.index({ LastName: 1 });
patientSchema.index({ Email: 1 });
patientSchema.index({ NearCity: 1 });
patientSchema.index({ Doctor: 1 });
patientSchema.index({ Guardian: 1 });
patientSchema.index({ PID: 1 });

// Virtual for full name
patientSchema.virtual('FullName').get(function() {
  return `${this.FirstName} ${this.LastName}`;
});

// Method to format medical conditions as string
patientSchema.methods.getMedicalConditionsString = function() {
  return this.MedicalConditions.join(', ');
};

// Method to format medications as string
patientSchema.methods.getMedicationsString = function() {
  return this.Medications.join(', ');
};

// Method to format allergies as string
patientSchema.methods.getAllergiesString = function() {
  return this.Allergies.join(', ');
};

// Static method to generate next PID
patientSchema.statics.generateNextPID = async function() {
  const lastPatient = await this.findOne().sort({ PID: -1 });
  if (!lastPatient) {
    return 'P001';
  }
  
  const lastNumber = parseInt(lastPatient.PID.substring(1));
  const nextNumber = lastNumber + 1;
  return `P${nextNumber.toString().padStart(3, '0')}`;
};

module.exports = mongoose.model('Patient', patientSchema);
