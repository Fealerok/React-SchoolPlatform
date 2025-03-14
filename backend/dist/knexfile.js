"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
//Объект с настройками конфигурации knex (данные БД и папка для миграций)
//Создание файла миграций - npx knex migrate:make name_migrate
const config = {
    development: {
        client: "pg",
        connection: {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        },
        migrations: {
            directory: "./src/migrations"
        },
        seeds: {
            directory: "./src/seeds"
        },
    },
};
exports.default = config;
