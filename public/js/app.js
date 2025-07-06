/**
 * Patient Record Management System - Frontend JavaScript
 * Uses jQuery extensively for DOM manipulation, AJAX calls, and user interactions
 */

// Global variables
let currentPage = 1;
let totalPages = 1;
let currentPatientId = null;
let searchTimeout = null;

// API Base URL
const API_BASE = '/api';

// Document ready function - jQuery usage #1
$(document).ready(function() {
    console.log('Patient Record Management System initialized');
    
    // Initialize the application
    initializeApp();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load initial data
    loadDashboardData();
    
    // Update time every second
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
});

/**
 * Initialize the application
 */
function initializeApp() {
    // Set today's date as default for last visit date
    const today = new Date().toISOString().split('T')[0];
    $('#lastVisitDate').val(today);
    
    // Initialize Bootstrap tooltips and popovers
    $('[data-bs-toggle="tooltip"]').tooltip();
    $('[data-bs-toggle="popover"]').popover();
    
    console.log('Application initialized successfully');
}

/**
 * Set up all event listeners - jQuery usage #2
 */
function setupEventListeners() {
    // Tab change events
    $('#mainTabs button[data-bs-toggle="tab"]').on('shown.bs.tab', function(e) {
        const target = $(e.target).attr('data-bs-target');
        
        if (target === '#patients') {
            loadAllPatients();
        } else if (target === '#dashboard') {
            loadDashboardData();
        }
    });
    
    // Real-time search functionality - jQuery usage #3
    $('#searchInput').on('input', function() {
        clearTimeout(searchTimeout);
        const query = $(this).val().trim();
        const field = $('#searchField').val();
        
        if (query.length >= 2) {
            searchTimeout = setTimeout(() => {
                performSearch(query, field);
            }, 300); // Debounce search for better performance
        } else if (query.length === 0) {
            showEmptySearchState();
        }
    });
    
    // Search field change event
    $('#searchField').on('change', function() {
        const query = $('#searchInput').val().trim();
        if (query.length >= 2) {
            const field = $(this).val();
            performSearch(query, field);
        }
    });
    
    // Form submission for adding patients - jQuery usage #4
    $('#addPatientForm').on('submit', function(e) {
        e.preventDefault();
        if (validatePatientForm()) {
            addNewPatient();
        }
    });
    
    // Form validation on input change - jQuery usage #5
    $('#addPatientForm input, #addPatientForm select').on('blur change', function() {
        validateField($(this));
    });
    
    // Edit patient form submission
    $('#editPatientForm').on('submit', function(e) {
        e.preventDefault();
    });
    
    // Save edit button click
    $('#saveEditBtn').on('click', function() {
        if (validateEditForm()) {
            savePatientEdit();
        }
    });
    
    // Delete patient confirmation
    $('#deletePatientBtn').on('click', function() {
        if (currentPatientId) {
            showDeleteConfirmation();
        }
    });
    
    // Edit patient button
    $('#editPatientBtn').on('click', function() {
        if (currentPatientId) {
            showEditModal();
        }
    });
    
    console.log('Event listeners set up successfully');
}

/**
 * Update current time display
 */
function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    $('#currentTime').text(timeString);
}

/**
 * Show loading overlay
 */
function showLoading() {
    $('#loadingOverlay').fadeIn(200);
}

/**
 * Hide loading overlay
 */
function hideLoading() {
    $('#loadingOverlay').fadeOut(200);
}

/**
 * Show alert message
 */
function showAlert(message, type = 'success', duration = 5000) {
    const alertId = 'alert-' + Date.now();
    const alertHtml = `
        <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show" role="alert">
            <i class="fas fa-${getAlertIcon(type)} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    
    $('#alertContainer').append(alertHtml);
    
    // Auto dismiss after duration
    setTimeout(() => {
        $(`#${alertId}`).alert('close');
    }, duration);
}

/**
 * Get appropriate icon for alert type
 */
