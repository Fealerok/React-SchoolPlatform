import { Knex } from "knex";
const bcrypt = require("bcryptjs");

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex("UsersData").del();

    const hashedPassword = await bcrypt.hash(process.env.TECH_PASSWORD, 5);

    // Inserts seed entries
    await knex("UsersData").insert([
        {login: process.env.TECH_LOGIN,  password: hashedPassword},
    ]);
};
