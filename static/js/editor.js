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
    
    try {
        const response = await fetch(`/api/templates/${templateId}`);
        if (!response.ok) throw new Error('Erro ao buscar template');
        
        const template = await response.json();
        const editor = document.getElementById('editor');
        
        if (editor) {
            editor.innerHTML = template.content;
            // Salvar o conteúdo após inserir o template
            saveEditorContent();
        }
    } catch (error) {
        console.error('Erro ao inserir template:', error);
        alert('Erro ao carregar o modelo de laudo');
    }
}

// Cache para armazenar templates já carregados
const templateCache = new Map();

async function getTemplate(templateId) {
    if (templateCache.has(templateId)) {
        return templateCache.get(templateId);
    }
    
    const response = await fetch(`/api/templates/${templateId}`);
    if (!response.ok) throw new Error('Erro ao buscar template');
    
    const template = await response.json();
    templateCache.set(templateId, template);
    return template;
}

async function insertPhrase(templateId) {
    if (!templateId) return;
    
    try {
        const template = await getTemplate(templateId);
        const editor = document.getElementById('editor');
        
        if (editor) {
            const selection = window.getSelection();
            if (selection.rangeCount) {
                const range = selection.getRangeAt(0);
                
                // Criar um elemento temporário para o conteúdo HTML
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = template.content;
                
                // Adicionar quebra de linha se necessário
                if (range.startContainer.nodeType === Node.TEXT_NODE && 
                    range.startContainer.textContent.trim() !== '') {
                    const br = document.createElement('br');
                    tempDiv.insertBefore(br, tempDiv.firstChild);
                }
                
                // Limpar qualquer seleção existente e inserir o conteúdo
                range.deleteContents();
                const fragment = document.createDocumentFragment();
                while (tempDiv.firstChild) {
                    fragment.appendChild(tempDiv.firstChild);
                }
                range.insertNode(fragment);
                
                // Mover o cursor para o final do texto inserido
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
                
                // Salvar o conteúdo e manter o foco
                saveEditorContent();
                editor.focus();
                
                // Limpar a seleção do dropdown
                document.getElementById('phraseSelect').value = '';
            }
        }
    } catch (error) {
        console.error('Erro ao inserir frase:', error);
        alert('Erro ao carregar a frase padrão');
    }
}

function saveEditorContent() {
    const editor = document.getElementById('editor');
    if (editor) {
        localStorage.setItem('editorContent', editor.innerHTML);
    }
}

function loadEditorContent() {
    const editor = document.getElementById('editor');
    const savedContent = localStorage.getItem('editorContent');
    if (editor && savedContent) {
        editor.innerHTML = savedContent;
    }
}

// Salvar conteúdo automaticamente a cada 30 segundos
setInterval(saveEditorContent, 30000);

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    loadEditorContent();
    const editor = document.getElementById('editor');
    if (editor) {
        editor.addEventListener('input', saveEditorContent);
    }
});
