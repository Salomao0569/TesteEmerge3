
function gerarPDF() {
    const selectedDoctor = document.getElementById('selectedDoctor');
    if (!selectedDoctor.value) {
        alert('Por favor, selecione um médico antes de gerar o PDF');
        return;
    }
    window.jsPDF = window.jspdf.jsPDF;

    try {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true
        });
        
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 25;
        const contentWidth = pageWidth - (2 * margin);
        let currentY = margin;

        // Cabeçalho
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        const titulo = "Laudo de Ecodopplercardiograma";
        const tituloWidth = doc.getStringUnitWidth(titulo) * 16 / doc.internal.scaleFactor;
        const tituloX = (pageWidth - tituloWidth) / 2;
        doc.text(titulo, tituloX, currentY);

        currentY += 15;

        // Dados do Paciente
        const dataExame = document.getElementById('dataExame').value;
        const dataFormatada = dataExame ? new Date(dataExame).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR');
        
        const dadosPaciente = [
            ["Nome", document.getElementById('nome').value || 'N/D'],
            ["Data Nascimento", document.getElementById('dataNascimento').value || 'N/D'],
            ["Sexo", document.getElementById('sexo').value || 'N/D'],
            ["Peso", (document.getElementById('peso').value ? document.getElementById('peso').value + " kg" : 'N/D')],
            ["Altura", (document.getElementById('altura').value ? document.getElementById('altura').value + " cm" : 'N/D')],
            ["Data do Exame", dataFormatada]
        ];

        doc.autoTable({
            startY: currentY,
            head: [['Dados do Paciente', 'Valor']],
            body: dadosPaciente,
            theme: 'striped',
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            styles: { fontSize: 10 },
            margin: { left: margin, right: margin }
        });

        currentY = doc.autoTable.previous.finalY + 15;

        // Medidas e Cálculos
        const medidasCalculos = [
            ["Átrio Esquerdo", document.getElementById('atrio').value || 'N/D', 
             "Volume Diastólico Final", document.getElementById('print_volume_diast_final').textContent || 'N/D'],
            ["Aorta", document.getElementById('aorta').value || 'N/D', 
             "Volume Sistólico Final", document.getElementById('print_volume_sist_final').textContent || 'N/D'],
            ["Diâmetro Diastólico", document.getElementById('diam_diast_final').value || 'N/D', 
             "Volume Ejetado", document.getElementById('print_volume_ejetado').textContent || 'N/D'],
            ["Diâmetro Sistólico", document.getElementById('diam_sist_final').value || 'N/D', 
             "Fração de Ejeção", document.getElementById('print_fracao_ejecao').textContent || 'N/D'],
            ["Espessura do Septo", document.getElementById('esp_diast_septo').value || 'N/D',
             "Percentual Enc. Cavidade", document.getElementById('print_percent_encurt').textContent || 'N/D'],
            ["Espessura PPVE", document.getElementById('esp_diast_ppve').value || 'N/D',
             "Espessura Relativa", document.getElementById('print_esp_relativa').textContent || 'N/D'],
            ["Ventrículo Direito", document.getElementById('vd').value || 'N/D',
             "Massa do VE", document.getElementById('print_massa_ve').textContent || 'N/D']
        ];

        doc.autoTable({
            startY: currentY,
            head: [['Medida', 'Valor', 'Cálculo', 'Resultado']],
            body: medidasCalculos,
            theme: 'striped',
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            styles: { fontSize: 10 },
            margin: { left: margin, right: margin }
        });

        // Nova página para o laudo
        doc.addPage();
        currentY = margin;
        
        // Conteúdo do Laudo
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        const laudoContent = document.getElementById('editor').innerText;
        const lines = doc.splitTextToSize(laudoContent, contentWidth);
        
        for (let i = 0; i < lines.length; i++) {
            if (currentY > pageHeight - margin) {
                doc.addPage();
                currentY = margin;
            }
            doc.text(lines[i], margin, currentY);
            currentY += 7;
        }

        // Assinatura do Médico
        const doctorSelect = document.getElementById('selectedDoctor');
        if (doctorSelect.value) {
            if (currentY > pageHeight - 40) {
                doc.addPage();
                currentY = margin + 20;
            }
            
            const selectedOption = doctorSelect.selectedOptions[0];
            const doctorName = selectedOption.text;
            const doctorCRM = selectedOption.dataset.crm;
            const doctorRQE = selectedOption.dataset.rqe;
            
            currentY += 20;
            doc.setLineWidth(0.5);
            doc.line(pageWidth/2 - 40, currentY, pageWidth/2 + 40, currentY);
            currentY += 10;
            
            doc.setFont('helvetica', 'bold');
            doc.text(doctorName, pageWidth/2, currentY, { align: 'center' });
            currentY += 7;
            doc.setFontSize(10);
            doc.text(`CRM: ${doctorCRM}${doctorRQE ? ` / RQE: ${doctorRQE}` : ''}`, pageWidth/2, currentY, { align: 'center' });
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
