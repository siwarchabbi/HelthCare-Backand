const express = require("express");
const multer = require("multer");
const {
  registerUser,
  currentUser,
  loginUser,
  putProfile,
  getProfile,
  forgotPassword,
  resetPassword,
} = require("../controllers/userController");

const validateToken = require("../middleware/validateTokenHandler");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/current", validateToken, currentUser);
router.get("/profile/:userId", getProfile);
router.put("/update/:userId", upload.single("image"), putProfile);

module.exports = router;
