document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('etas-form');
    const downloadPdfButton = document.getElementById('download-pdf');

    // Generate a default QR code on page load
    generateQrCode();

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        updateDocument();
        generateQrCode();
    });

    downloadPdfButton.addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const etasDocument = document.querySelector('.container');

        // Hide form and button for PDF generation
        document.querySelector('.form-container').style.display = 'none';

        html2canvas(etasDocument, { scale: 3 }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [etasDocument.offsetWidth, etasDocument.offsetHeight]
            });
            pdf.addImage(imgData, 'PNG', 0, 0, etasDocument.offsetWidth, etasDocument.offsetHeight);
            pdf.save('eTAS-document.pdf');

            // Show form and button again
            document.querySelector('.form-container').style.display = 'block';
        });
    });

    function updateDocument() {
        document.getElementById('family-name').textContent = document.getElementById('form-family-name').value.toUpperCase() || 'DOE';
        document.getElementById('given-names').textContent = document.getElementById('form-given-names').value.toUpperCase() || 'JOHN';
        document.getElementById('nationality').textContent = document.getElementById('form-nationality').value.toUpperCase() || 'UNITED STATES OF AMERICA';
        document.getElementById('dob').textContent = document.getElementById('form-dob').value || '1990-01-01';
        document.getElementById('pob').textContent = document.getElementById('form-pob').value.toUpperCase() || 'WASHINGTON D.C.';
        document.getElementById('passport-number').textContent = document.getElementById('form-passport-number').value.toUpperCase() || 'P123456789';
        document.getElementById('issue-date').textContent = document.getElementById('form-issue-date').value || '2022-01-01';
        document.getElementById('expiry-date').textContent = document.getElementById('form-expiry-date').value || '2032-01-01';
        document.getElementById('arrival-date').textContent = document.getElementById('form-arrival-date').value || '2024-12-01';

        const photoFile = document.getElementById('form-photo').files[0];
        if (photoFile) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('photo-preview').src = e.target.result;
            }
            reader.readAsDataURL(photoFile);
        }
    }

    function generateQrCode() {
        const data = JSON.stringify({
            etasNumber: document.getElementById('etas-number').textContent,
            familyName: document.getElementById('family-name').textContent,
            givenNames: document.getElementById('given-names').textContent,
            nationality: document.getElementById('nationality').textContent,
            dateOfBirth: document.getElementById('dob').textContent,
            passportNumber: document.getElementById('passport-number').textContent,
        });

        const qrCanvas = document.getElementById('qr-canvas');
        if (!qrCanvas) {
            console.error("QR Canvas not found!");
            return;
        }

        new QRious({
            element: qrCanvas,
            value: data,
            size: 160,
            padding: 0
        });
    }
});