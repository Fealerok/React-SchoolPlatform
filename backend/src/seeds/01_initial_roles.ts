import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex("Roles").del();

    // Inserts seed entries
    await knex("Roles").insert([
        { name: "Техподдержка" },
        { name: "Администратор" },
        { name: "Учитель" },
        { name: "Ученик" },
    ]);
};
