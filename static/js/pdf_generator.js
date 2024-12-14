
function gerarPDF() {
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
        const margin = 20;
        const contentWidth = pageWidth - (2 * margin);
        let currentY = margin;

        // Cabeçalho
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        const titulo = "Laudo de Ecodopplercardiograma";
        const tituloWidth = doc.getStringUnitWidth(titulo) * 16 / doc.internal.scaleFactor;
        const tituloX = (pageWidth - tituloWidth) / 2;
        doc.text(titulo, tituloX, currentY);

        currentY += 25;

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

        // Título da primeira tabela
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('IDENTIFICAÇÃO', margin, currentY);
        
        doc.autoTable({
            startY: currentY + 5,
            head: [['Dados do Paciente', 'Valor']],
            body: dadosPaciente,
            theme: 'striped',
            headStyles: { 
                fillColor: [41, 128, 185], 
                textColor: 255,
                fontSize: 11,
                halign: 'center'
            },
            styles: { 
                fontSize: 10,
                cellPadding: 3,
                lineColor: [80, 80, 80],
                lineWidth: 0.1
            },
            margin: { left: margin, right: margin },
            columnStyles: {
                0: { fontStyle: 'bold' }
            }
        });
        
        currentY = doc.autoTable.previous.finalY + 20;
        
        // Título da segunda tabela
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('CÁLCULOS E MEDIDAS', margin, currentY);
        currentY += 5;

        // Medidas e Cálculos
        const medidasCalculos = [
            ["Átrio Esquerdo", document.getElementById('atrio').value || 'N/D', 
             "Volume Diastólico Final", document.getElementById('print_volume_diast_final').textContent || 'N/D'],
            ["Aorta", document.getElementById('aorta').value || 'N/D', 
             "Volume Sistólico", document.getElementById('print_volume_sistolico').textContent || 'N/D'],
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
            headStyles: { 
                fillColor: [41, 128, 185], 
                textColor: 255,
                fontSize: 11,
                halign: 'center'
            },
            styles: { 
                fontSize: 10,
                cellPadding: 3,
                lineColor: [80, 80, 80],
                lineWidth: 0.1,
                halign: 'center'
            },
            margin: { left: margin, right: margin },
            columnStyles: {
                0: { halign: 'left', fontStyle: 'bold' },
                2: { halign: 'left', fontStyle: 'bold' }
            }
        });
        
        currentY = doc.autoTable.previous.finalY + 15;

        // Início do laudo em nova página
        doc.addPage();
        currentY = margin;

        // Título do laudo
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('LAUDO:', margin, currentY);
        currentY += 10;

        // Conteúdo do Laudo
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        const laudoContent = document.getElementById('editor').innerText;
        const splitText = doc.splitTextToSize(laudoContent, contentWidth);
        
        // Verifica se precisa de nova página
        if (currentY + doc.getTextDimensions(splitText).h > pageHeight - margin) {
            doc.addPage();
            currentY = margin;
        }
        
        doc.text(splitText, margin, currentY, {
            maxWidth: contentWidth,
            lineHeightFactor: 1.5
        });
        
        currentY = doc.getTextDimensions(splitText).h + currentY + 30;

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
