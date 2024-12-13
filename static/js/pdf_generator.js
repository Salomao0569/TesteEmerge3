function gerarPDF() {
    console.log("Iniciando geração do PDF");
    try {
        if (typeof window.jspdf === 'undefined') {
            throw new Error("Biblioteca jsPDF não carregada");
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pageWidth = doc.internal.pageSize.width;
        const margin = 15;
        const contentWidth = pageWidth - (2 * margin);

        // Função auxiliar para pegar valor do campo com validação
        const getFieldValue = (id, suffix = '') => {
            const element = document.getElementById(id);
            return element && element.value ? element.value + suffix : '';
        };

        // Título centralizado
        doc.setFontSize(12);
        doc.text("Identificação", pageWidth/2, margin, { align: 'center' });

        // Dados do Paciente - Tabela mais compacta
        doc.autoTable({
            startY: margin + 5,
            body: [
                [
                    { content: 'Nome:', styles: { cellWidth: 40 } },
                    { content: getFieldValue('nome'), styles: { cellWidth: 100 } },
                    { content: 'Sexo:', styles: { cellWidth: 30 } },
                    { content: getFieldValue('sexo'), styles: { cellWidth: 30 } }
                ],
                [
                    'Data de Nascimento',
                    getFieldValue('dataNascimento'),
                    'Data',
                    new Date().toLocaleDateString()
                ],
                [
                    'Peso:',
                    getFieldValue('peso', ' kg'),
                    'Altura:',
                    getFieldValue('altura', ' cm')
                ],
                [
                    'Superfície Corpórea:',
                    getFieldValue('superficie', ' m²'),
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
        const getMeasurement = (id, unit = '') => {
            const element = document.getElementById(id);
            return element && element.textContent ? element.textContent + unit : '';
        };

        doc.autoTable({
            startY: doc.autoTable.previous.finalY + 5,
            head: [[{
                content: 'Cálculos e Medidas',
                colSpan: 6,
                styles: { halign: 'center', fillColor: [38, 201, 158] }
            }]],
            body: [
                ['Medida', 'Valor', 'Un', 'Cálculo', 'Resultado', 'Un'],
                ['Aorta', getFieldValue('aorta'), 'mm', 'Volume Diastólico Final', getMeasurement('print_volume_diast_final'), 'ml'],
                ['Aorta Ascendente', getFieldValue('aorta_asc'), 'mm', 'Volume Sistólico', getMeasurement('print_volume_sistolico'), 'ml'],
                ['Átrio Esquerdo', getFieldValue('atrio'), 'mm', 'Massa do VE', getMeasurement('print_massa_ve'), 'g'],
                ['Vol Atrial Esq. Indexado', '', '', 'Volume Ejetado', getMeasurement('print_volume_ejetado'), 'ml'],
                ['Diâmetro Diastólico', getFieldValue('diam_diast_final'), 'mm', 'Fração de Ejeção', getMeasurement('print_fracao_ejecao'), '%'],
                ['Diâmetro Sistólico', getFieldValue('diam_sist_final'), 'mm', 'Percentual Enc. Cavidade', getMeasurement('print_percent_encurt'), '%'],
                ['Espessura do Septo', getFieldValue('esp_diast_septo'), 'mm', 'Espessura Relativa Parede', getMeasurement('print_esp_relativa'), ''],
                ['Espessura da Parede', getFieldValue('esp_diast_ppve'), 'mm', 'Índice de massa', getMeasurement('print_indice_massa'), 'g/m²']
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
        const laudoText = document.getElementById('editor');
        if (laudoText) {
            doc.setFontSize(9);
            const lines = laudoText.innerText.split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);

            let currentY = margin;
            lines.forEach(line => {
                const wrappedText = doc.splitTextToSize(line, pageWidth - 2 * margin);
                wrappedText.forEach(text => {
                    doc.text(text, margin, currentY);
                    currentY += 5;
                });
                currentY += 2; // Espaço extra entre parágrafos
            });
        }

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
        alert("Erro ao gerar o PDF. Por favor, verifique o console para mais detalhes.");
    }
}
