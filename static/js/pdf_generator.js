function gerarPDF() {
    console.log("Iniciando geração do PDF");
    try {
        const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    const contentWidth = pageWidth - (2 * margin);

    // Título centralizado
    doc.setFontSize(12);
    doc.text("Identificação", pageWidth/2, margin, { align: 'center' });

    // Dados do Paciente - Tabela mais compacta
    doc.autoTable({
        startY: margin + 5,
        body: [
            [
                { content: 'Nome:', styles: { cellWidth: 40 } },
                { content: document.getElementById('nome').value || '', styles: { cellWidth: 100 } },
                { content: 'Sexo:', styles: { cellWidth: 30 } },
                { content: document.getElementById('sexo').value || '', styles: { cellWidth: 30 } }
            ],
            [
                'Data de Nascimento',
                document.getElementById('dataNascimento').value || '',
                'Data',
                new Date().toLocaleDateString()
            ],
            [
                'Peso:',
                document.getElementById('peso').value ? document.getElementById('peso').value + ' kg' : '',
                'Altura:',
                document.getElementById('altura').value ? document.getElementById('altura').value + ' cm' : ''
            ],
            [
                'Superfície Corpórea:',
                document.getElementById('superficie').value ? document.getElementById('superficie').value + ' m²' : '',
                '',
                ''
            ]
        ],
        theme: 'grid',
        styles: {
            fontSize: 8,
            cellPadding: 2,
            lineWidth: 0.1,
            lineColor: [0, 0, 0],
            minCellHeight: 4
        },
        margin: { left: margin, right: margin }
    });

    // Cálculos e Medidas - Tabela mais compacta
    doc.autoTable({
        startY: doc.autoTable.previous.finalY + 5,
        head: [[{
            content: 'Cálculos e Medidas',
            colSpan: 6,
            styles: { halign: 'center', fillColor: [38, 201, 158] }
        }]],
        body: [
            ['Medida', 'Valor', 'Un', 'Cálculo', 'Resultado', 'Un'],
            ['Aorta', document.getElementById('aorta').value || '', 'mm', 'Volume Diastólico Final', document.getElementById('print_volume_diast_final').textContent || '', 'ml'],
            ['Aorta Ascendente', document.getElementById('aorta_asc').value || '', 'mm', 'Volume Sistólico', document.getElementById('print_volume_sistolico').textContent || '', 'ml'],
            ['Átrio Esquerdo', document.getElementById('atrio').value || '', 'mm', 'Massa do VE', document.getElementById('print_massa_ve').textContent || '', 'g'],
            ['Vol Atrial Esq. Indexado', '', '', 'Volume Ejetado', document.getElementById('print_volume_ejetado').textContent || '', 'ml'],
            ['Diâmetro Diastólico', document.getElementById('diam_diast_final').value || '', 'mm', 'Fração de Ejeção', document.getElementById('print_fracao_ejecao').textContent || '', '%'],
            ['Diâmetro Sistólico', document.getElementById('diam_sist_final').value || '', 'mm', 'Percentual Enc. Cavidade', document.getElementById('print_percent_encurt').textContent || '', '%'],
            ['Espessura do Septo', document.getElementById('esp_diast_septo').value || '', 'mm', 'Espessura Relativa Parede', document.getElementById('print_esp_relativa').textContent || '', ''],
            ['Espessura da Parede', document.getElementById('esp_diast_ppve').value || '', 'mm', 'Índice de massa', document.getElementById('print_indice_massa').textContent || '', 'g/m²']
        ],
        styles: {
            fontSize: 8,
            cellPadding: 2,
            lineWidth: 0.1,
            minCellHeight: 4
        },
        columnStyles: {
            0: { cellWidth: 35 },
            1: { cellWidth: 15, halign: 'center' },
            2: { cellWidth: 10, halign: 'center' },
            3: { cellWidth: 35 },
            4: { cellWidth: 15, halign: 'center' },
            5: { cellWidth: 10, halign: 'center' }
        },
        margin: { left: margin, right: margin }
    });

    // Nova página para o laudo
    doc.addPage();

    // Texto do laudo
    doc.setFontSize(8);
    const laudoY = margin;
    const laudoText = [
        'Exame Realizado com ritmo cardíaco regular',
        '',
        'Cavidades Cardíacas com dimensões normais',
        'Raiz da Aorta com diâmetro Conservado',
        'Espessura miocádica do ventrículo esquerdo conservada',
        '',
        'Desempenho sistólico biventricular conservado. Não foram observadas alterações segmentares da',
        'Contratilidade ventricular',
        'Função Diastólica do ventrículo esquerdo conservado ao Doppler Mitral espectral',
        '',
        'Valva mitral com abertura e mobilidade conservadas. Colordoppler registrou refluxo discreto',
        'Valva tricúspide com abertura conservada.',
        'Valva aórtica com abertura e mobilidade conservadas.',
        'Valva pulmonar com abertura e mobilidade conservadas.',
        '',
        'Demais fluxos transvalvares com velocidades normais ao colordoppler',
        'Pericárdio ecograficamente normal.',
        '',
        'OPINIÃO:',
        'Ecocardiograma compatível com a normalidade'
    ];

    let currentY = laudoY;
    laudoText.forEach(line => {
        doc.text(line, margin, currentY);
        currentY += 5;
    });

    // Numeração das páginas
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Página ${i} de ${totalPages}`, pageWidth - 25, doc.internal.pageSize.height - 10);
    }

    doc.save("laudo_ecocardiograma.pdf");
    console.log("PDF gerado com sucesso");
    } catch (error) {
        console.error("Erro ao gerar PDF:", error);
    }
}
