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
  ...(NODE_ENV == "development"
    ? { host: DATABASE_HOST }
    : { socketPath: DATABASE_HOST }),
  user: DATABASE_USERNAME,
  password: DATABASE_PASSWORD,
});

await connection.query(`CREATE DATABASE IF NOT EXISTS ${DATABASE_NAME}`);

connection.end();

let sequelize = await connect();

async function connect() {
  try {
    const sequelize = new Sequelize(
      DATABASE_NAME,
      DATABASE_USERNAME,
      DATABASE_PASSWORD,
      {
        dialect: "mysql",
        ...(NODE_ENV == "development"
          ? { host: DATABASE_HOST }
          : {
              dialectOptions: {
                socketPath: process.env.DATABASE_HOST,
              },
            }),
        define: { charset: "utf8", collate: "utf8_unicode_ci" },
      }
    );

    await sequelize.authenticate();
    console.log(
      `Connected to MySQL database '${DATABASE_NAME}' through host '${DATABASE_HOST}'.`
    );

    return sequelize;
  } catch (error) {
    console.error("Unable to connect to MySQL database: ", error);
  }
}

export default sequelize;
