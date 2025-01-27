import express, { Request, Response } from "express";
import config from "../knexfile";
import knex from "knex";
import { METHODS } from "http";

const router = require("./routes/routes");


require("dotenv").config();

const cors = require("cors");
const app = express();
const port = process.env.SERVER_PORT; //3010

app.use(cors({
    origin: "http://localhost:3000",
    METHODS: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ['Content-Type', 'Authorization'], // Разрешаемые заголовки
}));
app.use(express.json());
app.use("/", router);


//Определяем среду программы (в данном случае - разработка)
const environment = process.env.NODE_ENV || "development"
const knexInstance = knex(config[environment]);

//Метод запуска всех миграций
const runMigrations = async () => {
    try {
        await knexInstance.migrate.latest();
    } catch (error) {
        console.log(`Ошибка запуска миграций: ${error}`);
        
    }
}

const runSeeds = async () => {
    try {
        await knexInstance.seed.run();
    } catch (error) {
        console.log(`Ошибка запуска сидов для миграций: ${error}`);
    }
}

const Main = async () => {
    await runMigrations();
    await runSeeds();

    await app.listen(port, () => {
        console.log(`Server is started on port: ${port}`);
    });
}

Main();





