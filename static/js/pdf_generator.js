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

        // Obter os dados do paciente
        const nome = document.getElementById('nome')?.value || 'Paciente';
        const sexo = document.getElementById('sexo')?.value || '';
        const dataNascimento = document.getElementById('dataNascimento')?.value || '';
        const idade = document.getElementById('idade')?.value || '';
        const peso = document.getElementById('peso')?.value || '';
        const altura = document.getElementById('altura')?.value || '';
        const superficie = document.getElementById('superficie')?.value || '';

        // Título centralizado
        doc.setFontSize(12);
        doc.text("Identificação", pageWidth / 2, margin, { align: 'center' });

        // Dados do Paciente - Tabela
        doc.autoTable({
            startY: margin + 10,
            head: [["Campo", "Valor"]],
            body: [
                ["Nome", nome],
                ["Sexo", sexo],
                ["Data de Nascimento", dataNascimento],
                ["Idade", idade],
                ["Peso", peso],
                ["Altura", altura],
                ["Superfície Corpórea", superficie]
            ],
            styles: {
                fontSize: 8,
                cellPadding: 3,
                lineWidth: 0.5,
                lineColor: [200, 200, 200]
            },
            headStyles: {
                fillColor: [220, 230, 241],
                fontStyle: 'bold'
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245]
            },
            margin: { left: margin }
        });

        // Cálculos e Medidas - Tabela
        doc.autoTable({
            startY: doc.autoTable.previous.finalY + 10,
            head: [[{
                content: 'Cálculos e Medidas',
                colSpan: 6,
                styles: { halign: 'center', fillColor: [38, 201, 158], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 10 }
            }]],
            body: [
                ['Medida', 'Valor', 'Un', 'Cálculo', 'Resultado', 'Un'],
                ['Aorta', document.getElementById('aorta')?.value || '', 'mm', 'Volume Diastólico Final', document.getElementById('print_volume_diast_final')?.textContent || '', 'ml'],
                ['Aorta Ascendente', document.getElementById('aorta_asc')?.value || '', 'mm', 'Volume Sistólico', document.getElementById('print_volume_sistolico')?.textContent || '', 'ml'],
                ['Átrio Esquerdo', document.getElementById('atrio')?.value || '', 'mm', 'Massa do VE', document.getElementById('print_massa_ve')?.textContent || '', 'g'],
                ['Vol Atrial Esq. Indexado', '', '', 'Volume Ejetado', document.getElementById('print_volume_ejetado')?.textContent || '', 'ml'],
                ['Diâmetro Diastólico', document.getElementById('diam_diast_final')?.value || '', 'mm', 'Fração de Ejeção', document.getElementById('print_fracao_ejecao')?.textContent || '', '%'],
                ['Diâmetro Sistólico', document.getElementById('diam_sist_final')?.value || '', 'mm', 'Percentual Enc. Cavidade', document.getElementById('print_percent_encurt')?.textContent || '', '%'],
                ['Espessura do Septo', document.getElementById('esp_diast_septo')?.value || '', 'mm', 'Espessura Relativa Parede', document.getElementById('print_esp_relativa')?.textContent || '', ''],
                ['Espessura da Parede', document.getElementById('esp_diast_ppve')?.value || '', 'mm', 'Índice de massa', document.getElementById('print_indice_massa')?.textContent || '', 'g/m²']
            ],
            styles: {
                fontSize: 8,
                cellPadding: 3,
                lineWidth: 0.5,
                lineColor: [200, 200, 200]
            },
            columnStyles: {
                0: { cellWidth: 35 },
                1: { cellWidth: 15, halign: 'center' },
                2: { cellWidth: 10, halign: 'center' },
                3: { cellWidth: 35 },
                4: { cellWidth: 15, halign: 'center' },
                5: { cellWidth: 10, halign: 'center' }
            },
            margin: { left: margin }
        });

        // Texto do Laudo
        const laudoContent = document.getElementById('editor')?.innerText || '';
        
        if (doc.autoTable.previous.finalY + 20 > doc.internal.pageSize.height - margin) {
            doc.addPage();
        }

        doc.setFontSize(10);
        doc.text("Laudo", margin, doc.autoTable.previous.finalY + 20);

        doc.setFontSize(9);
        const textLines = doc.splitTextToSize(laudoContent, pageWidth - 2 * margin);
        let currentY = doc.autoTable.previous.finalY + 30;

        textLines.forEach(line => {
            if (currentY > doc.internal.pageSize.height - margin) {
                doc.addPage();
                currentY = margin + 10;
            }
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
        alert("Erro ao gerar o PDF. Por favor, verifique o console para mais detalhes.");
    }
}
