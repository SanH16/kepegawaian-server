import express from "express";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";
import db from "./config/Database.js";
import SequelizeStore from "connect-session-sequelize";
import UserRoute from "./routes/UserRoute.js";
import RekrutmenRoute from "./routes/RekrutmenRoute.js";
import AuthRoute from "./routes/AuthRoute.js";
import CutiRoute from "./routes/CutiRoute.js";
import PegawaiRoute from "./routes/PegawaiRoute.js";
import MutasiRoute from "./routes/MutasiRoute.js";
import AbsensiRoute from "./routes/AbsensiRoute.js";
import LamaranRoute from "./routes/LamaranRoute.js";
import PenugasanRoute from "./routes/PenugasanRoute.js";
import RewardRoute from "./routes/RewardRoute.js";
import PhkRoute from "./routes/PhkRoute.js";
import PromosiRoute from "./routes/PromosiRoute.js";
import PunishmentRoute from "./routes/PunishmentRoute.js";

dotenv.config();
const port = process.env.PORT;

const app = express();
const sessionStore = SequelizeStore(session.Store);

const store = new sessionStore({
  db: db,
});

(async () => {
  try {
    await db.authenticate(); // Cek koneksi database
    console.log("Database Connected...");

    // Uncomment ini HANYA kalau ada perubahan struktur tabel
    // await db.sync({ alter: true });

    await store.sync(); // Sinkronisasi tabel session (AMAN DI PRODUCTION)
    console.log("Session table synced");
  } catch (error) {
    console.error("Database error:", error);
  }
})();

app.use(
  session({
    name: "token", // Nama cookie untuk menyimpan session ID
    secret: process.env.SESS_SECRET, // untuk assign cookie
    resave: false, // Tidak menyimpan sesi jika tidak ada perubahan
    saveUninitialized: false, // Tidak menyimpan sesi yang baru kecuali sudah dimodifikasi
    store: store, // Store untuk menyimpan sesi di database
    cookie: {
      secure: process.env.NODE_ENV === "production" ? true : false, // false di lokal, true di production (HTTPS)
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Mencegah pengiriman cookie ke situs lain, `none` untuk production
      maxAge: 1000 * 60 * 60 * 24, // expire cookie (1 hari)
      httpOnly: true, //set true buat production
    },
  })
);

app.use("/images", express.static("./images"));
app.use("/docfiles", express.static("./docfiles"));
app.use(
  cors({
    credentials: true, // allow pengiriman cookie di CORS
    origin: ["http://localhost:5173", process.env.CLIENT_URL, process.env.SERVER_URL],
  })
);

// Middleware
app.use(express.json());

// route
app.use(UserRoute);
app.use(RekrutmenRoute);
app.use(AuthRoute);
app.use(CutiRoute);
app.use(PegawaiRoute);
app.use(MutasiRoute);
app.use(AbsensiRoute);
app.use(LamaranRoute);
app.use(PenugasanRoute);
app.use(RewardRoute);
app.use(PhkRoute);
app.use(PromosiRoute);
app.use(PunishmentRoute);

// Start Server
app.listen(port, () => {
  console.log(`Server up and running on port ${port}`);
});
