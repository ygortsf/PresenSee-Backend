require('dotenv').config();
const { sequelize, User, Turma, Aluno, Frequencia } = require('../models');
const dayjs = require('dayjs');

const seed = async () => {
  await sequelize.sync({ force: true });
  console.log('🗑️  Banco limpo e recriado.');

  // Usuários
  const gestor = await User.create({ nome: 'Diretor(a) da Escola', email: 'gestor@presensee.com', senha: '123456', perfil: 'gestor' });
  const coord = await User.create({ nome: 'Coordenador(a) Pedagógico', email: 'coordenador@presensee.com', senha: '123456', perfil: 'coordenador' });
  const prof1 = await User.create({ nome: 'Prof. Carlos Oliveira', email: 'professor@presensee.com', senha: '123456', perfil: 'professor' });
  const prof2 = await User.create({ nome: 'Profa. Ana Lima', email: 'professor2@presensee.com', senha: '123456', perfil: 'professor' });
  console.log('✅ Usuários criados.');

  // Turmas
  const turma1A = await Turma.create({ nome: '1° Ano A', serie: '1° Ano', turno: 'manha', anoLetivo: 2025, professorId: prof1.id });
  const turma2B = await Turma.create({ nome: '2° Ano B', serie: '2° Ano', turno: 'tarde', anoLetivo: 2025, professorId: prof2.id });
  const turma3C = await Turma.create({ nome: '3° Ano C', serie: '3° Ano', turno: 'manha', anoLetivo: 2025, professorId: prof1.id });
  console.log('✅ Turmas criadas.');

  // Alunos
  const alunos1A = await Aluno.bulkCreate([
    { matricula: '20250001', nome: 'Ana Beatriz Santos', turmaId: turma1A.id },
    { matricula: '20250002', nome: 'Bruno Carvalho Silva', turmaId: turma1A.id },
    { matricula: '20250003', nome: 'Carla Mendes Rocha', turmaId: turma1A.id },
    { matricula: '20250004', nome: 'Diego Ferreira Lima', turmaId: turma1A.id },
    { matricula: '20250005', nome: 'Eduarda Costa Neves', turmaId: turma1A.id },
  ]);

  const alunos2B = await Aluno.bulkCreate([
    { matricula: '20250006', nome: 'Felipe Souza Dias', turmaId: turma2B.id },
    { matricula: '20250007', nome: 'Gabriela Alves Mota', turmaId: turma2B.id },
    { matricula: '20250008', nome: 'Henrique Pinto Luz', turmaId: turma2B.id },
  ]);
  console.log('✅ Alunos criados.');

  // Simular frequências dos últimos 20 dias
  const hoje = dayjs();
  let aulasTurma1A = 0;

  for (let i = 19; i >= 0; i--) {
    const data = hoje.subtract(i, 'day');
    if (data.day() === 0 || data.day() === 6) continue; // pula fds

    const dataStr = data.format('YYYY-MM-DD');
    aulasTurma1A++;

    for (const aluno of alunos1A) {
      // Aluno 4 falta muito (risco de evasão)
      let presente = true;
      if (aluno.matricula === '20250004' && i % 3 !== 0) presente = false;
      if (aluno.matricula === '20250005' && i < 5) presente = false; // faltas consecutivas

      await Frequencia.create({
        alunoId: aluno.id,
        turmaId: turma1A.id,
        data: dataStr,
        presente,
        registradoPorId: prof1.id,
      });
    }
  }

  await turma1A.update({ totalAulas: aulasTurma1A });
  console.log('✅ Frequências simuladas.');

  // Disparar verificação de alertas
  const { verificarAlertas } = require('../services/alertaService');
  await verificarAlertas(turma1A.id, hoje.format('YYYY-MM-DD'));
  console.log('✅ Alertas gerados.');

  console.log('\n🎉 Seed concluído! Credenciais de acesso:');
  console.log('   gestor@presensee.com     / 123456');
  console.log('   coordenador@presensee.com / 123456');
  console.log('   professor@presensee.com  / 123456');
};

seed().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
