const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Aluno = sequelize.define('Aluno', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  matricula: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dataNascimento: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: { isEmail: true },
  },
  telefone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  nomeResponsavel: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  telefoneResponsavel: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  fotoBiometrica: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Base64 ou path da foto para reconhecimento facial',
  },
  statusEvasao: {
    type: DataTypes.ENUM('normal', 'atencao', 'risco', 'evadido'),
    defaultValue: 'normal',
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

module.exports = Aluno;
