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
    const rows = data.split('\n');
    const headers = rows[0].split(',');

    contacts = rows.slice(1).map(row => {
        const values = row.split(',');
        const contact = {};
        headers.forEach((header, index) => {
            contact[header.trim()] = values[index].trim();
        });
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
    const queryParts = query.split(' ');

    const results = contacts.filter(contact => {
        const firstName = contact['First Name'].toLowerCase();
        const lastName = contact['Last Name'].toLowerCase();

        return (
            (queryParts.includes(firstName) && queryParts.includes(lastName)) ||
            (queryParts.includes(lastName) && queryParts.includes(firstName))
        );
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
        row
