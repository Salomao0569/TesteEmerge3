function gerarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;

    // Título
    doc.autoTable({
        head: [['Identificação']],
        body: [[
            {
                content: 
                `Nome: ${document.getElementById('nome').value}     Sexo: ${document.getElementById('sexo').value}
                Data de Nascimento: ${document.getElementById('dataNascimento').value}     
                Peso: ${document.getElementById('peso').value}     Altura: ${document.getElementById('altura').value}     Superfície Corpórea: ${document.getElementById('superficie').value}`,
                styles: { cellWidth: 'wrap' }
            }
        ]],
        startY: margin,
        theme: 'plain',
        styles: {
            fontSize: 9,
            cellPadding: 2,
        },
        headStyles: {
            halign: 'center',
            fontSize: 9,
            fontStyle: 'bold'
        },
        margin: { left: margin, right: margin }
    });

    // Cálculos e Medidas
    doc.autoTable({
        head: [['Cálculos e Medidas']],
        body: [
            ['Aorta', document.getElementById('aorta').value || '', 'mm', 'Volume Diastólico Final', document.getElementById('print_volume_diast_final').textContent || '', 'ml'],
            ['Átrio Esquerdo', document.getElementById('atrio').value || '', 'mm', 'Volume Sistólico', document.getElementById('print_volume_sistolico').textContent || '', 'ml'],
            ['Diâmetro Diastólico', document.getElementById('diam_diast_final').value || '', 'mm', 'Volume Ejetado', document.getElementById('print_volume_ejetado').textContent || '', 'ml'],
            ['Diâmetro Sistólico', document.getElementById('diam_sist_final').value || '', 'mm', 'Fração de Ejeção', document.getElementById('print_fracao_ejecao').textContent || '', '%'],
            ['Espessura do Septo', document.getElementById('esp_diast_septo').value || '', 'mm', 'Percentual Enc. Cavidade', document.getElementById('print_percent_encurt').textContent || '', '%'],
            ['Espessura da Parede', document.getElementById('esp_diast_ppve').value || '', 'mm', 'Espessura Relativa', document.getElementById('print_esp_relativa').textContent || '', ''],
            ['Ventrículo Direito', document.getElementById('vd').value || '', 'mm', 'Índice de Massa', document.getElementById('print_indice_massa').textContent || '', 'g/m²']
        ],
        startY: doc.autoTable.previous.finalY + 5,
        theme: 'plain',
        styles: {
            fontSize: 8,
            cellPadding: 1,
            lineColor: [0, 0, 0],
            lineWidth: 0.1
        },
        columnStyles: {
            0: { cellWidth: 35 },
            1: { cellWidth: 10, halign: 'center' },
            2: { cellWidth: 10, halign: 'center' },
            3: { cellWidth: 35 },
            4: { cellWidth: 10, halign: 'center' },
            5: { cellWidth: 10, halign: 'center' }
        },
        headStyles: {
            halign: 'center',
            fontSize: 9,
            fontStyle: 'bold'
        },
        margin: { left: margin, right: margin }
    });

    // Texto do Laudo
    const laudoText = document.getElementById('editor').innerText;
    doc.setFontSize(9);
    const textLines = doc.splitTextToSize(laudoText, pageWidth - 2 * margin);
    doc.text(textLines, margin, doc.autoTable.previous.finalY + 10);

    // Numeração de página
    doc.setFontSize(8);
    doc.text('Página 1 de 1', pageWidth - margin, doc.internal.pageSize.height - 10, { align: 'right' });

    doc.save("laudo_ecocardiograma.pdf");
}