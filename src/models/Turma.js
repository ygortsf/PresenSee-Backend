const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Turma = sequelize.define('Turma', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  serie: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Ex: 1° Ano, 2° Ano, 3° Ano',
  },
  turno: {
    type: DataTypes.ENUM('manha', 'tarde', 'noite'),
    allowNull: false,
    defaultValue: 'manha',
  },
  anoLetivo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: new Date().getFullYear(),
  },
  totalAulas: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Total de aulas dadas na turma',
  },
  ativa: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

module.exports = Turma;
