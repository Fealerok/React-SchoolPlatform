import type { Knex } from "knex";
require("dotenv").config();

//Объект с настройками конфигурации knex (данные БД и папка для миграций)
//Создание файла миграций - npx knex migrate:make name_migrate
const config: { [key: string]: Knex.Config} = {
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
        }
      },
}

export default config;