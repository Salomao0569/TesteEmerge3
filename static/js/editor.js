document.addEventListener('DOMContentLoaded', function() {
    const editor = document.getElementById('editor');
    if (!editor) return;
    
    const wordCountDisplay = document.createElement('div');
    wordCountDisplay.className = 'text-muted small mt-2';
    editor.parentElement.appendChild(wordCountDisplay);

    // Configurar o editor para preservar formatação
    editor.addEventListener('paste', function(e) {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData('text/html') || 
                    (e.clipboardData || window.clipboardData).getData('text/plain');
        
        const div = document.createElement('div');
        div.innerHTML = text;
        
        // Limpar estilos indesejados mas manter formatação básica
        const cleanNodes = Array.from(div.childNodes).map(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                const allowedTags = ['p', 'br', 'b', 'strong', 'i', 'em', 'u', 'ul', 'ol', 'li'];
                if (!allowedTags.includes(node.tagName.toLowerCase())) {
                    return document.createTextNode(node.textContent);
                }
            }
            return node.cloneNode(true);
        });
        
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        range.deleteContents();
        cleanNodes.forEach(node => range.insertNode(node));
        
        // Mover o cursor para o final
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
        
        updateWordCount();
    });

    editor.addEventListener('input', updateWordCount);

    function updateWordCount() {
        const words = editor.innerText.trim().split(/\s+/).length;
        wordCountDisplay.textContent = `${words} palavras`;
        saveContent();
    }

    function saveContent() {
        // Processar o conteúdo para garantir formatação consistente
        const processedContent = processEditorContent(editor);
        localStorage.setItem('editorContent', processedContent);
        // Disparar evento para notificar outras partes do sistema
        editor.dispatchEvent(new CustomEvent('contentChanged', { 
            detail: { 
                html: processedContent,
                text: editor.innerText,
                formatted: true
            } 
        }));
    }

    function processEditorContent(editorElement) {
        // Clone o conteúdo para não modificar o original
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = editorElement.innerHTML;

        // Função para processar estilos de texto
        function processTextStyles(element) {
            if (element.nodeType === Node.ELEMENT_NODE) {
                // Preservar alinhamento
                if (element.style.textAlign) {
                    element.setAttribute('data-text-align', element.style.textAlign);
                }

                // Converter estilos inline em elementos HTML apropriados
                if (element.style.fontWeight === 'bold' || element.style.fontWeight >= 600) {
                    const strong = document.createElement('strong');
                    strong.innerHTML = element.innerHTML;
                    element.innerHTML = strong.outerHTML;
                }
                if (element.style.fontStyle === 'italic') {
                    const em = document.createElement('em');
                    em.innerHTML = element.innerHTML;
                    element.innerHTML = em.outerHTML;
                }
                if (element.style.textDecoration === 'underline') {
                    const u = document.createElement('u');
                    u.innerHTML = element.innerHTML;
                    element.innerHTML = u.outerHTML;
                }

                // Aplicar estilos consistentes
                element.style.fontFamily = 'Arial, sans-serif';
                element.style.fontSize = element.style.fontSize || '12pt';
                element.style.lineHeight = '1.5';

                // Processar filhos recursivamente
                Array.from(element.children).forEach(child => processTextStyles(child));
            }
        }

        // Processar parágrafos
        const paragraphs = tempDiv.getElementsByTagName('p');
        Array.from(paragraphs).forEach(p => {
            // Garantir que cada parágrafo tenha margem adequada
            p.style.marginBottom = '1em';
            p.style.marginTop = '0';
            
            // Processar estilos de texto dentro do parágrafo
            processTextStyles(p);
            
            // Restaurar alinhamento
            const align = p.getAttribute('data-text-align');
            if (align) {
                p.style.textAlign = align;
            } else if (!p.style.textAlign) {
                p.style.textAlign = 'left';
            }
        });

        // Processar listas
        ['ul', 'ol'].forEach(listType => {
            const lists = tempDiv.getElementsByTagName(listType);
            Array.from(lists).forEach(list => {
                list.style.marginLeft = '2em';
                list.style.marginBottom = '1em';
                list.style.paddingLeft = '1em';
                
                const items = list.getElementsByTagName('li');
                Array.from(items).forEach(item => {
                    item.style.marginBottom = '0.5em';
                    processTextStyles(item);
                });
            });
        });

        return tempDiv.innerHTML;
    }

    window.execCommand = function(command, value = null) {
        editor.focus();
        if (command === 'fontSize') {
            document.execCommand(command, false, value);
        } else if (command.startsWith('justify')) {
            // Garantir que o alinhamento seja aplicado ao parágrafo atual
            const selection = window.getSelection();
            const range = selection.getRangeAt(0);
            let currentBlock = range.commonAncestorContainer;
            
            while (currentBlock && currentBlock.nodeType !== Node.ELEMENT_NODE) {
                currentBlock = currentBlock.parentNode;
            }
            
            if (currentBlock && currentBlock !== editor) {
                currentBlock.style.textAlign = command.replace('justify', '').toLowerCase();
            }
        } else {
            document.execCommand(command, false, value);
        }
        saveContent();
    }

    window.addMedicalSignature = function() {
        const doctorSelect = document.getElementById('selectedDoctor');
        if (!doctorSelect) {
            alert('Por favor, selecione um médico antes de adicionar a assinatura.');
            return;
        }

        const selectedOption = doctorSelect.selectedOptions[0];
        if (!selectedOption || !selectedOption.value) {
            alert('Por favor, selecione um médico antes de adicionar a assinatura.');
            return;
        }

        const doctorName = selectedOption.text;
        const crm = selectedOption.dataset.crm;
        const rqe = selectedOption.dataset.rqe;
        const currentDate = new Date().toLocaleDateString('pt-BR');

        // Remover assinatura anterior se existir
        const existingSignature = editor.querySelector('.medical-signature');
        if (existingSignature) {
            existingSignature.remove();
        }

        // Criar a assinatura com formatação consistente
        const signatureHtml = `
            <div class="medical-signature" style="text-align: right; margin-top: 2em; border-top: 1px solid #ccc; padding-top: 1em;">
                <p style="margin-bottom: 0.5em; font-family: Arial, sans-serif;"><strong>Dr(a). ${doctorName}</strong></p>
                <p style="margin-bottom: 0.5em; font-family: Arial, sans-serif;">CRM: ${crm}</p>
                ${rqe ? `<p style="margin-bottom: 0.5em; font-family: Arial, sans-serif;">RQE: ${rqe}</p>` : ''}
                <p style="margin-bottom: 0.5em; font-size: 0.9em; font-family: Arial, sans-serif;">${currentDate}</p>
            </div>
        `;

        // Adicionar quebra de linha e assinatura ao final do editor
        editor.innerHTML = editor.innerHTML + '<p><br></p>' + signatureHtml;
        saveContent();
    }

    // Restaurar conteúdo salvo se existir
    const savedContent = localStorage.getItem('editorContent');
    if (savedContent) {
        editor.innerHTML = processEditorContent(document.createElement('div')).innerHTML = savedContent;
        updateWordCount();
    }

    // Adicionar listeners para formatação automática
    editor.addEventListener('blur', () => {
        // Processar conteúdo quando o editor perde o foco
        const processedContent = processEditorContent(editor);
        if (processedContent !== editor.innerHTML) {
            editor.innerHTML = processedContent;
        }
    });

    // Expor função para outros módulos
    window.getProcessedEditorContent = () => {
        return processEditorContent(editor);
    };
});
