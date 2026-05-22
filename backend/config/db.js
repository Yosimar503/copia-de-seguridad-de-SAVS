const { Sequelize } = require('sequelize');
require('dotenv').config(); // Cargar variables de entorno

const db = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql', // dialecto explícito
        logging: false,   // Cambia a console.log si deseas ver las consultas SQL en consola
    }
);

module.exports = db;
