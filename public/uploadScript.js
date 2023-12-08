document.getElementById('upload-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    const formData = new FormData(this);
    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });
        const filteredText = await response.text();
        const txtPDF = document.querySelector('#txtPDF');
        txtPDF.textContent = filteredText;
        txtPDF.readOnly = true;  // Make the textarea non-editable
    } catch (error) {
        console.error('Error:', error);
    }
});

document.getElementById('prompt-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    const formData = new FormData(this);
    try {
        const response = await fetch('/execute', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(
            { txtPrompt: document.querySelector('#txtPrompt2').value}
            )
        });
        let filteredText = await response.text();
        filteredText = filteredText.replace(/\\n/g, "<br>");
        //remove quotes at the start and end of the string
        filteredText = filteredText.substring(1, filteredText.length - 1);
        document.getElementById('txtRespChoice').innerHTML = filteredText;
    } catch (error) {
        console.error('Error:', error);
    }
});