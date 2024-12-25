// Function to get CSRF token from meta tag or cookie
function getCSRFToken() {
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    if (metaTag) {
        return metaTag.getAttribute('content');
    }
    return document.cookie.split('; ').find(row => row.startsWith('csrf_token='))?.split('=')[1];
}

// Function to add CSRF token to headers (now largely redundant)
function addCSRFToken(headers = {}) {
    const token = getCSRFToken();
    if (token) {
        return {
            ...headers,
            'X-CSRF-Token': token,
            'X-CSRFToken': token
        };
    }
    return headers;
}

// Template loading function with enhanced error handling and delete functionality
async function loadTemplatesAndPhrases() {
    try {
        const response = await fetch('/api/templates');
        if (!response.ok) {
            throw new Error('Erro ao carregar templates');
        }

        const templates = await response.json();
        console.log('Templates carregados:', templates);

        // Get container elements
        const mascaraContainer = document.getElementById('mascaraContainer');
        const fraseContainer = document.getElementById('fraseContainer');

        // Clear existing content
        mascaraContainer.innerHTML = `
            <label for="mascaraSelect" class="form-label">Máscaras:</label>
            <div class="custom-select-wrapper">
                <select id="mascaraSelect" class="form-select">
                    <option value="">Selecione uma máscara...</option>
                </select>
                <div class="template-list"></div>
            </div>
        `;

        fraseContainer.innerHTML = `
            <label for="fraseSelect" class="form-label">Frases Padrão:</label>
            <div class="custom-select-wrapper">
                <select id="fraseSelect" class="form-select">
                    <option value="">Selecione uma frase padrão...</option>
                </select>
                <div class="template-list"></div>
            </div>
        `;

        // Separate templates by category
        const mascaras = templates.filter(t => t.category === 'mascara');
        const frases = templates.filter(t => t.category === 'frase');

        // Add templates to their respective containers
        const mascaraList = mascaraContainer.querySelector('.template-list');
        const fraseList = fraseContainer.querySelector('.template-list');

        mascaras.forEach(mascara => {
            mascaraList.appendChild(createTemplateItem(mascara, 'mascara'));
        });

        frases.forEach(frase => {
            fraseList.appendChild(createTemplateItem(frase, 'frase'));
        });

        // Add click handlers for showing/hiding template lists
        ['mascaraSelect', 'fraseSelect'].forEach(selectId => {
            const wrapper = document.getElementById(selectId).closest('.custom-select-wrapper');
            const templateList = wrapper.querySelector('.template-list');

            wrapper.addEventListener('click', (e) => {
                if (!e.target.closest('.template-item')) {
                    templateList.style.display = templateList.style.display === 'block' ? 'none' : 'block';
                }
            });

            // Close list when clicking outside
            document.addEventListener('click', (e) => {
                if (!wrapper.contains(e.target)) {
                    templateList.style.display = 'none';
                }
            });
        });

    } catch (error) {
        console.error('Erro ao carregar templates:', error);
        showFeedback('Erro ao carregar templates e máscaras', 'danger');
    }
}

function createTemplateItem(template, type) {
    const item = document.createElement('div');
    item.className = 'template-item';
    item.dataset.id = template.id;
    item.dataset.content = template.content;
    item.innerHTML = `
        <span class="template-name">${template.name}</span>
        <button class="btn btn-sm btn-link text-danger delete-btn" title="Excluir">
            <i class="fas fa-trash"></i>
        </button>
    `;

    // Add click handlers
    item.addEventListener('click', (e) => {
        if (e.target.closest('.delete-btn')) {
            e.preventDefault();
            e.stopPropagation();
            deleteTemplate(template.id, template.name);
        } else {
            if (type === 'mascara') {
                $('#editor').summernote('code', template.content);
            } else {
                const currentContent = $('#editor').summernote('code');
                $('#editor').summernote('pasteHTML', currentContent + '\n' + template.content);
            }
            // Hide template list after selection
            const templateList = item.closest('.template-list');
            if (templateList) {
                templateList.style.display = 'none';
            }
        }
    });

    return item;
}

async function deleteTemplate(id, name) {
    if (!confirm(`Deseja realmente excluir "${name}"?`)) {
        return;
    }

    try {
        const response = await fetch(`/api/templates/${id}`, {
            method: 'DELETE',
            headers: addCSRFToken()
        });

        if (!response.ok) {
            throw new Error('Erro ao excluir template');
        }

        showFeedback('Template excluído com sucesso', 'success');
        await loadTemplatesAndPhrases();
    } catch (error) {
        console.error('Erro ao excluir template:', error);
        showFeedback('Erro ao excluir template', 'danger');
    }
}

