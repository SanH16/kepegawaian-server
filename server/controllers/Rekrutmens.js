import multer from "multer";
import path from "path";
import Rekrutmen from "../models/RekrutmenModel.js";
import User from "../models/UserModel.js";
import { Op } from "sequelize";

export const getRekrutmens = async (req, res) => {
  try {
    let response;
    if (req.role === "admin") {
      // jika login as admin
      response = await Rekrutmen.findAll({
        attributes: ["uuid", "title", "tags", "reference", "image_desc", "text_desc", "image_rekrutmen"],
        include: [
          {
            model: User,
            attributes: ["name", "email", "role"],
          },
        ],
      });
    } else if (req.role === "user") {
      response = await Rekrutmen.findAll({
        attributes: ["uuid", "title", "tags", "reference", "image_desc", "text_desc", "image_rekrutmen"],
        // jika login as user
        where: {
          userId: req.userId, // melihat data yg diinput oleh user itu sendiri
        },
        include: [
          {
            model: User,
            attributes: ["name", "email", "role"],
          },
        ],
      });
    } else {
      response = await Rekrutmen.findAll({
        attributes: ["uuid", "title", "tags", "reference", "image_desc", "text_desc", "image_rekrutmen"],
        include: [
          {
            model: User,
            attributes: ["name", "email", "role"],
          },
        ],
      });
    }
    // kirim response
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getRekrutmenById = async (req, res) => {
  try {
    const rekrutmen = await Rekrutmen.findOne({
      where: {
        uuid: req.params.id,
      },
    });

    if (!rekrutmen) return res.status(404).json({ msg: "Data tidak ditemukan" });

    let response;
    if (req.role === "admin") {
      response = await Rekrutmen.findOne({
        attributes: ["uuid", "title", "tags", "reference", "image_desc", "image_rekrutmen", "text_desc", "createdAt"],
        where: {
          id: rekrutmen.id,
        },
        include: [
          {
            model: User,
            attributes: ["name", "email", "role"],
          },
        ],
      });
    } else if (req.role === "user") {
      response = await Rekrutmen.findOne({
        attributes: ["uuid", "title", "tags", "reference", "image_desc", "image_rekrutmen", "text_desc"],
        where: {
          [Op.and]: [{ id: rekrutmen.id }, { userId: req.userId }],
        },
        include: [
          {
            model: User,
            attributes: ["name", "email"],
          },
        ],
      });
    } else {
      response = await Rekrutmen.findOne({
        attributes: ["uuid", "title", "tags", "reference", "image_desc", "image_rekrutmen", "text_desc", "createdAt"],
        where: {
          id: rekrutmen.id,
        },
        include: [
          {
            model: User,
            attributes: ["name", "email", "role"],
          },
        ],
      });
    }
    // kirim response
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const createRekrutmen = async (req, res) => {
  const { title, tags, reference, image_desc, text_desc } = req.body;

  if (!req.file) {
    return res.status(400).json({ msg: "No file uploaded" });
  }

  // Convert image to base64
  const image_rekrutmen = req.file.buffer.toString("base64");

  try {
    await Rekrutmen.create({
      title: title,
      tags: tags,
      reference: reference,
      image_rekrutmen: image_rekrutmen,
      image_desc: image_desc,
      text_desc: text_desc,
      userId: req.userId,
    });
    res.status(201).json({ msg: "Rekrutmen Created Successfuly" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const updateRekrutmen = async (req, res) => {
  try {
    const rekrutmen = await Rekrutmen.findOne({
      where: {
        uuid: req.params.id,
      },
    });

    if (!rekrutmen) return res.status(404).json({ msg: "Data tidak ditemukan" });

    const { title, tags, reference, image_desc, text_desc } = req.body;

    let image_rekrutmen = rekrutmen.image_rekrutmen;
    if (req.file) {
      image_rekrutmen = req.file.buffer.toString("base64");
    }

    if (req.role === "admin") {
      await Rekrutmen.update(
        { title, tags, reference, image_rekrutmen, image_desc, text_desc },
        {
          where: {
            id: rekrutmen.id,
          },
        }
      );
    } else {
      if (req.userId !== rekrutmen.userId) return res.status(403).json({ msg: "Akses terlarang" });
      await Rekrutmen.update(
        { title, tags, reference, image_rekrutmen, image_desc, text_desc },
        {
          where: {
            [Op.and]: [{ id: rekrutmen.id }, { userId: req.userId }],
          },
        }
      );
    }
    // kirim response
    res.status(200).json({ msg: "Rekrutmen updated successfuly" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const deleteRekrutmen = async (req, res) => {
  try {
    const rekrutmen = await Rekrutmen.findOne({
      where: {
        uuid: req.params.id,
      },
    });

    if (!rekrutmen) return res.status(404).json({ msg: "Data tidak ditemukan" });

    if (req.role === "admin") {
      await Rekrutmen.destroy({
        where: {
          id: rekrutmen.id,
        },
      });
    } else {
      if (req.userId !== rekrutmen.userId) return res.status(403).json({ msg: "Akses terlarang" });
      await Rekrutmen.destroy({
        where: {
          [Op.and]: [{ id: rekrutmen.id }, { userId: req.userId }],
        },
      });
    }
    // kirim response
    res.status(200).json({ msg: "Rekrutmen deleted successfuly" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Modified multer configuration to store in memory
const storage = multer.memoryStorage();

export const upload = multer({
  storage: storage,
  limits: { fileSize: "1000000" }, // 1 MB
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const mimeType = fileTypes.test(file.mimetype);
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimeType && extname) {
      return cb(null, true);
    }
    cb("Give proper files format to upload");
  },
}).single("image_rekrutmen");
