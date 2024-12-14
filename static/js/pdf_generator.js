
function gerarPDF() {
    // Inicialização do jsPDF
    window.jsPDF = window.jspdf.jsPDF;

    try {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;
        const margin = 20;
        const contentWidth = pageWidth - (2 * margin);

        // Título
        doc.setFontSize(16);
        const titulo = "Laudo de Ecodopplercardiograma";
        const tituloWidth = doc.getStringUnitWidth(titulo) * 16 / doc.internal.scaleFactor;
        const tituloX = (pageWidth - tituloWidth) / 2;
        doc.text(titulo, tituloX, margin);

        // Dados do Paciente
        const dadosPaciente = [
            ["Nome", document.getElementById('nome').value || 'N/D'],
            ["Data Nascimento", document.getElementById('dataNascimento').value || 'N/D'],
            ["Sexo", document.getElementById('sexo').value || 'N/D'],
            ["Peso", (document.getElementById('peso').value ? document.getElementById('peso').value + " kg" : 'N/D')],
            ["Altura", (document.getElementById('altura').value ? document.getElementById('altura').value + " cm" : 'N/D')]
        ];

        doc.autoTable({
            startY: margin + 10,
            head: [['Dados do Paciente', 'Valor']],
            body: dadosPaciente,
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            styles: { fontSize: 10 },
            margin: { left: margin }
        });

        // Medidas e Cálculos
        const medidasCalculos = [
            ["Átrio Esquerdo", document.getElementById('atrio').value || 'N/D', 
             "Volume Diastólico Final", document.getElementById('print_volume_diast_final').textContent || 'N/D'],
            ["Aorta", document.getElementById('aorta').value || 'N/D', 
             "Volume Sistólico", document.getElementById('print_volume_sistolico').textContent || 'N/D'],
            ["Diâmetro Diastólico", document.getElementById('diam_diast_final').value || 'N/D', 
             "Volume Ejetado", document.getElementById('print_volume_ejetado').textContent || 'N/D'],
            ["Diâmetro Sistólico", document.getElementById('diam_sist_final').value || 'N/D', 
             "Fração de Ejeção", document.getElementById('print_fracao_ejecao').textContent || 'N/D']
        ];

        doc.autoTable({
            startY: doc.autoTable.previous.finalY + 10,
            head: [['Medida', 'Valor', 'Cálculo', 'Resultado']],
            body: medidasCalculos,
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            styles: { fontSize: 10 },
            margin: { left: margin }
        });

        // Conteúdo do Laudo
        doc.setFontSize(12);
        const laudoContent = document.getElementById('editor').innerText;
        const splitText = doc.splitTextToSize(laudoContent, contentWidth);
        doc.text(splitText, margin, doc.autoTable.previous.finalY + 15);

        // Assinatura do Médico
        const doctorSelect = document.getElementById('selectedDoctor');
        if (doctorSelect.value) {
            const selectedOption = doctorSelect.selectedOptions[0];
            const doctorName = selectedOption.text;
            const doctorCRM = selectedOption.dataset.crm;
            const doctorRQE = selectedOption.dataset.rqe;

            let assinaturaY = doc.internal.pageSize.height - 40;
            doc.setFont('helvetica', 'bold');
            doc.text(doctorName, pageWidth/2, assinaturaY, { align: 'center' });
            doc.text(`CRM: ${doctorCRM}${doctorRQE ? ` / RQE: ${doctorRQE}` : ''}`, pageWidth/2, assinaturaY + 10, { align: 'center' });
        }

        // Salvar PDF
        const nomePaciente = document.getElementById('nome').value;
        const nomeArquivo = nomePaciente ? 
            `Laudo_${nomePaciente.trim().replace(/[^a-zA-Z0-9]/g, '_')}.pdf` : 
            'laudo_ecocardiograma.pdf';
        
        doc.save(nomeArquivo);
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        alert('Erro ao gerar o PDF. Por favor, tente novamente.');
    }
}
