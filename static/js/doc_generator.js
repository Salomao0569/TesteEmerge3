
function gerarDOC() {
    const editor = document.getElementById('editor');
    const nome = document.getElementById('nome').value || 'Paciente';
    const doctorSelect = document.getElementById('selectedDoctor');
    
    if (!doctorSelect.value) {
        alert('Por favor, selecione um médico antes de gerar o documento.');
        return;
    }

    // Preparar o conteúdo do editor com formatação adequada
    const laudoContent = window.prepareContentForDocument ? 
        window.prepareContentForDocument() : 
        editor.innerHTML;
    
    // Formatar a data do exame
    const dataExame = document.getElementById('dataExame').value || 
        new Date().toISOString().split('T')[0];
    const dataFormatada = new Date(dataExame).toLocaleDateString('pt-BR');
    
    fetch('/gerar_doc', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            paciente: {
                nome: document.getElementById('nome').value || 'N/D',
                dataNascimento: document.getElementById('dataNascimento').value || 'N/D',
                sexo: document.getElementById('sexo').value || 'N/D',
                peso: document.getElementById('peso').value ? 
                    document.getElementById('peso').value : 'N/D',
                altura: document.getElementById('altura').value ? 
                    document.getElementById('altura').value : 'N/D',
                dataExame: dataFormatada
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
            calculos: {
                volumeDiastFinal: document.getElementById('print_volume_diast_final').textContent,
                volumeSistFinal: document.getElementById('print_volume_sist_final').textContent,
                volumeEjetado: document.getElementById('print_volume_ejetado').textContent,
                fracaoEjecao: document.getElementById('print_fracao_ejecao').textContent,
                percentEncurt: document.getElementById('print_percent_encurt').textContent,
                espRelativa: document.getElementById('print_esp_relativa').textContent,
                massaVE: document.getElementById('print_massa_ve').textContent
            },
            laudo: laudoContent,
            medico: {
                id: doctorSelect.value,
                nome: doctorSelect.selectedOptions[0].text,
                crm: doctorSelect.selectedOptions[0].dataset.crm,
                rqe: doctorSelect.selectedOptions[0].dataset.rqe || ''
            }
        })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(error => {
                throw new Error(error.error || 'Erro ao gerar o documento');
            });
        }
        return response.blob();
    })
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Laudo_${nome.replace(/[^a-zA-Z0-9]/g, '_')}.docx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    })
    .catch(error => {
        console.error('Erro ao gerar DOC:', error);
        alert('Erro ao gerar o documento DOC: ' + error.message);
    });
}
