
document.addEventListener('DOMContentLoaded', function() {
    const editor = document.getElementById('editor');
    
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

    // Função para inserir frase
    window.insertPhrase = function(templateId) {
        if (!templateId) return;
        
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
            });
    }

    // Função para inserir modelo de laudo
    window.insertTemplate = function(templateId) {
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

    // Carregar conteúdo salvo
    const savedContent = localStorage.getItem('editorContent');
    if (savedContent) {
        editor.innerHTML = savedContent;
    }

    // Salvar alterações
    editor.addEventListener('input', () => {
        localStorage.setItem('editorContent', editor.innerHTML);
    });

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
