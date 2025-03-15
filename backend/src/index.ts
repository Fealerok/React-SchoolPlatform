import express, { Request, Response } from "express";
import config from "../knexfile";
import knex from "knex";
import cors from "cors";
import router from "./routes/routes"; // Импортируем роутер

require("dotenv").config();

const app = express();
const port = process.env.SERVER_PORT || 3010; // Порт из переменных окружения или 3010 по умолчанию

// Настройка CORS
app.use(
  cors({
    origin: "https://react-school-platform.vercel.app", // Разрешаем запросы только с этого домена
    methods: ["GET", "POST", "PUT", "DELETE"], // Разрешенные методы
    allowedHeaders: ["Content-Type", "Authorization"], // Разрешенные заголовки
    credentials: true, // Разрешаем передачу кук и заголовков авторизации
  })
);

// Обработка preflight-запросов для всех роутов
app.options("*", cors());

// Middleware для парсинга JSON
app.use(express.json());

// Логирование всех входящих запросов (для отладки)
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// Подключаем роутер
app.use("/", router);

// Определяем среду программы (в данном случае - разработка)
const environment = process.env.NODE_ENV || "development";
const knexInstance = knex(config[environment]);

// Метод запуска всех миграций
const runMigrations = async () => {
  try {
    await knexInstance.migrate.latest();
    console.log("Миграции успешно выполнены");
  } catch (error) {
    console.error(`Ошибка запуска миграций: ${error}`);
  }
};

// Метод запуска сидов (заполняющих изначальные данные)
const runSeeds = async () => {
  try {
    await knexInstance.seed.run();
    console.log("Сиды успешно выполнены");
  } catch (error) {
    console.error(`Ошибка запуска сидов для миграций: ${error}`);
  }
};

// Запускаем миграции, сиды и сервер
const Main = async () => {
  try {

    // Запуск сервера
    app.listen(port, () => {
      console.log(`Сервер запущен на порту: ${port} :)`);
    });
  } catch (error) {
    console.error(`Ошибка при запуске сервера: ${error}`);
  }
};

// Запуск приложения
Main();