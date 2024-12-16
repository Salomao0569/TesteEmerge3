// Configuração básica do TinyMCE para o editor de laudos
document.addEventListener('DOMContentLoaded', function() {
    console.log('Iniciando configuração do TinyMCE...');

    // Configurar TinyMCE para modo de uso sem API key
    tinymce.init({
        selector: '#editor',
        height: 500,
        menubar: true,
        statusbar: true,
        branding: false,
        promotion: false,

    tinymce.init({
        selector: '#editor',
        height: 500,
        menubar: true,
        statusbar: true,
        branding: false,
        promotion: false,
        plugins: [
            'advlist', 'autolink', 'lists', 'link', 'charmap', 'preview',
            'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'table', 'help', 'wordcount'
        ],
        toolbar: 'undo redo | formatselect | ' +
                'bold italic backcolor | alignleft aligncenter ' +
                'alignright alignjustify | bullist numlist outdent indent | ' +
                'removeformat | table help',
        content_style: `
            body {
                font-family: Arial, sans-serif;
                font-size: 14px;
                line-height: 1.5;
                margin: 1rem;
            }
        `,
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
            editor.on('init', function() {
                console.log('Editor inicializado com sucesso');
            });

            editor.ui.registry.addButton('assinatura', {
                text: 'Assinatura',
                onAction: function() {
                    const doctorSelect = document.getElementById('doctorId');
                    if (doctorSelect && doctorSelect.value) {
                        const doctorInfo = doctorSelect.options[doctorSelect.selectedIndex].text;
                        const signature = `
                            <div class="medical-signature" style="text-align: center; margin-top: 30px;">
                                <p>_______________________________________________</p>
                                <p>${doctorInfo}</p>
                            </div>`;
                        editor.insertContent(signature);
                    } else {
                        alert('Por favor, selecione um médico antes de adicionar a assinatura.');
                    }
                }
            });
        },
        init_instance_callback: function(editor) {
            editor.on('change', function() {
                const form = document.getElementById('reportForm');
                if (form) {
                    const formData = new FormData(form);
                    formData.append('content', editor.getContent());
                    
                    fetch('/api/templates', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(Object.fromEntries(formData))
                    }).catch(error => console.error('Erro ao salvar:', error));
                }
            });
        }
    });
});