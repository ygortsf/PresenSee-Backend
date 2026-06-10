const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Frequencia = sequelize.define('Frequencia', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  data: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  presente: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  justificada: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Falta justificada por atestado, etc.',
  },
  justificativa: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  metodoRegistro: {
    type: DataTypes.ENUM('manual', 'facial', 'qrcode'),
    defaultValue: 'manual',
  },
  observacao: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

module.exports = Frequencia;
