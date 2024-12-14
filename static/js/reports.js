// Função para carregar modelos de laudos
async function loadReports() {
    const response = await fetch('/api/templates?category=laudo');
    const templates = await response.json();
    updateReportsList(templates);
}

// Função para atualizar a lista de modelos
function updateReportsList(templates) {
    const tbody = document.querySelector('#reportsList');
    tbody.innerHTML = templates.map(template => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = template.content;
        const textPreview = tempDiv.textContent.substring(0, 100) + '...';
        
        return `
            <tr>
                <td>${template.name}</td>
                <td>
                    <div class="text-preview">${textPreview}</div>
                    <button class="btn btn-sm btn-secondary mt-1" onclick="viewFullContent(${template.id})">
                        <i class="fas fa-eye"></i> Ver Completo
                    </button>
                </td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="deleteReport(${template.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Função para visualizar o conteúdo completo formatado
async function viewFullContent(templateId) {
    try {
        const response = await fetch(`/api/templates/${templateId}`);
        const template = await response.json();
        
        // Criar modal para exibir o conteúdo
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'viewContentModal';
        modal.setAttribute('tabindex', '-1');
        
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${template.name}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="formatted-content">${template.content}</div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
        
        // Remover modal do DOM após fechado
        modal.addEventListener('hidden.bs.modal', function () {
            document.body.removeChild(modal);
        });
    } catch (error) {
        console.error('Erro ao carregar conteúdo:', error);
        alert('Erro ao carregar o conteúdo do template');
    }
}

// Função para cadastrar um novo modelo
async function createReport(event) {
    event.preventDefault();
    
    try {
        const reportName = document.getElementById('reportName').value;
        if (!reportName) {
            throw new Error('Por favor, insira um nome para o modelo de laudo');
        }
        
        const editor = document.getElementById('editor');
        if (!editor || !editor.innerHTML.trim()) {
            throw new Error('Por favor, insira o conteúdo do laudo');
        }

        // Capturar o conteúdo HTML mantendo toda a formatação e espaços
        const htmlContent = editor.innerHTML
            .replace(/<div><br><\/div>/g, '<br>')
            .replace(/<div>/g, '<p>')
            .replace(/<\/div>/g, '</p>')
            .replace(/\s+/g, ' ')
            .replace(/<br\s*\/?>/g, '<br>\n')
            .trim();
        
        // Log para debug
        console.log('HTML capturado:', htmlContent);
        console.log('Conteúdo HTML do editor:', htmlContent);

        // Criar um elemento temporário para verificar se o HTML é válido
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        
        // Verificar se há conteúdo real além de espaços em branco
        if (!tempDiv.textContent.trim()) {
            throw new Error('O conteúdo do laudo não pode estar vazio');
        }

        const doctorId = document.getElementById('doctorId').value;
        if (!doctorId) {
            throw new Error('Por favor, selecione o médico responsável');
        }

        // Adicionar assinatura do médico ao final do conteúdo
        const doctorSelect = document.getElementById('doctorId');
        const doctorInfo = doctorSelect.options[doctorSelect.selectedIndex].text;
        const assinatura = `
            <br><br>
            <div style="text-align: center; margin-top: 30px;">
                <p>_______________________________________________</p>
                <p>${doctorInfo}</p>
            </div>
        `;

        const reportData = {
            name: reportName,
            category: 'laudo',
            content: htmlContent + assinatura,
            doctor_id: parseInt(doctorId)
        };

        console.log('Enviando dados do laudo:', reportData);

        const response = await fetch('/api/templates', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reportData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Erro na resposta do servidor:', errorData);
            throw new Error(errorData.error || 'Erro ao cadastrar modelo de laudo');
        }

        const responseData = await response.json();
        console.log('Resposta do servidor:', responseData);

        // Limpar formulário
        document.getElementById('reportForm').reset();
        reportContent.innerHTML = '<p>Exame realizado com ritmo cardíaco regular. Evidenciando:</p>';
        
        // Recarregar lista de modelos
        await loadReports();
        
        alert('Modelo de laudo cadastrado com sucesso!');
    } catch (error) {
        console.error('Erro ao criar laudo:', error);
        alert('Erro ao cadastrar modelo de laudo: ' + error.message);
    }
}

// Garantir que o editor está inicializado
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('reportForm');
    const editor = document.getElementById('reportContent');
    
    if (form) {
        console.log('Form encontrado, adicionando event listener');
        form.addEventListener('submit', createReport);
    } else {
        console.error('Form não encontrado');
    }
    
    if (editor) {
        console.log('Editor encontrado');
        // Inicializar editor se necessário
        editor.focus();
    } else {
        console.error('Editor não encontrado');
    }
    
    loadReports();
});

// Função para deletar um modelo
async function deleteReport(id) {
    if (!confirm('Tem certeza que deseja excluir este modelo?')) return;

    try {
        const response = await fetch(`/api/templates/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Erro ao excluir modelo');

        await loadReports();
    } catch (error) {
        alert('Erro ao excluir modelo: ' + error.message);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('reportForm');
    if (form) {
        form.addEventListener('submit', createReport);
    }
    loadReports();
});