function getAlertIcon(type) {
    const icons = {
        success: 'check-circle',
        danger: 'exclamation-triangle',
        warning: 'exclamation-circle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

/**
 * Load dashboard data using AJAX
 */
function loadDashboardData() {
    // Load statistics
    $.ajax({
        url: `${API_BASE}/stats/patients`,
        method: 'GET',
        success: function(response) {
            if (response.success) {
                updateDashboardStats(response.data);
            }
        },
        error: function(xhr) {
            console.error('Error loading dashboard stats:', xhr);
            showAlert('Failed to load dashboard statistics', 'danger');
        }
    });
    
    // Load recent patients
    $.ajax({
        url: `${API_BASE}/patients?limit=5&sortBy=createdAt&order=desc`,
        method: 'GET',
        success: function(response) {
            if (response.success) {
                displayRecentPatients(response.data.patients);
            }
        },
        error: function(xhr) {
            console.error('Error loading recent patients:', xhr);
            $('#recentPatients').html(`
                <div class="text-center text-muted">
                    <i class="fas fa-exclamation-triangle fa-2x mb-2"></i>
                    <p>Failed to load recent patients</p>
                </div>
            `);
        }
    });
}

/**
 * Update dashboard statistics
 */
function updateDashboardStats(stats) {
    // Update total patients count with animation
    animateCounter('#totalPatientsCount', stats.total);
    
    // Calculate status-based counts
    let aliveCount = 0;
    let criticalCount = 0;
    
    stats.statusDistribution.forEach(status => {
        if (status._id === 'Alive' || status._id === 'Stable' || status._id === 'Recovering') {
            aliveCount += status.count;
        }
        if (status._id === 'Critical') {
            criticalCount = status.count;
        }
    });
    
    animateCounter('#activePatientsCount', aliveCount);
    animateCounter('#criticalPatientsCount', criticalCount);
    
    // For today's visits, we'll use a placeholder for now
    animateCounter('#todayVisitsCount', Math.floor(Math.random() * 20));
    
    // Display status chart
    displayStatusChart(stats.statusDistribution);
    
    // Display top cities
    displayCityChart(stats.topCities);
}

/**
 * Animate counter numbers
 */
function animateCounter(selector, targetValue) {
    const $counter = $(selector);
    const currentValue = parseInt($counter.text()) || 0;
    
    $({ count: currentValue }).animate({
        count: targetValue
    }, {
        duration: 1000,
        easing: 'swing',
        step: function() {
            $counter.text(Math.floor(this.count));
        },
        complete: function() {
            $counter.text(targetValue);
        }
    });
}

/**
 * Display status distribution chart
 */
function displayStatusChart(statusData) {
    let chartHtml = '';
    
    statusData.forEach(status => {
        const percentage = Math.round((status.count / statusData.reduce((sum, s) => sum + s.count, 0)) * 100);
        const statusClass = `status-${status._id.toLowerCase()}`;
        
        chartHtml += `
            <div class="d-flex align-items-center mb-2">
                <span class="status-badge ${statusClass} me-3" style="min-width: 80px;">
                    ${status._id}
                </span>
                <div class="flex-grow-1">
                    <div class="progress" style="height: 8px;">
                        <div class="progress-bar bg-primary" role="progressbar" 
                             style="width: ${percentage}%" aria-valuenow="${percentage}" 
                             aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                </div>
                <span class="ms-2 text-muted">${status.count} (${percentage}%)</span>
            </div>
        `;
    });
    
    $('#statusChart').html(chartHtml);
}

/**
 * Display city distribution chart
 */
function displayCityChart(cityData) {
    let chartHtml = '';
    
    if (cityData.length === 0) {
        chartHtml = '<p class="text-muted text-center">No city data available</p>';
    } else {
        const maxCount = Math.max(...cityData.map(city => city.count));
        
        cityData.slice(0, 5).forEach(city => {
            const percentage = Math.round((city.count / maxCount) * 100);
            
            chartHtml += `
                <div class="d-flex align-items-center mb-2">
                    <span class="me-3" style="min-width: 100px; font-weight: 500;">
                        ${city._id}
                    </span>
                    <div class="flex-grow-1">
                        <div class="progress" style="height: 8px;">
                            <div class="progress-bar bg-info" role="progressbar" 
                                 style="width: ${percentage}%" aria-valuenow="${percentage}" 
                                 aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                    </div>
                    <span class="ms-2 text-muted">${city.count}</span>
                </div>
            `;
        });
    }
    
    $('#cityChart').html(chartHtml);
}

/**
 * Display recent patients
 */
function displayRecentPatients(patients) {
    if (patients.length === 0) {
        $('#recentPatients').html(`
            <div class="text-center text-muted">
                <i class="fas fa-user-plus fa-2x mb-2"></i>
                <p>No patients found. Add some patients to get started!</p>
            </div>
        `);
        return;
    }
    
    let html = '<div class="row">';
    
    patients.forEach(patient => {
        html += createPatientCard(patient, 'col-md-6 col-lg-4 mb-3');
    });
    
    html += '</div>';
    $('#recentPatients').html(html);
}

/**
 * Load all patients with pagination
 */
function loadAllPatients(page = 1, sortBy = 'createdAt', order = 'desc') {
    showLoading();
    
    $.ajax({
        url: `${API_BASE}/patients?page=${page}&limit=9&sortBy=${sortBy}&order=${order}`,
        method: 'GET',
        success: function(response) {
            hideLoading();
            if (response.success) {
                displayAllPatients(response.data.patients);
                updatePagination(response.data.currentPage, response.data.totalPages, response.data.total);
                currentPage = response.data.currentPage;
                totalPages = response.data.totalPages;
            }
        },
        error: function(xhr) {
            hideLoading();
            console.error('Error loading patients:', xhr);
            showAlert('Failed to load patients', 'danger');
            $('#patientsContainer').html(`
                <div class="col-12">
                    <div class="text-center text-muted py-5">
                        <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
                        <h4>Failed to Load Patients</h4>
                        <p>Please check your connection and try again.</p>
                        <button class="btn btn-primary" onclick="loadAllPatients()">
                            <i class="fas fa-retry me-2"></i>Retry
                        </button>
                    </div>
                </div>
            `);
        }
    });
}

/**
 * Display all patients in grid format
 */
function displayAllPatients(patients) {
    if (patients.length === 0) {
        $('#patientsContainer').html(`
            <div class="col-12">
                <div class="empty-state">
                    <i class="fas fa-user-plus"></i>
                    <h3>No Patients Found</h3>
                    <p>Start by adding your first patient to the system.</p>
                    <button class="btn btn-primary" onclick="$('#add-tab').tab('show')">
                        <i class="fas fa-plus me-2"></i>Add Patient
                    </button>
                </div>
            </div>
        `);
        return;
    }
    
    let html = '';
    patients.forEach(patient => {
        html += createPatientCard(patient, 'col-md-6 col-lg-4 mb-4');
    });
    
    $('#patientsContainer').html(html);
}

/**
 * Create a patient card HTML
 */
function createPatientCard(patient, colClass = '') {
    const fullName = `${patient.FirstName} ${patient.LastName}`;
    const statusClass = `status-${patient.Status.toLowerCase()}`;
    const visitDate = new Date(patient.LastVisitDate).toLocaleDateString();
    
    return `
        <div class="${colClass}">
            <div class="patient-card card fade-in" onclick="showPatientDetails('${patient.PID}')">
                <div class="card-body">
                    <div class="patient-id">${patient.PID}</div>
                    <div class="patient-name">${fullName}</div>
                    
                    <div class="patient-info">
                        <div class="info-item">
                            <span class="info-label">Email:</span>
                            <span class="info-value">${patient.Email}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">City:</span>
                            <span class="info-value">${patient.NearCity}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Doctor:</span>
                            <span class="info-value">${patient.Doctor}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Guardian:</span>
                            <span class="info-value">${patient.Guardian}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Last Visit:</span>
                            <span class="info-value">${visitDate}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Status:</span>
                            <span class="status-badge ${statusClass}">${patient.Status}</span>
                        </div>
                    </div>
                    
                    ${createMedicalTags(patient)}
                </div>
            </div>
        </div>
    `;
}

/**
 * Create medical information tags
 */
function createMedicalTags(patient) {
    let html = '';
    
    if (patient.MedicalConditions && patient.MedicalConditions.length > 0) {
        html += '<div class="medical-tags">';
        patient.MedicalConditions.slice(0, 3).forEach(condition => {
            html += `<span class="medical-tag">${condition}</span>`;
        });
        if (patient.MedicalConditions.length > 3) {
            html += `<span class="medical-tag">+${patient.MedicalConditions.length - 3} more</span>`;
        }
        html += '</div>';
    }
    
    return html;
}

/**
 * Update pagination controls
 */
function updatePagination(currentPage, totalPages, totalCount) {
    let html = '';
    
    if (totalPages > 1) {
        // Previous button
        html += `
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="loadAllPatients(${currentPage - 1})" 
                   ${currentPage === 1 ? 'tabindex="-1"' : ''}>Previous</a>
            </li>
        `;
        
        // Page numbers
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);
        
        if (startPage > 1) {
            html += `<li class="page-item"><a class="page-link" href="#" onclick="loadAllPatients(1)">1</a></li>`;
            if (startPage > 2) {
                html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            html += `
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="loadAllPatients(${i})">${i}</a>
                </li>
            `;
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
            html += `<li class="page-item"><a class="page-link" href="#" onclick="loadAllPatients(${totalPages})">${totalPages}</a></li>`;
        }
        
        // Next button
        html += `
            <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="loadAllPatients(${currentPage + 1})" 
                   ${currentPage === totalPages ? 'tabindex="-1"' : ''}>Next</a>
            </li>
        `;
    }
    
    $('#paginationControls').html(html);
    
    // Update page info
    const startCount = ((currentPage - 1) * 9) + 1;
    const endCount = Math.min(currentPage * 9, totalCount);
    const pageInfo = `Showing ${startCount}-${endCount} of ${totalCount} patients`;
    
    // Add page info if it doesn't exist
    if ($('#pageInfo').length === 0) {
        $('#paginationControls').after(`<p id="pageInfo" class="text-center text-muted mt-2">${pageInfo}</p>`);
    } else {
        $('#pageInfo').text(pageInfo);
    }
}

/**
 * Perform search using AJAX
 */
function performSearch(query, field) {
    $('#searchResults').html(`
        <div class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Searching...</span>
            </div>
            <p class="mt-2 text-muted">Searching for "${query}"...</p>
        </div>
    `);
    
    let searchUrl;
    if (field === 'all') {
        searchUrl = `${API_BASE}/search/patients?query=${encodeURIComponent(query)}`;
    } else {
        // Use specific endpoint based on field
        const fieldEndpoints = {
            'FirstName': `firstname/${encodeURIComponent(query)}`,
            'LastName': `lastname/${encodeURIComponent(query)}`,
            'Email': `email/${encodeURIComponent(query)}`,
            'NearCity': `city/${encodeURIComponent(query)}`,
            'Doctor': `doctor/${encodeURIComponent(query)}`,
            'Guardian': `guardian/${encodeURIComponent(query)}`,
            'PID': encodeURIComponent(query)
        };
        
        if (field === 'PID') {
            searchUrl = `${API_BASE}/patients/${fieldEndpoints[field]}`;
        } else {
            searchUrl = `${API_BASE}/patients/${fieldEndpoints[field]}`;
        }
    }
    
    $.ajax({
        url: searchUrl,
        method: 'GET',
        success: function(response) {
            if (response.success) {
                displaySearchResults(response.data, query);
            }
        },
        error: function(xhr) {
            console.error('Search error:', xhr);
            $('#searchResults').html(`
                <div class="text-center text-muted py-4">
                    <i class="fas fa-exclamation-triangle fa-2x mb-2"></i>
                    <h5>Search Failed</h5>
                    <p>Unable to search at this time. Please try again.</p>
                </div>
            `);
            showAlert('Search failed. Please try again.', 'danger');
        }
    });
}

/**
 * Display search results
 */
function displaySearchResults(results, query) {
    if (!Array.isArray(results)) {
        results = [results]; // Single result from ID search
    }
    
    if (results.length === 0) {
        $('#searchResults').html(`
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No Results Found</h3>
                <p>No patients found matching "${query}". Try a different search term.</p>
            </div>
        `);
        return;
    }
    
    let html = `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h5>Search Results</h5>
            <span class="text-muted">${results.length} result(s) found for "${query}"</span>
        </div>
        <div class="row">
    `;
    
    results.forEach(patient => {
        html += createPatientCard(patient, 'col-md-6 col-lg-4 mb-3');
    });
    
    html += '</div>';
    $('#searchResults').html(html);
}

/**
 * Show empty search state
 */
function showEmptySearchState() {
    $('#searchResults').html(`
        <div class="empty-state">
            <i class="fas fa-search"></i>
            <h3>Start Searching</h3>
            <p>Enter a search term above to find patients</p>
        </div>
    `);
}

/**
 * Quick search functionality
 */
function quickSearch(field, value) {
    $('#searchField').val(field);
    $('#searchInput').val(value);
    performSearch(value, field);
    
    // Switch to search tab if not already active
    $('#search-tab').tab('show');
}

/**
 * Search for today's visits
 */
function searchTodayVisits() {
    const today = new Date().toISOString().split('T')[0];
    
    $.ajax({
        url: `${API_BASE}/patients`,
        method: 'GET',
        success: function(response) {
            if (response.success) {
                const todayVisits = response.data.patients.filter(patient => {
                    const visitDate = new Date(patient.LastVisitDate).toISOString().split('T')[0];
                    return visitDate === today;
                });
                
                displaySearchResults(todayVisits, "today's visits");
                $('#search-tab').tab('show');
            }
        },
        error: function(xhr) {
            showAlert('Failed to search today\'s visits', 'danger');
        }
    });
}

/**
 * Show patient details in modal
 */
function showPatientDetails(patientId) {
    currentPatientId = patientId;
    
    $.ajax({
        url: `${API_BASE}/patients/${patientId}`,
        method: 'GET',
        success: function(response) {
            if (response.success) {
                populatePatientModal(response.data);
                $('#patientModal').modal('show');
            }
        },
        error: function(xhr) {
            console.error('Error loading patient details:', xhr);
            showAlert('Failed to load patient details', 'danger');
        }
    });
}

/**
 * Populate patient details modal
 */
function populatePatientModal(patient) {
    const fullName = `${patient.FirstName} ${patient.LastName}`;
    const statusClass = `status-${patient.Status.toLowerCase()}`;
    const visitDate = new Date(patient.LastVisitDate).toLocaleDateString();
    const createdDate = new Date(patient.createdAt).toLocaleDateString();
    const updatedDate = new Date(patient.updatedAt).toLocaleDateString();
    
    $('#patientModalTitle').html(`
        <i class="fas fa-user me-2"></i>${fullName} 
        <span class="badge bg-secondary ms-2">${patient.PID}</span>
    `);
    
    $('#patientModalBody').html(`
        <div class="row">
            <div class="col-md-6">
                <h6 class="text-primary mb-3"><i class="fas fa-user me-2"></i>Personal Information</h6>
                <table class="table table-borderless">
                    <tr><td><strong>First Name:</strong></td><td>${patient.FirstName}</td></tr>
                    <tr><td><strong>Last Name:</strong></td><td>${patient.LastName}</td></tr>
                    <tr><td><strong>Email:</strong></td><td>${patient.Email}</td></tr>
                    <tr><td><strong>City:</strong></td><td>${patient.NearCity}</td></tr>
                    <tr><td><strong>Guardian:</strong></td><td>${patient.Guardian}</td></tr>
                </table>
            </div>
            <div class="col-md-6">
                <h6 class="text-primary mb-3"><i class="fas fa-stethoscope me-2"></i>Medical Information</h6>
                <table class="table table-borderless">
                    <tr><td><strong>Assigned Doctor:</strong></td><td>${patient.Doctor}</td></tr>
                    <tr><td><strong>Status:</strong></td><td><span class="status-badge ${statusClass}">${patient.Status}</span></td></tr>
                    <tr><td><strong>Last Visit:</strong></td><td>${visitDate}</td></tr>
                </table>
            </div>
        </div>
        
        <hr>
        
        <div class="row">
            <div class="col-md-4">
                <h6 class="text-warning mb-3"><i class="fas fa-notes-medical me-2"></i>Medical Conditions</h6>
                ${patient.MedicalConditions && patient.MedicalConditions.length > 0 
                    ? patient.MedicalConditions.map(condition => `<span class="medical-tag d-inline-block mb-1">${condition}</span>`).join(' ')
                    : '<span class="text-muted">None recorded</span>'
                }
            </div>
            <div class="col-md-4">
                <h6 class="text-info mb-3"><i class="fas fa-pills me-2"></i>Medications</h6>
                ${patient.Medications && patient.Medications.length > 0 
                    ? patient.Medications.map(medication => `<span class="medical-tag d-inline-block mb-1">${medication}</span>`).join(' ')
                    : '<span class="text-muted">None recorded</span>'
                }
            </div>
            <div class="col-md-4">
                <h6 class="text-danger mb-3"><i class="fas fa-exclamation-triangle me-2"></i>Allergies</h6>
                ${patient.Allergies && patient.Allergies.length > 0 
                    ? patient.Allergies.map(allergy => `<span class="medical-tag d-inline-block mb-1">${allergy}</span>`).join(' ')
                    : '<span class="text-muted">None recorded</span>'
                }
            </div>
        </div>
        
        <hr>
        
        <div class="row">
            <div class="col-12">
                <h6 class="text-muted mb-2"><i class="fas fa-clock me-2"></i>Record Information</h6>
                <small class="text-muted">
                    Created: ${createdDate} | Last Updated: ${updatedDate}
                </small>
            </div>
        </div>
    `);
}

/**
 * Validate patient form
 */
function validatePatientForm() {
    let isValid = true;
    
    // Required fields validation
    const requiredFields = ['firstName', 'lastName', 'email', 'nearCity', 'doctor', 'guardian', 'status', 'lastVisitDate'];
    
    requiredFields.forEach(fieldId => {
        const $field = $(`#${fieldId}`);
        if (!$field.val().trim()) {
            showFieldError($field, 'This field is required');
            isValid = false;
        } else {
            clearFieldError($field);
        }
    });
    
    // Email validation
    const email = $('#email').val().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
        showFieldError($('#email'), 'Please enter a valid email address');
        isValid = false;
    }
    
    // Date validation
    const lastVisitDate = $('#lastVisitDate').val();
    if (lastVisitDate && new Date(lastVisitDate) > new Date()) {
        showFieldError($('#lastVisitDate'), 'Last visit date cannot be in the future');
        isValid = false;
    }
    
    return isValid;
}

/**
 * Validate individual field
 */
function validateField($field) {
    const fieldId = $field.attr('id');
    const value = $field.val().trim();
    
    // Required field validation
    if ($field.prop('required') && !value) {
        showFieldError($field, 'This field is required');
        return false;
    }
    
    // Email validation
    if (fieldId === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showFieldError($field, 'Please enter a valid email address');
            return false;
        }
    }
    
    // Date validation
    if (fieldId === 'lastVisitDate' && value) {
        if (new Date(value) > new Date()) {
            showFieldError($field, 'Date cannot be in the future');
            return false;
        }
    }
    
    clearFieldError($field);
    return true;
}

