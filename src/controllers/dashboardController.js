const { Aluno, Turma, Frequencia, Alerta, sequelize } = require('../models');
const { Op, fn, col, literal } = require('sequelize');
const dayjs = require('dayjs');

// Resumo geral para o dashboard
const resumoGeral = async (req, res) => {
  try {
    const { anoLetivo = new Date().getFullYear() } = req.query;

    const [totalAlunos, alunosRisco, alunosAtencao, totalTurmas, alertasAbertos] = await Promise.all([
      Aluno.count({ where: { ativo: true } }),
      Aluno.count({ where: { ativo: true, statusEvasao: 'risco' } }),
      Aluno.count({ where: { ativo: true, statusEvasao: 'atencao' } }),
      Turma.count({ where: { ativa: true, anoLetivo } }),
      Alerta.count({ where: { resolvido: false } }),
    ]);

    // Taxa geral de frequência do mês atual
    const inicioMes = dayjs().startOf('month').toDate();
    const fimMes = dayjs().endOf('month').toDate();

    const frequenciasMes = await Frequencia.findAll({
      where: { data: { [Op.between]: [inicioMes, fimMes] } },
      attributes: [
        [fn('COUNT', col('id')), 'total'],
        [fn('SUM', literal('CASE WHEN presente = 1 THEN 1 ELSE 0 END')), 'presentes'],
      ],
      raw: true,
    });

    const totalFreq = parseInt(frequenciasMes[0]?.total) || 0;
    const presentesFreq = parseInt(frequenciasMes[0]?.presentes) || 0;
    const taxaFrequenciaGeral = totalFreq > 0 ? ((presentesFreq / totalFreq) * 100).toFixed(1) : 0;

    res.json({
      totalAlunos,
      alunosRisco,
      alunosAtencao,
      totalTurmas,
      alertasAbertos,
      taxaFrequenciaGeral: parseFloat(taxaFrequenciaGeral),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

// Evolução mensal de frequência (últimos 6 meses)
const evolucaoMensal = async (req, res) => {
  try {
    const { turmaId } = req.query;
    const meses = [];

    for (let i = 5; i >= 0; i--) {
      const mes = dayjs().subtract(i, 'month');
      const inicio = mes.startOf('month').format('YYYY-MM-DD');
      const fim = mes.endOf('month').format('YYYY-MM-DD');

      const where = { data: { [Op.between]: [inicio, fim] } };
      if (turmaId) where.turmaId = turmaId;

      const registros = await Frequencia.findAll({
        where,
        attributes: [
          [fn('COUNT', col('id')), 'total'],
          [fn('SUM', literal('CASE WHEN presente = 1 THEN 1 ELSE 0 END')), 'presentes'],
        ],
        raw: true,
      });

      const total = parseInt(registros[0]?.total) || 0;
      const presentes = parseInt(registros[0]?.presentes) || 0;
      const taxa = total > 0 ? parseFloat(((presentes / total) * 100).toFixed(1)) : 0;

      meses.push({
        mes: mes.format('MMM/YY'),
        mesNumero: mes.month() + 1,
        ano: mes.year(),
        total,
        presentes,
        faltas: total - presentes,
        taxaFrequencia: taxa,
      });
    }

    res.json(meses);
  } catch (err) {
    res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

// Frequência por turma
const frequenciaPorTurma = async (req, res) => {
  try {
    const turmas = await Turma.findAll({ where: { ativa: true } });
    const resultado = [];

    for (const turma of turmas) {
      const totalAlunos = await Aluno.count({ where: { turmaId: turma.id, ativo: true } });
      const alunosRisco = await Aluno.count({ where: { turmaId: turma.id, ativo: true, statusEvasao: 'risco' } });

      const registros = await Frequencia.findAll({
        where: { turmaId: turma.id },
        attributes: [
          [fn('COUNT', col('id')), 'total'],
          [fn('SUM', literal('CASE WHEN presente = 1 THEN 1 ELSE 0 END')), 'presentes'],
        ],
        raw: true,
      });

      const total = parseInt(registros[0]?.total) || 0;
      const presentes = parseInt(registros[0]?.presentes) || 0;
      const taxa = total > 0 ? parseFloat(((presentes / total) * 100).toFixed(1)) : 0;

      resultado.push({
        turma: { id: turma.id, nome: turma.nome, serie: turma.serie, turno: turma.turno },
        totalAlunos,
        alunosRisco,
        totalAulas: turma.totalAulas,
        taxaFrequencia: taxa,
      });
    }

    res.json(resultado);
  } catch (err) {
    res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

// Relatório mensal completo
const relatorioMensal = async (req, res) => {
  try {
    const { mes = dayjs().month() + 1, ano = dayjs().year(), turmaId } = req.query;

    const inicio = dayjs(`${ano}-${String(mes).padStart(2, '0')}-01`).startOf('month').format('YYYY-MM-DD');
    const fim = dayjs(`${ano}-${String(mes).padStart(2, '0')}-01`).endOf('month').format('YYYY-MM-DD');

    const alunoWhere = { ativo: true };
    if (turmaId) alunoWhere.turmaId = turmaId;

    const alunos = await Aluno.findAll({
      where: alunoWhere,
      include: [{ model: Turma, as: 'turma', attributes: ['id', 'nome', 'serie'] }],
    });

    const relatorio = [];
    for (const aluno of alunos) {
      const freqWhere = { alunoId: aluno.id, data: { [Op.between]: [inicio, fim] } };
      if (turmaId) freqWhere.turmaId = turmaId;

      const registros = await Frequencia.findAll({ where: freqWhere });
      const total = registros.length;
      const presencas = registros.filter(r => r.presente).length;
      const faltas = registros.filter(r => !r.presente && !r.justificada).length;
      const faltasJustificadas = registros.filter(r => !r.presente && r.justificada).length;

      relatorio.push({
        aluno: { id: aluno.id, nome: aluno.nome, matricula: aluno.matricula },
        turma: aluno.turma,
        totalAulas: total,
        presencas,
        faltas,
        faltasJustificadas,
        taxaFrequencia: total > 0 ? parseFloat(((presencas / total) * 100).toFixed(1)) : 0,
        percentualFaltas: total > 0 ? parseFloat(((faltas / total) * 100).toFixed(1)) : 0,
        statusEvasao: aluno.statusEvasao,
      });
    }

    res.json({
      periodo: { mes: parseInt(mes), ano: parseInt(ano), inicio, fim },
      relatorio,
    });
  } catch (err) {
    res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

module.exports = { resumoGeral, evolucaoMensal, frequenciaPorTurma, relatorioMensal };
