import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const db = new Sequelize(process.env.DATABASE_URL, {
  dialect: "mysql",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Tambahin biar kompatibel dengan Railway
    },
  },
});

export default db;
