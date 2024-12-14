
document.addEventListener('DOMContentLoaded', function() {
    const editor = document.getElementById('editor');
    
    window.execCommand = function(command, value = null) {
        try {
            editor.focus();
            document.execCommand('styleWithCSS', false, true);
            document.execCommand(command, false, value);
            localStorage.setItem('editorContent', editor.innerHTML);
        } catch (error) {
            console.error('Erro:', error);
        }
    }

    window.changeFontSize = function(direction) {
        const sizes = ['1', '2', '3', '4', '5', '6', '7'];
        const currentSize = editor.style.fontSize || '3';
        let index = sizes.indexOf(currentSize);
        
        if (direction === 'increase' && index < sizes.length - 1) {
            index++;
        } else if (direction === 'decrease' && index > 0) {
            index--;
        }
        
        editor.style.fontSize = sizes[index];
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
