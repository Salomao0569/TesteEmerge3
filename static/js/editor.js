
let currentFontSize = 3;
let lastSavedContent = '';

function applyFont(fontFamily) {
    const selection = window.getSelection();
    const editor = document.getElementById('editor');
    
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        span.style.fontFamily = fontFamily;
        
        if (range.toString().length > 0) {
            range.surroundContents(span);
        } else {
            editor.style.fontFamily = fontFamily;
        }
    } else {
        editor.style.fontFamily = fontFamily;
    }
    saveEditorContent();
}

function execCommand(command, value = null) {
    try {
        const editor = document.getElementById('editor');
        if (!editor) {
            console.error('Editor não encontrado');
            return;
        }

        editor.focus();
        if (command === 'fontName') {
            applyFont(value);
        } else {
            document.execCommand(command, false, value);
        }
        saveEditorContent();
    } catch (error) {
        console.error(`Erro ao executar comando ${command}:`, error);
    }
}

function changeFontSize(direction) {
    try {
        if (direction === 'increase' && currentFontSize < 7) {
            currentFontSize++;
        } else if (direction === 'decrease' && currentFontSize > 1) {
            currentFontSize--;
        } else {
            return;
        }
        
        console.log(`Alterando tamanho da fonte para: ${currentFontSize}`);
        execCommand('fontSize', currentFontSize);
    } catch (error) {
        console.error('Erro ao alterar tamanho da fonte:', error);
    }
}

function saveEditorContent() {
    const editor = document.getElementById('editor');
    if (!editor) return;

    const currentContent = editor.innerHTML;
    if (currentContent === lastSavedContent) {
        return;
    }

    try {
        localStorage.setItem('editorContent', currentContent);
        lastSavedContent = currentContent;
        console.log('Conteúdo do editor salvo');
    } catch (error) {
        console.error('Erro ao salvar conteúdo do editor:', error);
    }
}

function loadEditorContent() {
    const editor = document.getElementById('editor');
    if (!editor) return;

    try {
        const savedContent = localStorage.getItem('editorContent');
        if (savedContent) {
            editor.innerHTML = savedContent;
            lastSavedContent = savedContent;
            console.log('Conteúdo do editor carregado');
        }
    } catch (error) {
        console.error('Erro ao carregar conteúdo do editor:', error);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const editor = document.getElementById('editor');
    if (editor) {
        loadEditorContent();
        editor.addEventListener('input', saveEditorContent);
        editor.addEventListener('blur', saveEditorContent);
        window.addEventListener('beforeunload', saveEditorContent);
        console.log('Editor inicializado com sucesso');
    } else {
        console.log('Elemento editor não encontrado na página');
    }
});
