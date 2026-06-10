const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Alerta = sequelize.define('Alerta', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  tipo: {
    type: DataTypes.ENUM('percentual', 'consecutivas', 'evasao'),
    allowNull: false,
  },
  mensagem: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  lido: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  resolvido: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  observacaoResolucao: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

module.exports = Alerta;
