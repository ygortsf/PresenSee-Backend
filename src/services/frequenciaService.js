// Regra do sistema: Aluno com >= 25% de faltas ou 4 consecutivas gera alerta

function calcularPercentual(totalAulas, faltas) {
    if (totalAulas === 0) return 0;
    return (faltas / totalAulas) * 100;
}

function verificarRiscoEvasao(percentualFaltas) {
    if (percentualFaltas >= 25) return 'risco';
    if (percentualFaltas >= 10) return 'atencao';
    return 'normal';
}

function verificarFaltasConsecutivas(faltasConsecutivas) {
    return faltasConsecutivas >= 4;
}

module.exports = { 
    calcularPercentual, 
    verificarRiscoEvasao, 
    verificarFaltasConsecutivas 
};