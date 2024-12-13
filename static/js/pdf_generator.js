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
        head: [
            [{
                content: 'Dados do Paciente',
                colSpan: 1,
                styles: { halign: 'left' }
            }, {
                content: 'Valor',
                colSpan: 1,
                styles: { halign: 'left' }
            }]
        ],
        body: [
            ['Nome', document.getElementById('nome').value || ''],
            ['Data Nascimento', document.getElementById('dataNascimento').value || ''],
            ['Sexo', document.getElementById('sexo').value || ''],
            ['Peso', (document.getElementById('peso').value ? document.getElementById('peso').value + ' kg' : '')],
            ['Altura', (document.getElementById('altura').value ? document.getElementById('altura').value + ' cm' : '')]
        ],
        theme: 'plain',
        styles: {
            fontSize: 10,
            cellPadding: 6,
            lineColor: [0, 0, 0],
            lineWidth: 0.1,
        },
        columnStyles: {
            0: { 
                cellWidth: contentWidth/2,
                fillColor: false
            },
            1: { 
                cellWidth: contentWidth/2,
                fillColor: false
            }
        },
        headStyles: {
            fillColor: [38, 201, 158],
            textColor: 255,
            lineWidth: 0.1
        },
        margin: { left: margin }
    });

    // Tabela de Cálculos e Medidas
    const calculosHeader = {
        content: 'Cálculos e Medidas',
        colSpan: 6,
        styles: { 
            halign: 'left',
            fillColor: [38, 201, 158],
            textColor: 255
        }
    };

    const subHeader = [
        'Medida', 'Valor', 'Un', 'Cálculo', 'Resultado', 'Un'
    ].map(text => ({
        content: text,
        styles: {
            fillColor: [38, 201, 158],
            textColor: 255,
            halign: 'left'
        }
    }));

    doc.autoTable({
        startY: doc.autoTable.previous.finalY + 10,
        head: [
            [calculosHeader],
            subHeader
        ],
        body: [
            ['Átrio Esquerdo', document.getElementById('atrio').value || '', 'mm', 'Volume Diastólico Final', document.getElementById('print_volume_diast_final').textContent || '', 'ml'],
            ['Aorta', document.getElementById('aorta').value || '', 'mm', 'Volume Sistólico', document.getElementById('print_volume_sistolico').textContent || '', 'ml'],
            ['Diâmetro Diastólico', document.getElementById('diam_diast_final').value || '', 'mm', 'Volume Ejetado', document.getElementById('print_volume_ejetado').textContent || '', 'ml'],
            ['Diâmetro Sistólico', document.getElementById('diam_sist_final').value || '', 'mm', 'Fração de Ejeção', document.getElementById('print_fracao_ejecao').textContent || '', '%'],
            ['Espessura do Septo', document.getElementById('esp_diast_septo').value || '', 'mm', 'Percentual Enc. Cavidade', document.getElementById('print_percent_encurt').textContent || '', '%'],
            ['Espessura da Parede', document.getElementById('esp_diast_ppve').value || '', 'mm', 'Espessura Relativa', document.getElementById('print_esp_relativa').textContent || '', ''],
            ['Ventrículo Direito', document.getElementById('vd').value || '', 'mm', 'Índice de Massa', document.getElementById('print_indice_massa').textContent || '', 'g/m²']
        ],
        theme: 'plain',
        styles: {
            fontSize: 10,
            cellPadding: 6,
            lineColor: [0, 0, 0],
            lineWidth: 0.1,
            valign: 'middle'
        },
        columnStyles: {
            0: { cellWidth: 35 },
            1: { cellWidth: 15, halign: 'center' },
            2: { cellWidth: 15, halign: 'center' },
            3: { cellWidth: 35 },
            4: { cellWidth: 20, halign: 'center' },
            5: { cellWidth: 15, halign: 'center' }
        },
        margin: { left: margin }
    });

    // Numeração de páginas
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Página ${i} de ${totalPages}`, pageWidth - 25, doc.internal.pageSize.height - 10);
    }

    doc.save("laudo_ecocardiograma.pdf");
}
