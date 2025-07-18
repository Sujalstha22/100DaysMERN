const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/image/uploads");
  },
  filename: function (req, file, cb) {
    crypto.randomBytes(12, function (err, bytes) {
      if (err) return cb(err);

      const uniqueSuffix =
        bytes.toString("hex") + path.extname(file.originalname);
      cb(null, file.fieldname + "-" + uniqueSuffix);
    });
  },
});

const upload = multer({ storage });

module.exports = upload;
