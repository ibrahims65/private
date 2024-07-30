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
                console.log('Contacts loaded:', contacts);
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

// Search contacts by first name and last name
function searchContacts() {
    const query = document.getElementById("searchInput").value.toLowerCase().trim();
    
    if (!contacts || contacts.length === 0) {
        alert("Please load a CSV file first.");
        return;
    }

    if (query === '') {
        alert("Please enter a search term.");
        return;
    }

    // Split query into parts
    const queryParts = query.split(/\s+/);

    // Search for contacts matching any combination of first and last names
    const results = contacts.filter(contact => {
        const firstName = String(contact['First Name']).toLowerCase();
        const lastName = String(contact['Last Name']).toLowerCase();

        return queryParts.some(part => 
            firstName.includes(part) || lastName.includes(part)
        );
    });

    displayResults(results);
}

// Display the search results in the table
function displayResults(results) {
    const tableBody = document.getElementById("contactTableBody");
    tableBody.innerHTML = ""; // Clear previous results

    if (results.length === 0) {
        const noResultsRow = document.createElement("tr");
        noResultsRow.innerHTML = `<td colspan="${3 + additionalFields.length}">No contacts found.</td>`;
        tableBody.appendChild(noResultsRow);
        return;
    }

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

// Collapsible logic
function toggleFieldSelection() {
    const checkboxGroup = document.getElementById('fieldCheckboxes');
    checkboxGroup.style.display = checkboxGroup.style.display === 'block' ? 'none' : 'block';
}
