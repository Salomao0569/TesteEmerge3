function gerarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    const contentWidth = pageWidth - (2 * margin);

    // Título do documento
    doc.setFontSize(16);
    doc.text("Laudo de Ecodopplercardiograma", margin, margin);

    // Dados do paciente
    doc.autoTable({
        startY: margin + 10,
        head: [['Dados do Paciente', 'Valor']],
        body: [
            ['Nome', document.getElementById('nome').value || ''],
            ['Data Nascimento', document.getElementById('dataNascimento').value || ''],
            ['Sexo', document.getElementById('sexo').value || ''],
            ['Peso', (document.getElementById('peso').value ? document.getElementById('peso').value + ' kg' : '')],
            ['Altura', (document.getElementById('altura').value ? document.getElementById('altura').value + ' cm' : '')]
        ],
        theme: 'grid',
        styles: {
            fontSize: 10,
            cellPadding: 5,
        },
        columnStyles: {
            0: { cellWidth: 80 },
            1: { cellWidth: 'auto', halign: 'center' }
        },
        headStyles: {
            fillColor: [38, 201, 158],
            textColor: 255,
            halign: 'left'
        },
        margin: { left: margin }
    });

    // Cálculos e Medidas
    doc.autoTable({
        startY: doc.autoTable.previous.finalY + 10,
        head: [
            [{ content: 'Cálculos e Medidas', colSpan: 6, styles: { halign: 'left' } }],
            ['Medida', 'Valor', 'Un', 'Cálculo', 'Resultado', 'Un']
        ],
        body: [
            [
                'Átrio Esquerdo',
                { content: document.getElementById('atrio').value || '', styles: { halign: 'center' } },
                { content: 'mm', styles: { halign: 'center' } },
                'Volume Diastólico Final',
                { content: document.getElementById('print_volume_diast_final').textContent || '', styles: { halign: 'center' } },
                { content: 'ml', styles: { halign: 'center' } }
            ],
            [
                'Aorta',
                { content: document.getElementById('aorta').value || '', styles: { halign: 'center' } },
                { content: 'mm', styles: { halign: 'center' } },
                'Volume Sistólico',
                { content: document.getElementById('print_volume_sistolico').textContent || '', styles: { halign: 'center' } },
                { content: 'ml', styles: { halign: 'center' } }
            ],
            [
                'Diâmetro Diastólico',
                { content: document.getElementById('diam_diast_final').value || '', styles: { halign: 'center' } },
                { content: 'mm', styles: { halign: 'center' } },
                'Volume Ejetado',
                { content: document.getElementById('print_volume_ejetado').textContent || '', styles: { halign: 'center' } },
                { content: 'ml', styles: { halign: 'center' } }
            ],
            [
                'Diâmetro Sistólico',
                { content: document.getElementById('diam_sist_final').value || '', styles: { halign: 'center' } },
                { content: 'mm', styles: { halign: 'center' } },
                'Fração de Ejeção',
                { content: document.getElementById('print_fracao_ejecao').textContent || '', styles: { halign: 'center' } },
                { content: '%', styles: { halign: 'center' } }
            ],
            [
                'Espessura do Septo',
                { content: document.getElementById('esp_diast_septo').value || '', styles: { halign: 'center' } },
                { content: 'mm', styles: { halign: 'center' } },
                'Percentual Enc. Cavidade',
                { content: document.getElementById('print_percent_encurt').textContent || '', styles: { halign: 'center' } },
                { content: '%', styles: { halign: 'center' } }
            ],
            [
                'Espessura da Parede',
                { content: document.getElementById('esp_diast_ppve').value || '', styles: { halign: 'center' } },
                { content: 'mm', styles: { halign: 'center' } },
                'Espessura Relativa',
                { content: document.getElementById('print_esp_relativa').textContent || '', styles: { halign: 'center' } },
                { content: '', styles: { halign: 'center' } }
            ],
            [
                'Ventrículo Direito',
                { content: document.getElementById('vd').value || '', styles: { halign: 'center' } },
                { content: 'mm', styles: { halign: 'center' } },
                'Índice de Massa',
                { content: document.getElementById('print_indice_massa').textContent || '', styles: { halign: 'center' } },
                { content: 'g/m²', styles: { halign: 'center' } }
            ]
        ],
        theme: 'grid',
        styles: {
            fontSize: 10,
            cellPadding: 5,
            valign: 'middle'
        },
        columnStyles: {
            0: { cellWidth: 40 },
            1: { cellWidth: 20 },
            2: { cellWidth: 15 },
            3: { cellWidth: 40 },
            4: { cellWidth: 20 },
            5: { cellWidth: 15 }
        },
        headStyles: {
            fillColor: [38, 201, 158],
            textColor: 255,
            fontSize: 10
        },
        margin: { left: margin }
    });

    // Rodapé com numeração de páginas
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, doc.internal.pageSize.height - 10, { align: 'right' });
    }

    doc.save("laudo_ecocardiograma.pdf");
}