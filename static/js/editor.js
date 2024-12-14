
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

    // Função otimizada para inserir frase
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

    // Configurar drag and drop para frases
    const phraseSelect = document.getElementById('phraseSelect');
    phraseSelect.addEventListener('mousedown', function(e) {
        if (this.value) {
            e.preventDefault();
            fetch(`/api/templates/${this.value}`)
                .then(response => response.json())
                .then(template => {
                    const dragText = template.content;
                    editor.focus();
                    document.addEventListener('mousemove', onMouseMove);
                    document.addEventListener('mouseup', function onMouseUp(e) {
                        document.removeEventListener('mousemove', onMouseMove);
                        document.removeEventListener('mouseup', onMouseUp);
                        const range = document.caretRangeFromPoint(e.clientX, e.clientY);
                        if (range && range.commonAncestorContainer.contains(editor)) {
                            range.insertNode(document.createTextNode(dragText + '\n'));
                            localStorage.setItem('editorContent', editor.innerHTML);
                        }
                    });
                });
        }
    });

    function onMouseMove(e) {
        const range = document.caretRangeFromPoint(e.clientX, e.clientY);
        if (range && range.commonAncestorContainer.contains(editor)) {
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);
        }
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
});
