const { validationResult } = require('express-validator');
const { Frequencia, Aluno, Turma, Alerta, sequelize } = require('../models');
const { Op } = require('sequelize');
const alertaService = require('../services/alertaService');

// Registrar chamada para uma turma inteira em um dia
const registrarChamada = async (req, res) => {
  const erros = validationResult(req);
  if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

  const t = await sequelize.transaction();
  try {
    const { turmaId, data, registros, metodoRegistro = 'manual' } = req.body;
    // registros: [{ alunoId, presente, justificada, justificativa, observacao }]

    const turma = await Turma.findByPk(turmaId);
    if (!turma) {
      await t.rollback();
      return res.status(404).json({ erro: 'Turma não encontrada.' });
    }

    const resultados = [];
    for (const r of registros) {
      const [freq, created] = await Frequencia.findOrCreate({
        where: { alunoId: r.alunoId, turmaId, data },
        defaults: {
          presente: r.presente,
          justificada: r.justificada || false,
          justificativa: r.justificativa || null,
          metodoRegistro,
          observacao: r.observacao || null,
          registradoPorId: req.user.id,
        },
        transaction: t,
      });

      if (!created) {
        await freq.update({
          presente: r.presente,
          justificada: r.justificada || false,
          justificativa: r.justificativa || null,
          observacao: r.observacao || null,
        }, { transaction: t });
      }

      resultados.push(freq);
    }

    // Incrementa contador de aulas da turma se for registro novo
    await turma.increment('totalAulas', { by: 1, transaction: t });
    await t.commit();

    // Verificar alertas de evasão após registro (assíncrono, não bloqueia resposta)
    alertaService.verificarAlertas(turmaId, data).catch(console.error);

    res.status(201).json({
      mensagem: 'Chamada registrada com sucesso.',
      total: resultados.length,
    });
  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

// Buscar chamada de uma turma em uma data específica
const buscarChamada = async (req, res) => {
  try {
    const { turmaId, data } = req.query;
    if (!turmaId || !data) return res.status(400).json({ erro: 'turmaId e data são obrigatórios.' });

    const registros = await Frequencia.findAll({
      where: { turmaId, data },
      include: [{ model: Aluno, as: 'aluno', attributes: ['id', 'matricula', 'nome'] }],
      order: [[{ model: Aluno, as: 'aluno' }, 'nome', 'ASC']],
    });

    const presentes = registros.filter(r => r.presente).length;
    const ausentes = registros.length - presentes;

    res.json({ registros, resumo: { total: registros.length, presentes, ausentes } });
  } catch (err) {
    res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

// Justificar uma falta
const justificarFalta = async (req, res) => {
  try {
    const freq = await Frequencia.findByPk(req.params.id);
    if (!freq) return res.status(404).json({ erro: 'Registro não encontrado.' });
    if (freq.presente) return res.status(400).json({ erro: 'Aluno estava presente nesta data.' });

    await freq.update({
      justificada: true,
      justificativa: req.body.justificativa,
    });

    res.json({ mensagem: 'Falta justificada com sucesso.', frequencia: freq });
  } catch (err) {
    res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

module.exports = { registrarChamada, buscarChamada, justificarFalta };
