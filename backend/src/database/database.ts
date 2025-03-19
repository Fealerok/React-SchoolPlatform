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

    addNewLesson = async (newLessonName: string, selectedTime: string, selectedDate: Date, className: string) => {
        try {
            const idClass = (await this.db.query(`SELECT id FROM "Classes" WHERE name=$1`, [className])).rows[0]?.id;

            const lesson = (await this.db.query(`SELECT * FROM "Lessons" WHERE lesson_date=$1 AND lesson_start_time=$2 AND id_class=$3`, [selectedDate, selectedTime, idClass] )).rows;
            
            if (lesson.length == 0){
                await this.db.query(`INSERT INTO "Lessons"("name", "lesson_date", "lesson_start_time", "id_class")
                VALUES ($1, $2, $3, $4)`, [newLessonName, selectedDate, selectedTime, idClass]);
            }

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

    getLessonsBetweenDates = async (dates: Array<string>, scheduleClassName: string) => {
        try {
            const idClass = (await this.db.query(`SELECT id FROM "Classes" WHERE name=$1`, [scheduleClassName])).rows[0]?.id;



            const lessons = (await this.db.query(`SELECT * FROM "Lessons"
                                                WHERE "lesson_date" BETWEEN $1 AND $2 AND "id_class" = $3`, [dates[0], dates[dates.length-1], idClass])).rows;

                
            return lessons;
            
        } catch (error) {
            console.log(`Ошибка получения уроков в БД: ${error}`);
            
        }
    }

    getLessonInformation = async (idLesson: number) => {
        try {
            const lesson = (await this.db.query(`SELECT * FROM "Lessons" WHERE id=$1`, [idLesson])).rows[0];

            const className = (await this.db.query(`SELECT name FROM "Classes" WHERE id=$1`, [lesson.id_class])).rows[0].name;

            let utcDate = new Date(lesson.lesson_date);
            const date = new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000).toISOString().split("T")[0];

            const time = String(lesson.lesson_start_time).slice(0, -3);
            
            const teacherNameRows = (await this.db.query(`SELECT full_name FROM "Users" WHERE id=$1`, [lesson.id_teacher])).rows;

            const lessonInformation = {
                id: lesson.id,
                name: lesson.name,
                lesson_date: date,
                lesson_start_time: time,
                className: className,
                teacher: teacherNameRows.length != 0 ? teacherNameRows[0].full_name : ""
            }

            return lessonInformation;
            
        } catch (error) {
            console.log(`Ошибка получения информации об уроке в БД: ${error}`);
            
        }
    }

    updateLesson = async (lessonInformation: {
        lessonId: number,
        name: string,
        time: string,
        className: string,
        teacher: string
    }) => {
        try {

            const classId = (await this.db.query(`SELECT id FROM "Classes" WHERE name=$1`, [lessonInformation.className])).rows[0].id;
            const lessonDate = (await this.db.query(`SELECT lesson_date FROM "Lessons" WHERE id=$1`, [lessonInformation.lessonId])).rows[0].lesson_date;

            let utcDate = new Date(lessonDate);
            const date = new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000).toISOString().split("T")[0];

            const idTeacher = (await this.db.query(`SELECT id FROM "Users" WHERE full_name=$1`, [lessonInformation.teacher])).rows[0].id;
            
            const lesson = (await this.db.query(`SELECT * FROM "Lessons" WHERE lesson_date=$1 AND lesson_start_time=$2`, [date, lessonInformation.time])).rows;

            if (lesson.length == 0 || (lesson.length == 1 && lesson[0].id == lessonInformation.lessonId)){
                await this.db.query(`UPDATE "Lessons" SET name=$1, lesson_start_time=$2, id_class=$3, id_teacher=$4 WHERE id=$5`, [lessonInformation.name, lessonInformation.time, classId, idTeacher, lessonInformation.lessonId]);
            }

            
            
        } catch (error) {
            console.log(`Ошибка обновления урока в БД: ${error}`);
            
        }
    }

    deleteLesson = async (idLesson: number) => {
        try {
            await this.db.query(`DELETE FROM "Lessons" WHERE id=$1`, [idLesson]);
        } catch (error) {
            console.log(`Ошибка удаления урока в БД: ${error}`);
            
        }
    }

    getClassUser = async (idUser: number) => {
        try {
            const idClass = (await this.db.query(`SELECT id_class FROM "Users" WHERE id=$1`, [idUser])).rows[0].id_class;
            const className = (await this.db.query(`SELECT name FROM "Classes" WHERE id=$1`, [idClass])).rows[0].name;

            return className;
        } catch (error) {
            console.log(`Ошибка получения класса ученика в БД: ${error}`);
            
        }
    }

    getUserClass = async (idUser: number) => {
        try {
            
            const idClass = (await this.db.query(`SELECT id_class FROM "Users" WHERE id=$1`, [idUser])).rows[0].id_class;

            const className = (await this.db.query(`SELECT name FROM "Classes" WHERE id=$1`, [idClass])).rows[0].name;
            
            return className;
            
        } catch (error) {
            console.log(`Ошибка получения класса профиля в БД: ${error}`);
            
        }
    } 

    getTeachers = async () => {
        try {
            const teacherId = (await this.db.query(`SELECT id FROM "Roles" WHERE name='Учитель'`)).rows[0].id;
            const resultWithUsersData = (await this.db.query(`SELECT "Users".id, full_name, "UsersData".login FROM "Users" LEFT JOIN "UsersData" ON "Users".id_usersdata = "UsersData".id WHERE "Users".id_role=$1`,[teacherId])).rows;

            return resultWithUsersData;
        } catch (error) {
            console.log(`Ошибка получения учителей в БД: ${error}`);
            
        }
    }

    addTeacher = async (surname: string, name: string, patronymic: string) => {
        try {
            const idRole = (await this.db.query(`SELECT id FROM "Roles" WHERE name='Учитель'`)).rows[0].id;

            const fullName = `${surname} ${name} ${patronymic}`;
            await this.db.query(`INSERT INTO "Users" ("full_name", "id_role") VALUES ($1, $2)`, [fullName, idRole]);
        } catch (error) {
            console.log(`Ошибка добавления учителя в БД: ${error}`);
            
        }
    }

    deleteTeacher = async (idTeacher: number) => {
        try {
            await this.db.query(`DELETE FROM "Users" WHERE id=$1`, [idTeacher]);
        } catch (error) {
            console.log(`Ошибка добавления учителя в БД: ${error}`);
            
        }
    }

    updateTeacher = async (idTeacher: number, fullName: string, login: string, password: string) => {
        try {
            
            const user = (await this.db.query(`SELECT * FROM "Users" WHERE id=$1`, [idTeacher])).rows[0];
            //Если нет id_usersdata
            if (!user.id_usersdata){

                //Если логин и пароль не вписали, значит обновляем только ФИО
                if ((login == "" || !login) && (password == "" || !password)){
                    await this.db.query(`UPDATE "Users" SET full_name=$1 WHERE id=$2`, [fullName, idTeacher]);
                }


                //Если логин и пароль вписали, то создаем UsersData и связаываем его с Users
                else if (login != "" && password != ""){
                    const hashedPassword = await bcrypt.hash(password, salt);
                    const idInseredUsersData =  (await this.db.query(`INSERT INTO "UsersData" ("login", "password") VALUES ($1, $2) RETURNING "id"`, [login, hashedPassword])).rows[0].id;

                    await this.db.query(`UPDATE "Users" SET id_usersdata=$1 WHERE id=$2`, [idInseredUsersData, idTeacher]);

                }
            }

            else {
                const hashedPassword = await bcrypt.hash(password, salt);
                await this.db.query(`UPDATE "UsersData" SET login=$1, password=$2 WHERE id=$3`, [login, hashedPassword, user.id_usersdata]);
                await this.db.query(`UPDATE "Users" SET full_name=$1 WHERE id=$2`, [fullName, idTeacher]);
            }
        } catch (error) {
            console.log(`Ошибка обновления учителя в БД: ${error}`);
            
        }
    }

    createRequest = async (nameRequest: string, textRequest: string, idUser: number) => {
        try {
            await this.db.query(`INSERT INTO "SupportRequests" ("id_user", "name_request", "text_request") VALUES ($1, $2, $3)`, [idUser, nameRequest, textRequest]);
        } catch (error) {
            console.log(`Ошибка создания заявки в ТП в БД: ${error}`);
            
        }
    }

    getTickets = async () => {
        try {
            const tickets = (await this.db.query(`SELECT "SupportRequests".id, name_request, text_request, "Users".full_name FROM "SupportRequests" JOIN "Users" ON "SupportRequests".id_user = "Users".id`)).rows;

            return tickets;
        } catch (error) {
            console.log(`Ошибка получения тикетов в БД: ${error}`);
            
        }
    }

    deleteTicket = async (idTicket: number) => {
        try {
            await this.db.query(`DELETE FROM "SupportRequests" WHERE id=$1`, [idTicket]);
        } catch (error) {
            console.log(`Ошибка удаления тикета в БД: ${error}`);
            
        }
    }
}

module.exports = new Database();

