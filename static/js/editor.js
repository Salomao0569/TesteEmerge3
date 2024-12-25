$(document).ready(function() {
    console.log('Iniciando configuração do editor...');

    try {
        // Configurar Summernote
        $('#editor').summernote({
            height: 500,
            lang: 'pt-BR',
            toolbar: [
                ['style', ['style']],
                ['font', ['bold', 'italic', 'underline', 'strikethrough', 'clear']],
                ['fontsize', ['fontsize']],
                ['color', ['color']],
                ['para', ['ul', 'ol', 'paragraph']],
                ['table', ['table']],
                ['insert', ['link', 'picture']],
                ['view', ['fullscreen', 'codeview']],
                ['custom', ['gerarTextoIA', 'avaliarLaudo', 'salvarFraseModelo']] // Adicionado botão de avaliação
            ],
            fontSizes: ['8', '9', '10', '11', '12', '14', '16', '18', '24', '36'],
            styleTags: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
            placeholder: 'Digite o conteúdo do laudo aqui...',
            callbacks: {
                onChange: function(contents) {
                    localStorage.setItem('reportContent', contents);
                    showBackupIndicator();
                },
                onInit: function() {
                    console.log('Editor inicializado com sucesso');
                    const savedContent = localStorage.getItem('reportContent');
                    if (savedContent) {
                        $('#editor').summernote('code', savedContent);
                    }
                }
            },
            buttons: {
                gerarTextoIA: function (context) {
                    var ui = $.summernote.ui;
                    var button = ui.button({
                        contents: '<i class="fas fa-robot"></i> Simplifica IA',
                        tooltip: 'Gerar Texto com IA',
                        click: function () {
                            $('#modalGerarTexto').modal('show');
                        }
                    });
                    return button.render();
                },
                avaliarLaudo: function (context) {
                    var ui = $.summernote.ui;
                    var button = ui.button({
                        contents: '<i class="fas fa-check-circle"></i> Avaliar',
                        tooltip: 'Avaliar Laudo Atual',
                        click: function () {
                            avaliarLaudoAtual();
                        }
                    });
                    return button.render();
                },
                salvarFraseModelo: function (context) {
                    var ui = $.summernote.ui;
                    var button = ui.button({
                        contents: '<i class="fas fa-save"></i> Salvar Frase/Modelo',
                        tooltip: 'Salvar como Frase ou Modelo',
                        click: function () {
                            salvarFraseModelo();
                        }
                    });
                    return button.render();
                }
            }
        });

        // Carregar templates e frases
        loadTemplatesAndPhrases();
        loadDoctors();

        // Layout com dois painéis
        $('body').append(`
            <div class="modal fade" id="modalGerarTexto" tabindex="-1">
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Simplifica IA</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-5">
                                    <div class="form-group">
                                        <label for="promptIA">Descreva o que você deseja gerar:</label>
                                        <textarea class="form-control" id="promptIA" rows="3" 
                                            placeholder="Ex: Gere um laudo normal para um paciente com fração de ejeção preservada"></textarea>
                                        <div class="mt-3">
                                            <button type="button" class="btn btn-primary" onclick="gerarTextoIA()">
                                                <i class="fas fa-robot"></i> Gerar Texto
                                            </button>
                                            <button type="button" class="btn btn-info ms-2" onclick="avaliarLaudoAtual()">
                                                <i class="fas fa-check-circle"></i> Avaliar Laudo Atual
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-7">
                                    <div class="preview-area">
                                        <label>Preview do texto gerado:</label>
                                        <div id="previewTextoIA" class="form-control preview-content" contenteditable="true"></div>
                                        <div class="btn-group mt-2">
                                            <button class="btn btn-success btn-sm" onclick="inserirTextoGerado()">
                                                <i class="fas fa-paste"></i> Inserir no Editor
                                            </button>
                                            <button class="btn btn-outline-secondary btn-sm" onclick="copiarTextoGerado()">
                                                <i class="fas fa-copy"></i> Copiar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `);

    } catch (error) {
        console.error('Erro ao configurar editor:', error);
    }
});

