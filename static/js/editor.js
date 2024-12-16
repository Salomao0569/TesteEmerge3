
// Configuração e inicialização do Summernote
$(document).ready(function() {
    console.log('Iniciando configuração do Summernote...');
    
    try {
        $('#editor').summernote({
            height: 500,
            lang: 'pt-BR',
            focus: true,
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
        
        console.log('Summernote configurado com sucesso');
    } catch (error) {
        console.error('Erro ao configurar Summernote:', error);
    }
});

// Função para inserir template selecionado no editor
function insertSelectedTemplate() {
    try {
        const templateSelect = document.getElementById('templateSelect');
        const selectedOption = templateSelect.options[templateSelect.selectedIndex];
        if (selectedOption && selectedOption.value) {
            $('#editor').summernote('code', selectedOption.title);
        }
    } catch (error) {
        console.error('Erro ao inserir template:', error);
    }
}

// Função para inserir frase selecionada no editor
function insertSelectedPhrase() {
    try {
        const phraseSelect = document.getElementById('phraseSelect');
        const selectedOption = phraseSelect.options[phraseSelect.selectedIndex];
        if (selectedOption && selectedOption.value) {
            const currentContent = $('#editor').summernote('code');
            $('#editor').summernote('pasteHTML', selectedOption.title);
        }
    } catch (error) {
        console.error('Erro ao inserir frase:', error);
    }
}
