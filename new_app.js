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
        if (header !== 'First Name' && header !== 'Last Name' && header !== 'Phone Number') {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = header;
            checkbox.id = 'field-' + header;

            const label = document.createElement('label');
            label.htmlFor = 'field-' + header;
            label.textContent = header;

            const container = document.createElement('div');
            container.appendChild(checkbox);
            container.appendChild(label);

            checkboxGroup.appendChild(container);
        }
    });
}

function populatePagingFieldSelection(headers) {
    const checkboxGroup = document.getElementById('pagingFieldCheckboxes');
    checkboxGroup.innerHTML = '';

    headers.forEach(header => {
        if (header !== 'First Name' && header !== 'Last Name' && header !== 'Schedule Name') {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = header;
            checkbox.id = 'paging-field-' + header;

            const label = document.createElement('label');
            label.htmlFor = 'paging-field-' + header;
            label.textContent = header;

            const container = document.createElement('div');
            container.appendChild(checkbox);
            container.appendChild(label);

            checkboxGroup.appendChild(container);
        }
    });
}

function toggleFieldSelection() {
    const selection = document.getElementById('fieldCheckboxes');
    selection.style.display = selection.style.display === 'none' ? 'block' : 'none';
}

function togglePagingFieldSelection() {
    const selection = document.getElementById('pagingFieldCheckboxes');
    selection.style.display = selection.style.display === 'none' ? 'block' : 'none';
}

function searchContacts() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const selectedFields = Array.from(document.querySelectorAll('#fieldCheckboxes input[type="checkbox"]:checked')).map(checkbox => checkbox.value);

    const filteredContacts = contacts.filter(contact => {
        const firstName = contact['First Name']?.toLowerCase() || '';
        const lastName = contact['Last Name']?.toLowerCase() || '';
        return firstName.includes(query) || lastName.includes(query) || `${firstName} ${lastName}`.includes(query);
    });

    displayContacts(filteredContacts, selectedFields);
}

function searchPaging() {
    const query = document.getElementById('pagingSearchInput').value.toLowerCase();
    const selectedFields = Array.from(document.querySelectorAll('#pagingFieldCheckboxes input[type="checkbox"]:checked')).map(checkbox => checkbox.value);

    const filteredSchedules = pagingSchedules.filter(schedule => {
        const firstName = schedule['First Name']?.toLowerCase() || '';
        const lastName = schedule['Last Name']?.toLowerCase() || '';
        const scheduleName = schedule['Schedule Name']?.toLowerCase() || '';
        return firstName.includes(query) || lastName.includes(query) || scheduleName.includes(query);
    });

    displayPagingSchedules(filteredSchedules, selectedFields);
}

function displayContacts(contacts, additionalFields) {
    const tableBody = document.getElementById('contactsTableBody');
    tableBody.innerHTML = '';

    contacts.forEach(contact => {
        const row = document.createElement('tr');

        const firstNameCell = document.createElement('td');
        firstNameCell.textContent = contact['First Name'];
        row.appendChild(firstNameCell);

        const lastNameCell = document.createElement('td');
        lastNameCell.textContent = contact['Last Name'];
        row.appendChild(lastNameCell);

        const phoneNumberCell = document.createElement('td');
        phoneNumberCell.textContent = contact['Phone Number'];
        row.appendChild(phoneNumberCell);

        additionalFields.forEach(field => {
            const cell = document.createElement('td');
            cell.textContent = contact[field] || '';
            row.appendChild(cell);
        });

        tableBody.appendChild(row);
    });
}

function displayPagingSchedules(schedules, additionalFields) {
    const tableBody = document.getElementById('pagingTableBody');
    tableBody.innerHTML = '';

    schedules.forEach(schedule => {
        const row = document.createElement('tr');

        const firstNameCell = document.createElement('td');
        firstNameCell.textContent = schedule['First Name'];
        row.appendChild(firstNameCell);

        const lastNameCell = document.createElement('td');
        lastNameCell.textContent = schedule['Last Name'];
        row.appendChild(lastNameCell);

        const scheduleNameCell = document.createElement('td');
        scheduleNameCell.textContent = schedule['Schedule Name'];
        row.appendChild(scheduleNameCell);

        additionalFields.forEach(field => {
            const cell = document.createElement('td');
            cell.textContent = schedule[field] || '';
            row.appendChild(cell);
        });

        tableBody.appendChild(row);
    });
}

function identifyPhoneNumberFields(contact, headers) {
    headers.forEach(header => {
        if (header.toLowerCase().includes('phone') || header.toLowerCase().includes('mobile') || header.toLowerCase().includes('contact')) {
            contact['Phone Number'] = contact[header];
        }
    });
}
