# Patient Record Management System - Quick Start Guide

## Prerequisites

Before running the application, ensure you have:

1. **Node.js** (v14 or higher) installed
2. **MongoDB** installed and running locally, OR use MongoDB Atlas (cloud)

## Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
The application uses the following default settings:
- **Database**: `mongodb://localhost:27017/patient_records`
- **Port**: `3000`

To customize these settings, create a `.env` file in the root directory:
```env
MONGODB_URI=mongodb://localhost:27017/patient_records
PORT=3000
```

### 3. Start MongoDB (Local Installation)

**Windows:**
```bash
# Start MongoDB service
net start MongoDB

# Or start mongod manually
mongod --dbpath "C:\data\db"
```

**macOS:**
```bash
# Using Homebrew
brew services start mongodb-community

# Or start manually
mongod --config /usr/local/etc/mongod.conf
```

**Linux:**
```bash
# Using systemd
sudo systemctl start mongod

# Or start manually
sudo mongod --dbpath /var/lib/mongodb
```

### 4. Seed Sample Data (Optional)
```bash
npm run seed
```

This will populate the database with 10 sample patients for testing.

### 5. Start the Application
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

### 6. Access the Application
Open your browser and navigate to: **http://localhost:3000**

## Using MongoDB Atlas (Cloud Alternative)

If you don't have MongoDB installed locally, you can use MongoDB Atlas:

1. **Create a free account** at [mongodb.com/atlas](https://mongodb.com/atlas)
2. **Create a new cluster** (free tier available)
3. **Get your connection string** from the Atlas dashboard
4. **Update your .env file**:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/patient_records?retryWrites=true&w=majority
   PORT=3000
   ```

## Application Features

### Dashboard
- **Patient Statistics**: Total patients, active cases, critical patients
- **Status Distribution**: Visual breakdown of patient statuses
- **City Distribution**: Patients grouped by nearest city
- **Recent Patients**: Latest patient entries

### Patient Management
- **View All Patients**: Paginated list with sorting options
- **Add New Patient**: Comprehensive form with validation
- **Edit Patient**: Update existing patient information
- **Delete Patient**: Remove patient records (with confirmation)

### Search Functionality
- **Global Search**: Search across all patient fields
- **Field-Specific Search**: Search by name, email, city, doctor, guardian
- **Quick Filters**: Critical patients, active patients, today's visits
- **Real-time Search**: Results update as you type

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/patients` | Get all patients (with pagination) |
| `POST` | `/api/patients` | Add a new patient |
| `GET` | `/api/patients/:pid` | Get patient by ID |
| `PUT` | `/api/patients/:pid` | Update patient by ID |
| `DELETE` | `/api/patients/:pid` | Delete patient by ID |
| `GET` | `/api/patients/firstname/:name` | Search by first name |
| `GET` | `/api/patients/lastname/:name` | Search by last name |
| `GET` | `/api/patients/email/:email` | Search by email |
| `GET` | `/api/patients/city/:city` | Search by city |
| `GET` | `/api/patients/doctor/:doctorName` | Search by doctor |
| `GET` | `/api/patients/guardian/:guardianName` | Search by guardian |
| `GET` | `/api/search/patients` | Advanced search |
| `GET` | `/api/stats/patients` | Get patient statistics |

## Testing the API

You can test the API endpoints using curl, Postman, or any HTTP client:

### Add a New Patient
```bash
curl -X POST http://localhost:3000/api/patients \
  -H "Content-Type: application/json" \
  -d '{
    "FirstName": "Test",
    "LastName": "Patient",
    "Email": "test@example.com",
    "NearCity": "Colombo",
    "Doctor": "Dr. Test Doctor",
    "Guardian": "Test Guardian",
    "Status": "Alive",
    "LastVisitDate": "2025-06-10",
    "MedicalConditions": ["Test Condition"],
    "Medications": ["Test Medication"],
    "Allergies": ["Test Allergy"]
  }'
```

### Get All Patients
```bash
curl http://localhost:3000/api/patients
```

### Search Patients
```bash
# Search by name
curl http://localhost:3000/api/patients/firstname/Harry

# Search by city
curl http://localhost:3000/api/patients/city/Kandy

# Advanced search
curl "http://localhost:3000/api/search/patients?query=Harry"
```

## Sample Data

After running `npm run seed`, you'll have these sample patients:

1. **Harry Silva** (P001) - Hypertension, Dr. James Cameron, Kandy
2. **Emma Watson** (P002) - Diabetes Type 2, Dr. Sarah Johnson, Colombo  
3. **John Smith** (P003) - Asthma, Dr. James Cameron, Galle
4. **Maria Garcia** (P004) - Heart Disease, Dr. Robert Brown, Kandy
5. **David Johnson** (P005) - Depression/Anxiety, Dr. Sarah Johnson, Negombo
6. **Sarah Wilson** (P006) - Migraine, Dr. Michael Davis, Colombo
7. **Michael Brown** (P007) - Arthritis, Dr. James Cameron, Matara
8. **Lisa Anderson** (P008) - Thyroid Disorder, Dr. Sarah Johnson, Kandy
9. **James Martinez** (P009) - Chronic Pain, Dr. Robert Brown, Galle
10. **Jennifer Taylor** (P010) - COPD, Dr. Michael Davis, Colombo

## Troubleshooting

### Common Issues

**MongoDB Connection Error:**
```
Error: MongoNetworkError: failed to connect to server
```
**Solution:** Ensure MongoDB is running and the connection string is correct.

**Port Already in Use:**
```
Error: EADDRINUSE: address already in use :::3000
```
**Solution:** Change the port in `.env` file or stop the process using port 3000.

**Dependencies Not Found:**
```
Error: Cannot find module 'express'
```
**Solution:** Run `npm install` to install all dependencies.

### Logs and Debugging

- **Application logs** are displayed in the terminal
- **MongoDB logs** can be found in MongoDB's log directory
- **Browser console** shows client-side errors and AJAX responses

## Performance Tips

1. **Use pagination** when displaying large numbers of patients
2. **Implement search indexes** for frequently searched fields
3. **Enable MongoDB caching** for better performance
4. **Use connection pooling** for database connections

## Security Notes

1. **Input validation** is implemented on both client and server
2. **CORS** is enabled for cross-origin requests
3. **Environment variables** protect sensitive configuration
4. **Error handling** prevents sensitive information exposure

## Support

For issues or questions:
1. Check the **DEVELOPMENT_GUIDE.md** for detailed development instructions
2. Review the **API documentation** above
3. Examine the **sample data** and expected formats
4. Test individual **API endpoints** to isolate issues

---

**Happy coding! 🏥💻**
