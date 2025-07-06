# Step-by-Step Guide: Adding New Features to the Patient Record Management System

This guide provides detailed instructions for extending the Patient Record Management System with new features, API routes, and functionality.

## Table of Contents
1. [Adding a New API Route](#adding-a-new-api-route)
2. [Adding New Database Fields](#adding-new-database-fields)
3. [Adding Frontend Features](#adding-frontend-features)
4. [Example: Adding Age-Based Search](#example-adding-age-based-search)
5. [Best Practices](#best-practices)

## Adding a New API Route

### Step 1: Update the Model (if needed)

If your new feature requires additional database fields, update the Patient model first.

**File:** `models/Patient.js`

```javascript
// Add new field to the schema
const patientSchema = new mongoose.Schema({
  // ...existing fields...
  Age: {
    type: Number,
    required: false,
    min: 0,
    max: 150
  },
  // ...rest of fields...
});

// Add index for better search performance
patientSchema.index({ Age: 1 });
```

### Step 2: Create Controller Function

Add the business logic for your new feature in the patient controller.

**File:** `controllers/patientController.js`

```javascript
// Add new controller function
exports.getPatientsByAgeRange = async (req, res) => {
  try {
    const { minAge, maxAge } = req.params;
    
    // Validate parameters
    if (!minAge || !maxAge) {
      return handleError(res, new Error('Both minAge and maxAge are required'), 400);
    }
    
    const min = parseInt(minAge);
    const max = parseInt(maxAge);
    
    if (isNaN(min) || isNaN(max) || min < 0 || max > 150 || min > max) {
      return handleError(res, new Error('Invalid age range'), 400);
    }
    
    // Query database
    const patients = await Patient.find({ 
      Age: { $gte: min, $lte: max } 
    }).sort({ Age: 1 });
    
    handleSuccess(res, patients, `Found ${patients.length} patients aged ${min}-${max}`);
  } catch (error) {
    handleError(res, error);
  }
};
```

### Step 3: Add Route Definition

Define the new route and map it to your controller function.

**File:** `routes/patientRoutes.js`

```javascript
// Add new route
router.get('/patients/age/:minAge/:maxAge', patientController.getPatientsByAgeRange);

// Or for more complex routes:
router.get('/patients/search/age', patientController.searchPatientsByAge);
```

### Step 4: Update Frontend

Add UI elements and JavaScript functionality to interact with your new API.

**File:** `public/index.html` (add to search tab)

```html
<!-- Add age range search -->
<div class="row mb-3">
  <div class="col-md-6">
    <label for="minAge" class="form-label">Minimum Age</label>
    <input type="number" class="form-control" id="minAge" min="0" max="150">
  </div>
  <div class="col-md-6">
    <label for="maxAge" class="form-label">Maximum Age</label>
    <input type="number" class="form-control" id="maxAge" min="0" max="150">
  </div>
</div>
<button class="btn btn-primary" onclick="searchByAgeRange()">
  <i class="fas fa-search me-2"></i>Search by Age Range
</button>
```

**File:** `public/js/app.js`

```javascript
// Add new function
function searchByAgeRange() {
  const minAge = $('#minAge').val();
  const maxAge = $('#maxAge').val();
  
  if (!minAge || !maxAge) {
    showAlert('Please enter both minimum and maximum age', 'warning');
    return;
  }
  
  if (parseInt(minAge) > parseInt(maxAge)) {
    showAlert('Minimum age cannot be greater than maximum age', 'warning');
    return;
  }
  
  $.ajax({
    url: `${API_BASE}/patients/age/${minAge}/${maxAge}`,
    method: 'GET',
    success: function(response) {
      if (response.success) {
        displaySearchResults(response.data, `age ${minAge}-${maxAge}`);
      }
    },
    error: function(xhr) {
      showAlert('Failed to search by age range', 'danger');
    }
  });
}

// Make function globally available
window.searchByAgeRange = searchByAgeRange;
```

## Adding New Database Fields

### Step 1: Update the Mongoose Schema

**File:** `models/Patient.js`

```javascript
const patientSchema = new mongoose.Schema({
  // ...existing fields...
  
  // New fields
  BloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: false
  },
  EmergencyContact: {
    Name: { type: String, required: false },
    Phone: { type: String, required: false },
    Relationship: { type: String, required: false }
  },
  InsuranceInfo: {
    Provider: { type: String, required: false },
    PolicyNumber: { type: String, required: false },
    ExpiryDate: { type: Date, required: false }
  }
});

// Add indexes for new searchable fields
patientSchema.index({ BloodType: 1 });
patientSchema.index({ 'EmergencyContact.Name': 1 });
```

### Step 2: Update Controllers

Add controller functions to handle the new fields:

```javascript
// Search by blood type
exports.getPatientsByBloodType = async (req, res) => {
  try {
    const { bloodType } = req.params;
    const patients = await Patient.find({ BloodType: bloodType });
    handleSuccess(res, patients, `Found ${patients.length} patients with blood type ${bloodType}`);
  } catch (error) {
    handleError(res, error);
  }
};
```

### Step 3: Update Forms

Add new fields to the add/edit patient forms:

```html
<!-- Blood Type -->
<div class="col-md-6 mb-3">
  <label for="bloodType" class="form-label">Blood Type</label>
  <select class="form-select" id="bloodType" name="BloodType">
    <option value="">Select Blood Type</option>
    <option value="A+">A+</option>
    <option value="A-">A-</option>
    <option value="B+">B+</option>
    <option value="B-">B-</option>
    <option value="AB+">AB+</option>
    <option value="AB-">AB-</option>
    <option value="O+">O+</option>
    <option value="O-">O-</option>
  </select>
</div>

<!-- Emergency Contact -->
<div class="col-md-4 mb-3">
  <label for="emergencyContactName" class="form-label">Emergency Contact Name</label>
  <input type="text" class="form-control" id="emergencyContactName" name="EmergencyContact.Name">
</div>
```

## Adding Frontend Features

### Step 1: Add UI Components

Create new HTML elements for your feature:

```html
<!-- Add to dashboard for new statistics -->
<div class="col-md-3 mb-3">
  <div class="stat-card">
    <span id="averageAgeCount" class="stat-number">0</span>
    <div class="stat-label">Average Age</div>
  </div>
</div>
```

### Step 2: Add JavaScript Functionality

Implement the feature logic:

```javascript
// Load average age statistic
function loadAverageAge() {
  $.ajax({
    url: `${API_BASE}/stats/average-age`,
    method: 'GET',
    success: function(response) {
      if (response.success) {
        $('#averageAgeCount').text(Math.round(response.data.averageAge));
      }
    },
    error: function(xhr) {
      console.error('Error loading average age:', xhr);
    }
  });
}
```

### Step 3: Add CSS Styling

Style your new components:

```css
/* New feature styles */
.blood-type-badge {
  background: linear-gradient(45deg, #e74c3c, #c0392b);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-md);
  font-size: 0.75rem;
  font-weight: 600;
}

.emergency-contact-card {
  background: var(--secondary-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1rem;
  margin-bottom: 1rem;
}
```

## Example: Adding Age-Based Search

Here's a complete example of adding an age-based search feature:

### 1. Update Model

```javascript
// models/Patient.js
const patientSchema = new mongoose.Schema({
  // ...existing fields...
  DateOfBirth: {
    type: Date,
    required: false
  }
});

// Virtual field for age calculation
patientSchema.virtual('Age').get(function() {
  if (!this.DateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.DateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Ensure virtual fields are serialized
patientSchema.set('toJSON', { virtuals: true });
```

### 2. Add Controller

```javascript
// controllers/patientController.js
exports.getPatientsByAgeRange = async (req, res) => {
  try {
    const { minAge, maxAge } = req.params;
    
    // Calculate date range from ages
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - parseInt(minAge), today.getMonth(), today.getDate());
    const minDate = new Date(today.getFullYear() - parseInt(maxAge) - 1, today.getMonth(), today.getDate());
    
    const patients = await Patient.find({
      DateOfBirth: {
        $gte: minDate,
        $lte: maxDate
      }
    });
    
    handleSuccess(res, patients, `Found ${patients.length} patients aged ${minAge}-${maxAge}`);
  } catch (error) {
    handleError(res, error);
  }
};
```

### 3. Add Route

```javascript
// routes/patientRoutes.js
router.get('/patients/age/:minAge/:maxAge', patientController.getPatientsByAgeRange);
```

### 4. Update Frontend

```html
<!-- Add to search tab -->
<div class="card mb-3">
  <div class="card-header">
    <h6 class="mb-0">Age-Based Search</h6>
  </div>
  <div class="card-body">
    <div class="row">
      <div class="col-md-4">
        <input type="number" class="form-control" id="minAge" placeholder="Min Age" min="0" max="150">
      </div>
      <div class="col-md-4">
        <input type="number" class="form-control" id="maxAge" placeholder="Max Age" min="0" max="150">
      </div>
      <div class="col-md-4">
        <button class="btn btn-primary w-100" onclick="searchByAgeRange()">Search</button>
      </div>
    </div>
  </div>
</div>
```

```javascript
// public/js/app.js
function searchByAgeRange() {
  const minAge = $('#minAge').val();
  const maxAge = $('#maxAge').val();
  
  if (!minAge || !maxAge) {
    showAlert('Please enter both minimum and maximum age', 'warning');
    return;
  }
  
  $.ajax({
    url: `${API_BASE}/patients/age/${minAge}/${maxAge}`,
    method: 'GET',
    success: function(response) {
      if (response.success) {
        displaySearchResults(response.data, `ages ${minAge}-${maxAge}`);
      }
    },
    error: function(xhr) {
      showAlert('Failed to search by age range', 'danger');
    }
  });
}
```

## Best Practices

### 1. Error Handling
- Always implement proper error handling in controllers
- Validate input parameters
- Use appropriate HTTP status codes
- Provide meaningful error messages

### 2. Database Operations
- Add indexes for frequently searched fields
- Use pagination for large result sets
- Implement proper data validation
- Consider using database transactions for complex operations

### 3. Frontend Development
- Use jQuery consistently for DOM manipulation
- Implement loading states for AJAX calls
- Validate forms on both client and server side
- Provide user feedback for all operations

### 4. Security Considerations
- Sanitize all user inputs
- Implement rate limiting for API endpoints
- Use HTTPS in production
- Validate data types and ranges

### 5. Performance Optimization
- Implement caching where appropriate
- Use database indexes effectively
- Minimize API calls with efficient queries
- Optimize frontend bundle size

### 6. Testing
- Test all new API endpoints
- Validate form submissions
- Test error scenarios
- Verify mobile responsiveness

## Common Patterns

### Adding a New Search Filter

1. **Controller Pattern:**
```javascript
exports.getPatientsByCustomField = async (req, res) => {
  try {
    const { fieldValue } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const patients = await Patient.find({ 
      CustomField: { $regex: fieldValue, $options: 'i' } 
    })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });
    
    const total = await Patient.countDocuments({ 
      CustomField: { $regex: fieldValue, $options: 'i' } 
    });
    
    handleSuccess(res, { patients, total, page }, 'Search completed');
  } catch (error) {
    handleError(res, error);
  }
};
```

2. **Frontend Pattern:**
```javascript
function searchByCustomField(fieldValue) {
  $.ajax({
    url: `${API_BASE}/patients/custom/${encodeURIComponent(fieldValue)}`,
    method: 'GET',
    beforeSend: function() {
      showLoading();
    },
    success: function(response) {
      hideLoading();
      if (response.success) {
        displaySearchResults(response.data.patients, fieldValue);
      }
    },
    error: function(xhr) {
      hideLoading();
      showAlert('Search failed', 'danger');
    }
  });
}
```

### Adding Data Validation

```javascript
// Server-side validation
const validatePatientData = (data) => {
  const errors = [];
  
  if (!data.FirstName || data.FirstName.trim().length < 2) {
    errors.push('First name must be at least 2 characters');
  }
  
  if (!data.Email || !/\S+@\S+\.\S+/.test(data.Email)) {
    errors.push('Valid email is required');
  }
  
  return errors;
};

// Client-side validation
function validateField($field) {
  const value = $field.val().trim();
  const fieldType = $field.attr('type');
  
  if ($field.prop('required') && !value) {
    showFieldError($field, 'This field is required');
    return false;
  }
  
  if (fieldType === 'email' && value && !/\S+@\S+\.\S+/.test(value)) {
    showFieldError($field, 'Please enter a valid email');
    return false;
  }
  
  clearFieldError($field);
  return true;
}
```

This guide provides a comprehensive approach to extending the Patient Record Management System. Follow these patterns and best practices to maintain code quality and consistency while adding new features.
