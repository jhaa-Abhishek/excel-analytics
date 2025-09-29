import express from "express";
import multer from "multer";
import xlsx from "xlsx";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { authMiddleware } from "../middleware/authMiddleware.js";
import Upload from "../models/Upload.js";

const router = express.Router();

// temp upload dir
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tmpDir = path.join(__dirname, "../../tmp");
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, tmpDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// POST /api/upload
// FRONTEND MUST SEND field name 'file' → formData.append("file", file)
router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file)
        return res.status(400).json({ message: "No file uploaded" });

      const filePath = req.file.path;

      // parse excel
      const wb = xlsx.readFile(filePath);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = xlsx.utils.sheet_to_json(ws, { defval: "" }); // [{col:val,...}]
      const columns = json.length ? Object.keys(json[0]) : [];

      // save history
      const saved = await Upload.create({
        userId: req.user.id,
        filename: req.file.originalname,
        columns,
        data: json,
      });

      // clean temp
      fs.unlink(filePath, () => {});

      // return the payload your frontend expects
      res.json({
        _id: saved._id,
        filename: saved.filename,
        columns: saved.columns,
        data: saved.data,
        createdAt: saved.createdAt,
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Upload failed" });
    }
  }
);

// GET /api/history
router.get("/history", authMiddleware, async (req, res) => {
  const items = await Upload.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .select("_id filename createdAt");
  res.json(items);
});

// GET /api/history/:id
router.get("/history/:id", authMiddleware, async (req, res) => {
  const item = await Upload.findOne({
    _id: req.params.id,
    userId: req.user.id,
  });
  if (!item) return res.status(404).json({ message: "Not found" });
  res.json({
    _id: item._id,
    filename: item.filename,
    columns: item.columns,
    data: item.data,
    createdAt: item.createdAt,
  });
});

// DELETE /api/history/:id
router.delete("/history/:id", authMiddleware, async (req, res) => {
  const deleted = await Upload.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.id,
  });
  if (!deleted) return res.status(404).json({ message: "Not found" });
  res.json({ message: "Upload deleted", id: req.params.id });
});

//rename the file
router.put("/history/:id/rename", authMiddleware, async (req, res) => {
  const { newName } = req.body;
  try {
    const updated = await Upload.findByIdAndUpdate(
      req.params.id,
      { filename: newName },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Rename failed" });
  }
});

export default router;
