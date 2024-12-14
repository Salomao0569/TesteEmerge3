let currentFontSize = 3; // Valor padrão
let lastSavedContent = '';

function execCommand(command, value = null) {
    try {
        const editor = document.getElementById('editor');
        if (!editor) {
            console.error('Editor não encontrado');
            return;
        }

        console.log(`Executando comando: ${command}, valor: ${value}`);

        if (command === 'fontName') {
            applyFontToSelection(value);
        } else {
            document.execCommand(command, false, value);
        }

        saveEditorContent();
    } catch (error) {
        console.error(`Erro ao executar comando ${command}:`, error);
        console.error(error.stack);
    }
}

function applyFontToSelection(fontFamily) {
    try {
        const editor = document.getElementById('editor');
        const selection = window.getSelection();
        
        if (!selection.rangeCount) {
            console.log('Nenhuma seleção encontrada');
            return;
        }

        const range = selection.getRangeAt(0);
        
        if (range.collapsed) {
            console.log('Nenhum texto selecionado');
            return;
        }

        // Mapear nome da fonte para classe CSS
        const fontClassMap = {
            'Arial': 'font-arial',
            'Times New Roman': 'font-times',
            'Calibri': 'font-calibri',
            'Georgia': 'font-georgia',
            'Verdana': 'font-verdana',
            'Tahoma': 'font-tahoma'
        };

        const fontClass = fontClassMap[fontFamily];
        if (!fontClass) {
            console.error('Fonte não suportada:', fontFamily);
            return;
        }

        // Criar span com a classe apropriada
        const span = document.createElement('span');
        span.className = fontClass;

        // Aplicar a fonte ao conteúdo selecionado
        const fragment = range.extractContents();
        span.appendChild(fragment);
        range.insertNode(span);

        // Limpar seleção redundante
        selection.removeAllRanges();
        selection.addRange(range);

        console.log(`Fonte ${fontFamily} aplicada com sucesso usando classe ${fontClass}`);
    } catch (error) {
        console.error('Erro ao aplicar fonte:', error);
        console.error(error.stack);
    }
}

function changeFontSize(direction) {
    try {
        if (direction === 'increase' && currentFontSize < 7) {
            currentFontSize++;
        } else if (direction === 'decrease' && currentFontSize > 1) {
            currentFontSize--;
        } else {
            return; // Evitar alterações fora do intervalo permitido
        }

        console.log(`Alterando tamanho da fonte para: ${currentFontSize}`);
        execCommand('fontSize', currentFontSize);
    } catch (error) {
        console.error('Erro ao alterar tamanho da fonte:', error);
    }
}

async function insertTemplate(templateId) {
    if (!templateId) return;
    
    try {
        const response = await fetch(`/api/templates/${templateId}`);
        if (!response.ok) throw new Error('Erro ao buscar template');
        
        const template = await response.json();
        const editor = document.getElementById('editor');
        
        if (editor) {
            // Usar um elemento temporário para preservar a formatação
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = template.content;
            
            // Garantir que quebras de linha e espaços sejam preservados
            const formattedContent = tempDiv.innerHTML
                .replace(/<div><br><\/div>/g, '<br>')
                .replace(/<div>/g, '<p>')
                .replace(/<\/div>/g, '</p>');
            
            editor.innerHTML = formattedContent;
            
            // Salvar o conteúdo após inserir o template
            saveEditorContent();
        }
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
        const editor = document.getElementById('editor');
        
        if (editor) {
            const selection = window.getSelection();
            if (selection.rangeCount) {
                const range = selection.getRangeAt(0);
                
                // Adicionar quebra de linha se necessário
                if (range.startContainer.nodeType === Node.TEXT_NODE && 
                    range.startContainer.textContent.trim() !== '') {
                    const br = document.createElement('br');
                    range.insertNode(br);
                    range.collapse(false);
                }
                
                // Inserir o conteúdo
                const div = document.createElement('div');
                div.innerHTML = template.content;
                const fragment = document.createDocumentFragment();
                
                while (div.firstChild) {
                    fragment.appendChild(div.firstChild);
                }
                
                range.insertNode(fragment);
                
                // Move o cursor para o final do texto inserido
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
                
                // Limpar a seleção do dropdown
                document.getElementById('phraseSelect').value = '';
                
                // Salvar o conteúdo
                saveEditorContent();
            }
        }
    } catch (error) {
        console.error('Erro ao inserir frase:', error);
        alert('Erro ao carregar a frase padrão');
    }
}

function saveEditorContent() {
    const editor = document.getElementById('editor');
    if (!editor) return;

    const currentContent = editor.innerHTML;
    
    // Evitar salvamentos desnecessários
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

// Debounce function para evitar muitas chamadas
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

// Salvar conteúdo automaticamente a cada 2 segundos após a última modificação
const debouncedSave = debounce(saveEditorContent, 2000);

// Atalhos de teclado para o editor
function setupKeyboardShortcuts(editor) {
    editor.addEventListener('keydown', function(e) {
        // Undo: Ctrl+Z
        if (e.ctrlKey && e.key === 'z') {
            e.preventDefault();
            execCommand('undo');
        }
        // Redo: Ctrl+Y
        if (e.ctrlKey && e.key === 'y') {
            e.preventDefault();
            execCommand('redo');
        }
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    loadEditorContent();
    
    const editor = document.getElementById('editor');
    if (editor) {
        // Configurar atalhos de teclado
        setupKeyboardShortcuts(editor);
        
        // Salvar quando houver mudanças no conteúdo
        editor.addEventListener('input', debouncedSave);
        
        // Salvar quando o editor perder o foco
        editor.addEventListener('blur', saveEditorContent);
        
        // Garantir que o conteúdo seja salvo antes de sair da página
        window.addEventListener('beforeunload', saveEditorContent);
    }
});
