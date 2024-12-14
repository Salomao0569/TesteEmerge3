
document.addEventListener('DOMContentLoaded', function() {
    const editor = document.getElementById('editor');
    
    function execCommand(command, value = null) {
        try {
            if (!editor) return;
            
            editor.focus();
            if (command === 'fontName') {
                const selection = window.getSelection();
                if (selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    const selectedText = range.toString();
                    
                    if (selectedText) {
                        document.execCommand('styleWithCSS', false, true);
                        document.execCommand('fontName', false, value);
                    } else {
                        editor.style.fontFamily = value;
                    }
                } else {
                    editor.style.fontFamily = value;
                }
            } else {
                document.execCommand(command, false, value);
            }
            
            localStorage.setItem('editorContent', editor.innerHTML);
        } catch (error) {
            console.error(`Erro ao executar comando ${command}:`, error);
        }
    }

    function changeFontSize(direction) {
        const sizes = [1, 2, 3, 4, 5, 6, 7];
        let currentSize = parseInt(editor.style.fontSize) || 3;
        
        if (direction === 'increase' && currentSize < 7) {
            currentSize++;
        } else if (direction === 'decrease' && currentSize > 1) {
            currentSize--;
        }
        
        document.execCommand('fontSize', false, currentSize);
        editor.style.fontSize = currentSize;
    }

    // Expor funções globalmente
    window.execCommand = execCommand;
    window.changeFontSize = changeFontSize;

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
