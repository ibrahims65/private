document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('search-button').addEventListener('click', searchContacts);
    document.getElementById('pagingSearchButton').addEventListener('click', searchPaging);
    document.getElementById('fileInput').addEventListener('change', handleFileSelect);
    document.getElementById('pagingFileInput').addEventListener('change', handlePagingFileSelect);
});

let contacts = [];
let pagingSchedules = [];

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

function toggleFieldSelection(checkboxGroupId) {
    const selection = document.getElementById(checkboxGroupId);
    selection.style.display = selection.style.display === 'none' ? 'block' : 'none';
}

function toggleSearchSection() {
    const searchSection = document.getElementById('search-section');
    searchSection.style.display = searchSection.style.display === 'none' ? 'block' : 'none';
}

function searchContacts() {
    const query = document.getElementById('search-input').value.toLowerCase();
    const selectedFields = Array.from(document.querySelectorAll('#fieldCheckboxes input[type="checkbox"]:checked')).map(checkbox => checkbox.value);

    const filteredContacts = contacts.filter(contact => {
        const firstName = contact['First Name']?.toLowerCase() || '';
        const lastName = contact['Last Name']?.toLowerCase() || '';
        return (
            query.split(',').some(q => 
                firstName.includes(q.trim()) || 
                lastName.includes(q.trim()) || 
                `${firstName} ${lastName}`.includes(q.trim()) || 
                `${lastName} ${firstName}`.includes(q.trim())
            )
        );
    });

    displayResults(filteredContacts, selectedFields);
}

function searchPaging() {
    const query = document.getElementById('pagingSearchInput').value.toLowerCase();
    const selectedFields = Array.from(document.querySelectorAll('#pagingFieldCheckboxes input[type="checkbox"]:checked')).map(checkbox => checkbox.value);

    const filteredSchedules = pagingSchedules.filter(schedule => {
        const firstName = schedule['First Name']?.toLowerCase() || '';
        const lastName = schedule['Last Name']?.toLowerCase() || '';
        const scheduleName = schedule['Schedule Name']?.toLowerCase() || '';
        return (
            query.split(',').some(q => 
                firstName.includes(q.trim()) || 
                lastName.includes(q.trim()) || 
                scheduleName.includes(q.trim()) || 
                `${firstName} ${lastName}`.includes(q.trim()) || 
                `${lastName} ${firstName}`.includes(q.trim())
            )
        );
    });

    displayPagingSchedules(filteredSchedules, selectedFields);
}

function displayResults(results, additionalFields) {
    const tbody = document.getElementById('results-table').querySelector('tbody');
    tbody.innerHTML = '';
    results.forEach(contact => {
        const row = tbody.insertRow();
        row.insertCell().textContent = contact['First Name'] || '';
        row.insertCell().textContent = contact['Last Name'] || '';
        row.insertCell().textContent = contact['Phone Number'] || '';
        additionalFields.forEach(field => {
            row.insertCell().textContent = contact[field] || '';
        });
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
            contact['Phone Number'] = contact[header] || '';
        }
    });
}

function openLink(action) {
    let url;
    switch(action) {
        case 'webex':
            url = 'https://webex.com';
            break;
        case 'conference':
            url = 'tel:800-CONFERENCE-BRIDGE';
            break;
        case 'mir3':
            url = 'https://mir3.com';
            break;
        case 'noc-log':
            url = 'path/to/noc-log.xlsx';
            break;
        case 'app-recovery':
            url = 'path/to/recovery-roll-call.docx';
            break;
        default:
            console.log('Unknown action');
            return;
    }
    window.open(url, '_blank');
}

function openWebexLine() {
    const selectedLine = document.getElementById('toc-line-select').value;
    alert(`Opening ${selectedLine} Webex line.`);
    // Here, integrate the logic for opening the actual Webex line.
}

function markComplete(stepId) {
    const step = document.getElementById(stepId);
    if (step) {
        step.classList.add('completed');
        const completeBtn = step.querySelector('.complete-btn');
        if (completeBtn) {
            completeBtn.textContent = 'Completed';
            completeBtn.disabled = true;
        }
    }
}