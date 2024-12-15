document.addEventListener('DOMContentLoaded', function() {
    const editor = document.getElementById('editor');
    if (!editor) return;
    
    const wordCountDisplay = document.createElement('div');
    wordCountDisplay.className = 'text-muted small mt-2';
    editor.parentElement.appendChild(wordCountDisplay);

    editor.addEventListener('input', function() {
        const words = editor.innerText.trim().split(/\s+/).length;
        wordCountDisplay.textContent = `${words} palavras`;
        localStorage.setItem('editorContent', editor.innerHTML);
    });

    window.execCommand = function(command, value = null) {
        editor.focus();
        document.execCommand(command, false, value);
        localStorage.setItem('editorContent', editor.innerHTML);
    }

    window.setFontSize = function(size) {
        editor.focus();
        document.execCommand('fontSize', false, size);
        localStorage.setItem('editorContent', editor.innerHTML);
    }

    window.addMedicalSignature = function() {
        const doctorSelect = document.getElementById('selectedDoctor');
        if (!doctorSelect) {
            alert('Por favor, selecione um médico antes de adicionar a assinatura.');
            return;
        }

        const selectedOption = doctorSelect.selectedOptions[0];
        if (!selectedOption || !selectedOption.value) {
            alert('Por favor, selecione um médico antes de adicionar a assinatura.');
            return;
        }

        const doctorName = selectedOption.text;
        const crm = selectedOption.dataset.crm;
        const rqe = selectedOption.dataset.rqe;

        // Criar a assinatura com espaçamento e alinhamento
        const signatureHtml = `
            <div style="text-align: right; margin-top: 2em;">
                <p style="margin-bottom: 0.5em;"><strong>Dr(a). ${doctorName}</strong></p>
                <p style="margin-bottom: 0.5em;">CRM: ${crm}</p>
                ${rqe ? `<p style="margin-bottom: 0.5em;">RQE: ${rqe}</p>` : ''}
            </div>
        `;

        // Adicionar quebra de linha e assinatura ao final do editor
        editor.innerHTML = editor.innerHTML + '<p><br></p>' + signatureHtml;
        
        // Atualizar o localStorage
        localStorage.setItem('editorContent', editor.innerHTML);
    }
});
