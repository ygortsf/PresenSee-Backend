const { validationResult } = require('express-validator');
const { Aluno, Turma, Frequencia, Alerta, sequelize } = require('../models');
const { Op } = require('sequelize');

const listar = async (req, res) => {
  try {
    const { turmaId, statusEvasao, busca, pagina = 1, limite = 20 } = req.query;
    const where = { ativo: true };

    if (turmaId) where.turmaId = turmaId;
    if (statusEvasao) where.statusEvasao = statusEvasao;
    if (busca) where.nome = { [Op.like]: `%${busca}%` };

    const { rows: alunos, count } = await Aluno.findAndCountAll({
      where,
      include: [{ model: Turma, as: 'turma', attributes: ['id', 'nome', 'serie', 'turno'] }],
      limit: parseInt(limite),
      offset: (parseInt(pagina) - 1) * parseInt(limite),
      order: [['nome', 'ASC']],
    });

    res.json({
      alunos,
      total: count,
      paginas: Math.ceil(count / parseInt(limite)),
      paginaAtual: parseInt(pagina),
    });
  } catch (err) {
    res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

const buscarPorId = async (req, res) => {
  try {
    const aluno = await Aluno.findByPk(req.params.id, {
      include: [{ model: Turma, as: 'turma' }],
    });
    if (!aluno) return res.status(404).json({ erro: 'Aluno não encontrado.' });
    res.json(aluno);
  } catch (err) {
    res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

const criar = async (req, res) => {
  const erros = validationResult(req);
  if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

  try {
    const aluno = await Aluno.create(req.body);
    res.status(201).json(aluno);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ erro: 'Matrícula já cadastrada.' });
    }
    res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

const atualizar = async (req, res) => {
  try {
    const aluno = await Aluno.findByPk(req.params.id);
    if (!aluno) return res.status(404).json({ erro: 'Aluno não encontrado.' });
    await aluno.update(req.body);
    res.json(aluno);
  } catch (err) {
    res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

const desativar = async (req, res) => {
  try {
    const aluno = await Aluno.findByPk(req.params.id);
    if (!aluno) return res.status(404).json({ erro: 'Aluno não encontrado.' });
    await aluno.update({ ativo: false });
    res.json({ mensagem: 'Aluno desativado com sucesso.' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

const frequenciaDoAluno = async (req, res) => {
  try {
    const { mes, ano, turmaId } = req.query;
    const where = { alunoId: req.params.id };

    if (turmaId) where.turmaId = turmaId;
    if (mes && ano) {
      const inicio = new Date(ano, mes - 1, 1);
      const fim = new Date(ano, mes, 0);
      where.data = { [Op.between]: [inicio, fim] };
    }

    const registros = await Frequencia.findAll({
      where,
      order: [['data', 'DESC']],
    });

    const total = registros.length;
    const presencas = registros.filter(r => r.presente).length;
    const faltas = total - presencas;
    const taxaFrequencia = total > 0 ? ((presencas / total) * 100).toFixed(1) : 0;
    const percentualFaltas = total > 0 ? ((faltas / total) * 100).toFixed(1) : 0;

    res.json({
      registros,
      resumo: { total, presencas, faltas, taxaFrequencia, percentualFaltas },
    });
  } catch (err) {
    res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

const cadastrarBiometria = async (req, res) => {
  try {
    const aluno = await Aluno.findByPk(req.params.id);
    if (!aluno) return res.status(404).json({ erro: 'Aluno não encontrado.' });

    const { fotoBiometrica } = req.body;
    await aluno.update({ fotoBiometrica });
    res.json({ mensagem: 'Biometria cadastrada com sucesso.' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

module.exports = { listar, buscarPorId, criar, atualizar, desativar, frequenciaDoAluno, cadastrarBiometria };
