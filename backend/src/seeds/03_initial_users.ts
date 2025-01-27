import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex("Users").del();

    // Получение id из таблицы roles
    const roles = await knex('Roles').select('id', 'name');

    // Получение id из таблицы UsersData
    const usersData = await knex('UsersData').select('id', 'login');
    // Inserts seed entries
    await knex("Users").insert([
        {
            full_name: "Чаплыгин Артём Алексеевич", 
            id_role: roles.find(role => role.name == "Техподдержка")?.id, 
            id_usersdata: usersData.find(ud => ud.login == process.env.TECH_LOGIN)?.id
        }
    ]);
};
