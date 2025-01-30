const {Pool} = require("pg");
const bcrypt = require("bcryptjs");
const cryptoJS = require("crypto-js");
import IAuth from "./interfaces";
require("dotenv").config();

const salt = 5;


class Database{
    db = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    constructor(){
        
    }



    //Функция аутентификации пользователя
    authUser = async (login: string, password: string): Promise<IAuth> => {
        //Открываем соединение
        const client = await this.db.connect();
        try {

            //Получаем пользователя по введенному логину из БД
            let query = `SELECT * FROM "UsersData" WHERE login=$1`;
            let values = [login];
            const userData = (await this.db.query(query, values)).rows[0];

            
            //Если пользователь существует
            if (userData){
                
                const userPassword = userData.password;
                const isMatch = await bcrypt.compare(password, userPassword);
                //Проверяем совпадение паролей
                if (isMatch){
                    query = `SELECT 
                        "Users".id, "UsersData".login, "Roles".name as role_name
                        FROM "Users"
                        JOIN "Roles" ON "Users".id_role = "Roles".id
                        JOIN "UsersData" ON "Users".id_usersdata = "UsersData".id
                        WHERE login=$1 `;
                    values = [login];

                    

                    const user = (await this.db.query(query, values)).rows[0];

                    client.release();

                    return {
                        isAuth: true,
                        message: "Успешная аутентификация",
                        user: {
                            id: user.id,
                            login: user.login,
                            role: user.role_name
                        }
                    }
                }

                else{
                    
                    //Если пароли не совпали
                    client.release();
                    return {
                        isAuth: false,
                        message: "Неверный пароль.",
                        user: undefined
                    }
                }
            }

            //Если пользователя не существует
            else{
                client.release();
                return {
                    isAuth: false,
                    message: "Пользователя с таким логином не существует."
                }
            }
        } catch (error) {
            console.log(`Ошибка аутентификации пользователя в бд: ${error}`);
            client.release();
            return {
                isAuth: false,
                message: "Ошибка аутентификации."
            };
        }
    }

    saveResfreshToken = async (idUser: number, refreshToken: string) => {
        try {
            const refreshInDatabase = (await this.db.query(`SELECT * FROM "RefreshTokens" WHERE id_user=$1`, [idUser])).rows;

            if (refreshInDatabase.length > 0){
                await this.db.query(`UPDATE "RefreshTokens" SET token=$1 WHERE id_user=$2`, [refreshToken, idUser]);
            }
            
            else{
                await this.db.query(`INSERT INTO "RefreshTokens" ("token", "id_user") VALUES ($1, $2)`, [refreshToken, idUser]);
            }
        } catch (error) {
            console.log(`Ошибка сохранения Рефреш-токена: ${error}`);
            
        }
    }

    getClasses = async () => {
        try {
            const classes = (await this.db.query(`SELECT * FROM "Classes"`)).rows;

            return classes;
        } catch (error) {
            console.log(`Ошибка получения классов в БД: ${error}`);
            
        }
    }

    getStudentsInSelectedClass = async (selectedClassid: number) => {
        try {
            const studentsInClass = await this.db.query(`SELECT
                                                        Classes.name, Users.full_name, UsersData.login, UsersData.password`);
        } catch (error) {
            console.log(`Ошибка получения учеников выбранного класса в БД: ${error}`);
            
        }
    }

    addNewClass = async (nameNewClass: string) => {
        try {
            await this.db.query(`INSERT INTO "Classes"("name") VALUES ($1)`, [nameNewClass]);
        } catch (error) {
            console.log(`Ошибка добавления нового класса в БД: ${error}`);
            
        }
    }

    deleteClass = async (selectedClassId: number) => {
        try {
           await this.db.query(`DELETE FROM "Classes" WHERE id=$1`, [selectedClassId]);
        } catch (error) {
            console.log(`Ошибка удаления класса в БД: ${error}`);
            
        }
    }
}

module.exports = new Database();

