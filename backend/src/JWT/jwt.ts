const jwt = require("jsonwebtoken");

interface IUserData{
    id: number,
    login: string,
    role: string
}

class JWTMethods{
    createAccessToken = ({
        id, 
        login,
        role
    } : IUserData) => {
        const accessSecret = process.env.JWT_ACCESS_SECRET;
        const accessToken = jwt.sign({id, login, role}, accessSecret, {
            expiresIn: "1m"
        });

        return accessToken;
    }

    createRefreshToken = ({
        id, 
        login, 
        role
    } : IUserData) => {
        const refreshSecret = process.env.JWT_REFRESH_SECRET;
        const refreshToken = jwt.sign({id, login, role}, refreshSecret, {
            expiresIn: "1d"
        });

        return refreshToken;
    }
}

module.exports = new JWTMethods();