import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const db = new Sequelize(process.env.DATABASE, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: "mysql",
  port: process.env.DB_PORT || 3306,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Tambahin biar kompatibel dengan Railway
    },
  },
});

export default db;
