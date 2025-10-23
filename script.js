document.addEventListener('DOMContentLoaded', () => {
    // Select all input elements in the sidebar
    const inputs = document.querySelectorAll('.sidebar input');

    // Function to update the document preview
    const updateDocument = () => {
        let qrText = '';
        inputs.forEach(input => {
            // Get the corresponding element in the document
            const docElementId = 'doc-' + input.id.replace('input-', '');
            const docElement = document.getElementById(docElementId);

            if (docElement) {
                // Update text content for non-file inputs
                if (input.type !== 'file') {
                    docElement.textContent = input.value;
                }
            }

            // Aggregate data for the QR code
            if (input.type !== 'file' && input.value) {
                qrText += `${input.previousElementSibling.textContent}: ${input.value}\n`;
            }
        });

        // Generate QR Code
        const qrCodeContainer = document.getElementById('doc-qr-code');
        qrCodeContainer.innerHTML = ''; // Clear previous QR code
        new QRCode(qrCodeContainer, {
            text: qrText.trim(),
            width: 160,
            height: 160,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });
    };

    // Add event listeners to all inputs to update the document on change
    inputs.forEach(input => {
        if (input.type === 'file') {
            input.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        document.getElementById('doc-photo').src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });
        } else {
            input.addEventListener('keyup', updateDocument);
        }
    });

    // Initial call to populate the document with default values
    updateDocument();
});
