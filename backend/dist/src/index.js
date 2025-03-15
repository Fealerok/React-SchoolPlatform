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
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./routes/routes")); // Импортируем роутер
require("dotenv").config();
const app = (0, express_1.default)();
const port = process.env.SERVER_PORT || 3010; // Порт из переменных окружения или 3010 по умолчанию
// Настройка CORS
app.use((0, cors_1.default)({
    origin: "*", // Разрешаем запросы только с этого домена
    methods: ["GET", "POST", "PUT", "DELETE"], // Разрешенные методы
    allowedHeaders: ["Content-Type", "Authorization"], // Разрешенные заголовки
    credentials: true, // Разрешаем передачу кук и заголовков авторизации
}));
// Обработка preflight-запросов для всех роутов
app.options("*", (0, cors_1.default)());
// Middleware для парсинга JSON
app.use(express_1.default.json());
// Логирование всех входящих запросов (для отладки)
app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
});
// Подключаем роутер
app.use("/", routes_1.default);
// Определяем среду программы (в данном случае - разработка)
const environment = process.env.NODE_ENV || "development";
const knexInstance = (0, knex_1.default)(knexfile_1.default[environment]);
// Метод запуска всех миграций
const runMigrations = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield knexInstance.migrate.latest();
        console.log("Миграции успешно выполнены");
    }
    catch (error) {
        console.error(`Ошибка запуска миграций: ${error}`);
    }
});
// Метод запуска сидов (заполняющих изначальные данные)
const runSeeds = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield knexInstance.seed.run();
        console.log("Сиды успешно выполнены");
    }
    catch (error) {
        console.error(`Ошибка запуска сидов для миграций: ${error}`);
    }
});
// Запускаем миграции, сиды и сервер
const Main = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Запуск сервера
        app.listen(port, () => {
            console.log(`Сервер запущен на порту: ${port} :)`);
        });
    }
    catch (error) {
        console.error(`Ошибка при запуске сервера: ${error}`);
    }
});
// Запуск приложения
Main();
