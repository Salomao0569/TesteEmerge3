// Configuração avançada do CKEditor 5
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar o CKEditor com configurações avançadas
    ClassicEditor
        .create(document.querySelector('#templateContent'), {
            // Configuração extendida da barra de ferramentas
            toolbar: {
                items: [
                    'undo', 'redo', '|',
                    'heading', '|',
                    'bold', 'italic', 'underline', 'strikethrough', '|',
                    'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', '|',
                    'alignment', '|',
                    'numberedList', 'bulletedList', '|',
                    'indent', 'outdent', '|',
                    'link', 'blockQuote', '|',
                    'insertTable', 'tableColumn', 'tableRow', 'mergeTableCells', '|',
                    'specialCharacters', 'horizontalLine', '|',
                    'removeFormat'
                ],
                shouldNotGroupWhenFull: true,
                removeItems: []
            },
            // Configurações avançadas de cabeçalho
            heading: {
                options: [
                    { model: 'paragraph', title: 'Parágrafo', class: 'ck-heading_paragraph' },
                    { model: 'heading1', view: 'h1', title: 'Título 1', class: 'ck-heading_heading1' },
                    { model: 'heading2', view: 'h2', title: 'Título 2', class: 'ck-heading_heading2' },
                    { model: 'heading3', view: 'h3', title: 'Título 3', class: 'ck-heading_heading3' },
                    { model: 'heading4', view: 'h4', title: 'Título 4', class: 'ck-heading_heading4' }
                ]
            },
            // Configurações precisas de fonte
            fontSize: {
                options: [
                    8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36
                ],
                supportAllValues: true
            },
            // Fontes expandidas
            fontFamily: {
                options: [
                    'default',
                    'Arial, Helvetica, sans-serif',
                    'Times New Roman, Times, serif',
                    'Courier New, Courier, monospace',
                    'Georgia, serif',
                    'Lucida Sans Unicode, Lucida Grande, sans-serif',
                    'Tahoma, Geneva, sans-serif',
                    'Trebuchet MS, Helvetica, sans-serif',
                    'Verdana, Geneva, sans-serif'
                ],
                supportAllValues: true
            },
            // Configurações de linguagem e localização
            language: 'pt-br',
            // Configurações de tabela aprimoradas
            table: {
                contentToolbar: [
                    'tableColumn',
                    'tableRow',
                    'mergeTableCells',
                    'tableProperties',
                    'tableCellProperties'
                ]
            },
            // Configurações de imagem (se necessário no futuro)
            image: {
                toolbar: [
                    'imageStyle:inline',
                    'imageStyle:block',
                    'imageStyle:side',
                    '|',
                    'toggleImageCaption',
                    'imageTextAlternative'
                ]
            },
            // Configurações para melhor manipulação de HTML
            htmlSupport: {
                allow: [
                    {
                        name: /.*/,
                        attributes: true,
                        classes: true,
                        styles: true
                    }
                ]
            },
            // Altura mínima do editor
            height: '800px',
            autogrow: {
                minHeight: '800px',
                maxHeight: null
            },
            // Plugins removidos
            removePlugins: []
        })
        .then(editor => {
            // Armazenar a instância do editor globalmente
            window.editor = editor;

            // Configurar autosave
            let autoSaveTimeout;
            editor.model.document.on('change:data', () => {
                clearTimeout(autoSaveTimeout);
                autoSaveTimeout = setTimeout(() => {
                    localStorage.setItem('editorAutosave', editor.getData());
                }, 1000);
            });

            // Restaurar conteúdo salvo se existir
            const savedContent = localStorage.getItem('editorAutosave');
            if (savedContent) {
                editor.setData(savedContent);
            }

            // Adicionar manipulador para o formulário
            const form = document.getElementById('templateForm');
            if (form) {
                form.addEventListener('submit', async function(e) {
                    e.preventDefault();

                    try {
                        // Obter token CSRF
                        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
                        if (!csrfToken) {
                            throw new Error('Token CSRF não encontrado');
                        }

                        // Preparar dados do formulário
                        const formData = {
                            name: document.getElementById('templateName').value,
                            category: document.getElementById('templateCategory').value,
                            content: editor.getData()
                        };

                        // Validar dados
                        if (!formData.name || !formData.category || !formData.content) {
                            throw new Error('Todos os campos são obrigatórios');
                        }

                        // Enviar dados para o servidor
                        const response = await fetch('/api/templates', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRFToken': csrfToken
                            },
                            body: JSON.stringify(formData)
                        });

                        const data = await response.json();

                        if (data.success) {
                            // Limpar autosave após salvar com sucesso
                            localStorage.removeItem('editorAutosave');
                            alert('Template salvo com sucesso!');
                            location.reload();
                        } else {
                            throw new Error(data.message || 'Erro ao salvar template');
                        }
                    } catch (error) {
                        console.error('Erro:', error);
                        alert(error.message || 'Erro ao salvar template');
                    }
                });
            }

            // Adicionar atalhos de teclado personalizados
            editor.keystrokes.set('Ctrl+S', (keyEvtData, cancel) => {
                cancel();
                form?.dispatchEvent(new Event('submit'));
            });

            // Configurar manipulação de colagem
            editor.editing.view.document.on('clipboardInput', (evt, data) => {
                // Limpar formatação indesejada do conteúdo colado
                const dataTransfer = data.dataTransfer;
                const textContent = dataTransfer.getData('text/plain');

                // Se não houver HTML, usar texto puro
                if (!dataTransfer.getData('text/html')) {
                    data.content = editor.data.processor.toView(textContent);
                }
            });
            
            // Ensure the editor container has the correct height
            const editorElement = editor.ui.getEditableElement();
            editorElement.style.minHeight = '800px';
            editorElement.style.height = 'auto';
        })
        .catch(error => {
            console.error('Erro ao inicializar o editor:', error);
            alert('Erro ao inicializar o editor. Por favor, recarregue a página.');
        });
});

// Função para carregar template
function loadTemplate(templateId) {
    fetch(`/api/templates/${templateId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && window.editor) {
                window.editor.setData(data.content);
            }
        })
        .catch(error => {
            console.error('Erro ao carregar template:', error);
        });
}

// Função para deletar template
function deleteTemplate(templateId) {
    if (confirm('Tem certeza que deseja excluir este template?')) {
        fetch(`/api/templates/${templateId}`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': document.querySelector('meta[name="csrf-token"]').content
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                location.reload();
            } else {
                alert('Erro ao excluir template: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao excluir template');
        });
    }
}