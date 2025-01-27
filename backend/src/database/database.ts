const {Pool} = require("pg");
const bcrypt = require("bcryptjs");
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
}

module.exports = new Database();

