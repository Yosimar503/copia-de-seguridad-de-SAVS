'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
require('dotenv').config();

const env = process.env.NODE_ENV || 'development';

/** @type {import('sequelize').Options & { database?: string; username?: string; password?: string }} */
let config;
try {
  config = require(__dirname + '/../config/config.json')[env];
} catch {
  config = null;
}

if (!config) {
  config = {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD ?? process.env.DB_PASS ?? '',
    database: process.env.DB_NAME || 'the_destiny_vault',
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    logging: false,
  };
} else if (env === 'development' || env === 'test') {
  config = {
    ...config,
    username: process.env.DB_USER || config.username,
    password: process.env.DB_PASSWORD ?? process.env.DB_PASS ?? config.password ?? '',
    database: process.env.DB_NAME || config.database,
    host: process.env.DB_HOST || config.host,
    port: Number(process.env.DB_PORT) || config.port || 3306,
  };
}
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
