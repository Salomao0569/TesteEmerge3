
ClassicEditor.create(document.querySelector('#templateContent'), {
    toolbar: {
        items: [
            'bold',
            'italic',
            '|',
            'bulletedList',
            'numberedList',
            '|',
            'undo',
            'redo'
        ]
    },
    language: 'pt-br'
}).catch(error => {
    console.error('Erro ao inicializar o editor:', error);
});
