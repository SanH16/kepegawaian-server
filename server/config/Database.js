import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const useSSL = process.env.DB_SSL === "true";

const db = new Sequelize(process.env.DATABASE, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: "mysql",
  port: process.env.DB_PORT || 3306,
  logging: false,
  dialectOptions: useSSL
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false, // Tambahin biar kompatibel dengan Railway
        },
      }
    : {},
});

export default db;
