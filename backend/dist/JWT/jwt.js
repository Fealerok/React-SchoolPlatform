"use strict";
const jwt = require("jsonwebtoken");
class JWTMethods {
    constructor() {
        this.createAccessToken = ({ id, login, role, fullName }) => {
            const accessSecret = process.env.JWT_ACCESS_SECRET;
            const accessToken = jwt.sign({ id, login, role, fullName }, accessSecret, {
                expiresIn: "1m"
            });
            return accessToken;
        };
        this.createRefreshToken = ({ id, login, role, fullName }) => {
            const refreshSecret = process.env.JWT_REFRESH_SECRET;
            const refreshToken = jwt.sign({ id, login, role, fullName }, refreshSecret, {
                expiresIn: "1d"
            });
            return refreshToken;
        };
    }
}
module.exports = new JWTMethods();
