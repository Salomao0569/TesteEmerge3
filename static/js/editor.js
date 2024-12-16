$(document).ready(function() {
    console.log('Iniciando configuração do Summernote...');
    
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
                ['view', ['fullscreen', 'codeview']]
            ],
            fontSizes: ['8', '9', '10', '11', '12', '14', '16', '18', '24', '36'],
            styleTags: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
            placeholder: 'Digite o conteúdo do laudo aqui...',
            callbacks: {
                onChange: function(contents) {
                    // Armazenar conteúdo no localStorage para backup
                    localStorage.setItem('reportContent', contents);
                },
                onInit: function() {
                    console.log('Summernote inicializado com sucesso');
                    // Restaurar conteúdo do backup se existir
                    const savedContent = localStorage.getItem('reportContent');
                    if (savedContent) {
                        $('#editor').summernote('code', savedContent);
                    }
                }
            }
        });
    } catch (error) {
        console.error('Erro ao configurar Summernote:', error);
    }
});

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
        $('#editor').summernote('pasteHTML', selectedOption.title);
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
    $('#editor').summernote('code', currentContent + '\n\n' + dadosMedico);
}
