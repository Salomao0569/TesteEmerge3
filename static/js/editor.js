
document.addEventListener('DOMContentLoaded', function() {
    const editor = document.getElementById('editor');
    const wordCountDisplay = document.createElement('div');
    wordCountDisplay.className = 'text-muted small mt-2';
    editor.parentNode.insertBefore(wordCountDisplay, editor.nextSibling);

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

    editor.addEventListener('input', updateWordCount);
    updateWordCount();

    // Atalhos de teclado adicionais
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
