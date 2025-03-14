"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

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
    production: {
        client: "pg",
        connection: process.env.DATABASE_URL, // Используем переменную окружения DATABASE_URL
        migrations: {
            directory: "./src/migrations"
        },
        seeds: {
            directory: "./src/seeds"
        },
    }
};
exports.default = config;