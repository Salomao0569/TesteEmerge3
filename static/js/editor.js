document.addEventListener('DOMContentLoaded', function() {
    // Adicionar atalhos de teclado
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key.toLowerCase()) {
                case 'b':
                    e.preventDefault();
                    execCommand('bold');
                    break;
                case 'i':
                    e.preventDefault();
                    execCommand('italic');
                    break;
                case 'u':
                    e.preventDefault();
                    execCommand('underline');
                    break;
            }
        }
    });

    // Função para limpar formatação indesejada
    function cleanFormatting(element) {
        if (!element || element.nodeType !== Node.ELEMENT_NODE) {
            return;
        }

        // Lista de atributos para manter
        const keepAttributes = ['style', 'class', 'data-processed'];
        
        // Remover todos os atributos exceto os permitidos
        Array.from(element.attributes).forEach(attr => {
            if (!keepAttributes.includes(attr.name)) {
                element.removeAttribute(attr.name);
            }
        });
        
        // Limpar estilos inline desnecessários
        if (element.style.cssText) {
            const allowedStyles = ['text-align', 'font-family', 'font-size', 'line-height', 'margin', 'padding'];
            const currentStyles = element.style.cssText.split(';')
                .map(style => style.trim())
                .filter(style => {
                    const prop = style.split(':')[0].trim();
                    return allowedStyles.includes(prop);
                })
                .join(';');
            
            element.style.cssText = currentStyles;
        }
        
        // Processar elementos filhos recursivamente
        Array.from(element.children).forEach(child => cleanFormatting(child));
    }
    const editor = document.getElementById('editor');
    if (!editor) return;
    
    const wordCountDisplay = document.createElement('div');
    wordCountDisplay.className = 'text-muted small mt-2';
    editor.parentElement.appendChild(wordCountDisplay);

    // Configurar o editor para preservar formatação
    editor.addEventListener('paste', function(e) {
        e.preventDefault();
        let text = '';
        
        try {
            // Obter o conteúdo colado
            if (e.clipboardData.types.includes('text/html')) {
                text = e.clipboardData.getData('text/html');
            } else {
                text = e.clipboardData.getData('text/plain');
                // Converter quebras de linha em parágrafos para texto puro
                text = '<p>' + text.split(/\n\s*\n/).join('</p><p>') + '</p>';
                // Converter quebras de linha simples em <br>
                text = text.replace(/\n/g, '<br>');
            }
            
            // Criar um elemento temporário para processar o conteúdo
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = text;
            
            // Definir tags e atributos permitidos
            const allowedTags = ['p', 'br', 'b', 'strong', 'i', 'em', 'u', 'ul', 'ol', 'li', 'div'];
            const allowedAttributes = ['style', 'class', 'data-processed'];
            const allowedStyles = ['text-align', 'margin-left', 'padding-left'];
            
            function processNode(node) {
                if (node.nodeType === Node.TEXT_NODE) {
                    return document.createTextNode(node.textContent);
                }
                
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const tagName = node.tagName.toLowerCase();
                    
                    // Se a tag não é permitida, criar um parágrafo
                    if (!allowedTags.includes(tagName)) {
                        const p = document.createElement('p');
                        p.textContent = node.textContent;
                        return p;
                    }
                    
                    // Criar novo elemento com a tag permitida
                    const newElement = document.createElement(tagName);
                    
                    // Copiar atributos permitidos
                    Array.from(node.attributes).forEach(attr => {
                        if (allowedAttributes.includes(attr.name)) {
                            if (attr.name === 'style') {
                                const styles = attr.value.split(';')
                                    .filter(style => {
                                        const prop = style.split(':')[0].trim();
                                        return allowedStyles.includes(prop);
                                    })
                                    .join(';');
                                if (styles) {
                                    newElement.style.cssText = styles;
                                }
                            } else {
                                newElement.setAttribute(attr.name, attr.value);
                            }
                        }
                    });
                    
                    // Preservar formatação de texto básica
                    const computedStyle = window.getComputedStyle(node);
                    if (parseInt(computedStyle.fontWeight) >= 600) {
                        const strong = document.createElement('strong');
                        strong.innerHTML = node.innerHTML;
                        newElement.appendChild(strong);
                    } else if (computedStyle.fontStyle === 'italic') {
                        const em = document.createElement('em');
                        em.innerHTML = node.innerHTML;
                        newElement.appendChild(em);
                    } else if (computedStyle.textDecoration.includes('underline')) {
                        const u = document.createElement('u');
                        u.innerHTML = node.innerHTML;
                        newElement.appendChild(u);
                    } else {
                        // Processar filhos recursivamente
                        Array.from(node.childNodes).forEach(child => {
                            const processedChild = processNode(child);
                            if (processedChild) {
                                newElement.appendChild(processedChild);
                            }
                        });
                    }
                    
                    return newElement;
                }
                
                return null;
            }
            
            // Processar e limpar o conteúdo
            const cleanNodes = Array.from(tempDiv.childNodes)
                .map(node => processNode(node))
                .filter(Boolean);
            
            // Inserir o conteúdo processado
            const selection = window.getSelection();
            const range = selection.getRangeAt(0);
            range.deleteContents();
            
            cleanNodes.forEach(node => {
                // Aplicar estilos consistentes antes de inserir
                processTextStyles(node);
                range.insertNode(node);
                range.collapse(false);
            });
            
            // Normalizar o DOM e atualizar a seleção
            editor.normalize();
            selection.removeAllRanges();
            selection.addRange(range);
            
            // Processar todo o conteúdo do editor para garantir consistência
            processTextStyles(editor);
            updateWordCount();
            
        } catch (error) {
            console.error('Erro ao processar conteúdo colado:', error);
            // Fallback: inserir como texto puro
            const text = e.clipboardData.getData('text/plain');
            document.execCommand('insertText', false, text);
            updateWordCount();
        }
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

        function processTextStyles(element) {
            if (!element || element.nodeType !== Node.ELEMENT_NODE) {
                return;
            }

            try {
                const computedStyle = window.getComputedStyle(element);
                const tagName = element.tagName.toLowerCase();

                // Limpar formatações anteriores
                cleanFormatting(element);
                
                // Definir estilos base com !important
                element.style.setProperty('font-family', 'Arial, sans-serif', 'important');
                element.style.setProperty('font-size', '12pt', 'important');
                element.style.setProperty('line-height', '1.5', 'important');

                // Aplicar estilos específicos por tipo de elemento
                if (tagName === 'p') {
                    element.style.setProperty('margin', '0 0 1em 0', 'important');
                    element.style.setProperty('padding', '0', 'important');
                    
                    // Preservar alinhamento de texto
                    const textAlign = computedStyle.textAlign;
                    if (textAlign && textAlign !== 'start') {
                        element.style.setProperty('text-align', textAlign, 'important');
                    }
                } else if (tagName === 'ul' || tagName === 'ol') {
                    element.style.setProperty('margin', '0 0 1em 2em', 'important');
                    element.style.setProperty('padding', '0', 'important');
                } else if (tagName === 'li') {
                    element.style.setProperty('margin', '0 0 0.5em 0', 'important');
                    element.style.setProperty('padding', '0', 'important');
                }

                // Processar formatação de texto mantendo a estrutura HTML
                let content = element.innerHTML;
                const textFormats = [
                    {
                        condition: () => parseInt(computedStyle.fontWeight) >= 600,
                        tag: 'strong',
                        check: (str) => !/<(strong|b)[^>]*>/.test(str)
                    },
                    {
                        condition: () => computedStyle.fontStyle === 'italic',
                        tag: 'em',
                        check: (str) => !/<(em|i)[^>]*>/.test(str)
                    },
                    {
                        condition: () => computedStyle.textDecoration.includes('underline'),
                        tag: 'u',
                        check: (str) => !/<u[^>]*>/.test(str)
                    }
                ];

                // Aplicar formatação preservando a estrutura
                let hasChanges = false;
                textFormats.forEach(format => {
                    if (format.condition() && format.check(content)) {
                        content = `<${format.tag}>${content}</${format.tag}>`;
                        hasChanges = true;
                    }
                });

                // Atualizar conteúdo apenas se necessário
                if (hasChanges) {
                    element.innerHTML = content;
                }

                // Processar elementos filhos recursivamente
                Array.from(element.children).forEach(child => {
                    if (!child.hasAttribute('data-processed')) {
                        if (child.classList.contains('medical-signature')) {
                            // Preservar formatação da assinatura
                            child.style.setProperty('margin-top', '2cm', 'important');
                            child.style.setProperty('position', 'relative', 'important');
                            child.style.setProperty('padding-top', '0.5cm', 'important');
                            child.style.setProperty('border-top', '1px solid #000', 'important');
                            child.style.setProperty('text-align', 'right', 'important');
                            child.style.setProperty('page-break-inside', 'avoid', 'important');
                        } else {
                            processTextStyles(child);
                        }
                        child.setAttribute('data-processed', 'true');
                    }
                });
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

        // Função para limpar o conteúdo do editor
        function cleanEditorContent() {
            // Remover quebras de linha extras e espaços em branco no final
            let content = editor.innerHTML;
            
            // Remover parágrafos vazios no final
            while (/\s*<p[^>]*>(\s|&nbsp;|<br\s*\/?>)*<\/p>\s*$/i.test(content)) {
                content = content.replace(/\s*<p[^>]*>(\s|&nbsp;|<br\s*\/?>)*<\/p>\s*$/i, '');
            }
            
            // Garantir que termine com um parágrafo não vazio
            if (!/\s*<p[^>]*>[^<]+<\/p>\s*$/i.test(content)) {
                content = content.replace(/\s*$/, '');
            }
            
            return content.trim();
        }

        // Criar a assinatura com formatação consistente e espaçamento preciso
        const signatureHtml = `
            <div class="medical-signature" contenteditable="false" style="position: relative !important; display: block !important; margin: 2cm 0 0 0 !important; padding: 0.5cm 0 0 0 !important; border-top: 1px solid #000 !important; text-align: right !important; page-break-inside: avoid !important; page-break-after: avoid !important;">
                <p style="margin: 0 0 0.3cm 0 !important; padding: 0 !important; font-family: Arial, sans-serif !important; font-size: 12pt !important; line-height: 1.2 !important; text-align: right !important;"><strong style="font-weight: bold !important;">Dr(a). ${doctorName}</strong></p>
                <p style="margin: 0 0 0.3cm 0 !important; padding: 0 !important; font-family: Arial, sans-serif !important; font-size: 12pt !important; line-height: 1.2 !important; text-align: right !important;">CRM: ${crm}</p>
                ${rqe ? `<p style="margin: 0 0 0.3cm 0 !important; padding: 0 !important; font-family: Arial, sans-serif !important; font-size: 12pt !important; line-height: 1.2 !important; text-align: right !important;">RQE: ${rqe}</p>` : ''}
                <p style="margin: 0 !important; padding: 0 !important; font-family: Arial, sans-serif !important; font-size: 11pt !important; line-height: 1.2 !important; text-align: right !important;">${currentDate}</p>
            </div>
        `;

        // Limpar o conteúdo do editor e adicionar a assinatura
        const cleanContent = cleanEditorContent();
        const finalContent = cleanContent + signatureHtml;
        
        // Atualizar o editor mantendo a formatação
        editor.innerHTML = finalContent;
        
        // Processar e salvar o conteúdo
        processTextStyles(editor);
        saveContent();
        
        // Garantir que o cursor fique antes da assinatura
        const range = document.createRange();
        const sel = window.getSelection();
        const lastParagraph = Array.from(editor.querySelectorAll('p:not(.medical-signature p)')).pop();
        
        if (lastParagraph) {
            range.setStartAfter(lastParagraph);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
        }
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

        function ensureExplicitStyles(element) {
            if (!element || element.nodeType !== Node.ELEMENT_NODE) {
                return;
            }

            try {
                const computedStyle = window.getComputedStyle(element);
                const tagName = element.tagName.toLowerCase();

                // Preservar estilos base com !important
                element.style.setProperty('font-family', 'Arial, sans-serif', 'important');
                element.style.setProperty('font-size', '12pt', 'important');
                element.style.setProperty('line-height', '1.5', 'important');

                if (tagName === 'p') {
                    // Garantir espaçamento consistente para parágrafos
                    element.style.setProperty('margin', '0 0 1em 0', 'important');
                    element.style.setProperty('padding', '0', 'important');
                    
                    // Preservar alinhamento
                    const textAlign = computedStyle.textAlign;
                    if (textAlign && textAlign !== 'start') {
                        element.style.setProperty('text-align', textAlign, 'important');
                    }
                }

                // Tratamento especial para a assinatura médica
                if (element.classList.contains('medical-signature')) {
                    element.style.setProperty('text-align', 'right', 'important');
                    element.style.setProperty('position', 'relative', 'important');
                    element.style.setProperty('margin-top', '2cm', 'important');
                    element.style.setProperty('margin-bottom', '0', 'important');
                    element.style.setProperty('padding-top', '0.5cm', 'important');
                    element.style.setProperty('border-top', '1px solid #000', 'important');
                    element.style.setProperty('page-break-inside', 'avoid', 'important');
                    element.style.setProperty('page-break-after', 'avoid', 'important');
                    
                    // Processar os parágrafos dentro da assinatura
                    Array.from(element.getElementsByTagName('p')).forEach((p, index, arr) => {
                        p.style.setProperty('margin', '0', 'important');
                        p.style.setProperty('padding', '0', 'important');
                        p.style.setProperty('line-height', '1.2', 'important');
                        if (index < arr.length - 1) {
                            p.style.setProperty('margin-bottom', '0.3cm', 'important');
                        }
                    });
                    
                    return; // Não processar mais os filhos da assinatura
                } // Fim do bloco medical-signature

                // Preservar formatação de texto
                const content = element.innerHTML;
                const formats = {
                    bold: {
                        condition: () => parseInt(computedStyle.fontWeight) >= 600,
                        tag: 'strong',
                        check: content => !/<(strong|b)[^>]*>/.test(content)
                    },
                    italic: {
                        condition: () => computedStyle.fontStyle === 'italic',
                        tag: 'em',
                        check: content => !/<(em|i)[^>]*>/.test(content)
                    },
                    underline: {
                        condition: () => computedStyle.textDecoration.includes('underline'),
                        tag: 'u',
                        check: content => !/<u[^>]*>/.test(content)
                    }
                };

                let newContent = content;
                Object.values(formats).forEach(format => {
                    if (format.condition() && format.check(newContent)) {
                        newContent = `<${format.tag}>${newContent}</${format.tag}>`;
                    }
                });

                if (newContent !== content) {
                    element.innerHTML = newContent;
                }

                // Processar elementos filhos recursivamente
                Array.from(element.children).forEach(child => {
                    ensureExplicitStyles(child);
                });
            } catch (error) {
                console.error('Erro ao processar estilos:', error, element);
            }
        }

        ensureExplicitStyles(docDiv);
        return docDiv.innerHTML;
    };
});