// Template saving functionality
async function salvarMascara() {
    try {
        const editor = $('#editor');
        const conteudo = editor.summernote('createRange')?.toString() || editor.summernote('code');

        if (!conteudo.trim()) {
            showFeedback('Por favor, selecione ou digite algum conteúdo antes de salvar.', 'warning');
            return;
        }

        window.tempContent = conteudo;

        if (!document.getElementById('modalSalvarMascara')) {
            const modalHtml = `
                <div class="modal fade" id="modalSalvarMascara" tabindex="-1">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Salvar Template</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <form id="salvarMascaraForm" onsubmit="return false;">
                                    <div class="mb-3">
                                        <label for="tituloMascara" class="form-label">Nome:</label>
                                        <input type="text" class="form-control" id="tituloMascara" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="tipoMascara" class="form-label">Tipo:</label>
                                        <select class="form-select" id="tipoMascara" required>
                                            <option value="mascara">Máscara</option>
                                            <option value="frase">Frase Padrão</option>
                                        </select>
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="button" class="btn btn-primary" onclick="confirmarSalvarMascara()">
                                    <i class="fas fa-save"></i> Salvar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
        }

        const modalElement = document.getElementById('modalSalvarMascara');
        const modal = new bootstrap.Modal(modalElement);
        modal.show();

    } catch (error) {
        console.error('Erro ao preparar modal:', error);
        showFeedback('Erro ao preparar formulário de salvamento', 'danger');
    }
}

async function confirmarSalvarMascara() {
    const titulo = document.getElementById('tituloMascara')?.value?.trim();
    const tipo = document.getElementById('tipoMascara')?.value;
    const conteudo = window.tempContent;

    if (!titulo || !tipo || !conteudo) {
        showFeedback('Por favor, preencha todos os campos.', 'warning');
        return;
    }

    const loadingBtn = document.querySelector('#modalSalvarMascara .btn-primary');
    const originalBtnHtml = loadingBtn.innerHTML;

    try {
        loadingBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
        loadingBtn.disabled = true;

        // Get CSRF token
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (!token) {
            throw new Error('Token CSRF não encontrado');
        }

        const response = await fetch('/api/templates', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': token,
                'X-CSRF-Token': token
            },
            body: JSON.stringify({
                name: titulo,
                content: conteudo,
                category: tipo
            })
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Erro ao salvar template');
        }

        const data = await response.json();

        const modalElement = document.getElementById('modalSalvarMascara');
        const modal = bootstrap.Modal.getInstance(modalElement);
        modal.hide();
        document.getElementById('salvarMascaraForm').reset();
        delete window.tempContent;

        showFeedback('Template salvo com sucesso!', 'success');
        await loadTemplatesAndPhrases();

    } catch (error) {
        console.error('Erro ao salvar:', error);
        showFeedback(error.message || 'Erro ao salvar template', 'danger');
    } finally {
        if (loadingBtn) {
            loadingBtn.innerHTML = originalBtnHtml;
            loadingBtn.disabled = false;
        }
    }
}

// Editor initialization
$(document).ready(function() {
    console.log('Iniciando configuração do editor...');

    try {
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
                ['custom', ['salvarMascara']]
            ],
            buttons: {
                salvarMascara: function (context) {
                    var ui = $.summernote.ui;
                    return ui.button({
                        contents: '<i class="fas fa-save"></i> Salvar Template',
                        tooltip: 'Salvar como Template',
                        click: function () {
                            salvarMascara();
                        }
                    }).render();
                }
            },
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
            fontSizes: ['8', '9', '10', '11', '12', '14', '16', '18', '24', '36'],
            styleTags: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
            placeholder: 'Digite o conteúdo do laudo aqui...',
        });

        loadTemplatesAndPhrases();
        loadDoctors();
    } catch (error) {
        console.error('Erro ao configurar editor:', error);
        showFeedback('Erro ao inicializar o editor', 'danger');
    }
});

// Helper functions
function showFeedback(message, type = 'success') {
    const feedbackDiv = document.createElement('div');
    feedbackDiv.className = `alert alert-${type} position-fixed bottom-0 end-0 m-3`;
    feedbackDiv.style.zIndex = '1050';
    feedbackDiv.textContent = message;
    document.body.appendChild(feedbackDiv);
    setTimeout(() => feedbackDiv.remove(), 3000);
}

function showBackupIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'backup-indicator';
    indicator.textContent = 'Conteúdo salvo localmente';
    document.body.appendChild(indicator);
    setTimeout(() => indicator.remove(), 2000);
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

//Layout com dois painéis
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

async function gerarTextoIA() {
    const prompt = document.getElementById('promptIA').value;
    if (!prompt) {
        alert('Por favor, descreva o que você deseja gerar.');
        return;
    }

    try {
        const previewArea = document.getElementById('previewTextoIA');
        previewArea.innerHTML = '<div class="alert alert-info">Gerando texto, por favor aguarde...</div>';

        const response = await fetch('/api/gerar_texto', {
            method: 'POST',
            headers: addCSRFToken({
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

async function avaliarLaudoAtual() {
    const laudoAtual = $('#editor').summernote('code');
    if (!laudoAtual) {
        alert('Por favor, insira algum texto no editor para avaliar.');
        return;
    }

    try {
        const previewArea = document.getElementById('previewTextoIA');
        previewArea.innerHTML = '<div class="alert alert-info">Analisando laudo, por favor aguarde...</div>';

        const response = await fetch('/api/gerar_texto', {
            method: 'POST',
            headers: addCSRFToken({
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