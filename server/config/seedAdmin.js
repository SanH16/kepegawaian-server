import db from "./Database.js";
import User from "../models/UserModel.js";
import argon2 from "argon2";

export const seedAdmin = async () => {
  try {
    await db.authenticate();
    console.log("Database Connected...");

    // Cek apakah admin sudah ada
    const adminExists = await User.findOne({ where: { role: "admin" } });
    if (adminExists) {
      console.log("Admin already exists!");
      return; // Jangan exit biar gak ganggu server
    }

    // Hash password admin
    const hashedPassword = await argon2.hash("admin123456");

    // Buat akun admin
    await User.create({
      name: "Admin",
      email: "admin@example.com",
      password: hashedPassword,
      role: "admin",
    });

    console.log("Admin user created successfully!");
  } catch (error) {
    console.error("Error seeding admin:", error);
  }
};
