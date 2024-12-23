import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    const userId = req.userId;
    const extname = path.extname(file.originalname);
    const uniqueFilename = `${userId}-${Date.now()}${extname}`;
    req.depositScreenshot = uniqueFilename;
    cb(null, uniqueFilename);
  },
});

const storageScanner = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    const extname = path.extname(file.originalname);
    const uniqueFilename = `${Date.now()}${Math.floor(
      Math.random() * 100000
    )}${extname}`;
    req.body.scanner = uniqueFilename;
    cb(null, uniqueFilename);
  },
});
const multerImageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Not An Image, please upload an iamge!.."), false);
  }
};

export const depositScreenshot = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 100 },
  fileFilter: multerImageFilter,
}).single("image");

export const addScanner = multer({
  storage: storageScanner,
  limits: { fileSize: 1024 * 1024 * 100 },
  fileFilter: multerImageFilter,
}).single("image");
