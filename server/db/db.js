import * as dotenv from "dotenv";
import { Sequelize } from "sequelize";
import mysql from "mysql2/promise";

dotenv.config();

const {
  NODE_ENV,
  DATABASE_NAME,
  DATABASE_USERNAME,
  DATABASE_PASSWORD,
  DATABASE_HOST,
} = process.env;

const connection = await mysql.createConnection({
  host: DATABASE_HOST,
  user: DATABASE_USERNAME,
  password: DATABASE_PASSWORD,
});

await connection.query(`CREATE DATABASE IF NOT EXISTS ${DATABASE_NAME}`);

connection.end();

const sequelize = new Sequelize(
  DATABASE_NAME,
  DATABASE_USERNAME,
  DATABASE_PASSWORD,
  {
    host: DATABASE_HOST,
    dialect: "mysql",
  }
);
try {
  await sequelize.authenticate();
  console.log(
    `Connected to MySQL database '${DATABASE_NAME}' through host '${DATABASE_HOST}'.`
  );
} catch (error) {
  console.error("Unable to connect to MySQL database: ", error);
}

export default sequelize;