// Função para avaliar o laudo atual
async function avaliarLaudoAtual() {
    const laudoAtual = $('#editor').summernote('code');
    if (!laudoAtual) {
        alert('Por favor, insira algum texto no editor para avaliar.');
        return;
    }

    try {
        const token = getCSRFToken(); //This function should be implemented elsewhere
        if (!token) {
            throw new Error('CSRF token não encontrado. Por favor, recarregue a página.');
        }

        const previewArea = document.getElementById('previewTextoIA');
        previewArea.innerHTML = '<div class="alert alert-info">Analisando laudo, por favor aguarde...</div>';

        const response = await fetch('/api/gerar_texto', {
            method: 'POST',
            headers: addCSRFToken({ //This function should be implemented elsewhere
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({ 
                prompt: `Por favor, analise este laudo ecocardiográfico e forneça feedback sobre sua completude, 
                        clareza e possíveis melhorias:\n\n${laudoAtual}` 
            })
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        if (data.texto) {
            previewArea.innerHTML = data.texto;
        } else {
            throw new Error('Resposta inválida do servidor');
        }
    } catch (error) {
        console.error('Erro ao avaliar laudo:', error);
        const previewArea = document.getElementById('previewTextoIA');
        previewArea.innerHTML = `<div class="alert alert-danger">
            <strong>Erro ao avaliar laudo:</strong><br>
            ${error.message || 'Erro desconhecido'}
        </div>`;
    }
}

// Função para copiar texto gerado
function copiarTextoGerado() {
    const texto = document.getElementById('previewTextoIA').innerText;
    if (texto) {
        navigator.clipboard.writeText(texto)
            .then(() => {
                const btn = document.querySelector('.btn-outline-secondary');
                btn.innerHTML = '<i class="fas fa-check"></i> Copiado!';
                setTimeout(() => {
                    btn.innerHTML = '<i class="fas fa-copy"></i> Copiar';
                }, 2000);
            })
            .catch(err => {
                console.error('Erro ao copiar texto:', err);
                alert('Não foi possível copiar o texto automaticamente.');
            });
    }
}

// Função para gerar texto usando IA
async function gerarTextoIA() {
    const prompt = document.getElementById('promptIA').value;
    if (!prompt) {
        alert('Por favor, descreva o que você deseja gerar.');
        return;
    }

    try {
        const token = getCSRFToken();//This function should be implemented elsewhere
        if (!token) {
            throw new Error('CSRF token não encontrado. Por favor, recarregue a página.');
        }

        const previewArea = document.getElementById('previewTextoIA');
        previewArea.innerHTML = '<div class="alert alert-info">Gerando texto, por favor aguarde...</div>';

        const response = await fetch('/api/gerar_texto', {
            method: 'POST',
            headers: addCSRFToken({//This function should be implemented elsewhere
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({ prompt })
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        if (!response.ok) {
            throw new Error('Erro ao gerar texto');
        }

        if (data.texto) {
            // Mostrar o texto gerado na área de preview
            previewArea.innerHTML = data.texto;
        } else {
            throw new Error('Resposta inválida do servidor');
        }
    } catch (error) {
        console.error('Erro ao gerar texto:', error);
        const errorMessage = error.message || 'Erro desconhecido. Por favor, tente novamente.';

        // Mostrar erro no preview
        const previewArea = document.getElementById('previewTextoIA');
        previewArea.innerHTML = `<div class="alert alert-danger">
            <strong>Erro ao gerar texto:</strong><br>
            ${errorMessage}
        </div>`;
    }
}

// Função para inserir o texto do preview no editor
function inserirTextoGerado() {
    const textoGerado = document.getElementById('previewTextoIA').innerHTML;
    if (textoGerado) {
        $('#editor').summernote('pasteHTML', textoGerado);
        $('#modalGerarTexto').modal('hide');
        // Limpar preview e prompt
        document.getElementById('previewTextoIA').innerHTML = '';
        document.getElementById('promptIA').value = '';
    }
}

// Função para carregar templates e frases
async function loadTemplatesAndPhrases() {
    try {
        const response = await fetch('/api/templates');
        const templates = await response.json();

        const templateSelect = document.getElementById('templateSelect');
        const phraseSelect = document.getElementById('phraseSelect');

        // Limpar opções existentes
        templateSelect.innerHTML = '<option value="">Selecione um modelo...</option>';
        phraseSelect.innerHTML = '<option value="">Selecione uma frase...</option>';

        // Adicionar templates
        templates.filter(t => t.category === 'laudo').forEach(template => {
            const option = new Option(template.name, template.id);
            option.title = template.content;
            templateSelect.add(option);
        });

        // Adicionar frases
        templates.filter(t => ['normal', 'alterado', 'conclusao'].includes(t.category)).forEach(phrase => {
            const option = new Option(phrase.name, phrase.id);
            option.title = phrase.content;
            phraseSelect.add(option);
        });

    } catch (error) {
        console.error('Erro ao carregar templates:', error);
    }
}

// Função para carregar médicos do servidor
async function loadDoctors() {
    try {
        const response = await fetch('/api/doctors');
        const doctors = await response.json();

        const doctorSelect = document.getElementById('selectedDoctor');
        doctorSelect.innerHTML = '<option value="">Selecione o médico...</option>';

        doctors.forEach(doctor => {
            const option = new Option(doctor.full_name, doctor.id);
            option.dataset.crm = doctor.crm;
            option.dataset.rqe = doctor.rqe || '';
            doctorSelect.add(option);
        });

    } catch (error) {
        console.error('Erro ao carregar médicos:', error);
    }
}

// Função para inserir template selecionado
function insertSelectedTemplate() {
    const templateSelect = document.getElementById('templateSelect');
    const selectedOption = templateSelect.options[templateSelect.selectedIndex];
    if (selectedOption && selectedOption.value) {
        $('#editor').summernote('code', selectedOption.title);
    }
}

// Função para inserir frase selecionada
function insertSelectedPhrase() {
    const phraseSelect = document.getElementById('phraseSelect');
    const selectedOption = phraseSelect.options[phraseSelect.selectedIndex];
    if (selectedOption && selectedOption.value) {
        const currentContent = $('#editor').summernote('code');
        $('#editor').summernote('pasteHTML', currentContent + '\n' + selectedOption.title);
    }
}

// Função para inserir assinatura do médico
function inserirAssinaturaMedico() {
    const select = document.getElementById('selectedDoctor');
    if (!select) return;

    const option = select.options[select.selectedIndex];
    if (!option || !option.value) {
        alert('Por favor, selecione um médico responsável');
        return;
    }

    const medicName = option.text;
    const crm = option.dataset.crm;
    const rqe = option.dataset.rqe;

    const dadosMedico = `\n\n<p style="text-align: center;">
        <strong>${medicName}</strong><br>
        CRM: ${crm}${rqe ? `<br>RQE: ${rqe}` : ''}
    </p>`;

    // Get current content and add doctor info at the end
    const currentContent = $('#editor').summernote('code');
    $('#editor').summernote('code', currentContent + dadosMedico);
}

// Função para mostrar indicador de backup
function showBackupIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'backup-indicator';
    indicator.textContent = 'Conteúdo salvo localmente';
    document.body.appendChild(indicator);

    setTimeout(() => {
        indicator.remove();
    }, 2000);
}

// Adicionar event listeners aos selects
document.getElementById('templateSelect').addEventListener('change', insertSelectedTemplate);
document.getElementById('phraseSelect').addEventListener('change', insertSelectedPhrase);


// Função para salvar frase ou modelo
async function salvarFraseModelo() {
    try {
        // Criar modal para input se ainda não existir
        if (!document.getElementById('modalSalvarFrase')) {
            const modalHtml = `
                <div class="modal fade" id="modalSalvarFrase" tabindex="-1">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Salvar Frase/Modelo</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <form id="salvarFraseForm" onsubmit="return false;">
                                    <div class="mb-3">
                                        <label for="tituloFrase" class="form-label">Título:</label>
                                        <input type="text" class="form-control" id="tituloFrase" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="categoriaFrase" class="form-label">Categoria:</label>
                                        <select class="form-select" id="categoriaFrase" required>
                                            <option value="">Selecione uma categoria...</option>
                                            <option value="normal">Normal</option>
                                            <option value="alterado">Alterado</option>
                                            <option value="conclusao">Conclusão</option>
                                            <option value="laudo">Laudo Completo</option>
                                        </select>
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="button" class="btn btn-primary" onclick="confirmarSalvarFrase()">
                                    <i class="fas fa-save"></i> Salvar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
        }

        // Obter conteúdo selecionado ou todo o conteúdo
        const editor = $('#editor');
        const conteudo = editor.summernote('createRange')?.toString() || editor.summernote('code');

        if (!conteudo.trim()) {
            showFeedback('Por favor, selecione ou digite algum conteúdo antes de salvar.', 'warning');
            return;
        }

        // Armazenar temporariamente o conteúdo
        window.tempContent = conteudo;

        // Mostrar modal usando Bootstrap 5
        const modalElement = document.getElementById('modalSalvarFrase');
        const modal = new bootstrap.Modal(modalElement);
        modal.show();

    } catch (error) {
        console.error('Erro ao preparar modal:', error);
        showFeedback('Erro ao preparar formulário de salvamento', 'danger');
    }
}

// Função para confirmar e salvar a frase/modelo
async function confirmarSalvarFrase() {
    const form = document.getElementById('salvarFraseForm');
    const titulo = document.getElementById('tituloFrase')?.value?.trim();
    const categoria = document.getElementById('categoriaFrase')?.value;
    const conteudo = window.tempContent;

    if (!titulo || !categoria) {
        showFeedback('Por favor, preencha todos os campos.', 'warning');
        return;
    }

    const loadingBtn = document.querySelector('#modalSalvarFrase .btn-primary');
    const originalBtnHtml = loadingBtn.innerHTML;

    try {
        loadingBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
        loadingBtn.disabled = true;

        const headers = addCSRFToken({
            'Content-Type': 'application/json'
        });

        const response = await fetch('/api/phrases', {
            method: 'POST',
            headers,
            body: JSON.stringify({
                title: titulo,
                content: conteudo,
                category: categoria
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erro ao salvar frase/modelo');
        }

        // Fechar modal e limpar form
        const modalElement = document.getElementById('modalSalvarFrase');
        const modal = bootstrap.Modal.getInstance(modalElement);
        modal.hide();
        form.reset();
        delete window.tempContent;

        // Mostrar feedback de sucesso
        showFeedback('Frase/modelo salvo com sucesso!', 'success');

        // Recarregar lista de templates e frases
        await loadTemplatesAndPhrases();

    } catch (error) {
        console.error('Erro ao salvar:', error);
        showFeedback(error.message || 'Erro ao salvar frase/modelo', 'danger');
    } finally {
        if (loadingBtn) {
            loadingBtn.innerHTML = originalBtnHtml || '<i class="fas fa-save"></i> Salvar';
            loadingBtn.disabled = false;
        }
    }
}

// Função para mostrar feedback visual
function showFeedback(message, type = 'success') {
    try {
        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = `alert alert-${type} position-fixed top-0 end-0 m-3`;
        feedbackDiv.style.zIndex = '1050';
        feedbackDiv.textContent = message;
        document.body.appendChild(feedbackDiv);

        // Remove after 3 seconds
        setTimeout(() => {
            if (feedbackDiv && feedbackDiv.parentNode) {
                feedbackDiv.remove();
            }
        }, 3000);
    } catch (error) {
        console.error('Erro ao mostrar feedback:', error);
    }
}