/**
 * Show field error
 */
function showFieldError($field, message) {
    $field.addClass('is-invalid');
    $field.siblings('.invalid-feedback').text(message);
}

/**
 * Clear field error
 */
function clearFieldError($field) {
    $field.removeClass('is-invalid');
    $field.siblings('.invalid-feedback').text('');
}

/**
 * Add new patient using AJAX
 */
function addNewPatient() {
    showLoading();
    
    const formData = {
        FirstName: $('#firstName').val().trim(),
        LastName: $('#lastName').val().trim(),
        Email: $('#email').val().trim(),
        NearCity: $('#nearCity').val().trim(),
        Doctor: $('#doctor').val().trim(),
        Guardian: $('#guardian').val().trim(),
        Status: $('#status').val(),
        LastVisitDate: $('#lastVisitDate').val(),
        MedicalConditions: $('#medicalConditions').val().split(',').map(s => s.trim()).filter(s => s),
        Medications: $('#medications').val().split(',').map(s => s.trim()).filter(s => s),
        Allergies: $('#allergies').val().split(',').map(s => s.trim()).filter(s => s)
    };
    
    $.ajax({
        url: `${API_BASE}/patients`,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(formData),
        success: function(response) {
            hideLoading();
            if (response.success) {
                showAlert(`Patient ${response.data.FirstName} ${response.data.LastName} added successfully!`, 'success');
                resetForm();
                
                // Refresh dashboard if it's active
                if ($('#dashboard-tab').hasClass('active')) {
                    loadDashboardData();
                }
            }
        },
        error: function(xhr) {
            hideLoading();
            console.error('Error adding patient:', xhr);
            const errorMessage = xhr.responseJSON?.error || 'Failed to add patient';
            showAlert(errorMessage, 'danger');
        }
    });
}

