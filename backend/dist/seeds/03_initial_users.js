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
exports.seed = seed;
function seed(knex) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        // Deletes ALL existing entries
        yield knex("Users").del();
        // Получение id из таблицы roles
        const roles = yield knex('Roles').select('id', 'name');
        // Получение id из таблицы UsersData
        const usersData = yield knex('UsersData').select('id', 'login');
        // Inserts seed entries
        yield knex("Users").insert([
            {
                full_name: "Иванов Иван Иванович",
                id_role: (_a = roles.find(role => role.name == "Техподдержка")) === null || _a === void 0 ? void 0 : _a.id,
                id_usersdata: (_b = usersData.find(ud => ud.login == process.env.TECH_LOGIN)) === null || _b === void 0 ? void 0 : _b.id
            }
        ]);
    });
}
;
