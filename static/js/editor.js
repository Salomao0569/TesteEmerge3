document.addEventListener('DOMContentLoaded', function() {
    // Configuração do editor
    if (document.getElementById('editor')) {
        $('#editor').summernote({
            height: 500,
            toolbar: [
                ['style', ['style']],
                ['font', ['bold', 'italic', 'underline', 'strikethrough', 'superscript', 'subscript', 'clear']],
                ['fontname', ['fontname']],
                ['fontsize', ['fontsize']],
                ['color', ['color']],
                ['para', ['ul', 'ol', 'paragraph']],
                ['table', ['table']],
                ['insert', ['link', 'hr']],
                ['view', ['fullscreen', 'codeview']],
                ['custom', ['templates', 'saveTemplate']] // Adicionado botão de salvar template
            ],
            fontNames: ['Arial', 'Times New Roman', 'Helvetica', 'Calibri'],
            fontSizes: ['8', '9', '10', '11', '12', '14', '16', '18', '24', '36'],
            styleTags: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
            callbacks: {
                onChange: function(contents) {
                    localStorage.setItem('editorDraft', contents);
                },
                onInit: function() {
                    const savedDraft = localStorage.getItem('editorDraft');
                    if (savedDraft) {
                        $('#editor').summernote('code', savedDraft);
                    }

                    // Adicionar botão de salvar template
                    const saveButton = createSaveTemplateButton();
                    $('.note-toolbar').append(saveButton);
                }
            }
        });
    }
});

function createTemplatesButton() {
    const button = $('<div class="note-btn-group btn-group note-template">');
    const templatesDropdown = $(`
        <button type="button" class="note-btn btn btn-light btn-sm dropdown-toggle" data-bs-toggle="dropdown">
            <i class="fas fa-file-medical"></i> Templates
        </button>
        <div class="dropdown-menu">
            <a class="dropdown-item" href="#" data-template="normal">Laudo Normal</a>
            <a class="dropdown-item" href="#" data-template="alterado">Laudo Alterado</a>
            <div class="dropdown-divider"></div>
            <a class="dropdown-item" href="#" onclick="gerenciarTemplates()">Gerenciar Templates</a>
        </div>
    `);
    
    button.append(templatesDropdown);
    return button;
}

function createSaveTemplateButton() {
    const button = $('<div class="note-btn-group btn-group">');
    const saveButton = $(`
        <button type="button" 
            id="saveTemplateBtn"
            class="note-btn btn btn-light btn-sm d-flex align-items-center gap-2"
            onclick="openSaveModal()"
        >
            <i class="fas fa-save"></i>
            Salvar Template
        </button>
    `);

    button.append(saveButton);
    return button;
}

// Função para abrir o modal de salvamento
function openSaveModal() {
    const editorContent = $('#editor').summernote('code');
    document.getElementById('templateContent').value = editorContent;
    const saveModal = new bootstrap.Modal(document.getElementById('saveTemplateModal'));
    saveModal.show();
}

// Função para alternar modo tela cheia do modal
function toggleFullscreen() {
    const modalDialog = document.querySelector('.modal-dialog');
    const isFullscreen = modalDialog.classList.contains('modal-fullscreen');

    if (isFullscreen) {
        modalDialog.classList.remove('modal-fullscreen');
        modalDialog.classList.add('modal-lg');
    } else {
        modalDialog.classList.remove('modal-lg');
        modalDialog.classList.add('modal-fullscreen');
    }
}

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

    const dadosMedico = `
        <p style="text-align: center; margin-top: 30px;">
            <strong>Dr. ${medicName}</strong><br>
            CRM: ${crm}${rqe ? `/RQE: ${rqe}` : ''}
        </p>
    `;

    const currentContent = $('#editor').summernote('code');
    $('#editor').summernote('code', currentContent + dadosMedico);
}

function gerenciarTemplates() {
    window.location.href = '/templates';
}

// Função para limpar o editor
function limparEditor() {
    if (confirm('Deseja realmente limpar todo o conteúdo do editor?')) {
        $('#editor').summernote('code', '');
        localStorage.removeItem('editorDraft');
    }
}