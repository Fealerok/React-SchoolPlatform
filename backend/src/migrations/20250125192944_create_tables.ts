import { table } from "console";
import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {

    //Создание таблицы UsersData
    try {
        await knex.schema.createTable("UsersData", (table) => {
            table.increments('id').primary();
            table.string('login').notNullable().unique();
            table.string('password').notNullable().unique();
        });
    } catch (error) {
        console.log(`Ошибка создания UsersData ${error}`);
    }

    //Создание таблицы Roles
    try {
        await knex.schema.createTable("Roles", (table) => {
            table.increments('id').primary();
            table.string('name').notNullable().unique();
        });
    } catch (error) {
        console.log(`Ошибка создания Roles ${error}`);
    }
    
    //Создание таблицы Users
    try {
        await knex.schema.createTable("Users", (table) => {
            table.increments('id').primary();
            table.string('full_name').notNullable();
            table.integer('id_role').notNullable();
            table.integer('class');
            table.integer('id_usersdata').notNullable().references('id').inTable('UsersData').onDelete("CASCADE");
        });
    } catch (error) {
        console.log(`Ошибка создания Users ${error}`);
    }

    
}


export async function down(knex: Knex): Promise<void> {
}

