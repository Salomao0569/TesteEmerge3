
// Backup automático
function backupLaudo() {
    const editor = document.getElementById('editor');
    const backupData = {
        content: editor.innerHTML,
        timestamp: new Date().toISOString(),
        measurements: {
            peso: document.getElementById('peso').value,
            altura: document.getElementById('altura').value,
            atrio: document.getElementById('atrio').value,
            // ... outros campos
        }
    };
    
    const backups = JSON.parse(localStorage.getItem('laudoBackups') || '[]');
    backups.push(backupData);
    if (backups.length > 10) backups.shift(); // Manter últimos 10 backups
    localStorage.setItem('laudoBackups', JSON.stringify(backups));
    
    // Indicador visual
    const indicator = document.createElement('div');
    indicator.className = 'backup-indicator';
    indicator.textContent = 'Backup realizado';
    document.body.appendChild(indicator);
    setTimeout(() => indicator.remove(), 2000);
}

// Realizar backup a cada 5 minutos
setInterval(backupLaudo, 300000);

// Restaurar último backup se necessário
window.addEventListener('load', () => {
    const backups = JSON.parse(localStorage.getItem('laudoBackups') || '[]');
    if (backups.length > 0) {
        const lastBackup = backups[backups.length - 1];
        if (confirm('Deseja restaurar o último backup?')) {
            document.getElementById('editor').innerHTML = lastBackup.content;
            // Restaurar medidas
            Object.entries(lastBackup.measurements).forEach(([id, value]) => {
                const input = document.getElementById(id);
                if (input) input.value = value;
            });
        }
    }
});
