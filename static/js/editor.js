
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

    // Função para mudar tamanho
    window.changeFontSize = function(direction) {
        const sizes = [1, 2, 3, 4, 5, 6, 7];
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        
        editor.focus();
        
        let currentSize = 3; // tamanho padrão
        if (selection.anchorNode.parentElement.style.fontSize) {
            currentSize = parseInt(selection.anchorNode.parentElement.style.fontSize);
        }
        
        if (direction === 'increase' && currentSize < 7) {
            currentSize++;
        } else if (direction === 'decrease' && currentSize > 1) {
            currentSize--;
        }
        
        console.log('Alterando tamanho da fonte para:', currentSize);
        document.execCommand('fontSize', false, currentSize);
        localStorage.setItem('editorContent', editor.innerHTML);
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
