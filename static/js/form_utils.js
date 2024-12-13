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
            formatarData(this);
        });
    }
});
