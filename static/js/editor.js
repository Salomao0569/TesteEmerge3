
document.addEventListener('DOMContentLoaded', function() {
    const editor = document.getElementById('editor');
    
    window.execCommand = function(command, value = null) {
        try {
            editor.focus();
            if (command === 'fontName' && value) {
                document.execCommand('fontName', false, value);
            } else if (command === 'fontSize' && value) {
                document.execCommand('fontSize', false, value);
            } else {
                document.execCommand(command, false, value);
            }
            localStorage.setItem('editorContent', editor.innerHTML);
        } catch (error) {
            console.error('Erro:', error);
        }
    }

    window.changeFontSize = function(direction) {
        const sizes = ['1', '2', '3', '4', '5', '6', '7'];
        let currentSize = editor.style.fontSize || '3';
        let index = sizes.indexOf(currentSize);
        
        if (direction === 'increase' && index < sizes.length - 1) {
            index++;
        } else if (direction === 'decrease' && index > 0) {
            index--;
        }
        
        document.execCommand('fontSize', false, sizes[index]);
        localStorage.setItem('editorContent', editor.innerHTML);
    }

    const savedContent = localStorage.getItem('editorContent');
    if (savedContent) {
        editor.innerHTML = savedContent;
    }

    editor.addEventListener('input', () => {
        localStorage.setItem('editorContent', editor.innerHTML);
    });
});
