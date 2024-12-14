let currentFontSize = 3; // Valor padrão

function execCommand(command, value = null) {
    document.execCommand(command, false, value);
    document.getElementById('editor').focus();
}

function changeFontSize(direction) {
    if (direction === 'increase' && currentFontSize < 7) {
        currentFontSize++;
    } else if (direction === 'decrease' && currentFontSize > 1) {
        currentFontSize--;
    }
    execCommand('fontSize', currentFontSize);
}

async function insertTemplate(templateId) {
    if (!templateId) return;
    
    const editor = document.getElementById('editor');
    try {
        const response = await fetch(`/api/templates/${templateId}`);
        if (!response.ok) throw new Error('Erro ao buscar template');
        
        const template = await response.json();
        editor.innerHTML = template.content;
    } catch (error) {
        console.error('Erro ao inserir template:', error);
        alert('Erro ao carregar o modelo de laudo');
    }
}

async function insertPhrase(templateId) {
    if (!templateId) return;
    
    try {
        const response = await fetch(`/api/templates/${templateId}`);
        if (!response.ok) throw new Error('Erro ao buscar frase');
        
        const template = await response.json();
        
        // Insere o conteúdo na posição atual do cursor
        const selection = window.getSelection();
        if (selection.rangeCount) {
            const range = selection.getRangeAt(0);
            const fragment = document.createDocumentFragment();
            const div = document.createElement('div');
            div.innerHTML = template.content;
            
            while (div.firstChild) {
                fragment.appendChild(div.firstChild);
            }
            
            range.deleteContents();
            range.insertNode(fragment);
            
            // Move o cursor para o final do texto inserido
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    } catch (error) {
        console.error('Erro ao inserir frase:', error);
        alert('Erro ao carregar a frase padrão');
    }
}

function saveEditorContent() {
    localStorage.setItem('editorContent', document.getElementById('editor').innerHTML);
}

function loadEditorContent() {
    const savedContent = localStorage.getItem('editorContent');
    if (savedContent) {
        document.getElementById('editor').innerHTML = savedContent;
    }
}

// Salvar conteúdo automaticamente a cada 30 segundos
setInterval(saveEditorContent, 30000);

// Carregar conteúdo ao iniciar
document.addEventListener('DOMContentLoaded', function() {
    loadEditorContent();
});
