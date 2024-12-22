
ClassicEditor
    .create(document.querySelector('#editor'), {
        toolbar: {
            items: [
                'heading',
                '|',
                'bold',
                'italic',
                'underline',
                'strikethrough',
                '|',
                'bulletedList',
                'numberedList',
                '|',
                'alignment',
                'indent',
                'outdent',
                '|',
                'link',
                'table',
                '|',
                'undo',
                'redo'
            ]
        },
        language: 'pt-br',
        placeholder: 'Digite o conteúdo do laudo aqui...',
        removePlugins: ['MediaEmbed', 'ImageUpload']
    })
    .catch(error => {
        console.error('Erro ao inicializar o editor:', error);
    });
