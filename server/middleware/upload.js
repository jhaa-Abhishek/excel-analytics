const multer = require("multer");
const path = require("path");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname);
  if (ext === ".xls" || ext === ".xlsx") cb(null, true);
  else cb(new Error("Only Excel files are allowed"), false);
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
