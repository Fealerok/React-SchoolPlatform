import express, { Request, Response } from "express";
import { JwtPayload, VerifyErrors } from "jsonwebtoken";
import jwt from "jsonwebtoken";

require("dotenv").config();

const db = require('../database/database');
const router = express.Router();
const JWTMethods = require("../JWT/jwt");
const checkTokens = require("../middleware/auth/checkTokens");

router.use(express.json());

// Расширяем тип Request, чтобы добавить свойство checkTokensResponse
declare module 'express' {
    interface Request {
        checkTokensResponse?: {
            accessToken: string | undefined,
            refreshToken: string | undefined
            isAuth: boolean;
            user: JwtPayload | string | undefined;
        };
    }
}

router.post("/update-access", (req: Request, res: Response): any => {
    const { refreshToken } = req.body;
    const refreshTokenSecret = process.env.JWT_REFRESH_SECRET as string;

    if (!refreshToken) return res.sendStatus(403);

    jwt.verify(refreshToken, refreshTokenSecret, async (err: VerifyErrors | null, decoded_refresh: any) => {
        if (err) return res.sendStatus(403);

        const refreshTokenInDB = await db.getRefreshToken(decoded_refresh.id);

        if (!refreshTokenInDB || refreshTokenInDB != refreshToken) {
            return res.sendStatus(403);
        }

        const newAccessToken = JWTMethods.createAccessToken(decoded_refresh);

        return res.status(200).json({ newAccessToken });
    });
});

router.post("/auth", async (req: Request, res: Response): Promise<any> => {
    const login = req.body.login;
    const password = req.body.password;

    let dbResponse = await db.authUser(login, password);

    if (dbResponse.isAuth) {
        console.log(dbResponse.user);
        const accessToken = JWTMethods.createAccessToken(dbResponse.user);
        const refreshToken = JWTMethods.createRefreshToken(dbResponse.user);


        await db.saveRefreshToken(dbResponse.user.id, refreshToken);
        return res.status(200).json({
            user: dbResponse.user,
            accessToken,
            refreshToken
        });
    }
    else {
        return res.status(401).json({ errorMessage: dbResponse.message });
    }

});

router.post("/check-auth", (req: Request, res: Response): any => {

    const authorization: string | undefined = req.headers.authorization;
    let accessToken = authorization?.split(" ")[1];
    const accessTokenSecret = process.env.JWT_ACCESS_SECRET as string;


    if (!accessToken) return res.sendStatus(401)
    else {
        jwt.verify(accessToken, accessTokenSecret, async (err: VerifyErrors | null, decoded_access: any) => {
            if (err) return res.sendStatus(401);

            console.log(decoded_access);
            return res.status(200).json({
                isAuth: true,
                user: decoded_access
            });
        });
    }

    console.log(1234);

});

router.post("/get-classes", async (req: Request, res: Response): Promise<any> => {
    try {
        const { authorization } = req.headers;
        const accessToken = authorization?.split(" ")[1] as string;

        if (accessToken == "null" || !accessToken) {
            return res.status(401).json({ message: "Требуется авторизация" });
        }

        else {
            const accessTokenSecret = process.env.JWT_ACCESS_SECRET as string;
            jwt.verify(accessToken, accessTokenSecret, async (err) => {

                if (err) {

                    return res.status(403).json({ message: "Доступ запрещен" });
                }

                else {
                    const classes = await db.getClasses();

                    return res.status(200).json({ classes: classes });
                }
            });
        }
    } catch (error) {
        console.log(`Ошибка получения классов: ${error}`);
    }


});

router.post("/get-students-in-class", async (req: Request, res: Response): Promise<any> => {
    try {
        const selectedClassId = req.body.selectedClassId;

        const students = await db.getStudentsInSelectedClass(selectedClassId);

        return res.status(200).json(students);
    } catch (error) {
        console.log(`Ошибка получения учеников: ${error}`);
    }

});

router.post("/add-new-class", async (req: Request, res: Response): Promise<any> => {
    try {
        const nameNewClass = req.body.name;

        await db.addNewClass(nameNewClass);

        return res.status(200).json({ message: "Успешно" });
    } catch (error) {
        return res.status(500).json({ message: "Ошибка 500" });
    }

});

router.delete("/delete-class", async (req: Request, res: Response): Promise<any> => {
    try {
        const idSelectedClass = req.body.selectedClassId;

        await db.deleteClass(idSelectedClass);

        return res.status(200).json({ message: "Успешно!" });
    } catch (error) {
        return res.status(500).json({ message: "Ошибка 500" });
    }
});

router.post("/add-student-in-class", async (req: Request, res: Response): Promise<any> => {
    try {
        let fullName = "";
        if (req.body.patronymic) fullName = `${req.body.surname} ${req.body.name} ${req.body.patronymic}`;
        else fullName = `${req.body.surname} ${req.body.name}`;

        const { selectedClassId } = req.body;

        await db.addStudentInClass(fullName, selectedClassId);

        return res.status(200).json({ message: "Успешно" });
    } catch (error) {
        return res.status(500).json({ message: "Ошибка 500" });
    }
});

router.delete("/delete-student", async (req: Request, res: Response): Promise<any> => {
    try {
        const { selectedStudentId } = req.body;

        await db.deleteStudent(selectedStudentId);

        return res.status(200).json({ message: "Успешно" });
    } catch (error) {
        return res.status(500).json({ message: "Ошибка 500" });
    }
});

router.post("/update-student", async (req: Request, res: Response): Promise<any> => {
    try {
        const { updatedStudent } = req.body;

        const dbResponse = await db.updateStudent(updatedStudent);


        if (!dbResponse[0]) {
            return res.status(501).json({ message: dbResponse[1] });
        }

        return res.status(200).json({ message: "Успешно" });
    } catch (error) {
        return res.status(500).json({ message: "Ошибка 500" });
    }
});

router.post("/update-classname", async (req: Request, res: Response): Promise<any> => {
    try {
        const { updatedClassName } = req.body;
        const { selectedClassId } = req.body;

        await db.updateClassName(updatedClassName, selectedClassId);
        return res.status(200).json({ message: "Успешно" });
    } catch (error) {
        return res.status(500).json({ message: "Ошибка 500" });
    }
});

router.post("/add-new-lesson", async (req: Request, res: Response): Promise<any> => {
    try {
        const { newLessonName } = req.body;
        const { selectedTime } = req.body;
        const { selectedDate } = req.body;
        const { idUser } = req.body;

        await db.addNewLesson(newLessonName, selectedTime, selectedDate, idUser);
    } catch (error) {
        return res.status(500).json({ message: "Ошибка 500" });
    }
});

router.post("/check-availability-class", async (req: Request, res: Response): Promise<any> => {
    try {
        const { className } = req.body;

        const result = await db.checkAvailabilityClass(className);

        return res.status(result ? 200 : 500).json({ message: "Успешно" });
    } catch (error) {
        return res.status(500).json({ message: "Ошибка 500" });
    }
});

module.exports = router;
