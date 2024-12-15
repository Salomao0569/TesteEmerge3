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

        // Função para processar estilos de texto de forma segura
        function processTextStyles(element) {
            if (!element || element.nodeType !== Node.ELEMENT_NODE) {
                return;
            }

            try {
                // Preservar alinhamento original
                const computedStyle = window.getComputedStyle(element);
                const textAlign = computedStyle.textAlign;
                if (textAlign && textAlign !== 'start') {
                    element.style.textAlign = textAlign;
                }

                // Processar estilos de texto
                const fontWeight = computedStyle.fontWeight;
                const fontStyle = computedStyle.fontStyle;
                const textDecoration = computedStyle.textDecoration;

                // Criar um novo elemento wrapper para manter a hierarquia
                const wrapper = document.createElement('span');
                wrapper.innerHTML = element.innerHTML;

                // Aplicar formatação com base nos estilos computados
                if (parseInt(fontWeight) >= 600) {
                    const strong = document.createElement('strong');
                    strong.innerHTML = wrapper.innerHTML;
                    wrapper.innerHTML = strong.outerHTML;
                }
                if (fontStyle === 'italic') {
                    const em = document.createElement('em');
                    em.innerHTML = wrapper.innerHTML;
                    wrapper.innerHTML = em.outerHTML;
                }
                if (textDecoration.includes('underline')) {
                    const u = document.createElement('u');
                    u.innerHTML = wrapper.innerHTML;
                    wrapper.innerHTML = u.outerHTML;
                }

                // Atualizar o conteúdo do elemento original
                element.innerHTML = wrapper.innerHTML;

                // Aplicar estilos consistentes
                element.style.fontFamily = 'Arial, sans-serif';
                element.style.fontSize = element.style.fontSize || '12pt';
                element.style.lineHeight = '1.5';

                // Processar filhos recursivamente
                const children = Array.from(element.children);
                children.forEach(child => processTextStyles(child));
            } catch (error) {
                console.error('Erro ao processar estilos:', error);
            }
        }

        try {
            // Processar parágrafos com tratamento de erro
            const paragraphs = tempDiv.getElementsByTagName('p');
            if (paragraphs && paragraphs.length > 0) {
                Array.from(paragraphs).forEach(p => {
                    if (!p) return;
                    
                    try {
                        // Garantir que cada parágrafo tenha margem adequada
                        p.style.marginBottom = '1em';
                        p.style.marginTop = '0';
                        
                        // Processar estilos de texto dentro do parágrafo
                        processTextStyles(p);
                        
                        // Aplicar alinhamento com base no estilo computado
                        const computedStyle = window.getComputedStyle(p);
                        if (computedStyle.textAlign !== 'start' && computedStyle.textAlign !== 'left') {
                            p.style.textAlign = computedStyle.textAlign;
                        } else {
                            p.style.textAlign = 'left';
                        }

                        // Garantir que o parágrafo mantenha sua formatação
                        p.setAttribute('data-original-format', 'true');
                    } catch (error) {
                        console.error('Erro ao processar parágrafo:', error);
                    }
                });
            }

            // Processar listas com verificações de segurança
            ['ul', 'ol'].forEach(listType => {
                const lists = tempDiv.getElementsByTagName(listType);
                if (!lists || lists.length === 0) return;

                Array.from(lists).forEach(list => {
                    if (!list) return;
                    
                    try {
                        // Aplicar estilos de lista
                        list.style.marginLeft = '2em';
                        list.style.marginBottom = '1em';
                        list.style.paddingLeft = '1em';
                        
                        // Processar itens da lista
                        const items = list.getElementsByTagName('li');
                        if (items && items.length > 0) {
                            Array.from(items).forEach(item => {
                                if (!item) return;
                                
                                try {
                                    item.style.marginBottom = '0.5em';
                                    processTextStyles(item);
                                    
                                    // Garantir que itens de lista mantenham sua formatação
                                    item.setAttribute('data-original-format', 'true');
                                } catch (error) {
                                    console.error('Erro ao processar item de lista:', error);
                                }
                            });
                        }

                        // Garantir que a lista mantenha sua formatação
                        list.setAttribute('data-original-format', 'true');
                    } catch (error) {
                        console.error('Erro ao processar lista:', error);
                    }
                });
            });

            // Garantir que elementos formatados mantenham seus estilos
            ['strong', 'b', 'em', 'i', 'u'].forEach(tag => {
                const elements = tempDiv.getElementsByTagName(tag);
                Array.from(elements).forEach(el => {
                    if (el) {
                        el.setAttribute('data-original-format', 'true');
                    }
                });
            });

        } catch (error) {
            console.error('Erro ao processar conteúdo:', error);
        }

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
            
            // Encontrar o elemento pai mais próximo que seja um parágrafo ou div
            while (currentBlock && currentBlock.nodeType !== Node.ELEMENT_NODE) {
                currentBlock = currentBlock.parentNode;
            }
            
            // Se encontrou um bloco válido e não é o próprio editor
            if (currentBlock && currentBlock !== editor) {
                const align = command.replace('justify', '').toLowerCase();
                currentBlock.style.textAlign = align;
                
                // Garantir que a formatação seja mantida
                currentBlock.setAttribute('data-text-align', align);
                currentBlock.setAttribute('data-original-format', 'true');
            }
        } else {
            // Para outros comandos (negrito, itálico, sublinhado)
            document.execCommand(command, false, value);
            
            // Processar o elemento recém formatado
            const selection = window.getSelection();
            const range = selection.getRangeAt(0);
            const container = range.commonAncestorContainer;
            
            // Encontrar o elemento pai mais próximo com a formatação
            let formattedElement = container;
            while (formattedElement && formattedElement.nodeType !== Node.ELEMENT_NODE) {
                formattedElement = formattedElement.parentNode;
            }
            
            if (formattedElement && formattedElement !== editor) {
                // Adicionar atributos para identificar a formatação
                formattedElement.setAttribute('data-original-format', 'true');
                const style = window.getComputedStyle(formattedElement);
                
                // Preservar estilos computados
                if (style.fontWeight >= 600) {
                    formattedElement.setAttribute('data-font-weight', 'bold');
                }
                if (style.fontStyle === 'italic') {
                    formattedElement.setAttribute('data-font-style', 'italic');
                }
                if (style.textDecoration.includes('underline')) {
                    formattedElement.setAttribute('data-text-decoration', 'underline');
                }
            }
        }
        saveContent();
        
        // Atualizar visualização para garantir consistência
        const processedContent = processEditorContent(editor);
        if (processedContent !== editor.innerHTML) {
            editor.innerHTML = processedContent;
            // Restaurar seleção
            if (selection && range) {
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }
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

    // Função para preparar conteúdo para geração de documentos
    window.prepareContentForDocument = () => {
        const processedContent = processEditorContent(editor);
        const docDiv = document.createElement('div');
        docDiv.innerHTML = processedContent;

        // Função para garantir que todos os elementos tenham estilos explícitos
        function ensureExplicitStyles(element) {
            if (element.nodeType === Node.ELEMENT_NODE) {
                // Garantir que todos os parágrafos tenham alinhamento explícito
                if (element.tagName === 'P') {
                    if (!element.style.textAlign) {
                        element.style.textAlign = 'left';
                    }
                    if (!element.style.marginBottom) {
                        element.style.marginBottom = '1em';
                    }
                }

                // Converter elementos de estilo em tags HTML apropriadas
                if (window.getComputedStyle(element).fontWeight >= 600) {
                    element.innerHTML = `<strong>${element.innerHTML}</strong>`;
                }
                if (window.getComputedStyle(element).fontStyle === 'italic') {
                    element.innerHTML = `<em>${element.innerHTML}</em>`;
                }
                if (window.getComputedStyle(element).textDecoration.includes('underline')) {
                    element.innerHTML = `<u>${element.innerHTML}</u>`;
                }

                // Garantir fonte e tamanho consistentes
                element.style.fontFamily = 'Arial, sans-serif';
                element.style.fontSize = element.style.fontSize || '12pt';
                element.style.lineHeight = '1.5';

                // Processar elementos filhos recursivamente
                Array.from(element.children).forEach(child => ensureExplicitStyles(child));
            }
        }

        ensureExplicitStyles(docDiv);
        return docDiv.innerHTML;
    };
});