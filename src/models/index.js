const sequelize = require('../config/database');
const User = require('./User');
const Turma = require('./Turma');
const Aluno = require('./Aluno');
const Frequencia = require('./Frequencia');
const Alerta = require('./Alerta');

// Aluno pertence a uma Turma
Aluno.belongsTo(Turma, { foreignKey: 'turmaId', as: 'turma' });
Turma.hasMany(Aluno, { foreignKey: 'turmaId', as: 'alunos' });

// Turma pertence a um professor responsável
Turma.belongsTo(User, { foreignKey: 'professorId', as: 'professor' });
User.hasMany(Turma, { foreignKey: 'professorId', as: 'turmas' });

// Frequencia pertence a Aluno e a Turma
Frequencia.belongsTo(Aluno, { foreignKey: 'alunoId', as: 'aluno' });
Aluno.hasMany(Frequencia, { foreignKey: 'alunoId', as: 'frequencias' });

Frequencia.belongsTo(Turma, { foreignKey: 'turmaId', as: 'turma' });
Turma.hasMany(Frequencia, { foreignKey: 'turmaId', as: 'frequencias' });

// Frequencia registrada por um User (professor)
Frequencia.belongsTo(User, { foreignKey: 'registradoPorId', as: 'registradoPor' });

// Alerta pertence a Aluno e Turma
Alerta.belongsTo(Aluno, { foreignKey: 'alunoId', as: 'aluno' });
Aluno.hasMany(Alerta, { foreignKey: 'alunoId', as: 'alertas' });

Alerta.belongsTo(Turma, { foreignKey: 'turmaId', as: 'turma' });

module.exports = { sequelize, User, Turma, Aluno, Frequencia, Alerta };
