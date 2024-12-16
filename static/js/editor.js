
$(document).ready(function() {
    $('#editor').summernote({
        lang: 'pt-BR',
        height: 500,
        toolbar: [
            ['style', ['style']],
            ['font', ['bold', 'italic', 'underline', 'clear']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['table', ['table']],
            ['insert', ['link']],
            ['view', ['fullscreen', 'codeview']],
            ['custom', ['undo', 'redo']]
        ],
        styleTags: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
        callbacks: {
            onChange: function(contents) {
                localStorage.setItem('reportContent', contents);
                updateWordCount();
            },
            onInit: function() {
                console.log('Summernote inicializado com sucesso');
                const savedContent = localStorage.getItem('reportContent');
                if (savedContent) {
                    $('#editor').summernote('code', savedContent);
                }
            }
        }
    });

    function updateWordCount() {
        const text = $('#editor').summernote('code').replace(/<[^>]*>/g, ' ');
        const words = text.trim().split(/\s+/).length;
        $('.word-count').text(`${words} palavras`);
    }

    window.getEditorContent = function() {
        return $('#editor').summernote('code');
    };
});
