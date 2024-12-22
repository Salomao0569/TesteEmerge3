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
                ['view', ['fullscreen', 'codeview']]
            ],
            fontSizes: ['8', '9', '10', '11', '12', '14', '16', '18', '24', '36'],
            styleTags: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
            placeholder: 'Digite o conteúdo do laudo aqui...',
            callbacks: {
                onChange: function(contents) {
                    // Armazenar conteúdo no localStorage para backup
                    localStorage.setItem('reportContent', contents);
                    showBackupIndicator();
                },
                onInit: function() {
                    console.log('Editor inicializado com sucesso');
                    // Restaurar conteúdo do backup se existir
                    const savedContent = localStorage.getItem('reportContent');
                    if (savedContent) {
                        $('#editor').summernote('code', savedContent);
                    }
                }
            }
        });

        // Carregar templates e frases
        loadTemplatesAndPhrases();
        loadDoctors();

    } catch (error) {
        console.error('Erro ao configurar editor:', error);
    }
});

// Função para carregar templates e frases do servidor
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