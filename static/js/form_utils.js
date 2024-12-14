function formatarData(input) {
    let valor = input.value.replace(/\D/g, "");
    if (valor.length > 2) valor = valor.replace(/^(\d{2})(\d)/, "$1/$2");
    if (valor.length > 5) valor = valor.replace(/^(\d{2}\/\d{2})(\d)/, "$1/$2");
    input.value = valor;
}

document.addEventListener('DOMContentLoaded', function() {
    const dateInput = document.getElementById('dataNascimento');
    if (dateInput) {
        dateInput.addEventListener('input', function() {

    // Set current date in exam date field
    const examDateInput = document.getElementById('dataExame');
    if (examDateInput) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        examDateInput.value = `${year}-${month}-${day}`;
    }

            formatarData(this);
        });
    }
});
