
function gerarPages() {
    const data = {
        paciente: {
            nome: document.getElementById('nome').value || 'N/D',
            dataNascimento: document.getElementById('dataNascimento').value || 'N/D',
            sexo: document.getElementById('sexo').value || 'N/D',
            peso: document.getElementById('peso').value || 'N/D',
            altura: document.getElementById('altura').value || 'N/D',
            dataExame: document.getElementById('dataExame').value || new Date().toISOString().split('T')[0]
        },
        medidas: {
            atrio: document.getElementById('atrio').value || 'N/D',
            aorta: document.getElementById('aorta').value || 'N/D',
            diamDiastFinal: document.getElementById('diam_diast_final').value || 'N/D',
            diamSistFinal: document.getElementById('diam_sist_final').value || 'N/D',
            espDiastSepto: document.getElementById('esp_diast_septo').value || 'N/D',
            espDiastPPVE: document.getElementById('esp_diast_ppve').value || 'N/D',
            vd: document.getElementById('vd').value || 'N/D'
        },
        laudo: document.getElementById('editor').innerHTML
    };

    const pagesContent = `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
            .header { text-align: center; margin-bottom: 20px; }
            .section { margin-bottom: 15px; }
            table { width: 100%; border-collapse: collapse; }
            td { padding: 5px; border: 1px solid #ccc; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Laudo de Ecodopplercardiograma</h1>
        </div>
        <div class="section">
            <h2>Dados do Paciente</h2>
            <p>Nome: ${data.paciente.nome}</p>
            <p>Data de Nascimento: ${data.paciente.dataNascimento}</p>
            <p>Sexo: ${data.paciente.sexo}</p>
            <p>Peso: ${data.paciente.peso} kg</p>
            <p>Altura: ${data.paciente.altura} cm</p>
        </div>
        <div class="section">
            ${data.laudo}
        </div>
    </body>
    </html>`;

    const blob = new Blob([pagesContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Laudo_${data.paciente.nome.replace(/[^a-zA-Z0-9]/g, '_')}.pages.html`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
}
