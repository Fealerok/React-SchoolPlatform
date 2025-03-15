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
const knexfile_1 = __importDefault(require("../knexfile"));
const knex_1 = __importDefault(require("knex"));
const router = require("./routes/routes");
require("dotenv").config();
const cors = require("cors");
const app = (0, express_1.default)();
const port = process.env.SERVER_PORT; //3010
app.use(cors({
    origin: "https://react-school-platform.vercel.app", // Разрешаем запросы только с этого домена
    methods: ["GET", "POST", "PUT", "DELETE"], // Разрешенные методы
    allowedHeaders: ["Content-Type", "Authorization"], // Разрешенные заголовки
}));
app.use(express_1.default.json());
app.use(cors());
app.use("/", router);
//Определяем среду программы (в данном случае - разработка)
const environment = process.env.NODE_ENV || "development";
const knexInstance = (0, knex_1.default)(knexfile_1.default[environment]);
//Метод запуска всех миграций
const runMigrations = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield knexInstance.migrate.latest();
    }
    catch (error) {
        console.log(`Ошибка запуска миграций: ${error}`);
    }
});
//Метод запуска сидов (заполняющих изначальные данные)
const runSeeds = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield knexInstance.seed.run();
    }
    catch (error) {
        console.log(`Ошибка запуска сидов для миграций: ${error}`);
    }
});
//Запускаем миграции и сиды, затем сервер
const Main = () => __awaiter(void 0, void 0, void 0, function* () {
    //await runMigrations();
    //await runSeeds();
    yield app.listen(port, () => {
        console.log(`Server is started on port: ${port}`);
    });
});
Main();
