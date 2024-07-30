let contacts = []; // This will hold your contact data
let phoneColumn = null; // This will store the detected phone number column
let additionalFields = []; // Store selected additional fields

// Function to parse CSV and load data
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

// Function to parse CSV data into contacts array
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
    searchContacts();
}

// Function to detect the column most likely containing phone numbers
function detectPhoneColumn() {
    if (contacts.length === 0) return;

    const sampleSize = Math.min(contacts.length, 100); // Sample size for detection
    const headers = Object.keys(contacts[0]);
    const phonePattern = /^\+?[0-9\s\-()]+$/; // Simple regex for phone numbers

    // Prioritize checking the specific field first
    if (headers.includes('BT Labeled Device 2 Address')) {
        phoneColumn = 'BT Labeled Device 2 Address';
        return;
    }

    // Fallback to regex detection
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

// Function to populate the additional fields dropdown
function populateAdditionalFields() {
    const headers = Object.keys(contacts[0]);
    const dropdown = document.getElementById('
