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

        // Obter os dados do paciente com tratamento de undefined
        const nome = document.getElementById('nome')?.value || '';
        const sexo = document.getElementById('sexo')?.value || '';
        const dataNascimento = document.getElementById('dataNascimento')?.value || '';
        const idade = document.getElementById('idade')?.value || '';
        const peso = document.getElementById('peso')?.value || '';
        const altura = document.getElementById('altura')?.value || '';
        const superficie = document.getElementById('superficie')?.value || '';

        // Título
        doc.autoTable({
            head: [['Identificação']],
            body: [[
                {
                    content: 
                    `Nome: ${nome}     Sexo: ${sexo}
                    Data de Nascimento: ${dataNascimento}     Idade: ${idade}
                    Peso: ${peso} kg     Altura: ${altura} cm     Superfície Corpórea: ${superficie} m²`,
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
                ['Aorta', '31', 'mm', 'Volume Diastólico Final', '154', 'ml'],
                ['Aorta Ascendente', '42', 'mm', 'Volume Sistólico', '67', 'ml'],
                ['Átrio Esquerdo', '31', 'mm', 'Massa do VE', '147', 'g'],
                ['Vol Atrial Esq. Indexado', '', 'mm', 'Volume Ejetado', '87', 'ml'],
                ['Diâmetro Diastólico', '48', 'mm', 'Fração de Ejeção', '57', '%'],
                ['Diâmetro Sistólico', '32', 'mm', 'Percentual Enc. Cavidade', '33', '%'],
                ['Espessura do Septo', '9', 'mm', 'Espessura Relativa Parede', '0.38', ''],
                ['Espessura da Parede', '9', 'mm', 'Índice de massa', '74', 'g/m²']
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
            margin: { left: margin, right: margin }
        });

        // Texto do Laudo
        const laudoContent = document.getElementById('editor')?.innerText || '';
        
        doc.setFontSize(9);
        const textLines = doc.splitTextToSize(laudoContent, pageWidth - 2 * margin);
        
        if (doc.autoTable.previous.finalY + (textLines.length * 5) > doc.internal.pageSize.height - margin) {
            doc.addPage();
            doc.autoTable.previous.finalY = margin;
        }

        textLines.forEach((line, index) => {
            const yPos = doc.autoTable.previous.finalY + 10 + (index * 5);
            if (yPos > doc.internal.pageSize.height - margin) {
                doc.addPage();
                doc.autoTable.previous.finalY = margin;
                doc.text(line, margin, margin + ((index % 20) * 5));
            } else {
                doc.text(line, margin, yPos);
            }
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