import { Response, Request, NextFunction } from "express";
import jwt, { VerifyErrors, JwtPayload } from "jsonwebtoken";

const checkTokens = (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.body.accessToken;
    const refreshToken = req.body.refreshToken;
    const accessTokenSecret = process.env.JWT_ACCESS_SECRET as string;
    const refreshTokenSecret = process.env.JWT_REFRESH_SECRET as string;

    jwt.verify(accessToken, accessTokenSecret, (err: VerifyErrors | null, decoded_access: JwtPayload | string | undefined) => {
        
        if (err) {
            console.log("Access не валидный");
            jwt.verify(refreshToken, refreshTokenSecret, (err: VerifyErrors | null, decoded_refresh: JwtPayload | string | undefined) => {
                if (err){
                    req.checkTokensResponse = {
                        accessToken: undefined,
                        refreshToken: undefined,
                        isAuth: false,
                        user: undefined
                    }
                    next();
                }
    
                else{
                    req.checkTokensResponse = {
                        accessToken: undefined,
                        refreshToken: refreshToken,
                        isAuth: true,
                        user: decoded_refresh
                    }
                    next();
                }
            })
        }

        else{
            req.checkTokensResponse = {
                accessToken: accessToken,
                refreshToken: refreshToken,
                isAuth: true,
                user: decoded_access
            }
            next();
        }

        
    });
};

module.exports = checkTokens;
