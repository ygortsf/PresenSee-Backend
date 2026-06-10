const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  senha: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  perfil: {
    type: DataTypes.ENUM('professor', 'coordenador', 'secretaria', 'gestor'),
    allowNull: false,
    defaultValue: 'professor',
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  hooks: {
    beforeCreate: async (user) => {
      user.senha = await bcrypt.hash(user.senha, 10);
    },
    beforeUpdate: async (user) => {
      if (user.changed('senha')) {
        user.senha = await bcrypt.hash(user.senha, 10);
      }
    },
  },
});

User.prototype.verificarSenha = async function (senha) {
  return bcrypt.compare(senha, this.senha);
};

module.exports = User;
