import { Response, Request, NextFunction } from "express";
import jwt, { VerifyErrors, JwtPayload } from "jsonwebtoken";

const checkTokens = (req: Request, res: Response, next: NextFunction) => {
    const authorization: string | undefined = req.headers.authorization;
        let accessToken = authorization?.split(" ")[1];
        const accessTokenSecret = process.env.JWT_ACCESS_SECRET as string;
    
    
        if (!accessToken) return res.sendStatus(401)
        else {
            jwt.verify(accessToken, accessTokenSecret, async (err: VerifyErrors | null, decoded_access: any) => {
                if (err) return res.sendStatus(401);

                next();
            });
        }
};

module.exports = checkTokens;
