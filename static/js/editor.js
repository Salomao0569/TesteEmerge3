
let currentFontSize = 3;

function execCommand(command, value = null) {
    try {
        const editor = document.getElementById('editor');
        if (!editor) return;

        editor.focus();
        if (command === 'fontName') {
            editor.style.fontFamily = value;
        } else if (command === 'fontSize') {
            document.execCommand(command, false, value);
        } else {
            document.execCommand(command, false, value);
        }
        
        localStorage.setItem('editorContent', editor.innerHTML);
    } catch (error) {
        console.error(`Erro ao executar comando ${command}:`, error);
    }
}

function changeFontSize(direction) {
    if (direction === 'increase' && currentFontSize < 7) {
        currentFontSize++;
    } else if (direction === 'decrease' && currentFontSize > 1) {
        currentFontSize--;
    }
    execCommand('fontSize', currentFontSize);
}

function loadEditorContent() {
    const editor = document.getElementById('editor');
    if (!editor) return;
    
    const savedContent = localStorage.getItem('editorContent');
    if (savedContent) {
        editor.innerHTML = savedContent;
    }
}

document.addEventListener('DOMContentLoaded', loadEditorContent);
