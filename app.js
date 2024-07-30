let contacts = [];
let additionalFields = [];

// Load the CSV file using PapaParse
document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        Papa.parse(file, {
            header: true,
            dynamicTyping: true,
            complete: function(results) {
                contacts = results.data;
                populateFieldCheckboxes(results.meta.fields);
            }
        });
    }
});

// Populate checkboxes for additional fields
function populateFieldCheckboxes(fields) {
    const checkboxContainer = document.getElementById('fieldCheckboxes');
    checkboxContainer.innerHTML = ''; // Clear previous checkboxes

    fields.forEach(field => {
        if (field !== 'First Name' && field !== 'Last Name' && field !== 'Device 1 Address') {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = field;
            checkbox.id = field;
            checkbox.onchange = updateAdditionalFields;

            const label = document.createElement('label');
            label.htmlFor = field;
            label.textContent = field;

            const div = document.createElement('div');
            div.appendChild(checkbox);
            div.appendChild(label);

            checkboxContainer.appendChild(div);
        }
    });
}

// Update additional fields to display based on selected checkboxes
function updateAdditionalFields() {
    additionalFields = Array.from(document.querySelectorAll('#fieldCheckboxes input:checked'))
                             .map(checkbox => checkbox.value);
}

// Search contacts by first name, last name, phone number, or phone-like strings
function searchContacts() {
    const query = document.getElementById("searchInput").value.toLowerCase();
    const phoneRegex = /\b(?:\d{3}[-/]\d{2,4}[-/]\d{4}|\d{3}[-]\d{3}[-]\d{4})\b/;
    const results = contacts.filter(contact => 
        (contact['First Name'] && contact['First Name'].toLowerCase().includes(query)) || 
        (contact['Last Name'] && contact['Last Name'].toLowerCase().includes(query)) ||
        (contact['Device 1 Address'] && contact['Device 1 Address'].toString().toLowerCase().includes(query)) ||
        Object.values(contact).some(value => phoneRegex.test(value))
    );
    displayResults(results);
}

// Display the search results in the table
function displayResults(results) {
    const tableBody = document.getElementById("contactTableBody");
    tableBody.innerHTML = ""; // Clear previous results

    results.forEach(contact => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${contact['First Name'] || ''}</td>
            <td>${contact['Last Name'] || ''}</td>
            <td>${contact['Device 1 Address'] || ''}</td>
        `;

        // Add additional fields to the row
        additionalFields.forEach(field => {
            const cell = document.createElement("td");
            cell.textContent = contact[field] || '';
            row.appendChild(cell);
        });

        tableBody.appendChild(row);
    });
}
