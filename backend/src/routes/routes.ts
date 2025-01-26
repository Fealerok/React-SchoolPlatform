import express, { Request, Response } from "express";

const db = require('../database/database');
const router = express.Router();
const JWTMethods = require("../JWT/jwt");

router.use(express.json());

router.post("/auth", async (req: Request, res: Response): Promise<any>  => {
    const login = req.body.login;
    const password = req.body.password;

    let dbResponse = await db.authUser(login, password);

    if (dbResponse.isAuth){
        
        const accessToken = JWTMethods.createAccessToken(dbResponse.user);
        const refreshToken = JWTMethods.createRefreshToken(dbResponse.user);

        return res.status(200).json({
            user: dbResponse.user,
            accessToken,
            refreshToken
        });
    }
    else{
        return res.status(401).json({errorMessage: dbResponse.message});
    }

        
        
});

module.exports = router;
