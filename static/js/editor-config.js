// Configuração avançada do TinyMCE para o editor de laudos
document.addEventListener('DOMContentLoaded', function() {
    tinymce.init({
        selector: '#editor',
        plugins: [
            // Core editing features
            'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'image', 'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount',
            // Advanced premium features
            'checklist', 'mediaembed', 'casechange', 'export', 'formatpainter', 'pageembed', 'a11ychecker', 'tinymcespellchecker', 'permanentpen', 'powerpaste', 'advtable', 'advcode', 'editimage', 'advtemplate', 'ai', 'mentions', 'tinycomments', 'tableofcontents', 'footnotes', 'mergetags', 'autocorrect', 'typography', 'inlinecss', 'markdown', 'importword', 'exportword', 'exportpdf'
        ],
        toolbar: [
            { name: 'history', items: ['undo', 'redo'] },
            { name: 'styles', items: ['styles', 'blocks', 'fontfamily', 'fontsize'] },
            { name: 'formatting', items: ['bold', 'italic', 'underline', 'strikethrough'] },
            { name: 'alignment', items: ['alignleft', 'aligncenter', 'alignright', 'alignjustify'] },
            { name: 'indentation', items: ['indent', 'outdent'] },
            { name: 'advanced', items: ['link', 'image', 'media', 'mergetags'] },
            { name: 'tables', items: ['table', 'tabledelete', 'tableprops', 'tablerowprops', 'tablecellprops'] },
            { name: 'lists', items: ['checklist', 'numlist', 'bullist'] },
            { name: 'special', items: ['emoticons', 'charmap', 'hr', 'removeformat'] }
        ],
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
                            <div style="text-align: center; margin-top: 30px;">
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
