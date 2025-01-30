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
            table.integer('id_usersdata').notNullable().references('id').inTable('UsersData').onDelete("CASCADE").onUpdate("CASCADE");
        });
    } catch (error) {
        console.log(`Ошибка создания Users ${error}`);
    }

    //Создание таблицы RefreshTokens
    try {
        await knex.schema.createTable("RefreshTokens", (table) => {
            table.increments('id').primary();
            table.string("token");
            table.integer("id_user").references("id").inTable("Users").onDelete("CASCADE").onUpdate("CASCADE");
        });
    } catch (error) {
        console.log(`Ошибка создания RefreshTokens ${error}`);
    }

    //Создание таблицы Classes
    try {
        await knex.schema.createTable("Classes", (table) => {
            table.increments('id').primary();
            table.string("name").unique();
        });
    } catch (error) {
        console.log(`Ошибка создания Classes ${error}`);
    }

    //Создание таблицы UserClasses
    try {
        await knex.schema.createTable("UserClasses", (table) => {
            table.increments('id').primary();
            table.integer("id_user").references("id").inTable("Users").onDelete("CASCADE").onUpdate("CASCADE");
            table.integer("id_class").references("id").inTable("Classes").onDelete("CASCADE").onUpdate("CASCADE");
            table.unique(["id_user", "id_class"]);
        });
    } catch (error) {
        console.log(`Ошибка создания UserClasses ${error}`);
    }
    
}


export async function down(knex: Knex): Promise<void> {
}

