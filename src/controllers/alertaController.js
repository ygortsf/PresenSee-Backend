const { Alerta, Aluno, Turma } = require('../models');
const { Op } = require('sequelize');

const listar = async (req, res) => {
  try {
    const { turmaId, alunoId, tipo, resolvido, lido, pagina = 1, limite = 20 } = req.query;
    const where = {};

    if (turmaId) where.turmaId = turmaId;
    if (alunoId) where.alunoId = alunoId;
    if (tipo) where.tipo = tipo;
    if (resolvido !== undefined) where.resolvido = resolvido === 'true';
    if (lido !== undefined) where.lido = lido === 'true';

    const { rows: alertas, count } = await Alerta.findAndCountAll({
      where,
      include: [
        { model: Aluno, as: 'aluno', attributes: ['id', 'matricula', 'nome', 'statusEvasao'] },
        { model: Turma, as: 'turma', attributes: ['id', 'nome', 'serie'] },
      ],
      limit: parseInt(limite),
      offset: (parseInt(pagina) - 1) * parseInt(limite),
      order: [['createdAt', 'DESC']],
    });

    res.json({
      alertas,
      total: count,
      naoLidos: alertas.filter(a => !a.lido).length,
    });
  } catch (err) {
    res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

const marcarLido = async (req, res) => {
  try {
    const alerta = await Alerta.findByPk(req.params.id);
    if (!alerta) return res.status(404).json({ erro: 'Alerta não encontrado.' });
    await alerta.update({ lido: true });
    res.json({ mensagem: 'Alerta marcado como lido.' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

const resolver = async (req, res) => {
  try {
    const alerta = await Alerta.findByPk(req.params.id);
    if (!alerta) return res.status(404).json({ erro: 'Alerta não encontrado.' });
    await alerta.update({
      resolvido: true,
      lido: true,
      observacaoResolucao: req.body.observacao || null,
    });
    res.json({ mensagem: 'Alerta resolvido com sucesso.' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

const contarNaoLidos = async (req, res) => {
  try {
    const count = await Alerta.count({ where: { lido: false, resolvido: false } });
    res.json({ naoLidos: count });
  } catch (err) {
    res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

module.exports = { listar, marcarLido, resolver, contarNaoLidos };
