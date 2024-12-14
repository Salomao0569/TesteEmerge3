
function gerarExcel() {
    const selectedDoctor = document.getElementById('selectedDoctor');
    const selectedOption = selectedDoctor.options[selectedDoctor.selectedIndex];
    
    if (!selectedDoctor.value) {
        alert('Por favor, selecione um médico antes de gerar o Excel');
        return;
    }

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
        calculos: {
            volumeDiastFinal: document.getElementById('print_volume_diast_final').textContent,
            volumeSistFinal: document.getElementById('print_volume_sist_final').textContent,
            volumeEjetado: document.getElementById('print_volume_ejetado').textContent,
            fracaoEjecao: document.getElementById('print_fracao_ejecao').textContent,
            percentEncurt: document.getElementById('print_percent_encurt').textContent,
            espRelativa: document.getElementById('print_esp_relativa').textContent,
            massaVE: document.getElementById('print_massa_ve').textContent
        },
        medico: {
            nome: selectedOption.text,
            crm: selectedOption.dataset.crm,
            rqe: selectedOption.dataset.rqe || ''
        },
        laudo: document.getElementById('editor').innerText
    };

    fetch('/gerar_excel', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.blob())
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Laudo_${data.paciente.nome.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    })
    .catch(error => {
        console.error('Erro ao gerar Excel:', error);
        alert('Erro ao gerar o arquivo Excel. Por favor, tente novamente.');
    });
}
