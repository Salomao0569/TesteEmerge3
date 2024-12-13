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
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Identificação do Paciente", pageWidth / 2, margin, { align: 'center' });

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
                fontSize: 10,
                cellPadding: 5,
                lineWidth: 0.5,
                lineColor: [150, 150, 150]
            },
            headStyles: {
                fillColor: [240, 240, 240],
                textColor: [0, 0, 0],
                fontStyle: 'bold'
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245]
            },
            margin: { left: margin, right: margin },
            tableWidth: "auto"
        });

        // Cálculos e Medidas - Tabela
        doc.autoTable({
            startY: doc.autoTable.previous.finalY + 10,
            head: [[{
                content: 'Cálculos e Medidas',
                colSpan: 6,
                styles: { halign: 'center', fillColor: [30, 144, 255], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 12 }
            }]],
            body: [
                ['Medida', 'Valor', 'Unidade', 'Cálculo', 'Resultado', 'Unidade'],
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
                fontSize: 10,
                cellPadding: 5,
                lineWidth: 0.5,
                lineColor: [150, 150, 150]
            },
            columnStyles: {
                0: { cellWidth: 35 },
                1: { cellWidth: 25, halign: 'center' },
                2: { cellWidth: 20, halign: 'center' },
                3: { cellWidth: 40 },
                4: { cellWidth: 25, halign: 'center' },
                5: { cellWidth: 20, halign: 'center' }
            },
            margin: { left: margin, right: margin },
            tableWidth: "auto"
        });

        // Adiciona uma nova página para o laudo
        doc.addPage();

        // Configurações do laudo
        const laudoMargin = 20;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);

        // Obtém o texto do laudo do editor
        const laudoContent = document.getElementById('editor')?.innerText || '';
        const laudoLines = doc.splitTextToSize(laudoContent, pageWidth - 2 * laudoMargin);

        let y = laudoMargin;
        laudoLines.forEach(line => {
            if (y > doc.internal.pageSize.height - laudoMargin) {
                doc.addPage();
                y = laudoMargin;
            }
            doc.text(line, laudoMargin, y);
            y += 7;
        });

        // Numeração das páginas
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.text(`Página ${i} de ${totalPages}`, pageWidth - 30, doc.internal.pageSize.height - 10);
        }

        // Salva o PDF
        doc.save(`laudo_${nome.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
        console.log("PDF gerado com sucesso");
    } catch (error) {
        console.error("Erro ao gerar PDF:", error);
        alert("Erro ao gerar o PDF. Por favor, verifique o console para mais detalhes.");
    }
}
