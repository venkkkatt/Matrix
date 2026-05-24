const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowedFormats = [
      "image/png",
      "image/jpeg",
      "image/webp",
    ];

    if (allowedFormats.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file format"), false);
    }
  },
});

module.exports = upload;
