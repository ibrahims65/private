let contacts = [];
let additionalFields = [];
let headers = [];

// File input for contacts CSV
document.getElementById('fileInput').addEventListener('change', handleFileSelect);

// File input for additional spreadsheet
document.getElementById('excelFileInput').addEventListener('change', handleExcelFileSelect);

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

    headers = rows[0].split(',').map(header => header.trim()); // Trim headers

    contacts = rows.slice(1).map(row => {
        const values = row.split(',').map(value => value.trim()); // Trim values
        const contact = {};
        headers.forEach((header, index) => {
            contact[header] = values[index] || ''; // Handle missing values
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
    const query = document.getElementById('nameSearchInput').value.trim().toLowerCase();
    const queryParts = query.split(',').map(part => part.trim().toLowerCase());

    const results = contacts.filter(contact => {
        const firstName = contact['First Name'] ? contact['First Name'].toLowerCase() : '';
        const lastName = contact['Last Name'] ? contact['Last Name'].toLowerCase() : '';

        return queryParts.some(part => {
            const nameParts = part.split(' ').filter(Boolean); // Split on spaces and filter out empty parts
            if (nameParts.length === 1) {
                return firstName.includes(nameParts[0]) || lastName.includes(nameParts[0]);
            } else if (nameParts.length === 2) {
                return (
                    (firstName.includes(nameParts[0]) && lastName.includes(nameParts[1])) ||
                    (firstName.includes(nameParts[1]) && lastName.includes(nameParts[0]))
                );
            }
            return false;
        });
    });

    displayResults(results);
}

function displayResults(results) {
    const tableBody = document.getElementById('contactsTableBody');
    tableBody.innerHTML = ''; // Clear previous results

    results.forEach(contact => {
        const row = document.createElement('tr');

        const firstNameCell = document.createElement('td');
        firstNameCell.textContent = contact['First Name'] || '';
        row.appendChild(firstNameCell);

        const lastNameCell = document.createElement('td');
        lastNameCell.textContent = contact['Last Name'] || '';
        row.appendChild(lastNameCell);

        const phoneNumberCell = document.createElement('td');
        phoneNumberCell.textContent = contact['Device 1 Address'] || '';
        row.appendChild(phoneNumberCell);

        additionalFields.forEach(field => {
            const fieldCell = document.createElement('td');
            fieldCell.textContent = contact[field] || '';
            row.appendChild(fieldCell);
        });

        tableBody.appendChild(row);
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

function handleExcelFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        const csvData = XLSX.utils.sheet_to_csv(worksheet);
        const blob = new Blob([csvData], { type: 'text/csv' });
        const fileURL = URL.createObjectURL(blob);

        openSpreadsheetInIframe(fileURL);
    };
    reader.readAsArrayBuffer(file);
}

function openSpreadsheetInIframe(fileURL) {
    const iframeContainer = document.getElementById('iframeContainer');
    const spreadsheetIframe = document.getElementById('spreadsheetIframe');
    spreadsheetIframe.src = fileURL; // Set iframe src to file URL
    iframeContainer.style.display = 'block'; // Show iframe container
}

function toggleSpreadsheetVisibility() {
    const spreadsheetContainer = document.getElementById('spreadsheetContainer');
    if (spreadsheetContainer.classList.contains('minimized')) {
        spreadsheetContainer.classList.remove('minimized');
    } else {
        spreadsheetContainer.classList.add('minimized');
    }
}
