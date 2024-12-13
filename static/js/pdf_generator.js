function gerarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;

    // Identificação
    doc.autoTable({
        head: [['Identificação']],
        body: [
            ['Nome:', document.getElementById('nome').value, 'Sexo', document.getElementById('sexo').value],
            ['Data de Nascimento', document.getElementById('dataNascimento').value, 'Data', new Date().toLocaleDateString()],
            ['Peso:', document.getElementById('peso').value + ' kg', 'Altura:', document.getElementById('altura').value + ' cm'],
            ['Superfície Corpórea:', document.getElementById('superficie').value + ' m²']
        ],
        startY: margin,
        theme: 'grid',
        styles: {
            fontSize: 10,
            cellPadding: 2,
            lineWidth: 0.1,
            lineColor: [0, 0, 0],
            minCellHeight: 6
        },
        headStyles: {
            halign: 'center',
            fillColor: false,
            textColor: [0, 0, 0],
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
        theme: 'grid',
        styles: {
            fontSize: 10,
            cellPadding: 2,
            lineWidth: 0.1,
            lineColor: [0, 0, 0],
            minCellHeight: 6
        },
        columnStyles: {
            1: { halign: 'center' },
            2: { halign: 'center' },
            4: { halign: 'center' },
            5: { halign: 'center' }
        },
        headStyles: {
            halign: 'center',
            fillColor: false,
            textColor: [0, 0, 0],
            fontStyle: 'bold'
        },
        margin: { left: margin, right: margin }
    });

    // Laudo - cada linha como uma tabela separada para manter o grid
    const laudoText = document.getElementById('editor').innerText;
    const laudoLines = laudoText.split('\n');

    laudoLines.forEach((line, index) => {
        if (line.trim()) {  // Só cria tabela para linhas não vazias
            doc.autoTable({
                body: [[line]],
                startY: doc.autoTable.previous.finalY + (index === 0 ? 5 : 0),
                theme: 'grid',
                styles: {
                    fontSize: 10,
                    cellPadding: 2,
                    lineWidth: 0.1,
                    lineColor: [0, 0, 0],
                    minCellHeight: 6
                },
                margin: { left: margin, right: margin }
            });
        }
    });

    // Numeração de página
    doc.setFontSize(8);
    doc.text('Página 1 de 1', pageWidth - 25, doc.internal.pageSize.height - 10);

    doc.save("laudo_ecocardiograma.pdf");
}
