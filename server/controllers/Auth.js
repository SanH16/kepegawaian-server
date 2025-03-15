import Pegawai from "../models/PegawaiModel.js";
import User from "../models/UserModel.js";
import argon2 from "argon2";

export const Login = async (req, res) => {
  const user = await User.findOne({
    where: {
      email: req.body.email,
    },
  });
  if (!user) return res.status(404).json({ msg: "Akun User tidak ditemukan" });

  const match = await argon2.verify(user.password, req.body.password);
  if (!match) return res.status(400).json({ msg: "Wrong Password" });

  req.session.userId = user.uuid;
  console.log("User logged in, session ID:", req.session.userId);

  res.cookie("token", req.sessionID, {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 1000 * 60 * 60 * 24, // 1 hari
  });

  res.status(200).json({ uuid: user.uuid, name: user.name, email: user.email, role: user.role, token: req.token });
};

export const GetUserLogin = async (req, res) => {
  console.log("GetUserLogin session data:", req.session);
  if (!req.session.userId) {
    return res.status(401).json({ msg: "Mohon login ke akun Anda!" });
  }

  const user = await User.findOne({
    attributes: ["uuid", "name", "email", "role"],
    where: {
      uuid: req.session.userId,
    },
    include: [
      {
        model: Pegawai,
        attributes: ["photo"],
      },
    ],
  });

  if (!user) return res.status(404).json({ msg: "Akun User tidak ditemukan" });
  res.status(200).json(user);
};

export const LogOut = (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(400).json({ msg: "Tidak dapat logout" });

    res.clearCookie("token", {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    console.log("Cookie dan session berhasil dihapus");
    res.status(200).json({ msg: "Anda telah logout" });
  });
};