/**
 * Reset the add patient form
 */
function resetForm() {
    $('#addPatientForm')[0].reset();
    $('#addPatientForm .is-invalid').removeClass('is-invalid');
    $('#addPatientForm .invalid-feedback').text('');
    
    // Set today's date again
    const today = new Date().toISOString().split('T')[0];
    $('#lastVisitDate').val(today);
}

/**
 * Show edit patient modal
 */
function showEditModal() {
    if (!currentPatientId) return;
    
    $.ajax({
        url: `${API_BASE}/patients/${currentPatientId}`,
        method: 'GET',
        success: function(response) {
            if (response.success) {
                populateEditForm(response.data);
                $('#patientModal').modal('hide');
                $('#editPatientModal').modal('show');
            }
        },
        error: function(xhr) {
            showAlert('Failed to load patient data for editing', 'danger');
        }
    });
}

/**
 * Populate edit form with patient data
 */
function populateEditForm(patient) {
    const editFormHtml = `
        <div class="row">
            <div class="col-md-6 mb-3">
                <label for="editFirstName" class="form-label">First Name *</label>
                <input type="text" class="form-control" id="editFirstName" value="${patient.FirstName}" required>
                <div class="invalid-feedback"></div>
            </div>
            <div class="col-md-6 mb-3">
                <label for="editLastName" class="form-label">Last Name *</label>
                <input type="text" class="form-control" id="editLastName" value="${patient.LastName}" required>
                <div class="invalid-feedback"></div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-6 mb-3">
                <label for="editEmail" class="form-label">Email *</label>
                <input type="email" class="form-control" id="editEmail" value="${patient.Email}" required>
                <div class="invalid-feedback"></div>
            </div>
            <div class="col-md-6 mb-3">
                <label for="editNearCity" class="form-label">Nearest City *</label>
                <input type="text" class="form-control" id="editNearCity" value="${patient.NearCity}" required>
                <div class="invalid-feedback"></div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-6 mb-3">
                <label for="editDoctor" class="form-label">Doctor *</label>
                <input type="text" class="form-control" id="editDoctor" value="${patient.Doctor}" required>
                <div class="invalid-feedback"></div>
            </div>
            <div class="col-md-6 mb-3">
                <label for="editGuardian" class="form-label">Guardian *</label>
                <input type="text" class="form-control" id="editGuardian" value="${patient.Guardian}" required>
                <div class="invalid-feedback"></div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-6 mb-3">
                <label for="editStatus" class="form-label">Status *</label>
                <select class="form-select" id="editStatus" required>
                    <option value="Alive" ${patient.Status === 'Alive' ? 'selected' : ''}>Alive</option>
                    <option value="Critical" ${patient.Status === 'Critical' ? 'selected' : ''}>Critical</option>
                    <option value="Stable" ${patient.Status === 'Stable' ? 'selected' : ''}>Stable</option>
                    <option value="Recovering" ${patient.Status === 'Recovering' ? 'selected' : ''}>Recovering</option>
                    <option value="Deceased" ${patient.Status === 'Deceased' ? 'selected' : ''}>Deceased</option>
                </select>
                <div class="invalid-feedback"></div>
            </div>
            <div class="col-md-6 mb-3">
                <label for="editLastVisitDate" class="form-label">Last Visit Date *</label>
                <input type="date" class="form-control" id="editLastVisitDate" value="${patient.LastVisitDate.split('T')[0]}" required>
                <div class="invalid-feedback"></div>
            </div>
        </div>
        <div class="mb-3">
            <label for="editMedicalConditions" class="form-label">Medical Conditions</label>
            <input type="text" class="form-control" id="editMedicalConditions" value="${patient.MedicalConditions ? patient.MedicalConditions.join(', ') : ''}">
        </div>
        <div class="mb-3">
            <label for="editMedications" class="form-label">Medications</label>
            <input type="text" class="form-control" id="editMedications" value="${patient.Medications ? patient.Medications.join(', ') : ''}">
        </div>
        <div class="mb-3">
            <label for="editAllergies" class="form-label">Allergies</label>
            <input type="text" class="form-control" id="editAllergies" value="${patient.Allergies ? patient.Allergies.join(', ') : ''}">
        </div>
    `;
    
    $('#editPatientForm').html(editFormHtml);
}

