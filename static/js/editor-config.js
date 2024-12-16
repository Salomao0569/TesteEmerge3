// Configuração avançada do TinyMCE para o editor de laudos
document.addEventListener('DOMContentLoaded', function() {
    console.log('Iniciando configuração do TinyMCE...');
    tinymce.init({
        selector: '#editor',
        height: 500,
        menubar: true,
        branding: false,
        plugins: [
            'print preview powerpaste searchreplace autolink directionality',
            'visualblocks visualchars fullscreen image link media table',
            'charmap hr pagebreak nonbreaking anchor insertdatetime',
            'advlist lists wordcount textpattern help',
            'emoticons autosave code codesample',
            // Plugins premium disponíveis
            'importword exportword exportpdf'
        ].join(' '),
        toolbar: 'undo redo | formatselect | ' +
                'bold italic underline strikethrough | ' +
                'alignleft aligncenter alignright alignjustify | ' +
                'outdent indent | numlist bullist | ' +
                'table image media | removeformat | help',
        
        // Configurações de autosave
        autosave_ask_before_unload: true,
        autosave_interval: '30s',
        autosave_prefix: '{path}{query}-{id}-',
        
        // Configurações de conteúdo
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
        menubar: true,
        statusbar: true,
        tinycomments_mode: 'embedded',
        tinycomments_author: 'Author name',
        height: 500,
        language: 'pt_BR',
        language_url: 'https://cdn.tiny.cloud/1/no-api-key/tinymce/6/langs/pt_BR.js',
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
        formats: {
            alignleft: { selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', classes: 'text-start' },
            aligncenter: { selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', classes: 'text-center' },
            alignright: { selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', classes: 'text-end' },
            alignjustify: { selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', classes: 'text-justify' }
        },
        style_formats: [
            { title: 'Títulos', items: [
                { title: 'Título 1', format: 'h1' },
                { title: 'Título 2', format: 'h2' },
                { title: 'Título 3', format: 'h3' }
            ]},
            { title: 'Inline', items: [
                { title: 'Negrito', format: 'bold' },
                { title: 'Itálico', format: 'italic' },
                { title: 'Sublinhado', format: 'underline' },
                { title: 'Tachado', format: 'strikethrough' },
                { title: 'Sobrescrito', format: 'superscript' },
                { title: 'Subscrito', format: 'subscript' }
            ]},
            { title: 'Blocos', items: [
                { title: 'Parágrafo', format: 'p' },
                { title: 'Citação', format: 'blockquote' },
                { title: 'Código', format: 'pre' }
            ]}
        ],
        font_family_formats: 'Arial=arial,helvetica,sans-serif; Times New Roman=times new roman,times,serif; Courier New=courier new,courier,monospace',
        font_size_formats: '8pt 9pt 10pt 11pt 12pt 14pt 16pt 18pt 24pt 36pt',
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
                // Salvamento automático após mudanças
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
                        },
                        body: JSON.stringify(reportData)
                    }).catch(console.error);
                }
            });
        },
        // Configurações de autosave
        autosave_ask_before_unload: true,
        autosave_interval: '30s',
        autosave_prefix: 'tinymce-autosave-{path}{query}-{id}-',
        autosave_restore_when_empty: true,
        // Configurações de tabela
        table_appearance_options: true,
        table_advtab: true,
        table_cell_advtab: true,
        table_row_advtab: true,
        table_default_styles: {
            width: '100%'
        },
        // Configurações avançadas
        relative_urls: false,
        remove_script_host: false,
        document_base_url: window.location.origin,
        browser_spellcheck: true,
        contextmenu: 'link image table configurepermanentpen',
        custom_colors: false,
        promotion: false,
        ai_request: (request, respondWith) => respondWith.string(() => Promise.reject('See docs to implement AI Assistant'))
    });
});
