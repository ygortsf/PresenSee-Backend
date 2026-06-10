const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

if (process.env.DB_DIALECT === 'sqlite' || !process.env.DB_DIALECT) {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.DB_STORAGE || './database.sqlite',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: process.env.DB_DIALECT,
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
    }
  );
}

module.exports = sequelize;