/**
 * Validate edit form
 */
function validateEditForm() {
    let isValid = true;
    
    const requiredFields = ['editFirstName', 'editLastName', 'editEmail', 'editNearCity', 'editDoctor', 'editGuardian', 'editStatus', 'editLastVisitDate'];
    
    requiredFields.forEach(fieldId => {
        const $field = $(`#${fieldId}`);
        if (!$field.val().trim()) {
            showFieldError($field, 'This field is required');
            isValid = false;
        } else {
            clearFieldError($field);
        }
    });
    
    // Email validation
    const email = $('#editEmail').val().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
        showFieldError($('#editEmail'), 'Please enter a valid email address');
        isValid = false;
    }
    
    return isValid;
}

/**
 * Save patient edit
 */
function savePatientEdit() {
    if (!currentPatientId) return;
    
    showLoading();
    
    const formData = {
        FirstName: $('#editFirstName').val().trim(),
        LastName: $('#editLastName').val().trim(),
        Email: $('#editEmail').val().trim(),
        NearCity: $('#editNearCity').val().trim(),
        Doctor: $('#editDoctor').val().trim(),
        Guardian: $('#editGuardian').val().trim(),
        Status: $('#editStatus').val(),
        LastVisitDate: $('#editLastVisitDate').val(),
        MedicalConditions: $('#editMedicalConditions').val().split(',').map(s => s.trim()).filter(s => s),
        Medications: $('#editMedications').val().split(',').map(s => s.trim()).filter(s => s),
        Allergies: $('#editAllergies').val().split(',').map(s => s.trim()).filter(s => s)
    };
    
    $.ajax({
        url: `${API_BASE}/patients/${currentPatientId}`,
        method: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(formData),
        success: function(response) {
            hideLoading();
            if (response.success) {
                showAlert('Patient updated successfully!', 'success');
                $('#editPatientModal').modal('hide');
                
                // Refresh current view
                if ($('#patients-tab').hasClass('active')) {
                    loadAllPatients(currentPage);
                } else if ($('#dashboard-tab').hasClass('active')) {
                    loadDashboardData();
                }
                
                currentPatientId = null;
            }
        },
        error: function(xhr) {
            hideLoading();
            const errorMessage = xhr.responseJSON?.error || 'Failed to update patient';
            showAlert(errorMessage, 'danger');
        }
    });
}

