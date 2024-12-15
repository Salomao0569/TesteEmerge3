
document.addEventListener('DOMContentLoaded', function() {
    const editor = document.getElementById('editor');
    if (!editor) return;
    
    const wordCountDisplay = document.createElement('div');
    wordCountDisplay.className = 'text-muted small mt-2';
    editor.parentElement.appendChild(wordCountDisplay);

    // Auto-save a cada 30 segundos
    // Auto-save com feedback visual
    setInterval(() => {
        localStorage.setItem('editorContent', editor.innerHTML);
        const saveIndicator = document.createElement('div');
        saveIndicator.className = 'save-indicator';
        saveIndicator.textContent = 'Salvo automaticamente';
        document.body.appendChild(saveIndicator);
        setTimeout(() => saveIndicator.remove(), 2000);
    }, 30000);

    // Controle de tema escuro
    const themeToggle = document.createElement('button');
    themeToggle.className = 'btn btn-sm btn-outline-secondary ms-2';
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    themeToggle.title = 'Alternar tema escuro';
    document.querySelector('.editor-toolbar').appendChild(themeToggle);

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        localStorage.setItem('darkTheme', document.body.classList.contains('dark-theme'));
    });

    // Restaurar preferência de tema
    if (localStorage.getItem('darkTheme') === 'true') {
        document.body.classList.add('dark-theme');
    }

    // Contagem de palavras/caracteres
    function updateWordCount() {
        const text = editor.innerText;
        const wordCount = text.trim().split(/\s+/).length;
        const charCount = text.length;
        wordCountDisplay.textContent = `Palavras: ${wordCount} | Caracteres: ${charCount}`;
    }

    editor.addEventListener('input', e => {
        updateWordCount();
        // Salvar histórico de alterações
        const history = JSON.parse(localStorage.getItem('editorHistory') || '[]');
        history.push({
            content: editor.innerHTML,
            timestamp: new Date().toISOString()
        });
        // Manter apenas últimas 50 alterações
        if (history.length > 50) history.shift();
        localStorage.setItem('editorHistory', JSON.stringify(history));
    });
    updateWordCount();

    // Painel de histórico
    const historyButton = document.createElement('button');
    historyButton.className = 'btn btn-sm btn-outline-secondary ms-2';
    historyButton.innerHTML = '<i class="fas fa-history"></i>';
    historyButton.title = 'Histórico de alterações';
    document.querySelector('.editor-toolbar').appendChild(historyButton);

    historyButton.onclick = () => {
        const history = JSON.parse(localStorage.getItem('editorHistory') || '[]');
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5>Histórico de Alterações</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body" style="max-height: 400px; overflow-y: auto;">
                        ${history.reverse().map((item, i) => `
                            <div class="border-bottom p-2">
                                <small class="text-muted">${new Date(item.timestamp).toLocaleString()}</small>
                                <button class="btn btn-sm btn-outline-primary float-end" onclick="restoreVersion(${i})">
                                    Restaurar
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        new bootstrap.Modal(modal).show();
        modal.addEventListener('hidden.bs.modal', () => modal.remove());
    };

    window.restoreVersion = (index) => {
        const history = JSON.parse(localStorage.getItem('editorHistory') || '[]');
        if (history[index]) {
            editor.innerHTML = history[index].content;
            localStorage.setItem('editorContent', history[index].content);
        }
    };

    // Atalhos de teclado personalizados
    editor.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            localStorage.setItem('editorContent', editor.innerHTML);
        }
        if (e.ctrlKey && e.key === 'b') {
            e.preventDefault();
            execCommand('bold');
        }
        if (e.ctrlKey && e.key === 'i') {
            e.preventDefault();
            execCommand('italic');
        }
    });
    
    // Função simples para executar comandos
    window.execCommand = function(command, value = null) {
        editor.focus();
        document.execCommand(command, false, value);
        localStorage.setItem('editorContent', editor.innerHTML);
    }

    // Função para mudar fonte
    window.changeFont = function(fontName) {
        editor.focus();
        document.execCommand('fontName', false, fontName);
        localStorage.setItem('editorContent', editor.innerHTML);
    }

    // Função para definir tamanho da fonte
    window.setFontSize = function(size) {
        editor.focus();
        document.execCommand('fontSize', false, size);
        localStorage.setItem('editorContent', editor.innerHTML);
    }

    // Busca de frases
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.className = 'form-control form-control-sm mb-2';
    searchInput.placeholder = 'Buscar frases...';
    document.querySelector('.editor-templates').insertBefore(searchInput, document.getElementById('phraseSelect'));

    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const options = document.getElementById('phraseSelect').options;
        
        for (let option of options) {
            const text = option.text.toLowerCase();
            option.style.display = text.includes(searchTerm) ? '' : 'none';
        }
    });

    // Preview do PDF
    const previewButton = document.createElement('button');
    previewButton.className = 'btn btn-sm btn-outline-secondary ms-2';
    previewButton.innerHTML = '<i class="fas fa-eye"></i> Preview';
    previewButton.onclick = function() {
        const content = editor.innerHTML;
        const previewWindow = window.open('', '_blank');
        previewWindow.document.write(`
            <html>
                <head>
                    <title>Preview do Laudo</title>
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                </head>
                <body class="p-4">
                    <div class="container">${content}</div>
                </body>
            </html>
        `);
    };
    document.querySelector('.editor-toolbar').appendChild(previewButton);

    // Função para inserir frase selecionada
    window.insertSelectedPhrase = function() {
        const select = document.getElementById('phraseSelect');
        const templateId = select.value;
        if (!templateId) return;
        
        const button = select.nextElementSibling;
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Inserindo...';
        
        fetch(`/api/templates/${templateId}`)
            .then(response => response.json())
            .then(template => {
                editor.focus();
                const selection = window.getSelection();
                const range = selection.getRangeAt(0);
                const fragment = document.createTextNode(template.content + '\n');
                range.insertNode(fragment);
                range.collapse(false);
                localStorage.setItem('editorContent', editor.innerHTML);
                button.disabled = false;
                button.innerHTML = 'Inserir';
                select.value = '';
            })
            .catch(error => {
                console.error('Erro:', error);
                button.disabled = false;
                button.innerHTML = 'Inserir';
            });
    }

    // Adicionar atalhos de teclado
    document.addEventListener('keydown', function(e) {
        // Alt + I para foco no editor
        if (e.altKey && e.key === 'i') {
            editor.focus();
        }
    });

    // Função para inserir modelo de laudo selecionado
    window.insertSelectedTemplate = function() {
        const select = document.getElementById('templateSelect');
        const templateId = select.value;
        if (!templateId) return;
        
        fetch(`/api/templates/${templateId}`)
            .then(response => response.json())
            .then(template => {
                const editor = document.getElementById('editor');
                if (editor) {
                    editor.innerHTML = template.content;
                    editor.focus();
                    localStorage.setItem('editorContent', editor.innerHTML);
                }
            })
            .catch(error => console.error('Erro ao carregar modelo:', error));
    }

    // Função para limpar formatação indesejada
    function cleanHTML(html) {
        return html
            .replace(/<div><br><\/div>/g, '<br>')
            .replace(/<div>/g, '<p>')
            .replace(/<\/div>/g, '</p>')
            .trim();
    }

    // Carregar conteúdo salvo mantendo formatação
    const savedContent = localStorage.getItem('editorContent');
    if (savedContent) {
        editor.innerHTML = savedContent;
    }

    // Salvar alterações com formatação
    editor.addEventListener('input', () => {
        const content = cleanHTML(editor.innerHTML);
        localStorage.setItem('editorContent', content);
    });

    // Garantir que a formatação seja mantida ao inserir template
    window.insertTemplate = function(templateId) {
        if (!templateId) return;
        
        fetch(`/api/templates/${templateId}`)
            .then(response => response.json())
            .then(template => {
                editor.innerHTML = template.content;
                editor.focus();
                localStorage.setItem('editorContent', template.content);
            });
    }

    // Atualizar preview das frases no select
    const phraseSelect = document.getElementById('phraseSelect');
    phraseSelect.addEventListener('mouseover', function(e) {
        const option = e.target;
        if (option.value) {
            fetch(`/api/templates/${option.value}`)
                .then(response => response.json())
                .then(template => {
                    option.title = template.content;
                });
        }
    });
});
