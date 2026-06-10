const { Aluno, Frequencia, Alerta, Turma } = require('../models');
const { Op } = require('sequelize');

const MAX_ABSENCE_PERCENT = parseFloat(process.env.MAX_ABSENCE_PERCENT) || 25;
const MAX_CONSECUTIVE_ABSENCES = parseInt(process.env.MAX_CONSECUTIVE_ABSENCES) || 4;

/**
 * Verifica e gera alertas para todos os alunos de uma turma após registro de chamada.
 */
const verificarAlertas = async (turmaId, data) => {
  const turma = await Turma.findByPk(turmaId);
  if (!turma) return;

  const alunos = await Aluno.findAll({
    where: { turmaId, ativo: true },
  });

  for (const aluno of alunos) {
    await verificarAlertaAluno(aluno, turma);
  }
};

const verificarAlertaAluno = async (aluno, turma) => {
  const registros = await Frequencia.findAll({
    where: { alunoId: aluno.id, turmaId: turma.id },
    order: [['data', 'DESC']],
  });

  if (registros.length === 0) return;

  const total = registros.length;
  const faltas = registros.filter(r => !r.presente && !r.justificada).length;
  const percentualFaltas = (faltas / total) * 100;

  // Regra 1: percentual de faltas >= 25%
  if (percentualFaltas >= MAX_ABSENCE_PERCENT) {
    await criarAlertaSeNaoExiste(aluno, turma, 'percentual',
      `Aluno ${aluno.nome} atingiu ${percentualFaltas.toFixed(1)}% de faltas na turma ${turma.nome}. Limite: ${MAX_ABSENCE_PERCENT}%.`
    );

    // Atualiza status de evasão
    const novoStatus = percentualFaltas >= 50 ? 'risco' : 'atencao';
    if (aluno.statusEvasao === 'normal') {
      await aluno.update({ statusEvasao: novoStatus });
    }
  }

  // Regra 2: 4 faltas consecutivas
  let consecutivas = 0;
  for (const r of registros) {
    if (!r.presente && !r.justificada) {
      consecutivas++;
      if (consecutivas >= MAX_CONSECUTIVE_ABSENCES) break;
    } else {
      break; // para na primeira presença
    }
  }

  if (consecutivas >= MAX_CONSECUTIVE_ABSENCES) {
    await criarAlertaSeNaoExiste(aluno, turma, 'consecutivas',
      `Aluno ${aluno.nome} acumula ${consecutivas} faltas consecutivas na turma ${turma.nome}. Ação imediata necessária.`
    );
    if (aluno.statusEvasao === 'normal' || aluno.statusEvasao === 'atencao') {
      await aluno.update({ statusEvasao: 'risco' });
    }
  }
};

const criarAlertaSeNaoExiste = async (aluno, turma, tipo, mensagem) => {
  const alertaExistente = await Alerta.findOne({
    where: {
      alunoId: aluno.id,
      turmaId: turma.id,
      tipo,
      resolvido: false,
    },
  });

  if (!alertaExistente) {
    await Alerta.create({
      alunoId: aluno.id,
      turmaId: turma.id,
      tipo,
      mensagem,
    });
  } else {
    // Atualiza mensagem do alerta existente
    await alertaExistente.update({ mensagem });
  }
};

module.exports = { verificarAlertas, verificarAlertaAluno };
