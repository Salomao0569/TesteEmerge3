
let currentFontSize = 3; // Valor padrão
let lastSavedContent = '';

function execCommand(command, value = null) {
    try {
        const editor = document.getElementById('editor');
        if (!editor) {
            console.error('Editor não encontrado');
            return;
        }

        editor.focus();
        if (command === 'fontName') {
            document.execCommand('styleWithCSS', false, true);
            document.execCommand('fontName', false, value);
        } else {
            document.execCommand(command, false, value);
        }
        saveEditorContent();
        console.log(`Comando executado: ${command}, valor: ${value}`);
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

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const debouncedSave = debounce(saveEditorContent, 2000);

function setupKeyboardShortcuts(editor) {
    editor.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'z') {
            e.preventDefault();
            execCommand('undo');
        }
        if (e.ctrlKey && e.key === 'y') {
            e.preventDefault();
            execCommand('redo');
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const editor = document.getElementById('editor');
    if (editor) {
        loadEditorContent();
        setupKeyboardShortcuts(editor);
        editor.addEventListener('input', debouncedSave);
        editor.addEventListener('blur', saveEditorContent);
        window.addEventListener('beforeunload', saveEditorContent);
        console.log('Editor inicializado com sucesso');
    } else {
        console.log('Elemento editor não encontrado na página');
    }
});
