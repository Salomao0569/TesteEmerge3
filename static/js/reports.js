// Função para carregar modelos de laudos
async function loadReports() {
    const response = await fetch('/api/templates?category=laudo');
    const templates = await response.json();
    updateReportsList(templates);
}

// Função para atualizar a lista de modelos
function updateReportsList(templates) {
    const tbody = document.querySelector('#reportsList');
    tbody.innerHTML = templates.map(template => `
        <tr>
            <td>${template.name}</td>
            <td>${template.content.substring(0, 100)}...</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deleteReport(${template.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Função para cadastrar um novo modelo
async function createReport(event) {
    event.preventDefault();
    
    try {
        const reportName = document.getElementById('reportName').value;
        if (!reportName) {
            throw new Error('Por favor, insira um nome para o modelo de laudo');
        }
        
        const reportContent = document.getElementById('reportContent');
        if (!reportContent || !reportContent.innerHTML.trim()) {
            throw new Error('Por favor, insira o conteúdo do laudo');
        }

        console.log('Enviando dados do laudo:', {
            name: reportName,
            content: reportContent.innerHTML
        });

        const reportData = {
            name: reportName,
            category: 'laudo',
            content: reportContent.innerHTML
        };

        const response = await fetch('/api/templates', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reportData)
        });

        const responseData = await response.json();
        
        if (!response.ok) {
            throw new Error(responseData.error || 'Erro ao cadastrar modelo de laudo');
        }

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
