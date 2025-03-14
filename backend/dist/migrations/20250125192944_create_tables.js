"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
function up(knex) {
    return __awaiter(this, void 0, void 0, function* () {
        //Создание таблицы UsersData
        try {
            yield knex.schema.createTable("UsersData", (table) => {
                table.increments('id').primary();
                table.string('login').notNullable().unique();
                table.string('password').notNullable().unique();
            });
        }
        catch (error) {
            console.log(`Ошибка создания UsersData ${error}`);
        }
        //Создание таблицы Roles
        try {
            yield knex.schema.createTable("Roles", (table) => {
                table.increments('id').primary();
                table.string('name').notNullable().unique();
            });
        }
        catch (error) {
            console.log(`Ошибка создания Roles ${error}`);
        }
        //Создание таблицы Users
        try {
            yield knex.schema.createTable("Users", (table) => {
                table.increments('id').primary();
                table.string('full_name').notNullable();
                table.integer('id_role').notNullable();
                table.integer("id_class");
                table.integer('id_usersdata').references('id').inTable('UsersData').onDelete("CASCADE").onUpdate("CASCADE");
            });
        }
        catch (error) {
            console.log(`Ошибка создания Users ${error}`);
        }
        //Создание таблицы RefreshTokens
        try {
            yield knex.schema.createTable("RefreshTokens", (table) => {
                table.increments('id').primary();
                table.text("token");
                table.integer("id_user").references("id").inTable("Users").onDelete("CASCADE").onUpdate("CASCADE");
            });
        }
        catch (error) {
            console.log(`Ошибка создания RefreshTokens ${error}`);
        }
        //Создание таблицы Classes
        try {
            yield knex.schema.createTable("Classes", (table) => {
                table.increments('id').primary();
                table.string("name").unique();
            });
        }
        catch (error) {
            console.log(`Ошибка создания Classes ${error}`);
        }
        //Создание таблицы Lessons
        try {
            yield knex.schema.createTable("Lessons", (table) => {
                table.increments('id').primary();
                table.text("name");
                table.date("lesson_date");
                table.time("lesson_start_time");
                table.integer("id_teacher").references("id").inTable("Users").onDelete("CASCADE").onUpdate("CASCADE");
                table.integer("id_class").references("id").inTable("Classes").onDelete("CASCADE").onUpdate("CASCADE");
            });
        }
        catch (error) {
            console.log(`Ошибка создания Users ${error}`);
        }
        //Создание таблицы SupportRequests
        try {
            yield knex.schema.createTable("SupportRequests", (table) => {
                table.increments('id').primary();
                table.integer("id_user").references("id").inTable("Users").onDelete("CASCADE").onUpdate("CASCADE");
                table.text("name_request");
                table.text("text_request");
            });
        }
        catch (error) {
            console.log(`Ошибка создания SupportRequest ${error}`);
        }
    });
}
function down(knex) {
    return __awaiter(this, void 0, void 0, function* () {
    });
}
