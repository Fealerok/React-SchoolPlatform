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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require("dotenv").config();
const db = require('../database/database');
const router = express_1.default.Router();
const JWTMethods = require("../JWT/jwt");
const checkTokens = require("../middleware/auth/checkTokens");
router.use(express_1.default.json());
router.post("/update-access", (req, res) => {
    const { refreshToken } = req.body;
    const refreshTokenSecret = process.env.JWT_REFRESH_SECRET;
    if (!refreshToken)
        return res.sendStatus(403);
    jsonwebtoken_1.default.verify(refreshToken, refreshTokenSecret, (err, decoded_refresh) => __awaiter(void 0, void 0, void 0, function* () {
        if (err)
            return res.sendStatus(403);
        const refreshTokenInDB = yield db.getRefreshToken(decoded_refresh.id);
        if (!refreshTokenInDB || refreshTokenInDB != refreshToken) {
            return res.sendStatus(403);
        }
        const newAccessToken = JWTMethods.createAccessToken(decoded_refresh);
        return res.status(200).json({ newAccessToken });
    }));
});
router.post("/auth", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const login = req.body.login;
    const password = req.body.password;
    let dbResponse = yield db.authUser(login, password);
    if (dbResponse.isAuth) {
        console.log(dbResponse.user);
        const accessToken = JWTMethods.createAccessToken(dbResponse.user);
        const refreshToken = JWTMethods.createRefreshToken(dbResponse.user);
        yield db.saveRefreshToken(dbResponse.user.id, refreshToken);
        return res.status(200).json({
            user: dbResponse.user,
            accessToken,
            refreshToken
        });
    }
    else {
        return res.status(401).json({ errorMessage: dbResponse.message });
    }
}));
router.post("/check-auth", (req, res) => {
    const authorization = req.headers.authorization;
    let accessToken = authorization === null || authorization === void 0 ? void 0 : authorization.split(" ")[1];
    const accessTokenSecret = process.env.JWT_ACCESS_SECRET;
    if (!accessToken)
        return res.sendStatus(401);
    else {
        jsonwebtoken_1.default.verify(accessToken, accessTokenSecret, (err, decoded_access) => __awaiter(void 0, void 0, void 0, function* () {
            if (err)
                return res.sendStatus(401);
            console.log(decoded_access);
            return res.status(200).json({
                isAuth: true,
                user: decoded_access
            });
        }));
    }
});
router.post("/get-classes", checkTokens, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const classes = yield db.getClasses();
        return res.status(200).json({ classes: classes });
    }
    catch (error) {
        console.log(`Ошибка получения классов: ${error}`);
    }
}));
router.post("/get-students-in-class", checkTokens, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const selectedClassId = req.body.selectedClassId;
        const students = yield db.getStudentsInSelectedClass(selectedClassId);
        return res.status(200).json(students);
    }
    catch (error) {
        console.log(`Ошибка получения учеников: ${error}`);
    }
}));
router.post("/add-new-class", checkTokens, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const nameNewClass = req.body.name;
        console.log(nameNewClass);
        yield db.addNewClass(nameNewClass);
        return res.status(200).json({ message: "Успешно" });
    }
    catch (error) {
        return res.status(500).json({ message: "Ошибка 500" });
    }
}));
router.delete("/delete-class", checkTokens, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const idSelectedClass = req.body.selectedClassId;
        yield db.deleteClass(idSelectedClass);
        return res.status(200).json({ message: "Успешно!" });
    }
    catch (error) {
        return res.status(500).json({ message: "Ошибка 500" });
    }
}));
router.post("/add-student-in-class", checkTokens, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let fullName = "";
        if (req.body.patronymic)
            fullName = `${req.body.surname} ${req.body.name} ${req.body.patronymic}`;
        else
            fullName = `${req.body.surname} ${req.body.name}`;
        const { selectedClassId } = req.body;
        yield db.addStudentInClass(fullName, selectedClassId);
        return res.status(200).json({ message: "Успешно" });
    }
    catch (error) {
        return res.status(500).json({ message: "Ошибка 500" });
    }
}));
router.delete("/delete-student", checkTokens, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { selectedStudentId } = req.body;
        yield db.deleteStudent(selectedStudentId);
        return res.status(200).json({ message: "Успешно" });
    }
    catch (error) {
        return res.status(500).json({ message: "Ошибка 500" });
    }
}));
router.post("/update-student", checkTokens, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { updatedStudent } = req.body;
        const dbResponse = yield db.updateStudent(updatedStudent);
        if (!dbResponse[0]) {
            return res.status(501).json({ message: dbResponse[1] });
        }
        return res.status(200).json({ message: "Успешно" });
    }
    catch (error) {
        return res.status(500).json({ message: "Ошибка 500" });
    }
}));
router.post("/update-classname", checkTokens, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { updatedClassName } = req.body;
        const { selectedClassId } = req.body;
        yield db.updateClassName(updatedClassName, selectedClassId);
        return res.status(200).json({ message: "Успешно" });
    }
    catch (error) {
        return res.status(500).json({ message: "Ошибка 500" });
    }
}));
router.post("/add-new-lesson", checkTokens, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { newLessonName, selectedTime, className } = req.body;
        const utcDate = new Date(req.body.selectedDate); // Преобразуем строку в объект Date
        const localDate = new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000);
        yield db.addNewLesson(newLessonName, selectedTime, localDate, className);
        return res.status(200).json({ message: "Успешно" });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Ошибка 500" });
    }
}));
router.post("/check-availability-class", checkTokens, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { className } = req.body;
        console.log(className);
        const result = yield db.checkAvailabilityClass(className);
        if (result)
            return res.status(200).json({ message: "Успешно" });
        return res.status(501).json({ message: "Неуспешно" });
    }
    catch (error) {
        return res.status(500).json({ message: "Ошибка 500" });
    }
}));
router.post("/get-lessons", checkTokens, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { dates, scheduleClassName } = req.body;
        for (let i = 0; i < dates.length; i++) {
            let utcDate = new Date(dates[i]);
            dates[i] = new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000).toISOString().split("T")[0];
        }
        const lessons = yield db.getLessonsBetweenDates(dates, scheduleClassName);
        return res.status(200).json({ lessons });
    }
    catch (error) {
        console.log(`Ошибка получения уроков: ${error}`);
        return res.sendStatus(500);
    }
}));
router.post("/get-lesson-information", checkTokens, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { idLesson } = req.body;
        const lessonInformation = yield db.getLessonInformation(idLesson);
        return res.status(200).json({ lessonInformation });
    }
    catch (error) {
        console.log(`Ошибка получения информации о уроке на сервере: ${error}`);
        return res.sendStatus(500);
    }
}));
router.post("/update-lesson", checkTokens, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { lessonInformation } = req.body;
        console.log(lessonInformation);
        yield db.updateLesson(lessonInformation);
        return res.sendStatus(200);
    }
    catch (error) {
        console.log(`Ошибка обновления данных урока на сервере: ${error}`);
        return res.sendStatus(500);
    }
}));
router.delete("/delete-lesson", checkTokens, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { idLesson } = req.body;
        yield db.deleteLesson(idLesson);
        console.log(2);
        return res.status(200).json({ message: "Успешно" });
    }
    catch (error) {
        console.log(`Ошибка удаления урока на сервере: ${error}`);
        return res.status(500).json({ message: "Успешно" });
        ;
    }
}));
router.post("/get-class-user", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { idUser } = req.body;
        const userClass = yield db.getClassUser(idUser);
        return res.status(200).json({ className: userClass });
    }
    catch (error) {
        console.log(`Ошибка получения класса ученика на сервере: ${error}`);
        return res.sendStatus(500);
    }
}));
router.post("/get-user-class", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { idUser } = req.body;
        const userClass = yield db.getUserClass(idUser);
        return res.status(200).json({ userClass });
    }
    catch (error) {
        console.log(`Ошибка получения информации профиля на сервере: ${error}`);
        return res.sendStatus(500);
    }
}));
router.post("/get-teachers", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const teachers = yield db.getTeachers();
        return res.status(200).json({ teachers });
    }
    catch (error) {
        console.log(`Ошибка получения учителей на сервере: ${error}`);
        return res.sendStatus(500);
    }
}));
router.post("/add-new-teacher", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { surname, name, patronymic } = req.body;
        yield db.addTeacher(surname, name, patronymic);
        return res.status(200).json({ message: "Успешно" });
    }
    catch (error) {
        console.log(`Ошибка добавления учителя на сервере: ${error}`);
        return res.sendStatus(500);
    }
}));
router.delete("/delete-teacher", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { idTeacher } = req.body;
        yield db.deleteTeacher(idTeacher);
        return res.status(200).json({ message: "Успешно" });
    }
    catch (error) {
        console.log(`Ошибка добавления учителя на сервере: ${error}`);
        return res.sendStatus(500);
    }
}));
router.post("/update-teacher", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { idTeacher, fullName, login, password } = req.body;
        console.log(req.body);
        yield db.updateTeacher(idTeacher, fullName, login, password);
        return res.status(200).json({ message: "Успешно" });
    }
    catch (error) {
        console.log(`Ошибка добавления учителя на сервере: ${error}`);
        return res.sendStatus(500);
    }
}));
router.post("/send-request", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { nameRequest, textRequest, idUser } = req.body;
        yield db.createRequest(nameRequest, textRequest, idUser);
        return res.status(200).json({ message: "" });
    }
    catch (error) {
        console.log(`Ошибка отправки обращения в ТП на сервере: ${error}`);
        return res.sendStatus(500);
    }
}));
router.post("/get-tickets", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tickets = yield db.getTickets();
        console.log(tickets);
        return res.status(200).json({ tickets });
    }
    catch (error) {
        console.log(`Ошибка получения тикетов на сервере: ${error}`);
        return res.sendStatus(500);
    }
}));
router.post("/delete-ticket", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { idTicket } = req.body;
        console.log(idTicket);
        yield db.deleteTicket(idTicket);
        return res.status(200).json({ message: "Успешно" });
    }
    catch (error) {
        console.log(`Ошибка удаления тикета на сервере: ${error}`);
        return res.sendStatus(500);
    }
}));
module.exports = router;
