let contacts = [];
let additionalFields = [];

let pagingSchedules = [];
let pagingAdditionalFields = [];

document.getElementById('fileInput').addEventListener('change', handleFileSelect);
document.getElementById('pagingFileInput').addEventListener('change', handlePagingFileSelect);

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const csvData = e.target.result;
        parseCSV(csvData);
    };
    reader.readAsText(file);
}

function handlePagingFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const csvData = e.target.result;
        parsePagingCSV(csvData);
    };
    reader.readAsText(file);
}

function parseCSV(data) {
    const rows = data.split('\n').filter(row => row.trim() !== '');
    if (rows.length < 2) return;

    const headers = rows[0].split(',').map(header => header.trim());

    contacts = rows.slice(1).map(row => {
        const values = row.split(',').map(value => value.trim());
        const contact = {};
        headers.forEach((header, index) => {
            contact[header] = values[index] || '';
        });

        identifyPhoneNumberFields(contact, headers);

        return contact;
    });

    populateFieldSelection(headers);
}

function parsePagingCSV(data) {
    const rows = data.split('\n').filter(row => row.trim() !== '');
    if (rows.length < 2) return;

    const headers = rows[0].split(',').map(header => header.trim());

    pagingSchedules = rows.slice(1).map(row => {
        const values = row.split(',').map(value => value.trim());
        const schedule = {};
        headers.forEach((header, index) => {
            schedule[header] = values[index] || '';
        });

        identifyPhoneNumberFields(schedule, headers);

        return schedule;
    });

    populatePagingFieldSelection(headers);
}

function populateFieldSelection(headers) {
    const checkboxGroup = document.getElementById('fieldCheckboxes');
    checkboxGroup.innerHTML = '';

    headers.forEach(header => {
        if (header !== 'First Name' && header !== 'Last Name' && header !== 'Device 1 Address') {
            const checkboxDiv = document.createElement('div');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = header;
            checkbox.checked = additionalFields.includes(header);
            checkbox.addEventListener('change', () => {
                toggleAdditionalField(header, checkbox.checked);
            });

            checkboxDiv.appendChild(checkbox);
            checkboxDiv.appendChild(document.createTextNode(header));
            checkboxGroup.appendChild(checkboxDiv);
        }
    });
}

function populatePagingFieldSelection(headers) {
    const checkboxGroup = document.getElementById('pagingFieldCheckboxes');
    checkboxGroup.innerHTML = '';

    headers.forEach(header => {
        if (header !== 'First Name' && header !== 'Last Name' && header !== 'Device 1 Address') {
            const checkboxDiv = document.createElement('div');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = header;
            checkbox.checked = pagingAdditionalFields.includes(header);
            checkbox.addEventListener('change', () => {
                togglePagingAdditionalField(header, checkbox.checked);
            });

            checkboxDiv.appendChild(checkbox);
            checkboxDiv.appendChild(document.createTextNode(header));
            checkboxGroup.appendChild(checkboxDiv);
        }
    });
}

function toggleAdditionalField(field, isChecked) {
    if (isChecked) {
        additionalFields.push(field);
    } else {
        additionalFields = additionalFields.filter(f => f !== field);
    }
}

function togglePagingAdditionalField(field, isChecked) {
    if (isChecked) {
        pagingAdditionalFields.push(field);
    } else {
        pagingAdditionalFields = pagingAdditionalFields.filter(f => f !== field);
    }
}

function searchContacts() {
    const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
    const searchTerms = searchTerm.split(',').map(term => term.trim());
    
    const results = contacts.filter(contact => {
        return searchTerms.some(term => {
            const [firstName, lastName] = term.split(' ').map(t => t.trim().toLowerCase());
            return (
                (contact['First Name'].toLowerCase() === firstName && contact['Last Name'].toLowerCase() === lastName) ||
                (contact['First Name'].toLowerCase() === lastName && contact['Last Name'].toLowerCase() === firstName)
            );
        });
    });
    displayContacts(results);
}

function searchPaging() {
    const searchTerm = document.getElementById('pagingSearchInput').value.trim().toLowerCase();
    const searchTerms = searchTerm.split(',').map(term => term.trim());
    
    const results = pagingSchedules.filter(schedule => {
        return searchTerms.some(term => {
            const [firstName, lastName] = term.split(' ').map(t => t.trim().toLowerCase());
            return (
                (schedule['First Name'].toLowerCase() === firstName && schedule['Last Name'].toLowerCase() === lastName) ||
                (schedule['First Name'].toLowerCase() === lastName && schedule['Last Name'].toLowerCase() === firstName) ||
                (schedule['ScheduleName'].toLowerCase() === term.toLowerCase())
            );
        });
    });
    displayPaging(results);
}

function displayContacts(results) {
    const tableBody = document.getElementById('contactsTableBody');
    tableBody.innerHTML = '';

    results.forEach(contact => {
        const row = document.createElement('tr');

        row.appendChild(createCell(contact['First Name']));
        row.appendChild(createCell(contact['Last Name']));
        row.appendChild(createCell(contact['Device 1 Address']));

        additionalFields.forEach(field => {
            row.appendChild(createCell(contact[field]));
        });

        tableBody.appendChild(row);
    });
}

function displayPaging(results) {
    const tableBody = document.getElementById('pagingTableBody');
    tableBody.innerHTML = '';

    results.forEach(schedule => {
        const row = document.createElement('tr');

        row.appendChild(createCell(schedule['First Name']));
        row.appendChild(createCell(schedule['Last Name']));
        row.appendChild(createBoldCell(schedule['ScheduleName']));

        pagingAdditionalFields.forEach(field => {
            row.appendChild(createCell(schedule[field]));
        });

        tableBody.appendChild(row);
    });
}

function createCell(text) {
    const cell = document.createElement('td');
    cell.textContent = text || '';
    return cell;
}

function createBoldCell(text) {
    const cell = document.createElement('td');
    cell.innerHTML = `<strong>${text || ''}</strong>`;
    return cell;
}

function toggleFieldSelection() {
    const checkboxGroup = document.getElementById('fieldCheckboxes');
    checkboxGroup.style.display = checkboxGroup.style.display === 'none' ? 'block' : 'none';
}

function togglePagingFieldSelection() {
    const checkboxGroup = document.getElementById('pagingFieldCheckboxes');
    checkboxGroup.style.display = checkboxGroup.style.display === 'none' ? 'block' : 'none';
}

function identifyPhoneNumberFields(contact, headers) {
    headers.forEach(header => {
        if (header.toLowerCase().includes('phone') || header.toLowerCase().includes('mobile')) {
            contact['Device 1 Address'] = contact[header];
        }
    });
}
