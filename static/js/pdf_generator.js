function gerarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    const tableWidth = pageWidth - 2 * margin;

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
    doc.text("Identificação e Cálculos", pageWidth / 2, margin, { align: 'center' });

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
            lineColor: [0, 0, 0]
        },
        headStyles: {
            fillColor: [200, 200, 200],
            textColor: [0, 0, 0],
            fontStyle: 'bold'
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245]
        },
        margin: { left: margin, right: margin },
        tableWidth: tableWidth / 2 - 5
    });

    // Cálculos e Medidas - Tabela
    doc.autoTable({
        startY: margin + 10,
        startX: pageWidth / 2 + 5,
        head: [["Medida", "Valor", "Unidade"]],
        body: [
            ["Aorta", document.getElementById('aorta')?.value || '', "mm"],
            ["Aorta Ascendente", document.getElementById('aorta_asc')?.value || '', "mm"],
            ["Átrio Esquerdo", document.getElementById('atrio')?.value || '', "mm"],
            ["Diâmetro Diastólico", document.getElementById('diam_diast_final')?.value || '', "mm"],
            ["Diâmetro Sistólico", document.getElementById('diam_sist_final')?.value || '', "mm"],
            ["Espessura do Septo", document.getElementById('esp_diast_septo')?.value || '', "mm"],
            ["Espessura da Parede", document.getElementById('esp_diast_ppve')?.value || '', "mm"]
        ],
        styles: {
            fontSize: 10,
            cellPadding: 5,
            lineWidth: 0.5,
            lineColor: [0, 0, 0]
        },
        headStyles: {
            fillColor: [200, 200, 200],
            textColor: [0, 0, 0],
            fontStyle: 'bold'
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245]
        },
        margin: { left: pageWidth / 2 + 5, right: margin },
        tableWidth: tableWidth / 2 - 5
    });

    // Adiciona uma nova página para o laudo
    doc.addPage();

    // Texto do laudo
    const laudoContent = document.getElementById('editor')?.innerText || '';
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Laudo", margin, margin);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const textLines = doc.splitTextToSize(laudoContent, pageWidth - 2 * margin);
    let currentY = margin + 10;

    textLines.forEach(line => {
        if (currentY > doc.internal.pageSize.height - margin) {
            doc.addPage();
            currentY = margin;
        }
        doc.text(line, margin, currentY);
        currentY += 6;
    });

    // Numeração das páginas
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Página ${i} de ${totalPages}`, pageWidth - 30, doc.internal.pageSize.height - 10);
    }

    // Salva o PDF
    const fileName = `laudo_${nome.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
    doc.save(fileName);
}
