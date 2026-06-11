const { calcularPercentual, verificarRiscoEvasao, verificarFaltasConsecutivas } = require('../src/services/frequenciaService');
const { validarCamposLogin } = require('../src/services/authService');

describe('Testes Unitários - Regras de Negócio (PI4)', () => {

    // --- TESTES DE FREQUÊNCIA ---
    test('Deve calcular corretamente o percentual de faltas do aluno', () => {
        expect(calcularPercentual(40, 10)).toBe(25);
    });

    test('Deve retornar 0 se o total de aulas for 0', () => {
        expect(calcularPercentual(0, 10)).toBe(0);
    });

    test('Deve classificar aluno como "risco" se tiver 25% ou mais de faltas', () => {
        expect(verificarRiscoEvasao(26)).toBe('risco');
    });

    test('Deve classificar aluno como "atencao" se tiver entre 10% e 24% de faltas', () => {
        expect(verificarRiscoEvasao(15)).toBe('atencao');
    });

    test('Deve classificar aluno como "normal" se tiver menos de 10% de faltas', () => {
        expect(verificarRiscoEvasao(5)).toBe('normal');
    });

    test('Deve retornar "true" para acionar alerta de 4 faltas consecutivas', () => {
        expect(verificarFaltasConsecutivas(4)).toBe(true);
    });

    test('Deve retornar "false" se faltas consecutivas forem menores que 4', () => {
        expect(verificarFaltasConsecutivas(3)).toBe(false);
    });

    // --- TESTES DE LOGIN ---
    test('Deve retornar true se o login for válido', () => {
        expect(validarCamposLogin('aluno@unicap.br', 'senha123')).toBe(true);
    });

    test('Deve lançar erro ao tentar validar login com e-mail sem @', () => {
        expect(() => validarCamposLogin('alunounicap.br', 'senha123')).toThrow("E-mail inválido");
    });

    test('Deve lançar erro ao tentar validar login com ambos os campos vazios', () => {
        expect(() => validarCamposLogin('', '')).toThrow("E-mail e senha são obrigatórios");
    });

    test('Deve lançar erro ao tentar validar login sem a senha', () => {
        expect(() => validarCamposLogin('aluno@unicap.br', '')).toThrow("E-mail e senha são obrigatórios");
    });
});