let phoneColumn = null; // This will store the detected phone number column
let headers = []; // Store headers globally to use in multiple functions

// Add event listener to handle file input
document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        parseCSV(file);
    }
});

// Function to parse CSV file using PapaParse
function parseCSV(file) {
    Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: function(results) {
            headers = results.meta.fields;
            detectPhoneColumn(headers);
            populateAdditionalFields(headers);
        }
    });
}

// Function to detect the phone number column
function detectPhoneColumn(headers) {
    // Check specifically for "Device 2 Address"
    if (headers.includes('Device 2 Address')) {
        phoneColumn = 'Device 2 Address';
    } else {
        phoneColumn = null; // Default to null if not found
    }
}

// Function to populate additional fields in the dropdown
function populateAdditionalFields(headers) {
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
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please upload a CSV file first.');
        return;
    }

    const firstName = document.getElementById('firstName').value.toLowerCase();
    const lastName = document.getElementById('lastName').value.toLowerCase();

    const showFirstName = document.getElementById('showFirstName').checked;
    const showLastName = document.getElementById('showLastName').checked;
    const showPhoneNumber = document.getElementById('showPhoneNumber').checked;

    // Get selected additional fields
    const additionalFields = Array.from(document.getElementById('additionalFields').selectedOptions)
        .map(option => option.value)
        .slice(0, 5); // Limit to 5 additional fields

    // Clear previous results
    const tableBody = document.getElementById('resultsTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';

    // Use PapaParse to search contacts as we stream the file
    Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        step: function(row) {
            const contact = row.data;
            if (
                (firstName === '' || contact['First Name'].toLowerCase().includes(firstName)) &&
                (lastName === '' || contact['Last Name'].toLowerCase().includes(lastName))
            ) {
                const rowElement = tableBody.insertRow();
                if (showFirstName) rowElement.insertCell().textContent = contact['First Name'];
                if (showLastName) rowElement.insertCell().textContent = contact['Last Name'];
                if (showPhoneNumber) rowElement.insertCell().textContent = contact[phoneColumn];

                additionalFields.forEach(field => {
                    rowElement.insertCell().textContent = contact[field] || '';
                });
            }
        },
        complete: function() {
            console.log('Search completed');
        }
    });
}
