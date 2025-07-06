# Patient Record Management System

A full-stack web-based Patient Record Management System designed for teaching hospitals to automate manual processes and efficiently manage patient information.

## Features

- **Frontend**: HTML + Bootstrap responsive design with jQuery for dynamic interactions
- **Backend**: Node.js + Express.js RESTful API
- **Database**: MongoDB with Mongoose ODM
- **Data Format**: JSON communication
- **UI Design**: Dark theme with light blue accents, optimized for 24/7 healthcare facilities

## Technology Stack

- **Frontend Technologies**:
  - HTML5
  - Bootstrap 5
  - jQuery 3.6+
  - Ajax for asynchronous communication
  - Responsive design

- **Backend Technologies**:
  - Node.js
  - Express.js
  - MongoDB
  - Mongoose ODM
  - CORS enabled

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/patients` | Add a new patient |
| GET | `/patients` | List all patients |
| GET | `/patients/:pid` | Get patient by ID |
| GET | `/patients/firstname/:name` | Get patients by first name |
| GET | `/patients/lastname/:name` | Get patients by last name |
| GET | `/patients/email/:email` | Get patients by email |
| GET | `/patients/city/:city` | Get patients by nearest city |
| GET | `/patients/doctor/:doctorName` | Get patients by assigned doctor |
| GET | `/patients/guardian/:guardianName` | Get patients by guardian name |
| PUT | `/patients/:pid` | Update patient by ID |
| PUT | `/patients/firstname/:name` | Update patients by first name |
| DELETE | `/patients/:pid` | Delete patient by ID |

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd patient-record-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```
   MONGODB_URI=mongodb://localhost:27017/patient_records
   PORT=3000
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the application**
   ```bash
   # Development mode with nodemon
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Access the application**
   Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
patient-record-management-system/
├── server.js                 # Main server file
├── package.json              # Dependencies and scripts
├── .env                      # Environment variables
├── models/
│   └── Patient.js            # Patient data model
├── controllers/
│   └── patientController.js  # Patient business logic
├── routes/
│   └── patientRoutes.js      # API route definitions
└── public/                   # Frontend files
    ├── index.html            # Main HTML file
    ├── css/
    │   └── styles.css        # Custom styles
    └── js/
        └── app.js            # Frontend JavaScript with jQuery
```

## Patient Data Format

```json
{
  "PID": "P001",
  "FirstName": "Harry",
  "LastName": "Silva",
  "Email": "harry@gmail.com",
  "NearCity": "Kandy",
  "Doctor": "Dr. James Cameron",
  "Guardian": "John Silva",
  "MedicalConditions": ["Hypertension", "Stage 2"],
  "Medications": ["Losartan", "Furosemide"],
  "Allergies": ["Penicillin"],
  "Status": "Alive",
  "LastVisitDate": "2025-05-10"
}
```

## Adding New Features

### Step-by-Step Guide to Add a New API Route

1. **Define the Model** (if needed)
   - Update `models/Patient.js` with new fields
   - Add validation rules

2. **Create Controller Function**
   - Add new function in `controllers/patientController.js`
   - Implement business logic and error handling

3. **Add Route Definition**
   - Define new route in `routes/patientRoutes.js`
   - Map HTTP method and path to controller function

4. **Update Frontend**
   - Add UI elements in `public/index.html`
   - Implement jQuery/Ajax calls in `public/js/app.js`
   - Style new elements in `public/css/styles.css`

### Example: Adding a New Search by Age Range

1. **Controller** (`controllers/patientController.js`):
   ```javascript
   exports.getPatientsByAgeRange = async (req, res) => {
     try {
       const { minAge, maxAge } = req.params;
       // Implementation logic here
     } catch (error) {
       res.status(500).json({ error: error.message });
     }
   };
   ```

2. **Route** (`routes/patientRoutes.js`):
   ```javascript
   router.get('/patients/age/:minAge/:maxAge', patientController.getPatientsByAgeRange);
   ```

3. **Frontend** (`public/js/app.js`):
   ```javascript
   function searchByAgeRange(minAge, maxAge) {
     $.ajax({
       url: `/patients/age/${minAge}/${maxAge}`,
       method: 'GET',
       success: function(data) {
         displayPatients(data);
       }
     });
   }
   ```

## Usage

The system provides a comprehensive interface for healthcare staff to:

- **Add new patients** with complete medical information
- **Search patients** by various criteria (name, email, city, doctor, guardian)
- **Update patient records** with new medical information
- **View patient details** in organized cards and tables
- **Delete patient records** when necessary
- **Real-time form validation** and dynamic content updates

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please contact the development team or create an issue in the repository.
