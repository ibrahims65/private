let contacts = []; // This will hold your contact data

// Function to parse CSV and load data
function loadCSV(file) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const csv = event.target.result;
        parseCSV(csv);
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

// Function to search and display contacts
function searchContacts() {
    const firstName = document.getElementById('firstName').value.toLowerCase();
    const lastName = document.getElementById('lastName').value.toLowerCase();

    const showFirstName = document.getElementById('showFirstName').checked;
    const showLastName = document.getElementById('showLastName').checked;
    const showEmail = document.getElementById('showEmail').checked;

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
        if (showEmail) row.insertCell().textContent = contact['Email'];
        // Add more cells based on available fields
    });
}

// Initialize file input
document.getElementById('fileInput').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        loadCSV(file);
    }
});
