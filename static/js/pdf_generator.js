function gerarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
    });

    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    const contentWidth = pageWidth - (2 * margin);

    // Add header
    doc.setFontSize(16);
    doc.text("Laudo de Ecodopplercardiograma", margin, margin);

    // Patient data section
    const dadosPaciente = [
        ["Nome", document.getElementById('nome').value || 'N/D'],
        ["Data Nascimento", document.getElementById('dataNascimento').value || 'N/D'],
        ["Sexo", document.getElementById('sexo').value || 'N/D'],
        ["Peso", (document.getElementById('peso').value ? document.getElementById('peso').value + " kg" : 'N/D')],
        ["Altura", (document.getElementById('altura').value ? document.getElementById('altura').value + " cm" : 'N/D')]
    ];

    // Generate patient data table
    doc.autoTable({
        startY: margin + 10,
        head: [['Dados do Paciente', 'Valor']],
        body: dadosPaciente,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 2 },
        columnStyles: {
            0: { cellWidth: contentWidth / 2 },
            1: { cellWidth: contentWidth / 2 }
        },
        margin: { left: margin },
        tableWidth: contentWidth
    });

    // Measurements and calculations section
    const medidasCalculos = [
        ["Átrio Esquerdo", document.getElementById('atrio').value + " mm" || 'N/D', 
         "Volume Diastólico Final", document.getElementById('print_volume_diast_final').textContent + " ml" || 'N/D'],
        ["Aorta", document.getElementById('aorta').value + " mm" || 'N/D', 
         "Volume Sistólico", document.getElementById('print_volume_sistolico').textContent + " ml" || 'N/D'],
        ["Diâmetro Diastólico", document.getElementById('diam_diast_final').value + " mm" || 'N/D', 
         "Volume Ejetado", document.getElementById('print_volume_ejetado').textContent + " ml" || 'N/D'],
        ["Diâmetro Sistólico", document.getElementById('diam_sist_final').value + " mm" || 'N/D', 
         "Fração de Ejeção", document.getElementById('print_fracao_ejecao').textContent + " %" || 'N/D'],
        ["Espessura do Septo", document.getElementById('esp_diast_septo').value + " mm" || 'N/D', 
         "Percentual Enc. Cavidade", document.getElementById('print_percent_encurt').textContent + " %" || 'N/D'],
        ["Espessura da Parede", document.getElementById('esp_diast_ppve').value + " mm" || 'N/D', 
         "Espessura Relativa", document.getElementById('print_esp_relativa').textContent || 'N/D']
    ];

    // Generate measurements table
    doc.autoTable({
        startY: doc.autoTable.previous.finalY + 10,
        head: [['Medida', 'Valor', 'Cálculo', 'Resultado']],
        body: medidasCalculos,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 2, overflow: 'linebreak' },
        columnStyles: {
            0: { cellWidth: contentWidth / 4 },
            1: { cellWidth: contentWidth / 4 },
            2: { cellWidth: contentWidth / 4 },
            3: { cellWidth: contentWidth / 4 }
        },
        margin: { left: margin },
        tableWidth: contentWidth
    });

    // Add report content
    doc.setFontSize(12);
    const laudoContent = document.getElementById('editor').innerText;
    const textLines = doc.splitTextToSize(laudoContent, contentWidth);
    let cursorY = doc.autoTable.previous.finalY + 15;

    // Handle page breaks for report content
    if (cursorY + (textLines.length * 5) > doc.internal.pageSize.height - margin) {
        doc.addPage();
        cursorY = margin;
    }

    // Add report text
    doc.setFontSize(11);
    textLines.forEach(line => {
        if (cursorY > doc.internal.pageSize.height - margin) {
            doc.addPage();
            cursorY = margin;
        }
        doc.text(line, margin, cursorY);
        cursorY += 5;
    });

    // Add page numbers
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, doc.internal.pageSize.height - 10, { align: 'right' });
    }

    // Save the PDF
    doc.save("laudo_ecocardiograma.pdf");
}
