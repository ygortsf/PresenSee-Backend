const { validationResult } = require('express-validator');
const { Turma, Aluno, User, Frequencia } = require('../models');
const { Op } = require('sequelize');

const listar = async (req, res) => {
  try {
    const { anoLetivo, turno, professorId } = req.query;
    const where = { ativa: true };

    if (anoLetivo) where.anoLetivo = anoLetivo;
    if (turno) where.turno = turno;
    if (professorId) where.professorId = professorId;

    // Professor só vê as próprias turmas
    if (req.user.perfil === 'professor') where.professorId = req.user.id;

    const turmas = await Turma.findAll({
      where,
      include: [
        { model: User, as: 'professor', attributes: ['id', 'nome', 'email'] },
        { model: Aluno, as: 'alunos', where: { ativo: true }, required: false, attributes: ['id'] },
      ],
      order: [['serie', 'ASC'], ['nome', 'ASC']],
    });

    const resultado = turmas.map(t => ({
      ...t.toJSON(),
      totalAlunos: t.alunos.length,
    }));

    res.json(resultado);
  } catch (err) {
    res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

const buscarPorId = async (req, res) => {
  try {
    const turma = await Turma.findByPk(req.params.id, {
      include: [
        { model: User, as: 'professor', attributes: ['id', 'nome', 'email'] },
        { model: Aluno, as: 'alunos', where: { ativo: true }, required: false },
      ],
    });
    if (!turma) return res.status(404).json({ erro: 'Turma não encontrada.' });
    res.json(turma);
  } catch (err) {
    res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

const criar = async (req, res) => {
  const erros = validationResult(req);
  if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

  try {
    const turma = await Turma.create(req.body);
    res.status(201).json(turma);
  } catch (err) {
    res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

const atualizar = async (req, res) => {
  try {
    const turma = await Turma.findByPk(req.params.id);
    if (!turma) return res.status(404).json({ erro: 'Turma não encontrada.' });
    await turma.update(req.body);
    res.json(turma);
  } catch (err) {
    res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

const desativar = async (req, res) => {
  try {
    const turma = await Turma.findByPk(req.params.id);
    if (!turma) return res.status(404).json({ erro: 'Turma não encontrada.' });
    await turma.update({ ativa: false });
    res.json({ mensagem: 'Turma desativada com sucesso.' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

module.exports = { listar, buscarPorId, criar, atualizar, desativar };
