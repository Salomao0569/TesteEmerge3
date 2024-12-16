// Configuração básica do TinyMCE para o editor de laudos
document.addEventListener('DOMContentLoaded', function() {
    console.log('Iniciando configuração do TinyMCE...');

    const editor = tinymce.init({
        selector: '#editor',
        height: 500,
        menubar: true,
        branding: false,
        plugins: 'lists link image table wordcount',
        readonly: false,
        setup: function(editor) {
            editor.on('init', function() {
                console.log('Editor inicializado com sucesso');
            });
        },
        
        toolbar: 'undo redo | formatselect | ' +
                'bold italic underline strikethrough | ' +
                'alignleft aligncenter alignright alignjustify | ' +
                'outdent indent | numlist bullist | ' +
                'table image media | removeformat | help',
        
        content_css: [
            'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css'
        ],
        content_style: `
            body {
                font-family: Arial, sans-serif;
                margin: 1rem;
                max-width: 100%;
            }
            p { margin: 0 0 1rem 0; }
        `,
        
        // Configurações de autosave
        autosave_ask_before_unload: true,
        autosave_interval: '30s',
        autosave_prefix: 'tinymce-autosave-{path}{query}-{id}-',
        autosave_restore_when_empty: true,

        setup: function(editor) {
            // Adicionar botão de assinatura do médico
            editor.ui.registry.addButton('assinatura', {
                text: 'Assinatura',
                icon: 'signature',
                onAction: function() {
                    const doctorSelect = document.getElementById('doctorId');
                    if (doctorSelect && doctorSelect.value) {
                        const doctorInfo = doctorSelect.options[doctorSelect.selectedIndex].text;
                        const signature = `
                            <br><br>
                            <div class="medical-signature" style="text-align: center; margin-top: 30px;">
                                <p>_______________________________________________</p>
                                <p>${doctorInfo}</p>
                            </div>
                        `;
                        editor.insertContent(signature);
                    } else {
                        alert('Por favor, selecione um médico antes de adicionar a assinatura.');
                    }
                }
            });

            // Evento de mudança do editor
            editor.on('change', function() {
                editor.save();
                const content = editor.getContent();
                const reportName = document.getElementById('reportName').value;
                const doctorId = document.getElementById('doctorId').value;
                
                if (reportName && doctorId) {
                    const reportData = {
                        name: reportName,
                        content: content,
                        doctor_id: parseInt(doctorId),
                        category: 'laudo'
                    };
                    
                    // Autosave para o backend
                    fetch('/api/templates', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-Token': getCSRFToken()
                        },
                        body: JSON.stringify(reportData)
                    }).catch(error => console.error('Erro ao salvar:', error));
                }
            });
        }
    });
});