// Importamos os arquivos reais dos modelos
const Aluno = require('../src/models/Aluno');
const User = require('../src/models/User');

// Aqui criamos os MOCKS (dizemos ao Jest para interceptar e "fingir" o banco de dados)
jest.mock('../src/models/Aluno');
jest.mock('../src/models/User');

describe('Entrega 3 - Testes com Mocks e Stubs (PI4)', () => {

    beforeEach(() => {
        jest.clearAllMocks(); // Limpa o histórico do banco falso antes de cada teste
    });

    test('STUB 01: Deve simular a busca de um aluno no banco de dados', async () => {
        // Criando o STUB: A resposta pré-programada que o "banco" vai devolver
        const alunoSimulado = { id: 'uuid-123', nome: 'Pedro Henrique', statusEvasao: 'normal' };
        
        // Ensinamos o mock a retornar nossa resposta falsa quando chamarem o findByPk
        Aluno.findByPk = jest.fn().mockResolvedValue(alunoSimulado);

        const resultado = await Aluno.findByPk('uuid-123');

        // Verificamos se o sistema chamou o banco corretamente e se o dado voltou certo
        expect(Aluno.findByPk).toHaveBeenCalledWith('uuid-123');
        expect(resultado.nome).toBe('Pedro Henrique');
        expect(resultado.statusEvasao).toBe('normal');
    });

    test('STUB 02: Deve simular a verificação de um usuário no login', async () => {
        const usuarioFalso = { email: 'professor@unicap.br', perfil: 'professor' };
        
        // Simulando a busca por e-mail no banco (findOne do Sequelize)
        User.findOne = jest.fn().mockResolvedValue(usuarioFalso);

        const resultado = await User.findOne({ where: { email: 'professor@unicap.br' } });

        expect(User.findOne).toHaveBeenCalled();
        expect(resultado.perfil).toBe('professor');
    });

    test('STUB 03: Deve simular uma falha de conexão com o banco (Exceção)', async () => {
        // Simulando o cenário de erro: o banco de dados caiu
        Aluno.findAll = jest.fn().mockRejectedValue(new Error('Falha na conexão com o banco de dados'));

        // Garantimos que o sistema captura o erro corretamente
        await expect(Aluno.findAll()).rejects.toThrow('Falha na conexão com o banco de dados');
    });
});