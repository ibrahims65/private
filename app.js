let contacts = [];
let additionalFields = [];

document.getElementById('fileInput').addEventListener('change', handleFileSelect);

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const csvData = e.target.result;
        parseCSV(csvData);
    };
    reader.readAsText(file);
}

function parseCSV(data) {
    const rows = data.split('\n').filter(row => row.trim() !== ''); // Filter out empty rows
    if (rows.length < 2) return; // Ensure there's at least one header row and one data row

    const headers = rows[0].split(',').map(header => header.trim()); // Trim headers

    contacts = rows.slice(1).map(row => {
        const values = row.split(',').map(value => value.trim()); // Trim values
        const contact = {};
        headers.forEach((header, index) => {
            contact[header] = values[index] || ''; // Handle missing values
        });

        // Identify phone number fields and their types
        identifyPhoneNumberFields(contact, headers);

        return contact;
    });

    populateFieldSelection(headers);
}

function populateFieldSelection(headers) {
    const checkboxGroup = document.getElementById('fieldCheckboxes');
    checkboxGroup.innerHTML = ''; // Clear existing checkboxes

    headers.forEach(header => {
        if (header !== 'First Name' && header !== 'Last Name' && header !== 'Device 1 Address') {
            const checkboxDiv = document.createElement('div');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = header;
            checkboxDiv.appendChild(checkbox);

            const label = document.createElement('label');
            label.textContent = header;
            checkboxDiv.appendChild(label);

            checkboxGroup.appendChild(checkboxDiv);

            checkbox.addEventListener('change', function() {
                if (this.checked) {
                    additionalFields.push(header);
                } else {
                    additionalFields = additionalFields.filter(field => field !== header);
                }
                if (checkboxGroup.style.display === 'block') {
                    const collapsibleButton = document.getElementById('collapsibleButton');
                    collapsibleButton.textContent = 'Click Here when Done!';
                    collapsibleButton.classList.add('done-button');
                }
            });
        }
    });
}

function searchContacts() {
    const query = document.getElementById('searchInput').value.trim().toLowerCase();
    const queryParts = query.split(',').map(part => part.trim().toLowerCase());

    const results = contacts.filter(contact => {
        const firstName = contact['First Name'] ? contact['First Name'].toLowerCase() : '';
        const lastName = contact['Last Name'] ? contact['Last Name'].toLowerCase() : '';

        if (queryParts.length === 1) {
            // Search with one query part
            return firstName.includes(queryParts[0]) || lastName.includes(queryParts[0]);
        } else if (queryParts.length === 2) {
            // Search with two query parts (first and last name)
            return (
                (firstName.includes(queryParts[0]) && lastName.includes(queryParts[1])) ||
                (firstName.includes(queryParts[1]) && lastName.includes(queryParts[0]))
            );
        }
        return false;
    });

    displayResults(results);
}

function displayResults(results) {
    const tableBody = document.getElementById('contactsTableBody');
    tableBody.innerHTML = ''; // Clear existing results

    if (results.length === 0) {
        const noResultsRow = document.createElement('tr');
        const noResultsCell = document.createElement('td');
        noResultsCell.colSpan = 3;
        noResultsCell.textContent = 'No contacts found.';
        noResultsRow.appendChild(noResultsCell);
        tableBody.appendChild(noResultsRow);
        return;
    }

    results.forEach(contact => {
        const row = document.createElement('tr');

        const firstNameCell = document.createElement('td');
        firstNameCell.textContent = contact['First Name'] || '';
        row.appendChild(firstNameCell);

        const lastNameCell = document.createElement('td');
        lastNameCell.textContent = contact['Last Name'] || '';
        row.appendChild(lastNameCell);

        // Add a cell for phone numbers
        const phoneNumberCell = document.createElement('td');
        const phoneNumbers = getPhoneNumbers(contact);
        phoneNumberCell.textContent = phoneNumbers.join(', ') || 'No phone number';
        row.appendChild(phoneNumberCell);

        additionalFields.forEach(field => {
            const additionalCell = document.createElement('td');
            additionalCell.textContent = contact[field] || '';
            row.appendChild(additionalCell);
        });

        tableBody.appendChild(row);
    });
}

function getPhoneNumbers(contact) {
    const phoneNumberPatterns = [
        /\b\d{3}[-/]\d{3}[-/]\d{4}\b/g,  // e.g., 555-555-5555
        /\b\d{3}[-/]\d{4}\b/g,           // e.g., 555-5555
        /\b\d{3}[-/]\d{3}[-/]\d{4}\b/g,  // e.g., 555-555-5555
        /\b\d{3}\/\d{6}\b/g,              // e.g., 555/555555
        /\b\d{3}\/\d{3}[-/]\d{4}\b/g     // e.g., 555/555-5555
    ];

    const phoneNumbers = [];

    for (const [key, value] of Object.entries(contact)) {
        if (value) {
            phoneNumberPatterns.forEach(pattern => {
                const matches = value.match(pattern);
                if (matches) {
                    phoneNumbers.push(...matches);
                }
            });
        }
    }

    return phoneNumbers;
}

function identifyPhoneNumberFields(contact, headers) {
    const phoneNumberPatterns = [
        /\b\d{3}[-/]\d{3}[-/]\d{4}\b/g,  // e.g., 555-555-5555
        /\b\d{3}[-/]\d{4}\b/g,           // e.g., 555-5555
        /\b\d{3}[-/]\d{3}[-/]\d{4}\b/g,  // e.g., 555-555-5555
        /\b\d{3}\/\d{6}\b/g,              // e.g., 555/555555
        /\b\d{3}\/\d{3}[-/]\d{4}\b/g     // e.g., 555/555-5555
    ];

    headers.forEach(header => {
        const value = contact[header];
        if (value && phoneNumberPatterns.some(pattern => pattern.test(value))) {
            console.log(`Phone number detected in field '${header}': ${value}`);

            // Determine if it is a home, cell, or sms based on header naming conventions
            const normalizedHeader = header.toLowerCase();
            if (normalizedHeader.includes('home')) {
                console.log(`The field '${header}' seems to be a home phone number.`);
            } else if (normalizedHeader.includes('cell') || normalizedHeader.includes('mobile')) {
                console.log(`The field '${header}' seems to be a cell phone number.`);
            } else if (normalizedHeader.includes('sms')) {
                console.log(`The field '${header}' seems to be an SMS number.`);
            } else {
                console.log(`The field '${header}' may contain a phone number but its type is unknown.`);
            }
        }
    });
}

function toggleFieldSelection() {
    const checkboxGroup = document.getElementById('fieldCheckboxes');
    const collapsibleButton = document.getElementById('collapsibleButton');

    if (checkboxGroup.style.display === 'none' || checkboxGroup.style.display === '') {
        checkboxGroup.style.display = 'block';
        collapsibleButton.textContent = 'Click Here when Done!';
        collapsibleButton.classList.add('done-button');
    } else {
        checkboxGroup.style.display = 'none';
        collapsibleButton.textContent = 'Select Additional Fields';
        collapsibleButton.classList.remove('done-button');
    }
}
