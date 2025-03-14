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
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const cryptoJS = require("crypto-js");
require("dotenv").config();
const salt = 5;
class Database {
    constructor() {
        this.db = new Pool({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
        });
        //Функция аутентификации пользователя
        this.authUser = (login, password) => __awaiter(this, void 0, void 0, function* () {
            //Открываем соединение
            const client = yield this.db.connect();
            try {
                //Получаем пользователя по введенному логину из БД
                let query = `SELECT * FROM "UsersData" WHERE login=$1`;
                let values = [login];
                const userData = (yield this.db.query(query, values)).rows[0];
                //Если пользователь существует
                if (userData) {
                    const userPassword = userData.password;
                    const isMatch = yield bcrypt.compare(password, userPassword);
                    //Проверяем совпадение паролей
                    if (isMatch) {
                        query = `SELECT 
                        "Users".id, "Users".full_name, "UsersData".login, "Roles".name as role_name
                        FROM "Users"
                        JOIN "Roles" ON "Users".id_role = "Roles".id
                        JOIN "UsersData" ON "Users".id_usersdata = "UsersData".id
                        WHERE login=$1 `;
                        values = [login];
                        const user = (yield this.db.query(query, values)).rows[0];
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
                        };
                    }
                    else {
                        //Если пароли не совпали
                        client.release();
                        return {
                            isAuth: false,
                            message: "Неверный пароль.",
                            user: undefined
                        };
                    }
                }
                //Если пользователя не существует
                else {
                    client.release();
                    return {
                        isAuth: false,
                        message: "Пользователя с таким логином не существует."
                    };
                }
            }
            catch (error) {
                console.log(`Ошибка аутентификации пользователя в бд: ${error}`);
                client.release();
                return {
                    isAuth: false,
                    message: "Ошибка аутентификации."
                };
            }
        });
        this.getRefreshToken = (idUser) => __awaiter(this, void 0, void 0, function* () {
            try {
                const refreshTokenRow = (yield this.db.query(`SELECT * FROM "RefreshTokens" WHERE id_user=$1`, [idUser])).rows;
                if (refreshTokenRow.length != 0)
                    return refreshTokenRow[0].token;
                else
                    return null;
            }
            catch (error) {
                console.log(`Ошибка получения рефреш-токена в БД: ${error}`);
            }
        });
        this.saveRefreshToken = (idUser, refreshToken) => __awaiter(this, void 0, void 0, function* () {
            try {
                const refreshInDatabase = (yield this.db.query(`SELECT * FROM "RefreshTokens" WHERE id_user=$1`, [idUser])).rows;
                if (refreshInDatabase.length > 0) {
                    yield this.db.query(`UPDATE "RefreshTokens" SET token=$1 WHERE id_user=$2`, [refreshToken, idUser]);
                }
                else {
                    yield this.db.query(`INSERT INTO "RefreshTokens" ("token", "id_user") VALUES ($1, $2)`, [refreshToken, idUser]);
                }
            }
            catch (error) {
                console.log(`Ошибка сохранения Рефреш-токена: ${error}`);
            }
        });
        this.getClasses = () => __awaiter(this, void 0, void 0, function* () {
            try {
                const classes = (yield this.db.query(`SELECT * FROM "Classes"`)).rows;
                return classes;
            }
            catch (error) {
                console.log(`Ошибка получения классов в БД: ${error}`);
            }
        });
        this.getStudentsInSelectedClass = (selectedClassid) => __awaiter(this, void 0, void 0, function* () {
            try {
                const users = (yield this.db.query(`
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
            }
            catch (error) {
                console.log(`Ошибка получения учеников выбранного класса в БД: ${error}`);
            }
        });
        this.addNewClass = (nameNewClass) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.db.query(`INSERT INTO "Classes"("name") VALUES ($1)`, [nameNewClass]);
            }
            catch (error) {
                console.log(`Ошибка добавления нового класса в БД: ${error}`);
            }
        });
        this.deleteClass = (selectedClassId) => __awaiter(this, void 0, void 0, function* () {
            try {
                const idStudentRole = ((yield this.db.query(`SELECT id FROM "Roles" WHERE name=$1`, ['Ученик'])).rows[0]).id;
                yield this.db.query(`DELETE FROM "Classes" WHERE id=$1`, [selectedClassId]);
                const usersDataRows = (yield this.db.query(`SELECT id_usersdata 
                                                    FROM "Users" 
                                                    WHERE id_class = $1 AND id_role=$2`, [selectedClassId, idStudentRole])).rows;
                const usersDataId = usersDataRows.filter((ud) => ud.id_usersdata != null);
                yield this.db.query(`DELETE FROM "Users" WHERE id_class=$1 AND id_role=$2`, [selectedClassId, idStudentRole]);
                for (let i = 0; i < usersDataId.length; i++) {
                    yield this.db.query(`DELETE FROM "UsersData" WHERE id=$1`, [usersDataId[i].id_usersdata]);
                }
            }
            catch (error) {
                console.log(`Ошибка удаления класса в БД: ${error}`);
            }
        });
        this.addStudentInClass = (fullName, selectedClassId) => __awaiter(this, void 0, void 0, function* () {
            try {
                const studentRoleid = (yield this.db.query(`SELECT id FROM "Roles" WHERE name='Ученик'`)).rows[0].id;
                yield this.db.query(`INSERT INTO "Users"("full_name", "id_role", "id_class") VALUES ($1, $2, $3)`, [fullName, studentRoleid, selectedClassId]);
                console.log(`Фио: ${fullName}`);
            }
            catch (error) {
                console.log(`Ошибка добавления ученика в БД: ${error}`);
            }
        });
        this.deleteStudent = (selectedStudentId) => __awaiter(this, void 0, void 0, function* () {
            try {
                const usersDataIdRow = (yield this.db.query(`SELECT id_usersdata FROM "Users" WHERE id=$1`, [selectedStudentId])).rows[0];
                if (!usersDataIdRow.id_usersData) {
                    yield this.db.query(`DELETE FROM "Users" WHERE id=$1`, [selectedStudentId]);
                }
                else {
                    yield this.db.query(`DELETE FROM "Users" WHERE id=$1`, [selectedStudentId]);
                    yield this.db.query(`DELETE FROM "UsersData" WHERE id=$1`, [usersDataIdRow.id_usersData]);
                }
            }
            catch (error) {
                console.log(`Ошибка удаления ученика в БД: ${error}`);
            }
        });
        this.updateStudent = (updatedStudent) => __awaiter(this, void 0, void 0, function* () {
            try {
                let foundClassId = null;
                if (updatedStudent.className || updatedStudent.className != "") {
                    foundClassId = (yield this.db.query(`SELECT id FROM "Classes" WHERE name=$1`, [updatedStudent.className])).rows[0];
                    if (!foundClassId) {
                        return [false, "Для сохранения, введите корректный класс или оставьте поле пустым"];
                    }
                }
                foundClassId = foundClassId.id;
                const isEnteredPasswordForLogin = updatedStudent.login && (!updatedStudent.password || updatedStudent.password == ""); //Если введен логин, но не введен пароль
                const isEnteredLoginForPassword = updatedStudent.password && (!updatedStudent.login || updatedStudent.login == ""); //Если введен пароль, но не введен логин
                if (isEnteredLoginForPassword || isEnteredPasswordForLogin) {
                    return [false, "Для сохранения, введите недостающий логин или пароль"];
                }
                //Если в логине нет @ и .
                if (updatedStudent.login && (!updatedStudent.login.includes("@") || !updatedStudent.login.includes("."))) {
                    return [false, "Неверный формат почты, которая введена в качестве логина."];
                }
                if (updatedStudent.password && updatedStudent.password.length < 8) {
                    return [false, "Длина пароля должна быть не меньше 8 символов."];
                }
                const studentRoleid = (yield this.db.query(`SELECT id FROM "Roles" WHERE name='Ученик'`)).rows[0].id;
                const fullName = `${updatedStudent.surname} ${updatedStudent.name} ${updatedStudent.patronymic}`;
                yield this.db.query(`Update "Users"
                                SET full_name=$1,
                                id_role=$2,
                                id_class=$3
                                WHERE id=$4
                                `, [fullName, studentRoleid, foundClassId, updatedStudent.id]);
                const hashedPassword = yield bcrypt.hash(updatedStudent.password, salt);
                console.log(`Айди updated user: ${updatedStudent.id}`);
                const idUsersData = ((yield this.db.query(`SELECT id_usersdata from "Users" WHERE id=$1`, [updatedStudent.id])).rows[0]).id_usersdata;
                if (updatedStudent.login && updatedStudent.password) {
                    if (idUsersData) {
                        const oldLogin = ((yield this.db.query(`SELECT login FROM "UsersData" WHERE id=$1`, [idUsersData])).rows[0]).login;
                        yield this.db.query(`UPDATE "UsersData" SET login=$1, password=$2 WHERE login=$3`, [updatedStudent.login, hashedPassword, oldLogin]);
                    }
                    else {
                        yield this.db.query(`INSERT INTO "UsersData" ("login", "password") VALUES ($1, $2)`, [updatedStudent.login, hashedPassword]);
                        const idUserData = ((yield this.db.query(`SELECT id FROM "UsersData" WHERE login=$1`, [updatedStudent.login])).rows[0]).id;
                        yield this.db.query(`UPDATE "Users" SET id_usersdata=$1 WHERE id=$2`, [idUserData, updatedStudent.id]);
                    }
                }
                return [true, "Успешно"];
            }
            catch (error) {
                console.log(`Ошибка обновления ученика в Бд ${error}`);
            }
        });
        this.updateClassName = (updatedClassName, selectedClassId) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.db.query(`UPDATE "Classes" SET name=$1 WHERE id=$2`, [updatedClassName, selectedClassId]);
            }
            catch (error) {
                console.log(`Ошибка обновления названия класса в БД: ${error}`);
            }
        });
        this.addNewLesson = (newLessonName, selectedTime, selectedDate, className) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const idClass = (_a = (yield this.db.query(`SELECT id FROM "Classes" WHERE name=$1`, [className])).rows[0]) === null || _a === void 0 ? void 0 : _a.id;
                const lesson = (yield this.db.query(`SELECT * FROM "Lessons" WHERE lesson_date=$1 AND lesson_start_time=$2 AND id_class=$3`, [selectedDate, selectedTime, idClass])).rows;
                if (lesson.length == 0) {
                    yield this.db.query(`INSERT INTO "Lessons"("name", "lesson_date", "lesson_start_time", "id_class")
                VALUES ($1, $2, $3, $4)`, [newLessonName, selectedDate, selectedTime, idClass]);
                }
            }
            catch (error) {
                console.log(`Ошибка добавления урока в БД: ${error}`);
            }
        });
        this.checkAvailabilityClass = (className) => __awaiter(this, void 0, void 0, function* () {
            try {
                const classesRows = (yield this.db.query(`SELECT * FROM "Classes" WHERE name=$1`, [className])).rows;
                if (classesRows.length == 0)
                    return false;
                return true;
            }
            catch (error) {
                console.log(`Ошибка проверки наличия класса в бд: ${error}`);
            }
        });
        this.getLessonsBetweenDates = (dates, scheduleClassName) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const idClass = (_a = (yield this.db.query(`SELECT id FROM "Classes" WHERE name=$1`, [scheduleClassName])).rows[0]) === null || _a === void 0 ? void 0 : _a.id;
                const lessons = (yield this.db.query(`SELECT * FROM "Lessons"
                                                WHERE "lesson_date" BETWEEN $1 AND $2 AND "id_class" = $3`, [dates[0], dates[dates.length - 1], idClass])).rows;
                return lessons;
            }
            catch (error) {
                console.log(`Ошибка получения уроков в БД: ${error}`);
            }
        });
        this.getLessonInformation = (idLesson) => __awaiter(this, void 0, void 0, function* () {
            try {
                const lesson = (yield this.db.query(`SELECT * FROM "Lessons" WHERE id=$1`, [idLesson])).rows[0];
                const className = (yield this.db.query(`SELECT name FROM "Classes" WHERE id=$1`, [lesson.id_class])).rows[0].name;
                let utcDate = new Date(lesson.lesson_date);
                const date = new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000).toISOString().split("T")[0];
                const time = String(lesson.lesson_start_time).slice(0, -3);
                const teacherNameRows = (yield this.db.query(`SELECT full_name FROM "Users" WHERE id=$1`, [lesson.id_teacher])).rows;
                const lessonInformation = {
                    id: lesson.id,
                    name: lesson.name,
                    lesson_date: date,
                    lesson_start_time: time,
                    className: className,
                    teacher: teacherNameRows.length != 0 ? teacherNameRows[0].full_name : ""
                };
                return lessonInformation;
            }
            catch (error) {
                console.log(`Ошибка получения информации об уроке в БД: ${error}`);
            }
        });
        this.updateLesson = (lessonInformation) => __awaiter(this, void 0, void 0, function* () {
            try {
                const classId = (yield this.db.query(`SELECT id FROM "Classes" WHERE name=$1`, [lessonInformation.className])).rows[0].id;
                const lessonDate = (yield this.db.query(`SELECT lesson_date FROM "Lessons" WHERE id=$1`, [lessonInformation.lessonId])).rows[0].lesson_date;
                let utcDate = new Date(lessonDate);
                const date = new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000).toISOString().split("T")[0];
                const idTeacher = (yield this.db.query(`SELECT id FROM "Users" WHERE full_name=$1`, [lessonInformation.teacher])).rows[0].id;
                const lesson = (yield this.db.query(`SELECT * FROM "Lessons" WHERE lesson_date=$1 AND lesson_start_time=$2`, [date, lessonInformation.time])).rows;
                if (lesson.length == 0 || (lesson.length == 1 && lesson[0].id == lessonInformation.lessonId)) {
                    yield this.db.query(`UPDATE "Lessons" SET name=$1, lesson_start_time=$2, id_class=$3, id_teacher=$4 WHERE id=$5`, [lessonInformation.name, lessonInformation.time, classId, idTeacher, lessonInformation.lessonId]);
                }
            }
            catch (error) {
                console.log(`Ошибка обновления урока в БД: ${error}`);
            }
        });
        this.deleteLesson = (idLesson) => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(3);
                yield this.db.query(`DELETE FROM "Lessons" WHERE id=$1`, [idLesson]);
                console.log(4);
            }
            catch (error) {
                console.log(`Ошибка удаления урока в БД: ${error}`);
            }
        });
        this.getClassUser = (idUser) => __awaiter(this, void 0, void 0, function* () {
            try {
                const idClass = (yield this.db.query(`SELECT id_class FROM "Users" WHERE id=$1`, [idUser])).rows[0].id_class;
                const className = (yield this.db.query(`SELECT name FROM "Classes" WHERE id=$1`, [idClass])).rows[0].name;
                return className;
            }
            catch (error) {
                console.log(`Ошибка получения класса ученика в БД: ${error}`);
            }
        });
        this.getUserClass = (idUser) => __awaiter(this, void 0, void 0, function* () {
            try {
                const idClass = (yield this.db.query(`SELECT id_class FROM "Users" WHERE id=$1`, [idUser])).rows[0].id_class;
                const className = (yield this.db.query(`SELECT name FROM "Classes" WHERE id=$1`, [idClass])).rows[0].name;
                return className;
            }
            catch (error) {
                console.log(`Ошибка получения класса профиля в БД: ${error}`);
            }
        });
        this.getTeachers = () => __awaiter(this, void 0, void 0, function* () {
            try {
                const teacherId = (yield this.db.query(`SELECT id FROM "Roles" WHERE name='Учитель'`)).rows[0].id;
                const resultWithUsersData = (yield this.db.query(`SELECT "Users".id, full_name, "UsersData".login FROM "Users" LEFT JOIN "UsersData" ON "Users".id_usersdata = "UsersData".id WHERE "Users".id_role=$1`, [teacherId])).rows;
                console.log(resultWithUsersData);
                return resultWithUsersData;
            }
            catch (error) {
                console.log(`Ошибка получения учителей в БД: ${error}`);
            }
        });
        this.addTeacher = (surname, name, patronymic) => __awaiter(this, void 0, void 0, function* () {
            try {
                const idRole = (yield this.db.query(`SELECT id FROM "Roles" WHERE name='Учитель'`)).rows[0].id;
                const fullName = `${surname} ${name} ${patronymic}`;
                yield this.db.query(`INSERT INTO "Users" ("full_name", "id_role") VALUES ($1, $2)`, [fullName, idRole]);
            }
            catch (error) {
                console.log(`Ошибка добавления учителя в БД: ${error}`);
            }
        });
        this.deleteTeacher = (idTeacher) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.db.query(`DELETE FROM "Users" WHERE id=$1`, [idTeacher]);
            }
            catch (error) {
                console.log(`Ошибка добавления учителя в БД: ${error}`);
            }
        });
        this.updateTeacher = (idTeacher, fullName, login, password) => __awaiter(this, void 0, void 0, function* () {
            try {
                const user = (yield this.db.query(`SELECT * FROM "Users" WHERE id=$1`, [idTeacher])).rows[0];
                //Если нет id_usersdata
                if (!user.id_usersdata) {
                    console.log(1);
                    //Если логин и пароль не вписали, значит обновляем только ФИО
                    if ((login == "" || !login) && (password == "" || !password)) {
                        console.log(2);
                        yield this.db.query(`UPDATE "Users" SET full_name=$1 WHERE id=$2`, [fullName, idTeacher]);
                        console.log(3);
                    }
                    //Если логин и пароль вписали, то создаем UsersData и связаываем его с Users
                    else if (login != "" && password != "") {
                        console.log(4);
                        const hashedPassword = yield bcrypt.hash(password, salt);
                        console.log(5);
                        const idInseredUsersData = (yield this.db.query(`INSERT INTO "UsersData" ("login", "password") VALUES ($1, $2) RETURNING "id"`, [login, hashedPassword])).rows[0].id;
                        console.log(6);
                        yield this.db.query(`UPDATE "Users" SET id_usersdata=$1 WHERE id=$2`, [idInseredUsersData, idTeacher]);
                        console.log(7);
                    }
                }
                else {
                    const hashedPassword = yield bcrypt.hash(password, salt);
                    yield this.db.query(`UPDATE "UsersData" SET login=$1, password=$2 WHERE id=$3`, [login, hashedPassword, user.id_usersdata]);
                    yield this.db.query(`UPDATE "Users" SET full_name=$1 WHERE id=$2`, [fullName, idTeacher]);
                }
            }
            catch (error) {
                console.log(`Ошибка обновления учителя в БД: ${error}`);
            }
        });
        this.createRequest = (nameRequest, textRequest, idUser) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.db.query(`INSERT INTO "SupportRequests" ("id_user", "name_request", "text_request") VALUES ($1, $2, $3)`, [idUser, nameRequest, textRequest]);
            }
            catch (error) {
                console.log(`Ошибка создания заявки в ТП в БД: ${error}`);
            }
        });
        this.getTickets = () => __awaiter(this, void 0, void 0, function* () {
            try {
                const tickets = (yield this.db.query(`SELECT "SupportRequests".id, name_request, text_request, "Users".full_name FROM "SupportRequests" JOIN "Users" ON "SupportRequests".id_user = "Users".id`)).rows;
                return tickets;
            }
            catch (error) {
                console.log(`Ошибка получения тикетов в БД: ${error}`);
            }
        });
        this.deleteTicket = (idTicket) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.db.query(`DELETE FROM "SupportRequests" WHERE id=$1`, [idTicket]);
            }
            catch (error) {
                console.log(`Ошибка удаления тикета в БД: ${error}`);
            }
        });
    }
}
module.exports = new Database();
