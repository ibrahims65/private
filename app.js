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

    // Change the button text and style after selection
    const collapsibleButton = document.getElementById('collapsibleButton');
    collapsibleButton.textContent = 'Click Here when Done!';
    collapsibleButton.classList.add('done-button');
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

    // Ensure we have exactly two parts for first and last names
    if (queryParts.length !== 2) {
        alert("Please enter both first and last names.");
        return;
    }

    const [part1, part2] = queryParts;

    // Search for contacts matching first and last names in any order
    const results = contacts.filter(contact => {
        const firstName = String(contact['First Name']).toLowerCase();
        const lastName = String(contact['Last Name']).toLowerCase();

        // Check if the query matches first and last names in any order
        return (
            (firstName.includes(part1) && lastName.includes(part2)) ||
            (firstName.includes(part2) && lastName.includes(part1))
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
        const noResultsCell = document.createElement("td");
        noResultsCell.colSpan = 3;
        noResultsCell.textContent = "No contacts found.";
        noResultsRow.appendChild(noResultsCell);
        tableBody.appendChild(noResultsRow);
        return;
    }

    results.forEach(contact => {
        const row = document.createElement("tr");

        const firstNameCell = document.createElement("td");
        firstNameCell.textContent = contact['First Name'] || '';
        row.appendChild(firstNameCell);

        const lastNameCell = document.createElement("td");
        lastNameCell.textContent = contact['Last Name'] || '';
        row.appendChild(lastNameCell);

        const phoneCell = document.createElement("td");
        phoneCell.textContent = contact['Device 1 Address'] || '';
        row.appendChild(phoneCell);

        // Add additional fields if selected
        additionalFields.forEach(field => {
            const fieldCell = document.createElement("td");
            fieldCell.textContent = contact[field] || '';
            row.appendChild(fieldCell);
        });

        tableBody.appendChild(row);
    });
}

// Toggle field selection display
function toggleFieldSelection() {
    const checkboxGroup = document.getElementById('fieldCheckboxes');
    if (checkboxGroup.style.display === 'block') {
        checkboxGroup.style.display = 'none';
    } else {
        checkboxGroup.style.display = 'block';
    }

    // Reset button text and style when toggled
    const collapsibleButton = document.getElementById('collapsibleButton');
    if (checkboxGroup.style.display === 'block') {
        collapsibleButton.textContent = 'Select Additional Fields';
        collapsibleButton.classList.remove('done-button');
    }
}
