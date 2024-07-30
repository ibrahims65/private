let contacts = []; // This will hold your contact data
let phoneColumn = null; // This will store the detected phone number column

// Add event listener to handle file input
document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        loadCSV(file);
    }
});

// Function to load CSV file
function loadCSV(file) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const csv = event.target.result;
        parseCSV(csv);
        detectPhoneColumn();
        populateAdditionalFields();
    };
    reader.readAsText(file);
}

// Function to parse CSV data
function parseCSV(csv) {
    const lines = csv.split('\n').filter(line => line.trim() !== ''); // Remove empty lines
    const headers = lines[0].split(',').map(header => header.trim());

    contacts = lines.slice(1).map(line => {
        const values = line.split(',').map(value => value.trim());
        let contact = {};
        headers.forEach((header, index) => {
            contact[header] = values[index];
        });
        return contact;
    });

    // Optionally, clear the search fields and results
    document.getElementById('firstName').value = '';
    document.getElementById('lastName').value = '';
    searchContacts(); // Initial display (optional)
}

// Function to detect the phone number column
function detectPhoneColumn() {
    if (contacts.length === 0) return;

    const headers = Object.keys(contacts[0]);

    // Check specifically for "Device 2 Address"
    if (headers.includes('Device 2 Address')) {
        phoneColumn = 'Device 2 Address';
        return;
    }

    // Fallback to other potential headers if needed
    const phonePattern = /^\+?[0-9\s\-()]+$/; // Simple regex for phone numbers
    const sampleSize = Math.min(contacts.length, 100); // Sample size for detection

    headers.forEach(header => {
        let isPhoneColumn = false;

        for (let i = 0; i < sampleSize; i++) {
            const value = contacts[i][header];
            if (value && phonePattern.test(value)) {
                isPhoneColumn = true;
                break;
            }
        }

        if (isPhoneColumn) {
            phoneColumn = header;
        }
    });
}

// Function to populate additional fields in the dropdown
function populateAdditionalFields() {
    const headers = Object.keys(contacts[0]);
    const dropdown = document.getElementById('additionalFields');
    dropdown.innerHTML = ''; // Clear existing options

    headers.forEach(header => {
        if (header !== 'First Name' && header !== 'Last Name' && header !== phoneColumn) {
            const option = document.createElement('option');
            option.value = header;
            option.textContent = header;
            dropdown.appendChild(option);
        }
    });
}

// Function to search and display contacts
function searchContacts() {
    const firstName = document.getElementById('firstName').value.toLowerCase();
    const lastName = document.getElementById('lastName').value.toLowerCase();

    const showFirstName = document.getElementById('showFirstName').checked;
    const showLastName = document.getElementById('showLastName').checked;
    const showPhoneNumber = document.getElementById('showPhoneNumber').checked;

    // Get selected additional fields
    const additionalFields = Array.from(document.getElementById('additionalFields').selectedOptions)
        .map(option => option.value)
        .slice(0, 5); // Limit to 5 additional fields

    const results = contacts.filter(contact =>
        (firstName === '' || contact['First Name'].toLowerCase().includes(firstName)) &&
        (lastName === '' || contact['Last Name'].toLowerCase().includes(lastName))
    );

    const tableBody = document.getElementById('resultsTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';

    results.forEach(contact => {
        const row = tableBody.insertRow();
        if (showFirstName) row.insertCell().textContent = contact['First Name'];
        if (showLastName) row.insertCell().textContent = contact['Last Name'];
        if (showPhoneNumber) row.insertCell().textContent = contact[phoneColumn];
        
        additionalFields.forEach(field => {
            row.insertCell().textContent = contact[field] || '';
        });
    });
}
