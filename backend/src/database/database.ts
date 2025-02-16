const {Pool} = require("pg");
const bcrypt = require("bcryptjs");
const cryptoJS = require("crypto-js");
import { log } from "node:console";
import { up } from "../migrations/20250125192944_create_tables";
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
                        "Users".id, "Users".full_name, "UsersData".login, "Roles".name as role_name
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
                            role: user.role_name,
                            fullName: user.full_name
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

    getRefreshToken = async (idUser: number) => {
        try {
            const refreshTokenRow = (await this.db.query(`SELECT * FROM "RefreshTokens" WHERE id_user=$1`, [idUser])).rows;

            if (refreshTokenRow.length != 0) return refreshTokenRow[0].token;
            else return null;
        } catch (error) {
            console.log(`Ошибка получения рефреш-токена в БД: ${error}`);
            
        }
    }

    saveRefreshToken = async (idUser: number, refreshToken: string) => {
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
            
            const users = (await this.db.query(`
                SELECT 
                    "Users".id, 
                    "Users".full_name, 
                    "Classes".name as classname,
                    "UsersData".login
                FROM "Users"
                JOIN "Classes" ON "Classes".id = $1
                LEFT JOIN "UsersData" ON "UsersData".id = "Users".id_usersdata
                WHERE "Users".id_class = $1`, [selectedClassid])).rows;

            

            return users;
          
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
            const idStudentRole = ((await this.db.query(`SELECT id FROM "Roles" WHERE name=$1`, ['Ученик'])).rows[0]).id;
           await this.db.query(`DELETE FROM "Classes" WHERE id=$1`, [selectedClassId]);

           const usersDataRows = (await this.db.query(`SELECT id_usersdata 
                                                    FROM "Users" 
                                                    WHERE id_class = $1 AND id_role=$2`, [selectedClassId, idStudentRole])).rows;

            const usersDataId = usersDataRows.filter((ud: any) => ud.id_usersdata != null);

            await this.db.query(`DELETE FROM "Users" WHERE id_class=$1 AND id_role=$2`, [selectedClassId, idStudentRole]);

            for (let i = 0; i < usersDataId.length; i++){
                await this.db.query(`DELETE FROM "UsersData" WHERE id=$1`, [usersDataId[i].id_usersdata]);
            }
           
        } catch (error) {
            console.log(`Ошибка удаления класса в БД: ${error}`);
            
        }
    }

    addStudentInClass = async (fullName: string, selectedClassId: number) => {
        try {
            const studentRoleid = (await this.db.query(`SELECT id FROM "Roles" WHERE name='Ученик'`)).rows[0].id;
            await this.db.query(`INSERT INTO "Users"("full_name", "id_role", "id_class") VALUES ($1, $2, $3)`, [fullName, studentRoleid, selectedClassId]);
            console.log(`Фио: ${fullName}`);
            
        } catch (error) {
            console.log(`Ошибка добавления ученика в БД: ${error}`);
            
        }
    }

    deleteStudent = async (selectedStudentId: number) => {
        try {
            const usersDataIdRow = (await this.db.query(`SELECT id_usersdata FROM "Users" WHERE id=$1`, [selectedStudentId])).rows[0];
            
            if (!usersDataIdRow.id_usersData){
                await this.db.query(`DELETE FROM "Users" WHERE id=$1`, [selectedStudentId]);
            }
            else{
                await this.db.query(`DELETE FROM "Users" WHERE id=$1`, [selectedStudentId]);
                await this.db.query(`DELETE FROM "UsersData" WHERE id=$1`, [usersDataIdRow.id_usersData]);
            }
        } catch (error) {
            console.log(`Ошибка удаления ученика в БД: ${error}`);
            
        }
    }

    updateStudent = async (updatedStudent: {
        id: number,
        surname: string | undefined,
        name: string | undefined,
        patronymic: string | undefined,
        className: string | undefined,
        login: string | undefined,
        password: string | undefined
    }) => {
        try {
            let foundClassId = null;
            if (updatedStudent.className || updatedStudent.className != ""){
                foundClassId = (await this.db.query(`SELECT id FROM "Classes" WHERE name=$1`, [updatedStudent.className])).rows[0];

                if (!foundClassId){
                    return [false, "Для сохранения, введите корректный класс или оставьте поле пустым"]
                }
            }

            foundClassId = foundClassId.id;
            
            const isEnteredPasswordForLogin = updatedStudent.login && (!updatedStudent.password || updatedStudent.password == ""); //Если введен логин, но не введен пароль
            const isEnteredLoginForPassword = updatedStudent.password && (!updatedStudent.login || updatedStudent.login == "") //Если введен пароль, но не введен логин

            if (isEnteredLoginForPassword || isEnteredPasswordForLogin){
                return [false, "Для сохранения, введите недостающий логин или пароль"]
            }

            //Если в логине нет @ и .
            if (updatedStudent.login && (!updatedStudent.login.includes("@") || !updatedStudent.login.includes(".")) ){
                return [false, "Неверный формат почты, которая введена в качестве логина."]
            }

            if (updatedStudent.password && updatedStudent.password.length < 8){
                return [false, "Длина пароля должна быть не меньше 8 символов."]
            }

            const studentRoleid = (await this.db.query(`SELECT id FROM "Roles" WHERE name='Ученик'`)).rows[0].id;
            const fullName = `${updatedStudent.surname} ${updatedStudent.name} ${updatedStudent.patronymic}`;
            await this.db.query(`Update "Users"
                                SET full_name=$1,
                                id_role=$2,
                                id_class=$3
                                WHERE id=$4
                                `, [fullName, studentRoleid, foundClassId, updatedStudent.id]);

            const hashedPassword = await bcrypt.hash(updatedStudent.password, salt);

            console.log(`Айди updated user: ${updatedStudent.id}`);
            const idUsersData = ((await this.db.query(`SELECT id_usersdata from "Users" WHERE id=$1`, [updatedStudent.id])).rows[0]).id_usersdata;
           
            if (updatedStudent.login && updatedStudent.password){

                if (idUsersData){
                    const oldLogin = ((await this.db.query(`SELECT login FROM "UsersData" WHERE id=$1`, [idUsersData])).rows[0]).login;
                    await this.db.query(`UPDATE "UsersData" SET login=$1, password=$2 WHERE login=$3`, [updatedStudent.login, hashedPassword, oldLogin]);
                }

                else{
                    await this.db.query(`INSERT INTO "UsersData" ("login", "password") VALUES ($1, $2)`, [updatedStudent.login, hashedPassword]);
                    const idUserData =((await this.db.query(`SELECT id FROM "UsersData" WHERE login=$1`, [updatedStudent.login])).rows[0]).id;
                    await this.db.query(`UPDATE "Users" SET id_usersdata=$1 WHERE id=$2`, [idUserData, updatedStudent.id]);
                }
                
            }
            

            return [true, "Успешно"];

        } catch (error) {
            console.log(`Ошибка обновления ученика в Бд ${error}`);
            
        }
    }

    updateClassName = async (updatedClassName: string, selectedClassId: number) => {
        try {
            await this.db.query(`UPDATE "Classes" SET name=$1 WHERE id=$2`, [updatedClassName, selectedClassId]);
        } catch (error) {
            console.log(`Ошибка обновления названия класса в БД: ${error}`);
            
        }
    }

    addNewLesson = async (newLessonName: string, selectedTime: string, selectedDate: Date, idUser: number) => {
        try {
            console.log(idUser);
            await this.db.query(`INSERT INTO "Lessons"("name", "lesson_date", "lesson_start_time", "id_teacher")
                VALUES ($1, $2, $3, $4)`, [newLessonName, selectedDate, selectedTime, idUser]);
        } catch (error) {
            console.log(`Ошибка добавления урока в БД: ${error}`);
            
        }
    }

    checkAvailabilityClass = async (className: string) => {
        try {
            const classesRows = (await this.db.query(`SELECT * FROM "Classes" WHERE name=$1`, [className])).rows;

            if (classesRows.length == 0) return false;

            return true;
        } catch (error) {
            console.log(`Ошибка проверки наличия класса в бд: ${error}`);
            
        }
    }
}

module.exports = new Database();

