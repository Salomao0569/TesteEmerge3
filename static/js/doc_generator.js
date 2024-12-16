function gerarDOC() {
    try {
        const editor = document.getElementById('editor');
        const nome = document.getElementById('nome').value || 'Paciente';
        const doctorSelect = document.getElementById('selectedDoctor');
        
        if (!doctorSelect.value) {
            alert('Por favor, selecione um médico antes de gerar o documento.');
            return;
        }

        // Preparar o conteúdo do editor com formatação adequada
        const laudoContent = $('#editor').summernote('code');
        if (!laudoContent) {
            alert('Erro: Conteúdo do laudo não pode estar vazio');
            return;
        }
        
        // Formatar a data do exame
        const dataExame = document.getElementById('dataExame').value || 
            new Date().toISOString().split('T')[0];
        const dataFormatada = new Date(dataExame).toLocaleDateString('pt-BR');
        
        // Obter o token CSRF
        const metaTag = document.querySelector('meta[name="csrf-token"]');
        if (!metaTag) {
            console.error('Meta tag CSRF não encontrada');
            alert('Erro de segurança: Token CSRF não encontrado. Por favor, recarregue a página.');
            return;
        }
        
        const headers = {
            'Content-Type': 'application/json',
            'X-CSRFToken': metaTag.getAttribute('content')
        };
    
    const data = {
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
        };

        console.log('Dados a serem enviados:', data);

        fetch('/gerar_doc', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data),
            credentials: 'same-origin'
        })
        .then(response => {
            if (!response.ok) {
                if (response.headers.get('content-type')?.includes('application/json')) {
                    return response.json().then(error => {
                        throw new Error(error.error || 'Erro ao gerar o documento');
                    });
                }
                throw new Error('Erro ao gerar o documento');
            }
            return response.blob();
        })
        .then(blob => {
            if (!blob) {
                throw new Error('Documento gerado está vazio');
            }
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
            let errorMessage = 'Erro ao gerar o documento DOC: ';
            
            if (error.response) {
                console.error('Resposta do servidor:', error.response);
                errorMessage += error.response.data?.error || error.message;
            } else if (error.request) {
                console.error('Erro de rede:', error.request);
                errorMessage += 'Erro de conexão com o servidor';
            } else {
                console.error('Erro:', error);
                errorMessage += error.message;
            }
            
            alert(errorMessage);
        });
    } catch (error) {
        console.error('Erro ao preparar dados:', error);
        alert('Erro ao preparar dados para geração do documento: ' + error.message);
    }
}