/**
 * Show delete confirmation
 */
function showDeleteConfirmation() {
    if (!currentPatientId) return;
    
    const confirmHtml = `
        <div class="modal fade" id="deleteConfirmModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-danger text-white">
                        <h5 class="modal-title">Confirm Deletion</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="text-center">
                            <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                            <h5>Are you sure you want to delete this patient?</h5>
                            <p class="text-muted">This action cannot be undone. All patient data will be permanently removed.</p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-danger" onclick="confirmDeletePatient()">
                            <i class="fas fa-trash me-2"></i>Delete Patient
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    $('#deleteConfirmModal').remove();
    
    // Add new modal to body and show
    $('body').append(confirmHtml);
    $('#deleteConfirmModal').modal('show');
}

/**
 * Confirm patient deletion
 */
function confirmDeletePatient() {
    if (!currentPatientId) return;
    
    showLoading();
    
    $.ajax({
        url: `${API_BASE}/patients/${currentPatientId}`,
        method: 'DELETE',
        success: function(response) {
            hideLoading();
            if (response.success) {
                showAlert('Patient deleted successfully', 'success');
                $('#deleteConfirmModal').modal('hide');
                $('#patientModal').modal('hide');
                
                // Refresh current view
                if ($('#patients-tab').hasClass('active')) {
                    loadAllPatients(currentPage);
                } else if ($('#dashboard-tab').hasClass('active')) {
                    loadDashboardData();
                }
                
                currentPatientId = null;
            }
        },
        error: function(xhr) {
            hideLoading();
            const errorMessage = xhr.responseJSON?.error || 'Failed to delete patient';
            showAlert(errorMessage, 'danger');
        }
    });
}

/**
 * Refresh patients list
 */
function refreshPatients() {
    loadAllPatients(currentPage);
    showAlert('Patient list refreshed', 'info', 2000);
}

/**
 * Sort patients
 */
function sortPatients(sortBy, order) {
    loadAllPatients(1, sortBy, order);
}

// Utility functions for external API calls or additional features

/**
 * Export patient data (future feature)
 */
function exportPatients(format = 'json') {
    $.ajax({
        url: `${API_BASE}/patients`,
        method: 'GET',
        success: function(response) {
            if (response.success) {
                const dataStr = JSON.stringify(response.data.patients, null, 2);
                const dataBlob = new Blob([dataStr], {type: 'application/json'});
                
                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(dataBlob);
                link.download = `patients_export_${new Date().toISOString().split('T')[0]}.json`;
                link.click();
                
                showAlert('Patient data exported successfully', 'success');
            }
        },
        error: function(xhr) {
            showAlert('Failed to export patient data', 'danger');
        }
    });
}

/**
 * Print patient report (future feature)
 */
function printPatientReport(patientId) {
    window.open(`/api/patients/${patientId}/report`, '_blank');
}

// Make functions globally available
window.loadAllPatients = loadAllPatients;
window.refreshPatients = refreshPatients;
window.sortPatients = sortPatients;
window.quickSearch = quickSearch;
window.searchTodayVisits = searchTodayVisits;
window.showPatientDetails = showPatientDetails;
window.resetForm = resetForm;
window.confirmDeletePatient = confirmDeletePatient;
window.exportPatients = exportPatients;
window.printPatientReport = printPatientReport;
