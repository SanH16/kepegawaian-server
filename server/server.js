import express from "express";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";
import db from "./config/Database.js";
import connectSessionSequelize from "connect-session-sequelize";
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
import { seedAdmin } from "./config/seedAdmin.js";
import cookieParser from "cookie-parser";

dotenv.config();
const port = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "https://kepegawaian-client.vercel.app";

const app = express();
// Setup session store
const SequelizeStore = connectSessionSequelize(session.Store);

const sessionStore = new SequelizeStore({
  db: db,
});

(async () => {
  try {
    await db.authenticate(); // Cek koneksi database
    console.log("✅ Database Connected...");

    // Uncomment ini HANYA kalau ada perubahan struktur tabel di DEVELOPMENT
    if (process.env.NODE_ENV === "development") {
      // await db.sync({ alter: true });
      console.log("⚠️ Running db.sync({ alter: true }) is only for development!");
    }

    // Sinkronisasi session store
    await sessionStore
      .sync()
      .then(() => console.log("✅ Session table synced"))
      .catch((err) => console.error("❌ Session store sync failed:", err.message));

    // Jalankan seed admin kalau env `RUN_SEED_ADMIN=true`
    if (process.env.RUN_SEED_ADMIN === "true") {
      await seedAdmin();
      console.log("✅ Admin seeding completed.");
    }

    console.log("🚀 Server initialization complete!");
  } catch (error) {
    console.error("❌ Database error:", error.message, error.stack);
  }
})();

// app.set("trust proxy", 1);
// middleware cors
app.use(
  cors({
    credentials: true, // allow pengiriman cookie di CORS
    origin: CLIENT_URL,
  })
);

app.use(cookieParser());
app.use(
  session({
    name: "token",
    secret: process.env.SESS_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      path: "/",
    },
  })
);

// Middleware
app.use(express.json());
app.use("/images", express.static("./images"));
app.use("/docfiles", express.static("./docfiles"));

// Debugging session
app.use((req, res, next) => {
  console.log("Session Middleware:", req.session);
  next();
});

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
