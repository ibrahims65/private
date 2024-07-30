document.getElementById('contactsFileInput').addEventListener('change', handleFileSelect, false);
document.getElementById('excelFileInput').addEventListener('change', handleHtmlFileSelect, false);

let contacts = [];
let additionalFields = [];

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const csv = e.target.result;
        parseCSV(csv);
    };
    reader.readAsText(file);
}

function parseCSV(csv) {
    const rows = csv.split('\n');
    const header = rows[0].split(',');
    contacts = rows.slice(1).map(row => {
        const data = row.split(',');
        return header.reduce((obj, key, index) => {
            obj[key] = data[index] ? data[index].trim() : '';
            return obj;
        }, {});
    });

    populateFieldSelection(header);
}

function populateFieldSelection(header) {
    const checkboxGroup = document.getElementById('fieldCheckboxes');
    checkboxGroup.innerHTML = '';

    header.forEach(field => {
        if (field === 'FirstName' || field === 'LastName' || field === 'Device 1 Address') return;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = field;
        checkbox.id = `field-${field}`;
        checkbox.onchange = handleFieldChange;

        const label = document.createElement('label');
        label.htmlFor = `field-${field}`;
        label.textContent = field;

        const div = document.createElement('div');
        div.appendChild(checkbox);
        div.appendChild(label);

        checkboxGroup.appendChild(div);
    });
}

function handleFieldChange(event) {
    const field = event.target.value;
    if (event.target.checked) {
        additionalFields.push(field);
    } else {
        additionalFields = additionalFields.filter(f => f !== field);
    }
    displayContacts([]);
}

function searchContacts() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase().trim();
    const searchTerms = searchInput.split(',').map(term => term.trim());

    const filteredContacts = contacts.filter(contact => {
        return searchTerms.some(term => {
            const fullName = `${contact.FirstName} ${contact.LastName}`.toLowerCase();
            const reversedName = `${contact.LastName} ${contact.FirstName}`.toLowerCase();
            return (
                fullName.includes(term) ||
                reversedName.includes(term) ||
                contact.FirstName.toLowerCase().includes(term) ||
                contact.LastName.toLowerCase().includes(term)
            );
        });
    });

    displayContacts(filteredContacts);
}

function displayContacts(contactList) {
    const tableBody = document.getElementById('resultsTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';

    contactList.forEach(contact => {
        const row = document.createElement('tr');

        const firstNameCell = document.createElement('td');
        firstNameCell.textContent = contact.FirstName || '';
        row.appendChild(firstNameCell);

        const lastNameCell = document.createElement('td');
        lastNameCell.textContent = contact.LastName || '';
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

function handleHtmlFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const htmlContent = e.target.result;
        const fileURL = URL.createObjectURL(new Blob([htmlContent], { type: 'text/html' }));
        openSpreadsheetInIframe(fileURL);
    };
    reader.readAsText(file);
}

function openSpreadsheetInIframe(fileURL) {
    const spreadsheetContainer = document.getElementById('spreadsheetContainer');
    const spreadsheetIframe = document.getElementById('spreadsheetIframe');
    spreadsheetIframe.src = fileURL; // Set iframe src to file URL
    spreadsheetContainer.style.display = 'block'; // Show iframe container
}

function toggleSpreadsheetVisibility() {
    const spreadsheetContainer = document.getElementById('spreadsheetContainer');
    if (spreadsheetContainer.style.display === 'none' || spreadsheetContainer.style.display === '') {
        spreadsheetContainer.style.display = 'block';
    } else {
        spreadsheetContainer.style.display = 'none';
    }
}
